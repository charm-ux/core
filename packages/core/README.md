# @charm-ux/core

Charm Core is a collection of accessible, themeable Web Components built with Lit. It provides the primitives you need to ship consistent UI across frameworks while keeping bundle sizes lean and opting into only the pieces you use.

## What you get

- Headless-first components: extend or style the primitives without fighting baked-in opinions
- A curated set of UI components (accordion, button, dialog, menu, tabs, etc.) implemented as standards-based custom elements
- Built-in accessibility patterns for focus, keyboard navigation, and ARIA
- Design-token driven theming with sensible defaults and a utility-first CSS layer
- Framework-agnostic usage: drop into plain HTML or integrate with React, Vue, or any modern build tool
- First-class docs, stories, and test harnesses to keep components predictable and stable

## Installation

```bash
npm install @charm-ux/core @charm-ux/theming
```

## Usage

Components use the `ch-` tag prefix by default. Import a component's barrel to register it
(which defines its custom element as a side effect), then use it in markup.

### HTML

```html
<script type="module">
  import '@charm-ux/core/components/button/index.js';
</script>

<ch-button>Click Me</ch-button>
```

### JavaScript

```javascript
import { CoreButton } from '@charm-ux/core/components/button/button.js';

const button = new CoreButton();
button.textContent = 'Click Me';
document.body.appendChild(button);
```

### TypeScript

```typescript
import { CoreButton } from '@charm-ux/core/components/button/button.js';

const button = new CoreButton();
button.textContent = 'Click Me';
document.body.appendChild(button);
```

## Import paths: registered vs. class-only

Every component ships two import paths:

- **Barrel** — `@charm-ux/core/components/button` (or `.../button/index.js`) re-exports the
  component **and** registers it with the project scope, defining `<ch-button>` as a side
  effect.
- **Class module** — `@charm-ux/core/components/button/button.js` exports the class
  (`CoreButton`) **without** registering anything.

Use the barrel when you want the element usable in markup. Use the class module when you
only want the class — for example when subclassing — so importing it doesn't define a tag
you don't want. Each component's class is both a named (`CoreButton`) and a default export
(`button`).

## Components

Components are tagged `<ch-*>` and their classes are named `Core<Name>` (e.g. `CoreButton`,
`CoreInput`).

### Layout & Structure

- `<ch-card>` — Flexible content containers
- `<ch-divider>` — Visual separators
- `<ch-push-pane>` — Sliding panel

### Navigation

- `<ch-breadcrumb>` / `<ch-breadcrumb-item>` — Navigation hierarchy
- `<ch-menu>` / `<ch-menu-group>` / `<ch-menu-item>` — Contextual menus
- `<ch-tabs>` / `<ch-tab>` / `<ch-tab-panel>` — Tabbed interfaces

### Form Controls

- `<ch-button>` / `<ch-button-group>` — Action triggers
- `<ch-checkbox>` — Boolean selection
- `<ch-input>` — Text input
- `<ch-radio>` / `<ch-radio-group>` — Single selection
- `<ch-select>` — Dropdown selection
- `<ch-switch>` — Toggle control
- `<ch-text-area>` — Multi-line input

### Feedback

- `<ch-alert>` — Contextual messages
- `<ch-dialog>` — Modal dialogs
- `<ch-progress-bar>` — Progress indicators
- `<ch-spinner>` — Loading states
- `<ch-tooltip>` — Contextual hints
- `<ch-skeleton>` — Loading placeholders

### Data Display

- `<ch-avatar>` — User avatars
- `<ch-badge>` — Labels and tags
- `<ch-icon>` — Icons

### Utilities

- `<ch-accordion>` / `<ch-accordion-item>` — Collapsible sections
- `<ch-disclosure>` — Show/hide content
- `<ch-overflow>` — Handle overflow
- `<ch-popup>` — Positioned floating elements

## Theming

Components use CSS custom properties from `@charm-ux/theming`. Include the generated theme CSS:

```html
<link rel="stylesheet" href="path/to/charm/theme.css" />
```

### Token Helpers

The `tokens` object provides typed helpers for accessing design tokens. Three namespaces cover different use cases:

```typescript
import { tokens } from '@charm-ux/core';

// Lit component styles — returns CSSResult for css`` templates
const { component } = tokens.lit;
css`
  background: ${component('button', 'bgColor')};
`;

// JS contexts — returns plain var() strings
element.style.background = tokens.var.semantic('surface', 'primary');

// CSS property names — returns --path only
element.style.setProperty(tokens.prop.semantic('surface', 'primary'), '#fff');
```

### Custom Themes

Configure a custom prefix and token prefix before importing components. The token prefix defaults to the tag prefix if not set separately:

```typescript
import { project, setThemeDefinition } from '@charm-ux/core';
import { charmTokens } from '@charm-ux/theming';

// Tag prefix and token prefix can differ
project.updateProject({ prefix: 'myapp', tokenPrefix: 'charm' });

const myTokens = charmTokens.extendPrimitives({
  color: { brand: '#ff6600' },
});
setThemeDefinition(myTokens.definition);
```

> **Import order matters.** Component styles bake their CSS variable names when the style
> module is first evaluated. Call `project.updateProject()` / `setThemePrefix()` /
> `setThemeDefinition()` **before** importing any component module, or the change will not
> apply to already-imported components. A dev-only `console.warn` fires if you configure the
> theme after styles have been evaluated.

For convenience in component styles, the helpers are also exported directly:

```typescript
import { component } from '@charm-ux/core';
```

### Generating Theme CSS

For runtime CSS generation (SSR, build scripts), import from `@charm-ux/theming`:

```typescript
import { generateTheme } from '@charm-ux/theming';
const { css, cssReset } = generateTheme(definition, 'myapp');
```

See [@charm-ux/theming](https://www.npmjs.com/package/@charm-ux/theming) for token definition and theme customization.

## Subclassing components

Components are built to be extended. Registering a subclass through the project scope keeps
the prefix, suffix, and dependencies wiring automatic:

```typescript
import { property } from 'lit/decorators.js';
import { project } from '@charm-ux/core';
import { CoreButton } from '@charm-ux/core/components/button/button.js';

export class ShapedButton extends CoreButton {
  public static override styles = [...super.styles, additionalStyles];

  /** New attribute, e.g. <ch-button shape="square"> */
  @property({ reflect: true })
  public shape?: 'rounded' | 'square' = 'rounded';
}

// Register with the project scope so the tag picks up the configured prefix/suffix.
// This is required — do not use @customElement() or customElements.define() directly.
project.scope.registerComponent(ShapedButton);
```

The subclass inherits `static baseName`, so the tag prefix and suffix compose automatically.
`static styles = [...super.styles, extra]` is the layering pattern: superclass styles first,
yours last. Note that `registerComponent()` defines a subclass that extends your class, so
`customElements.get(tag)` returns the wrapper, not your class — keep `instanceof` checks on
instances, not identity.

Registering with a different suffix (via `createScope`) or prefix lets multiple Charm-based
libraries coexist on one page. Both the component registry (`window.CharmComponents`) and
the theme prefix are page-wide singletons: two libraries on the same page share one theme
definition and prefix, so configure them once per page.

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
