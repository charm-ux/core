# @charm-ux/theming

Design token system for Charm UI with automatic color palette generation and CSS variable output.

## Installation

```bash
npm install @charm-ux/theming
```

## Quick Start

### Using the Pre-built Theme

```typescript
import { charmTokens } from '@charm-ux/theming';

// Write generated CSS to files
fs.writeFileSync('tokens.css', charmTokens.theme.css);
fs.writeFileSync('reset.css', charmTokens.theme.cssReset);
fs.writeFileSync('utilities.css', charmTokens.theme.cssUtilities);
```

### Creating a Custom Theme

```typescript
import { defineTokens, generateTheme } from '@charm-ux/theming';

const { definition } = defineTokens({
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
});

const theme = generateTheme(definition, { prefix: 'my-app' });
```

## Token Architecture

The system uses a 3-layer hierarchy:

### 1. Primitives

Raw design values. Single color values auto-expand into 11-step palettes (50-950):

```typescript
primitives: {
  color: {
    primary: '#0265dc',    // Generates --charm-color-primary-50 through -950
    neutral: '#71717a',

    // Or define custom palette scales
    brand: {
      light: '#e6f0ff',
      base: '#0066cc',
      dark: '#004499',
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
    bgColor: ref('surface', 'secondary'),
    borderRadius: ref('borderRadius', 'md'),
  },
});
```

## Generated Outputs

`generateTheme()` returns:

| Output         | Description                                  |
| -------------- | -------------------------------------------- |
| `css`          | CSS variables in `:root`                     |
| `cssReset`     | CSS reset styles                             |
| `cssUtilities` | Utility classes (`.p-sm`, `.bg-primary-500`) |
| `tokensJson`   | W3C Design Tokens format                     |

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
import { createCssHelpers } from '@charm-ux/theming/lit';
import { charmTokens } from '@charm-ux/theming';
import { css } from 'lit';

const { primitive, semantic } = createCssHelpers(charmTokens.definition, 'charm');

const styles = css`
  :host {
    background: ${primitive('color', 'primary', 500)};
    color: ${semantic('text', 'primary')};
  }
`;
```

## API

### `defineTokens(config)`

Creates a token definition with typed helpers.

### `generateTheme(definition, options?)`

Generates theme outputs. Options:

- `prefix` — CSS variable prefix (default: `''`)
- `selector` — CSS selector (default: `':root'`)

### `charmTokens`

Pre-built Charm theme.

## Links

- [GitHub](https://github.com/charm-ux/core)
- [npm](https://www.npmjs.com/package/@charm-ux/theming)
