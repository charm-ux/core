# CHARM-006: Build form controls on `CharmFormControlElement`

Form-associated components (checkbox, switch, radio, select, text field, textarea) must
extend `CharmFormControlElement`. It is the single source of truth for form-control wiring
and provides, once and correctly: `static formAssociated = true`,
`this.internals = this.attachInternals()` in the constructor, `setFormValue` in
`connectedCallback`, `formResetCallback`, `updateValidity()`, and the
`checkValidity`/`reportValidity`/`setCustomValidity` wrappers over `internals.setValidity()`
— plus the shared `label`/`helpText`/`hideLabel`/`invalid` API and its templates. Don't
re-implement `ElementInternals` wiring on a component; delegate validity to the inner native
control through the base.

The base owns a `getFormAssociatedValue()` hook and calls `setFormValue()` on connection and
when relevant state changes. Return `null` for an empty submission; do not skip synchronization
when a value becomes empty. Override the hook for semantic values such as checked controls
(`checked ? value || 'on' : null`) or multi-value `FormData` groups. Do not let the base's
string value overwrite those values.

Capture a control's initial/reset value once, not on every connection: a reflected `value`
attribute may contain an edited value after a move in the DOM. `formDisabledCallback()` must
track fieldset-disabled state separately from the reflected `disabled` property, then use the
effective state (`disabled || formDisabled`) for rendering, validity, and submission. If the
public `disabled` getter includes `formDisabled`, do not let Lit reflect that effective getter:
it can leave the component's own `disabled` attribute set after the fieldset is re-enabled.
Reflect only the component-owned `_disabled` state, and represent the fieldset state with a
separate `form-disabled` attribute.

Synchronize native validity into `ElementInternals` after the inner control exists and whenever
value or constraints change (`required`, `min`, `max`, `pattern`, `disabled`, `readonly`, custom
validity). Apply custom validity to both the native input and `ElementInternals`. Refresh the
cached validation message before deriving `invalid` so an update cannot expose stale state.

Some controls, such as a host-based radio, deliberately have no inner native input because a
second interactive control would create nested-interactive semantics. They still extend this
base and use `ElementInternals`; override only the validity behavior that requires an inner
control, while keeping form association, reset, and fieldset-disabled wiring in the base.

Add browser regression tests for cleared `FormData`, custom errors before and after render,
constraint changes, fieldset disable/enable, reset after moving, and checked/multi-value
submissions. Component happy-path tests alone do not cover these lifecycle interactions.

**Do:**

```ts
export class CoreCheckbox extends CharmFormControlElement {
  public static override baseName = 'checkbox';
  // formAssociated, attachInternals, setFormValue, validity all inherited.
}
```

```ts
// The base owns validity — reuse it, don't reinvent it.
protected updateValidity() {
  this.updateComplete.then(() => {
    this.internals.setValidity(this.input?.validity, this.input?.validationMessage, this.input);
  });
}
```

```ts
// Reflect explicit disabled state, not the effective state returned by the getter.
@property({ type: Boolean })
public get disabled(): boolean {
  return this._disabled || this.formDisabled;
}

public set disabled(value: boolean) {
  if (this._disabled === value) return;
  this._disabled = value;
  this.toggleAttribute('disabled', value);
  this.requestUpdate('disabled');
}
```

**Don't:**

```ts
// Hand-rolled form association on a component — duplicates and diverges from the base.
export class CoreCheckbox extends CharmFocusableElement {
  protected static formAssociated = true;
  private internals = this.attachInternals(); // reinventing the base
  // ...bespoke setValidity/formResetCallback that drift from every other form control
}
```

Note: `CoreButton` is a deliberate exception — it attaches its own internals for
submit/reset behavior without being a full form control. Follow the base for actual inputs.

**Special form values.** Override `getFormAssociatedValue()` rather than writing form values
from a property setter or lifecycle hook. Checkbox-like controls submit according to `checked`
(`checked ? value || 'on' : null`); checkbox groups may return `FormData`. The hook is used for
all base synchronization, including clearing and reconnection.

**Do:**

```ts
// checkbox.ts — one source of truth for updates, empty state, and reconnection
protected override getFormAssociatedValue(): string | null {
  return this.checked ? this.value || 'on' : null;
}
```

```ts
// checkbox-group.ts — preserve its multi-value submission when base state changes
protected override getFormAssociatedValue(): FormData | null {
  return this.getFormValue();
}
```

See also: [CHARM-001](./CHARM-001.md), [PROP-009](../props/PROP-009.md), [A11Y-003](../accessibility/A11Y-003.md)
