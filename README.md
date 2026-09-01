# Charm UX

A modern, accessible web component library built with Lit. Charm provides headless UI components and a design token system to help you build consistent, themeable interfaces.

## Features

- **Accessible** — WCAG compliant with proper ARIA attributes and keyboard navigation
- **Themeable** — Design token system with automatic color palette generation
- **Framework Agnostic** — Works with React, Vue, Angular, or vanilla JavaScript
- **Tree-Shakeable** — Import only what you need
- **Type-Safe** — Full TypeScript support

## Packages

| Package                                 | Description                        |
| --------------------------------------- | ---------------------------------- |
| [@charm-ux/core](./packages/core)       | UI component library               |
| [@charm-ux/theming](./packages/theming) | Design tokens and theme generation |

## Installation

```bash
npm install @charm-ux/core @charm-ux/theming
```

## Quick Start

```html
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="path/to/charm-theme.css" />
    <script type="module">
      import '@charm-ux/core/components/button/button.js';
    </script>
  </head>
  <body>
    <charm-button variant="primary">Click Me</charm-button>
  </body>
</html>
```

## Components

### Layout

- **Card** — Content containers
- **Divider** — Visual separators
- **Push Pane** — Sliding panels

### Navigation

- **Breadcrumb** — Navigation hierarchy
- **Menu** — Contextual menus
- **Tabs** — Tabbed interfaces

### Form Controls

- **Button** — Action triggers
- **Checkbox** — Boolean selection
- **Input** — Text fields
- **Radio Group** — Single selection
- **Select** — Dropdowns
- **Switch** — Toggles
- **Text Area** — Multi-line input

### Feedback

- **Alert** — Messages
- **Dialog** — Modals
- **Progress Bar** — Progress indicators
- **Spinner** — Loading states
- **Tooltip** — Contextual hints
- **Skeleton** — Loading placeholders

### Data Display

- **Avatar** — User images
- **Badge** — Labels and tags
- **Icon** — Iconography

### Utilities

- **Accordion** — Collapsible content
- **Disclosure** — Show/hide
- **Popup** — Floating elements

## Theming

Charm uses CSS custom properties for theming. Generate a custom theme or use the defaults:

```typescript
import { charmTokens } from '@charm-ux/theming';
import { charmTheme } from '@charm-ux/theming/generator';

// Use the pre-built theme CSS
document.adoptedStyleSheets = [charmTheme.css];

// Or generate a custom theme
import { defineTokens } from '@charm-ux/theming';
import { generateTheme } from '@charm-ux/theming/generator';

const { definition } = defineTokens({
  primitives: {
    color: {
      primary: '#0265dc',
      neutral: '#71717a',
    },
  },
});

const theme = generateTheme(definition, { prefix: 'my-app' });
```

## Documentation

- [Core Components](./packages/core/README.md)
- [Theming System](./packages/theming/README.md)
- [Contributing](./CONTRIBUTING.md)

## License

MIT
