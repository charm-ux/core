# CHARM-001: Extend the correct base class

Charm components form a base-class hierarchy in `packages/core/src/base/`. Pick the
lowest base class that provides the behavior you need — don't extend `LitElement`
directly, and don't re-implement focus/form/dismiss behavior a base already gives you.

| Base class                | Extend it for                                                         | Adds                                                                                                         |
| ------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `CharmElement`            | A plain component with no focus or form semantics (icon, badge, card) | Scope registration, `emit()`, `dir` handling, `dependencies`, `ready` event, scoped element lookup           |
| `CharmFocusableElement`   | Anything that receives focus (button, disclosure trigger)             | `delegatesFocus` shadow root, `focusable` attribute, `hasFocus`/`hadFocus`, `autofocus`, focus/blur handlers |
| `CharmFormControlElement` | Form inputs (checkbox, select, text field)                            | Form association (`formAssociated`), `label`/`helpText`/`hideLabel`/`invalid`, `input`/`change` events       |
| `CharmDismissibleElement` | Show/hide overlays (dialog, popup)                                    | Reflected `open` property, `show()`/`hide()`/`toggle()`, transition lifecycle                                |

Only `CharmElement` declares the `static baseName` field; concrete components assign it
(see [CHARM-002](./CHARM-002.md)). Intermediate base classes do **not** set `baseName`.

**Do:**

```ts
// A focusable component extends the focusable base — focus delegation is free.
export class CoreButton extends CharmFocusableElement {
  public static override baseName = 'button';
}
```

**Don't:**

```ts
// Extending LitElement loses scope registration, emit(), dependencies, and focus handling.
export class CoreButton extends LitElement {
  // now re-implementing delegatesFocus, focus tracking, event helpers by hand...
}
```

See also: [CHARM-002](./CHARM-002.md), [PROP-003](../props/PROP-003.md), [A11Y-003](../accessibility/A11Y-003.md)
