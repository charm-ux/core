# @charm-ux/theming

Design token system for Charm UI with automatic color palette generation, theme extension, and CSS variable output.

## Installation

```bash
npm install @charm-ux/theming
```

## Quick Start

### Using the Pre-built Theme

```typescript
import { charmTokens } from '@charm-ux/theming';

// Access generated CSS
const { css, cssReset, cssUtilities } = charmTokens.theme;

// Write to files
fs.writeFileSync('tokens.css', css);
fs.writeFileSync('reset.css', cssReset);
fs.writeFileSync('utilities.css', cssUtilities);
```

### Extending the Charm Theme

Use `.extendPrimitives()`, `.extendSemantics()`, `.extendComponents()`, and `.extendRawCss()` to create derived themes. The semantic and component factories receive layer-specific reference helpers (`primitive`, `semantic`, `component`); their return value is **deep-merged** into the inherited tokens, so you only describe what changes — no need to spread `base`:

```typescript
import { charmTokens, generateTheme } from '@charm-ux/theming';

// Extend with custom brand colors
const myTokens = charmTokens
  .extendPrimitives({
    color: {
      brand: '#ff6600',
      accent: '#9333ea',
    },
  })
  .extendSemantics(({ primitive }) => ({
    action: {
      primary: primitive('color', 'brand', 500),
      primaryHover: primitive('color', 'brand', 600),
    },
  }))
  .extendComponents(({ primitive }) => ({
    button: {
      borderRadius: primitive('borderRadius', 'full'),
    },
  }))
  .extendRawCss(({ semantic }, base) => ({
    // Raw CSS is the exception: the factory return *replaces* inherited CSS,
    // so spread `base` (and interpolate `base?.theme`) to append instead.
    ...base,
    theme: `${base?.theme ?? ''}
      .brand-surface { background: ${semantic('surface', 'brand')}; }`,
  }));

// Generate CSS with your prefix
const theme = generateTheme(myTokens.definition, { prefix: 'myapp' });
```

Untouched groups and untouched keys within a group are preserved automatically. Merging can add or override tokens, but it cannot _remove_ an inherited one. The inherited tokens are still passed as the factory's second argument (`base`) for when you need to derive a value from them.

### Creating a Theme from Scratch

```typescript
import { defineTokens, generateTheme } from '@charm-ux/theming';

const myTokens = defineTokens(
  {
    primitives: {
      color: {
        primary: '#0265dc',
        neutral: '#71717a',
      },
      spacing: {
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
      },
    },
    semantics: ({ primitive }) => ({
      surface: {
        primary: { light: '#ffffff', dark: '#18181b' },
      },
      action: {
        primary: primitive('color', 'primary', 500),
      },
    }),
    components: ({ semantic, primitive }) => ({
      button: {
        bgColor: semantic('action', 'primary'),
        borderRadius: primitive('borderRadius', 'md'),
      },
    }),
    // Optional raw CSS appended to the generated files
    rawCss: {
      reset: `html { scroll-behavior: smooth; }`,
    },
  },
  { prefix: 'myapp' }
);

const theme = generateTheme(myTokens.definition, { prefix: 'myapp' });
```

## Token Architecture

The system uses a 3-layer hierarchy:

### 1. Primitives

Raw design values. Single color values auto-expand into 11-step palettes (50-950):

```typescript
primitives: {
  color: {
    primary: '#0265dc',    // Generates --prefix-color-primary-50 through -950
    neutral: '#71717a',

    // Or define explicit palette scales
    brand: {
      50: '#fff7ed',
      100: '#ffedd4',
      // ...
      900: '#7c2d12',
      950: '#431407',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    full: '9999px',
  },
}
```

### 2. Semantics

Context-aware tokens referencing primitives:

```typescript
semantics: ({ primitive }) => ({
  surface: {
    primary: { light: '#ffffff', dark: '#18181b' },
    secondary: {
      light: primitive('color', 'neutral', 100),
      dark: primitive('color', 'neutral', 800),
    },
  },
  action: {
    primary: primitive('color', 'primary', 500),
    primaryHover: primitive('color', 'primary', 600),
  },
  text: {
    primary: { light: '#18181b', dark: '#fafafa' },
  },
});
```

Use `{ light, dark }` objects for color-scheme-aware tokens.

### 3. Components

Component-specific tokens:

```typescript
components: ({ primitive, semantic }) => ({
  button: {
    bgColor: semantic('action', 'primary'),
    fgColor: semantic('text', 'inverse'),
    borderRadius: primitive('borderRadius', 'md'),
    hover: {
      bgColor: semantic('action', 'primaryHover'),
    },
  },
});
```

## Theme Extension API

### `.extendPrimitives(overrides)`

Override primitive values:

```typescript
const customTokens = charmTokens.extendPrimitives({
  color: { brand: '#ff6600' },
});
```

### `.extendSemantics(factory)`

Add or override semantic tokens. The factory receives `{ primitive }` reference helpers; its return is deep-merged into the inherited semantics, so you list only what changes:

```typescript
const customTokens = charmTokens.extendSemantics(({ primitive }) => ({
  surface: {
    brand: primitive('color', 'brand', 500),
  },
}));
```

The inherited `surface` siblings (and every other group) are preserved. The base semantics are still available as the second argument (`base`) when you need to derive a value from them.

### `.extendComponents(factory)`

Add or override component tokens. The factory receives `{ primitive, semantic }` reference helpers; its return is deep-merged into the inherited components:

```typescript
const customTokens = charmTokens.extendComponents(({ primitive }) => ({
  button: {
    borderRadius: primitive('borderRadius', 'full'),
  },
}));
```

### `.extendRawCss(additions)`

Inject raw CSS into the generated `reset`, `theme`, and `utilities` files. It accepts two forms that combine with inherited raw CSS differently:

- **Plain object** — each bucket is _appended_ after the inherited value. This is the common case for adding CSS on top of what you inherited:

  ```typescript
  const customTokens = charmTokens.extendRawCss({
    reset: `html { scroll-behavior: smooth; }`,
  });
  ```

- **Factory function** — receives `{ primitive, semantic, component }` reference helpers and the inherited raw CSS as `base`. Its return value **replaces** the inherited raw CSS, giving you full control:

  ```typescript
  const customTokens = charmTokens.extendRawCss(({ semantic }, base) => ({
    // Append: interpolate the inherited value
    ...base,
    theme: `${base?.theme ?? ''}
      .brand-surface { background: ${semantic('surface', 'brand')}; }`,

    // Drop an inherited bucket: omit it from the return value
    // Replace a bucket entirely: return a fresh value without spreading base
  }));
  ```

  Because the factory return replaces inherited raw CSS, spread `base` (and interpolate `base?.<bucket>`) to keep what you inherited, omit a bucket to drop it, or return a bucket without referencing `base` to replace it outright.

### Chaining

Methods can be chained:

```typescript
const customTokens = charmTokens
  .extendPrimitives({ color: { brand: '#ff6600' } })
  .extendSemantics(({ primitive }) => ({
    /* merged into inherited semantics */
  }))
  .extendComponents(({ primitive }) => ({
    /* merged into inherited components */
  }))
  .extendRawCss(({ semantic }, base) => ({ ...base /* raw CSS replaces; spread to keep */ }));
```

## Generated Outputs

`generateTheme()` returns:

| Output               | Description                                  |
| -------------------- | -------------------------------------------- |
| `css`                | CSS variables in `:root`                     |
| `cssReset`           | CSS reset styles                             |
| `cssUtilities`       | Utility classes (`.p-sm`, `.bg-primary-500`) |
| `tokensJson`         | W3C Design Tokens format                     |
| `hasLightDarkTokens` | Whether theme has light/dark variants        |

## Accessible Colors

The generator creates semantic tokens for text on colored backgrounds:

```css
--charm-color-on-primary-500: #fafafa; /* Light text for dark bg */
--charm-color-on-primary-50: #18181b; /* Dark text for light bg */
```

Usage:

```css
.badge {
  background: var(--charm-color-primary-500);
  color: var(--charm-color-on-primary-500);
}
```

## Lit Integration

For Lit components, use typed CSS helpers. In `@charm-ux/core` these are pre-bound via the `tokens` object:

```typescript
import { tokens } from '@charm-ux/core';
import { css } from 'lit';

const { primitive, semantic, component } = tokens.lit;

const styles = css`
  :host {
    background: ${component('button', 'bgColor')};
    color: ${semantic('text', 'primary')};
    padding: ${primitive('spacing', 'md')};
  }
`;
```

You can also create helpers directly with `createCssHelpers`:

```typescript
import { createCssHelpers, charmDefinition } from '@charm-ux/theming';
const { primitive, semantic, component } = createCssHelpers(charmDefinition, 'charm');
```

## Custom Elements Manifest Prefix

Charm's components document their CSS custom properties via `@cssproperty` JSDoc tags, which the [Custom Elements Manifest](https://github.com/webcomponents/custom-elements-manifest) (`custom-elements.json`) surfaces to tools like Storybook, VS Code, and design-system docs. Those documented names should carry the same prefix the theme emits at runtime (`charmDefinition.prefix`, default `charm` → `--charm-...`).

The repository provides a small utility that normalizes documented CSS custom property names in a manifest to the active theme prefix. The implementation lives in the theming package at `packages/theming/src/cem-plugin/cem-css-prefix-plugin.ts` (source-only tooling; not exported from the published package). It exposes three helpers you can use in your build-time tooling:

- `cssPrefixPlugin(options?)` — a Custom Elements Manifest analyzer plugin you can register during `cem analyze` to rewrite names as manifests are linked.
- `applyThemePrefix(manifest, options)` — an in-place transform that rewrites every `cssProperties[].name` in a parsed manifest and returns the number of names changed.
- `rewriteCssVarName(name, options)` — the pure per-name transform used by both helpers.

### Analyzer plugin

Register `cssPrefixPlugin()` in `custom-elements-manifest.config.mjs`, before the sorter so the finalized names are the ones that get sorted. Import it from the local source file when used in this repository's CEM config:

```js
import { cssPrefixPlugin } from './packages/theming/src/cem-plugin/cem-css-prefix-plugin.js';

export default {
  // ...
  plugins: [
    // ...other plugins
    cssPrefixPlugin(), // target prefix defaults to charmDefinition.prefix
    cemSorterPlugin({}),
  ],
};
```

### Standalone function

`applyThemePrefix(manifest, options)` rewrites every `cssProperties[].name` in a parsed manifest **in place** and returns the number of names changed:

```js
import fs from 'node:fs';
import { applyThemePrefix } from './packages/theming/src/cem-plugin/cem-css-prefix-plugin.js';

const manifest = JSON.parse(fs.readFileSync('custom-elements.json', 'utf8'));
const changed = applyThemePrefix(manifest, { prefix: 'acme' });
fs.writeFileSync('custom-elements.json', JSON.stringify(manifest, null, 2));
console.log(`Rewrote ${changed} CSS custom property names`);
```

`rewriteCssVarName(name, options)` is the pure per-name transform underneath both.

### Options

Both `cssPrefixPlugin`, `applyThemePrefix`, and `rewriteCssVarName` accept the same options:

| Option          | Type                           | Default                              | Description                                                         |
| --------------- | ------------------------------ | ------------------------------------ | ------------------------------------------------------------------- |
| `prefix`        | `string`                       | `charmDefinition.prefix` (`'charm'`) | Target prefix to apply. An empty string strips the prefix entirely. |
| `defaultPrefix` | `string \| string[] \| RegExp` | `ANY_PREFIX` (`/^[^-]+-/`)           | Existing prefix(es) to strip before applying `prefix`.              |

By default (`defaultPrefix` omitted), the transform replaces the **first `--xxxx-` segment** regardless of what it is, so the source prefix does not need to be known ahead of time:

```js
rewriteCssVarName('--charm-overflow-item-gap', { prefix: 'acme' }); // → --acme-overflow-item-gap
rewriteCssVarName('---button-color', { prefix: 'acme' }); // → --acme-button-color
rewriteCssVarName('--gap', { prefix: 'acme' }); // → --acme-gap (no segment to strip)
```

Scope the stripping when you know the source prefix(es):

```js
rewriteCssVarName(name, { prefix: 'acme', defaultPrefix: 'charm' }); // single
rewriteCssVarName(name, { prefix: 'acme', defaultPrefix: ['charm', 'fui'] }); // list
rewriteCssVarName(name, { prefix: 'acme', defaultPrefix: /^(charm|fui)-/ }); // regex
```

Notes:

- **Idempotent** — names already starting with `--{prefix}-` are left unchanged, so the transform is safe to re-run.
- **RegExp** patterns are matched against the name body (after `--`), auto-anchored to the start, and the `g` flag is ignored, so only a leading prefix is ever removed.
- **Caveat** — the default `ANY_PREFIX` cannot tell a real prefix from a genuine first segment, so an unprefixed name like `--form-control-bg-color` becomes `--{prefix}-control-bg-color`. Pass an explicit `defaultPrefix` when names may be unprefixed.

## Pre-built Themes

| Export        | Description                                    |
| ------------- | ---------------------------------------------- |
| `charmTokens` | Base Charm theme                               |
| `demoTokens`  | Demo theme with vibrant colors (extends charm) |

## API Reference

### `defineTokens(config, options?)`

Creates a token definition with typed helpers and extension methods.

Returns: `{ definition, helpers, extendPrimitives, extendSemantics, extendComponents, extendRawCss }`

### `generateTheme(definition, options?)`

Generates theme outputs asynchronously.

Options:

- `prefix` — CSS variable prefix (default: `''`)
- `selector` — CSS selector (default: `':root'`)

### `generateThemeSync(definition, options?)`

Synchronous version of `generateTheme()`.

### `createCssHelpers(definition, prefix)`

Creates typed CSS helpers for Lit components.

Returns: `{ primitive, semantic, component }`

## Links

- [GitHub](https://github.com/charm-ux/core)
- [npm](https://www.npmjs.com/package/@charm-ux/theming)
