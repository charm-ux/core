---
title: Extending Charm
---

Charm provides unstyled, accessible base components designed to be extended and customized for your project's needs.

## Project Configuration

### Setting Up Your Project

Configure your project with a custom prefix and theme before registering components. Keep this configuration in its own module — see [Import Order Matters](#import-order-matters) below for why:

```typescript
// project-config.ts
import { project } from '@charm-ux/core';
import { charmTokens } from '@charm-ux/theming';

// Create your custom theme by extending charm
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
    },
  }));

// Configure the project
project.updateProject({
  prefix: 'vel', // Components will be <vel-button>, <vel-card>, etc.
  theme: {
    definition: myTokens.definition,
    tokenPrefix: 'vel', // CSS variables will be --vel-*
  },
});

// Access generated CSS directly from project
const { css, cssReset, cssUtilities } = project.generateTheme();
// Or use the convenience getters: project.css, project.cssReset, project.cssUtilities
```

### Theme Configuration Options

The `theme` option in `project.updateProject()` accepts:

| Option        | Description                                                           |
| ------------- | --------------------------------------------------------------------- |
| `definition`  | Token definition from `defineTokens()` or extended from `charmTokens` |
| `tokenPrefix` | CSS variable prefix (e.g., `'vel'` → `--vel-button-bgColor`)          |

### Import Order Matters

Component style files read `project.theme` once, when the style module first evaluates. If a component is imported before `project.updateProject()` runs, that component's styles are locked to the default `charm` prefix regardless of any configuration that happens afterward — so your app's entry point must import `project-config.ts` **before** anything that imports a component:

```typescript
// main.ts
import './project-config.js'; // configures the theme first
import '@charm-ux/core/dist/components/button/index.js'; // components now pick up the configured theme
```

This is why `project-config.ts` lives in its own module: a single file's own code always runs _after_ all of that file's imports resolve, so writing `project.updateProject()` above a component import in the same file doesn't help — the component import still evaluates first.

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
import { CoreButton } from '@charm-ux/core/dist/components/button/button.js';
import styles from './shaped-button.styles.js';

export class ShapedButton extends CoreButton {
  public static override styles = [...super.styles, styles];

  /** Shape of the button */
  @property({ reflect: true })
  public shape?: 'rounded' | 'circular' | 'square' = 'rounded';
}

export default ShapedButton;
```

Create the component styles using project theme tokens:

```typescript
// shaped-button.styles.ts
import { css } from 'lit';
import { project } from '@charm-ux/core';

const { component } = project.theme;

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

### Using Theme Tokens in Styles

Access theme token helpers via `project.theme`:

```typescript
import { css } from 'lit';
import { project } from '@charm-ux/core';

const { primitive, semantic, component } = project.theme;

export default css`
  .base {
    /* Primitive tokens */
    padding: ${primitive('spacing', 'md')};
    border-radius: ${primitive('borderRadius', 'sm')};

    /* Semantic tokens */
    background: ${semantic('surface', 'primary')};
    color: ${semantic('text', 'primary')};

    /* Component tokens */
    border: ${component('button', 'borderWidth')} solid ${component('button', 'borderColor')};
  }
`;
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
import { CoreIcon } from '@charm-ux/core/dist/components/icon/icon.js';
import styles from './tag.styles.js';

/**
 * A tag is a small component typically used to convey additional information or status.
 *
 * @slot - The content of the tag.
 *
 * @csspart tag-base - The component's base wrapper.
 *
 * @cssproperty --tag-bg-color - Background color of the tag.
 * @cssproperty --tag-border-color - Border color.
 * @cssproperty --tag-border-radius - Border radius.
 * @cssproperty --tag-fg-color - Text color.
 * @cssproperty --tag-gap - Spacing between icon and content.
 * @cssproperty --tag-padding - Padding.
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
import { project } from '@charm-ux/core';

const { primitive, semantic } = project.theme;

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
const myTokens = charmTokens.extendComponents((ref, base) => ({
  ...base,
  // Add tokens for your new component
  tag: {
    bgColor: ref('surface', 'secondary'),
    fgColor: ref('text', 'primary'),
    borderColor: ref('border', 'primary'),
    borderRadius: ref('borderRadius', 'md'),
    padding: ref('spacing', 'sm'),
    gap: ref('spacing', 'xs'),
  },
}));
```

Then access them in your styles:

```typescript
const { component } = project.theme;

css`
  .base {
    background: ${component('tag', 'bgColor')};
    color: ${component('tag', 'fgColor')};
  }
`;
```
