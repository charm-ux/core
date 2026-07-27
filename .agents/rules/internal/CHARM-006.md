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

See also: [CHARM-001](./CHARM-001.md), [PROP-009](../props/PROP-009.md), [A11Y-003](../accessibility/A11Y-003.md)
