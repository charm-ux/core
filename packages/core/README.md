# @charm-ux/core

Charm Core is a collection of accessible, themeable Web Components built with Lit. It provides the primitives you need to ship consistent UI across frameworks while keeping bundle sizes lean and opting into only the pieces you use.

## What you get

- Headless-first components: extend or style the primitives without fighting baked-in opinions
- A curated set of UI components (accordion, button, dialog, menu, tabs, toast, etc.) implemented as standards-based custom elements
- Built-in accessibility patterns for focus, keyboard navigation, and ARIA
- Design-token driven theming with sensible defaults and a utility-first CSS layer
- Framework-agnostic usage: drop into plain HTML or integrate with React, Vue, or any modern build tool
- First-class docs, stories, and test harnesses to keep components predictable and stable

## Installation

```bash
npm install @charm-ux/core
```

## Usage

### HTML

```html
<script type="module">
  import '@charm-ux/core/components/button/button.js';
</script>

<charm-button variant="primary">Click Me</charm-button>
```

### JavaScript

```javascript
import { CharmButton } from '@charm-ux/core';

const button = document.createElement('charm-button');
button.variant = 'primary';
button.textContent = 'Click Me';
document.body.appendChild(button);
```

### TypeScript

```typescript
import { CharmButton } from '@charm-ux/core';

const button = new CharmButton();
button.variant = 'primary';
button.textContent = 'Click Me';
document.body.appendChild(button);
```

## Components

### Layout & Structure

- `<charm-card>` — Flexible content containers
- `<charm-divider>` — Visual separators
- `<charm-push-pane>` — Sliding panel

### Navigation

- `<charm-breadcrumb>` / `<charm-breadcrumb-item>` — Navigation hierarchy
- `<charm-menu>` / `<charm-menu-group>` / `<charm-menu-item>` — Contextual menus
- `<charm-tabs>` / `<charm-tab>` / `<charm-tab-panel>` — Tabbed interfaces

### Form Controls

- `<charm-button>` / `<charm-button-group>` — Action triggers
- `<charm-checkbox>` — Boolean selection
- `<charm-input>` — Text input
- `<charm-radio>` / `<charm-radio-group>` — Single selection
- `<charm-select>` — Dropdown selection
- `<charm-switch>` — Toggle control
- `<charm-text-area>` — Multi-line input

### Feedback

- `<charm-alert>` — Contextual messages
- `<charm-dialog>` — Modal dialogs
- `<charm-progress-bar>` — Progress indicators
- `<charm-spinner>` — Loading states
- `<charm-tooltip>` — Contextual hints
- `<charm-skeleton>` — Loading placeholders

### Data Display

- `<charm-avatar>` — User avatars
- `<charm-badge>` — Labels and tags
- `<charm-icon>` — Icons

### Utilities

- `<charm-accordion>` / `<charm-accordion-item>` — Collapsible sections
- `<charm-disclosure>` — Show/hide content
- `<charm-overflow>` — Handle overflow
- `<charm-popup>` — Positioned floating elements

## Theming

Components use CSS custom properties from `@charm-ux/theming`. Include the theme CSS or define your own variables:

```html
<link rel="stylesheet" href="path/to/charm-theme.css" />
```

See [@charm-ux/theming](https://www.npmjs.com/package/@charm-ux/theming) for theme customization.

## Accessibility

All components include:

- Proper ARIA attributes
- Keyboard navigation
- Focus management
- Screen reader support

## Browser Support

Modern browsers supporting ES2020 and Custom Elements v1.

## Links

- [Documentation](https://charm-ux.github.io/core/)
- [GitHub](https://github.com/charm-ux/core)
- [npm](https://www.npmjs.com/package/@charm-ux/core)
