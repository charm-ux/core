---
title: Extending Charm
---

Charm provides unstyled, accessible base components designed to be extended and customized for your project's needs.

## Styling with custom properties

Every Charm component exposes CSS custom properties (CSS variables) that allow you to customize its appearance without writing complex CSS overrides. These properties control colors, spacing, typography, and other visual aspects of the components, and are detailed in individual component API documentation.

You can override these properties at different levels:

- Globally - Apply styles across your entire application
- Per instance - Style individual component instances
- Via theme classes - Create reusable style variations
- Through the [scoped-styles component](/components/scoped-styles/)

## Extending Charm

### Extending the Charm design system

First, you need to extend the `project` class to give your components a unique prefix. For instance, for components such as `vel-button`, and `vel-card`:

```typescript
// project-config.ts
import { project } from '@charm-ux/core';

project.updateProject({
  prefix: 'vel',
});
```

To extend a component, you will extend the base charm class and provide additional styling/functionality.

For instance, to create a button with a nested icon and variant attribute and styling, you first extend the base button class with a new source file:

```typescript
// shaped-button.ts
import { property } from 'lit/decorators.js';
import { CoreButton } from '@charm-ux/core';
import styles from './shaped-button.styles.js';

export class ShapedButton extends CoreButton {
  public static override styles = [...super.styles, styles];

  /** Shape of the button */
  @property({ reflect: true })
  public shape?: 'rounded' | 'circular' | 'square' = 'rounded';
}

export default ShapedButton;
```

Then create the necessary styles:

```typescript
// shaped-button-styles.ts
import { css } from 'lit';

export default styles = css`
  :host([shape='square']) {
    --button-border-radius: var(--border-radius-none);
  }

  :host([shape='circular']) {
    --button-border-radius: var(--border-radius-circular);
  }
`;
```

Finally, register your new component using the `project` object in the `index.ts` file:

```typescript
// index.ts
import { project } from '@charm-ux/core';
import button from './shaped-button.js';

export * from './shaped-button.js';

project.scope.registerComponent(button);
```

### Creating a new component

To create a new component, you'll need to extend either `CharmElement` or for dismissible elements (popoups, menus, etc.) that need `show/hide` and associated events, `CharmDismissibleElement`.

Provide a comprehensive [JSDoc](https://jsdoc.app/) header above your component class. This documentation is parsed to generate the `custom-elements.json` manifest file, which powers IDE autocompletion, documentation sites, and other tooling.

**Required documentation:**

- Component description explaining its purpose and use cases
- `@slot` tags for all slots (default and named)
- `@csspart` tags for all exposed shadow parts
- `@cssproperty` tags for all CSS custom properties

```typescript
//tag.ts
import { html } from 'lit/static-html.js';
import { CharmElement } from '@charm-ux/core';
import { CoreIcon } from '@charm-ux/core';
import styles from './tag.styles.js';

/**
 * A tag is a small component typically used in user interfaces to convey additional information or status in a compact visual form.
 *
 * @slot - The content of the tag.
 *
 * @csspart tag-base - The component's base wrapper.
 *
 * @cssproperty --tag-bg-color - determines the background color of the tag.
 * @cssproperty --tag-border-color - determines the border color.
 * @cssproperty --tag-border-radius - determines the border radius.
 * @cssproperty --tag-border-style - determines the border style.
 * @cssproperty --tag-border-width - determines the border.
 * @cssproperty --tag-fg-color - determines the color of the text.
 * @cssproperty --tag-gap - determines the spacing between tag icon and content.
 * @cssproperty --tag-padding - determines the padding.
 **/

export class MyTag extends CharmElement {
  public static override styles = [...super.styles, styles];
  // The baseName sets the tag name of the component
  public static override baseName = 'tag';

  // Add any other components you use to the dependencies array so that they are properly registered
  // along with your base component
  public static override get dependencies(): (typeof CharmElement)[] {
    return [CoreIcon];
  }

  /** Tag icon name */
  @property({ reflect: true })
  public iconName?: string = 'person';

  // prefer protected template methods for component layout to make extending the component easier
  /** Generates the HTML template for tag. */
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

Create the component's styles in a separate file:

```typescript
// tag.styles.js
import { css } from 'lit';

export default css`
  .base {
    display: inline-flex;
    align-items: center;
    gap: var(--tag-gap, 0.5rem);
    padding: var(--tag-padding, 0.25rem 0.75rem);
    background: var(--tag-bg-color, var(--color-neutral-100));
    color: var(--tag-fg-color, var(--color-neutral-900));
    border: var(--tag-border-width, 1px) var(--tag-border-style, solid)
      var(--tag-border-color, var(--color-neutral-300));
    border-radius: var(--tag-border-radius, var(--border-radius-medium));
    font-size: var(--tag-font-size, 0.875rem);
  }
`;
```

Finally, register your new component in `index.ts`:

```typescript
//index.ts
import { project } from '@charm-ux/core';
import tag from './tag.js';

export * from './tag.js';

project.scope.registerComponent(tag);
```
