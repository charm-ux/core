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

Use `.extendPrimitives()`, `.extendSemantics()`, and `.extendComponents()` to create derived themes:

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
  .extendSemantics((ref, base) => ({
    ...base,
    action: {
      ...base?.action,
      primary: ref('color', 'brand', 500),
      primaryHover: ref('color', 'brand', 600),
    },
  }))
  .extendComponents((ref, base) => ({
    ...base,
    button: {
      ...base?.button,
      borderRadius: ref('borderRadius', 'full'),
    },
  }));

// Generate CSS with your prefix
const theme = generateTheme(myTokens.definition, { prefix: 'myapp' });
```

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
    semantics: ref => ({
      surface: {
        primary: { light: '#ffffff', dark: '#18181b' },
      },
      action: {
        primary: ref('color', 'primary', 500),
      },
    }),
    components: ref => ({
      button: {
        bgColor: ref('action', 'primary'),
        borderRadius: ref('borderRadius', 'md'),
      },
    }),
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
semantics: ref => ({
  surface: {
    primary: { light: '#ffffff', dark: '#18181b' },
    secondary: { light: ref('color', 'neutral', 100), dark: ref('color', 'neutral', 800) },
  },
  action: {
    primary: ref('color', 'primary', 500),
    primaryHover: ref('color', 'primary', 600),
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
components: ref => ({
  button: {
    bgColor: ref('action', 'primary'),
    fgColor: ref('text', 'inverse'),
    borderRadius: ref('borderRadius', 'md'),
    hover: {
      bgColor: ref('action', 'primaryHover'),
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

Override semantic tokens. Receives the base semantics to spread:

```typescript
const customTokens = charmTokens.extendSemantics((ref, base) => ({
  ...base,
  surface: {
    ...base?.surface,
    brand: ref('color', 'brand', 500),
  },
}));
```

### `.extendComponents(factory)`

Override component tokens:

```typescript
const customTokens = charmTokens.extendComponents((ref, base) => ({
  ...base,
  button: {
    ...base?.button,
    borderRadius: ref('borderRadius', 'full'),
  },
}));
```

### Chaining

Methods can be chained:

```typescript
const customTokens = charmTokens
  .extendPrimitives({ color: { brand: '#ff6600' } })
  .extendSemantics((ref, base) => ({ ...base /* ... */ }))
  .extendComponents((ref, base) => ({ ...base /* ... */ }));
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

For Lit components, use typed CSS helpers:

```typescript
import { createCssHelpers, charmDefinition } from '@charm-ux/theming';
import { css } from 'lit';

const { primitive, semantic, component } = createCssHelpers(charmDefinition, 'charm');

const styles = css`
  :host {
    background: ${component('button', 'bgColor')};
    color: ${semantic('text', 'primary')};
    padding: ${primitive('spacing', 'md')};
  }
`;
```

## Pre-built Themes

| Export        | Description                                    |
| ------------- | ---------------------------------------------- |
| `charmTokens` | Base Charm theme                               |
| `demoTokens`  | Demo theme with vibrant colors (extends charm) |

## API Reference

### `defineTokens(config, options?)`

Creates a token definition with typed helpers and extension methods.

Returns: `{ definition, helpers, extendPrimitives, extendSemantics, extendComponents }`

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
