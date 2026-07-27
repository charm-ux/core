# PROP-005: Document every property, event, slot, and part

Every public member of a component's API must be documented so the generated
custom-elements manifest, Storybook controls, and consumer autocomplete stay complete:

- **Properties** — a JSDoc comment above the `@property` declaration.
- **Events, slots, parts, CSS custom properties** — a tag in the class JSDoc block
  (`@event`, `@slot`, `@csspart`, `@cssproperty`); see [CHARM-005](../internal/CHARM-005.md).

Adding or changing any of these is not done until its documentation is updated in the same
change. Type event details in the tag when consumers rely on the payload
(`@event {TabsChangeEvent} tabs-change`).

**Do:**

```ts
export class CoreButton extends CharmFocusableElement {
  /** The button's semantic type. Ignored when rendered as a link. */
  @property({ reflect: true })
  public type: 'button' | 'submit' | 'reset' = 'button';

  /** When true, renders with icon-only spacing and no visible label. */
  @property({ type: Boolean, reflect: true, attribute: 'icon-only' })
  public iconOnly?: boolean;
}
```

**Don't:**

```ts
// Undocumented public props — absent from generated docs and controls, and their intent
// (why does iconOnly exist? what does type do?) is lost.
@property({ reflect: true })
public type: 'button' | 'submit' | 'reset' = 'button';

@property({ type: Boolean, reflect: true, attribute: 'icon-only' })
public iconOnly?: boolean;
```

See also: [CHARM-005](../internal/CHARM-005.md), [PROP-001](./PROP-001.md), [DOC-001](../documentation/DOC-001.md)
