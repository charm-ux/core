---
title: 'Extending Charm'
description: 'How to extend Charm components, configure project themes and register custom components in your app.'
tags:
  - getting-started
  - guide
---

Charm provides unstyled, accessible base components designed to be extended and customized for your project's needs.

## Project Configuration

### Setting Up Your Project

Configure your project with a custom prefix and theme before registering components. Keep this configuration in its own module — see [Import Order Matters](#import-order-matters) below for why:

```typescript
// project-config.ts
import { project, setThemeDefinition } from '@charm-ux/core';
import { charmTokens } from '@charm-ux/theming';

// Configure the project prefix early
project.updateProject({ prefix: 'vel', tokenPrefix: 'vel' });

// Create your custom theme by extending charm
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
    },
  }));

// Configure the theme definition — prefix already set by project
setThemeDefinition(myTokens.definition);
```

### Import Order Matters

Component style files evaluate `tokens.lit` when the style module first evaluates. The `primitive`, `semantic`, and `component` helpers are live wrappers that delegate to the current theme configuration, so any call to `setThemePrefix()` or `setThemeDefinition()` before a component is imported is reflected in its styles.

Your app's entry point must import `project-config.ts` **before** anything that imports a component:

```typescript
// main.ts
import './project-config.js'; // configures prefix and theme first
import '@charm-ux/core/components/button/index.js'; // components pick up the configured theme
```

## Styling with Custom Properties

Every Charm component exposes CSS custom properties (CSS variables) that allow you to customize its appearance without writing complex CSS overrides. These properties control colors, spacing, typography, and other visual aspects of the components, and are detailed in individual component API documentation.

You can override these properties at different levels:

- Globally - Apply styles across your entire application
- Per instance - Style individual component instances
- Via theme classes - Create reusable style variations
- Through the [scoped-styles component](/components/scoped-styles/)

## Extending Components

### Extending the Charm Design System

First, configure your project with a unique prefix and theme, in its own module (see [Import Order Matters](#import-order-matters) above):

```typescript
// project-config.ts
import { project } from '@charm-ux/core';

project.updateProject({
  prefix: 'vel',
});
```

To extend a component, extend the base Charm class and provide additional styling/functionality.

For instance, to create a button with a nested icon and variant attribute:

```typescript
// shaped-button.ts
import { property } from 'lit/decorators.js';
import { CoreButton } from '@charm-ux/core/components/button/button.js';
import styles from './shaped-button.styles.js';

export class ShapedButton extends CoreButton {
  public static override styles = [...super.styles, styles];

  /** Shape of the button */
  @property({ reflect: true })
  public shape?: 'rounded' | 'circular' | 'square' = 'rounded';
}

export default ShapedButton;
```

Create the component styles using theme tokens:

```typescript
// shaped-button.styles.ts
import { css } from 'lit';
import { tokens } from '@charm-ux/core';

const { component } = tokens.lit;

export default css`
  :host([shape='square']) .control {
    border-radius: 0;
  }

  :host([shape='circular']) .control {
    border-radius: ${component('button', 'borderRadius')};
  }
`;
```

Register your component using the project scope:

```typescript
// index.ts
import { project } from '@charm-ux/core';
import button from './shaped-button.js';

export * from './shaped-button.js';

project.scope.registerComponent(button);
```

> **Don't use `@customElement()` / `customElements.define()` for Charm components.**
> Charm components must be registered through the project scope so the tag picks up the
> configured prefix/suffix and nested dependencies are wired. Registering one with the bare
> decorator throws a descriptive error at construction, because the tag isn't backed by a
> scope.
>
> Import the component class from its class module (`.../button/button.js`) when
> subclassing, rather than the barrel (`.../button/index.js`) — the barrel registers
> `<ch-button>` as a side effect, which you may not want when defining your own tag.

### Tokens API

The `tokens` object exposes three namespaces for accessing design tokens, each suited to a different context:

| Namespace     | Returns                         | Use case                                |
| ------------- | ------------------------------- | --------------------------------------- |
| `tokens.lit`  | Lit `CSSResult` (`var(--path)`) | Component `css` template literals       |
| `tokens.var`  | Plain string (`var(--path)`)    | JS context where `CSSResult` won't work |
| `tokens.prop` | CSS property name (`--path`)    | `setProperty()` / `getPropertyValue()`  |

All three expose `primitive()`, `semantic()`, and `component()` helpers that stay in sync with the current theme configuration.

#### Lit Component Styles — `tokens.lit`

Returns Lit `CSSResult` objects safe to interpolate in `css` tagged templates. For component styles, the helpers are also exported directly:

```typescript
import { css } from 'lit';
import { component } from '@charm-ux/core';

// Shorthand — equivalent to `const { component } = tokens.lit;`
```

When you need all three helpers, destructure from `tokens.lit` as usual:

```typescript
import { css } from 'lit';
import { tokens } from '@charm-ux/core';

const { primitive, semantic, component } = tokens.lit;

export default css`
  .base {
    padding: ${primitive('spacing', 'md')};
    border-radius: ${primitive('borderRadius', 'sm')};
    background: ${semantic('surface', 'primary')};
    color: ${semantic('text', 'primary')};
    border: ${component('button', 'borderWidth')} solid ${component('button', 'borderColor')};
  }
`;
```

#### JS Contexts — `tokens.var`

Returns plain `var()` strings for use outside Lit's `css` template (inline styles, canvas, etc.):

```typescript
const bg = tokens.var.semantic('surface', 'primary');
element.style.background = bg;
```

#### CSS Property Names — `tokens.prop`

Returns just the custom property name without the `var()` wrapper, ideal for `setProperty`:

```typescript
element.style.setProperty(tokens.prop.semantic('surface', 'primary'), '#fff');
const value = getComputedStyle(element).getPropertyValue(
  tokens.prop.semantic('surface', 'primary')
);
```

#### Generating Theme CSS — `generateTheme`

If you need to generate theme CSS at runtime (server-side rendering, build scripts, etc.),
import directly from `@charm-ux/theming`:

```typescript
import { generateTheme } from '@charm-ux/theming';

const { css, cssReset, cssUtilities } = generateTheme(myDefinition, { prefix: 'fui' });
```

## Creating New Components

To create a new component, extend either `CharmElement` or for dismissible elements (popups, menus, etc.) that need `show/hide` and associated events, `CharmDismissibleElement`.

Provide a comprehensive [JSDoc](https://jsdoc.app/) header above your component class. This documentation is parsed to generate the `custom-elements.json` manifest file, which powers IDE autocompletion, documentation sites, and other tooling.

**Required documentation:**

- Component description explaining its purpose and use cases
- `@slot` tags for all slots (default and named)
- `@csspart` tags for all exposed shadow parts
- `@cssproperty` tags for all CSS custom properties

```typescript
// tag.ts
import { html } from 'lit/static-html.js';
import { property } from 'lit/decorators.js';
import { CharmElement } from '@charm-ux/core';
import { CoreIcon } from '@charm-ux/core/components/icon/icon.js';
import styles from './tag.styles.js';

/**
 * A tag is a small component typically used to convey additional information or status.
 *
 * @slot - The content of the tag.
 *
 * @csspart tag-base - The component's base wrapper.
 *
 * @cssproperty --charm-tag-bg-color - Background color of the tag.
 * @cssproperty --charm-tag-border-color - Border color.
 * @cssproperty --charm-tag-border-radius - Border radius.
 * @cssproperty --charm-tag-fg-color - Text color.
 * @cssproperty --charm-tag-gap - Spacing between icon and content.
 * @cssproperty --charm-tag-padding - Padding.
 */
export class MyTag extends CharmElement {
  public static override styles = [...super.styles, styles];
  public static override baseName = 'tag';

  public static override get dependencies(): (typeof CharmElement)[] {
    return [CoreIcon];
  }

  @property({ reflect: true })
  public iconName?: string = 'person';

  protected tagTemplate() {
    return html`
      <div class="base" part="tag-base">
        <ch-icon name=${this.iconName}></ch-icon>
        <slot></slot>
      </div>
    `;
  }

  protected override render() {
    return this.tagTemplate();
  }
}

export default MyTag;
```

Create styles using theme tokens:

```typescript
// tag.styles.ts
import { css } from 'lit';
import { tokens } from '@charm-ux/core';

const { primitive, semantic } = tokens.lit;

export default css`
  .base {
    display: inline-flex;
    align-items: center;
    gap: var(--tag-gap, ${primitive('spacing', 'sm')});
    padding: var(--tag-padding, ${primitive('spacing', 'xs')} ${primitive('spacing', 'md')});
    background: var(--tag-bg-color, ${semantic('surface', 'secondary')});
    color: var(--tag-fg-color, ${semantic('text', 'primary')});
    border: ${primitive('borderWidth', 'thin')} solid
      var(--tag-border-color, ${semantic('border', 'primary')});
    border-radius: var(--tag-border-radius, ${primitive('borderRadius', 'md')});
  }
`;
```

Register your component:

```typescript
// index.ts
import { project } from '@charm-ux/core';
import tag from './tag.js';

export * from './tag.js';

project.scope.registerComponent(tag);
```

## Adding Custom Tokens

When extending the theme, you can add new component tokens:

```typescript
const myTokens = charmTokens.extendComponents(({ primitive, semantic }) => ({
  // Add tokens for your new component - merged into the inherited components,
  // so the existing component tokens are left untouched.
  tag: {
    bgColor: semantic('surface', 'secondary'),
    fgColor: semantic('text', 'primary'),
    borderColor: semantic('border', 'primary'),
    borderRadius: primitive('borderRadius', 'md'),
    padding: primitive('spacing', 'sm'),
    gap: primitive('spacing', 'xs'),
  },
}));
```

The component factory receives `{ primitive, semantic }` reference helpers — use `semantic(...)` to point at semantic tokens and `primitive(...)` for raw primitives. The returned tokens are deep-merged into what you inherited, so you only describe additions and overrides.

Then access them in your styles:

```typescript
const { component } = tokens.lit;

css`
  .base {
    background: ${component('tag', 'bgColor')};
    color: ${component('tag', 'fgColor')};
  }
`;
```

## Injecting Raw CSS

Sometimes a theme needs plain CSS that isn't expressible as a token — a global reset tweak, a keyframes rule, or a utility class. Use `.extendRawCss()` to append CSS to the generated `reset`, `theme`, and `utilities` files:

```typescript
const myTokens = charmTokens.extendRawCss({
  theme: `
    @keyframes brand-pulse {
      from { opacity: 1; }
      to { opacity: 0.6; }
    }
  `,
});
```

The plain-object form **appends** each bucket after whatever was inherited from the base theme. To reference tokens or take full control over inherited CSS, pass a factory instead — it receives `{ primitive, semantic, component }` reference helpers and the inherited raw CSS as `base`, and its return value **replaces** the inherited raw CSS:

```typescript
const myTokens = charmTokens.extendRawCss(({ semantic }, base) => ({
  // Keep the inherited buckets, then append to `theme`
  ...base,
  theme: `${base?.theme ?? ''}
    .brand-surface {
      background: ${semantic('surface', 'brand')};
      color: ${semantic('text', 'primary')};
    }
  `,
}));
```

Because the factory return replaces inherited raw CSS, you control inheritance explicitly:

- **Append** — spread `base` and interpolate `base?.<bucket>` into your new value.
- **Drop** an inherited bucket — omit it from the returned object.
- **Replace** a bucket — return a fresh value for it without referencing `base`.
