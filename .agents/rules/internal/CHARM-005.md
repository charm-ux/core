# CHARM-005: Keep the custom-elements manifest accurate with JSDoc tags

The custom-elements manifest (`custom-elements.json`) is generated from the JSDoc block
above each component class by `@custom-elements-manifest/analyzer`. This manifest powers
Storybook controls, docs, and editor autocomplete for consumers — so the tags are public
API, not decoration. Every public event, slot, part, and CSS custom property must have a
tag, and adding/removing one of these means updating the block comment in the same change.

Tags used in this codebase: `@tag`, `@summary`, `@since`, `@status`, `@event`
(optionally typed: `@event {DialogRequestCloseEvent} dialog-request-close`), `@slot`,
`@csspart`, `@cssproperty`, `@dependency`.

**Do:**

```ts
/**
 * Buttons are used to commit a change or complete steps in a task.
 *
 * @tag ch-button
 * @since 1.0.0
 * @status beta
 *
 * @event change - Indicates the current toggling state through e.target.pressed.
 *
 * @slot - The button's content.
 * @slot start - A presentational prefix icon or similar element.
 *
 * @csspart button-control - The component's base wrapper.
 *
 * @cssproperty --charm-button-bg-color - Sets the background color of the button.
 */
export class CoreButton extends CharmFocusableElement {}
```

**Don't:**

```ts
// Adds an `end` slot and a `--charm-button-shadow` property in the template/styles
// but leaves the JSDoc block stale — consumers never see them in docs or controls.
export class CoreButton extends CharmFocusableElement {}
```

See also: [PROP-005](../props/PROP-005.md), [DOC-001](../documentation/DOC-001.md)
