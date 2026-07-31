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

**Checked-dependent form values.** Checkbox-like controls (checkbox, switch) submit different
form values depending on `checked` (`checked ? value || 'on' : null`). The base syncs the form
value from `value` in `connectedCallback`, so a bare `setFormValue` in the `checked` setter gets
clobbered on (re)connection — re-parenting a control into a form is enough to lose the value.
Re-apply the checked-dependent value after the base runs: set it in `willUpdate` when `checked`
changes (checkbox), and/or override `connectedCallback` to re-apply it after `super` (switch).

**Do:**

```ts
// checkbox.ts — re-applied on every update where checked changed, survives re-parenting
protected override willUpdate(changedProperties: PropertyValues) {
  super.willUpdate(changedProperties);
  if (changedProperties.has('checked')) {
    this.internals.setFormValue(this.checked ? this.value || 'on' : null);
  }
}
```

```ts
// switch.ts — connectedCallback in the base syncs from `value`; re-apply after super
public override connectedCallback(): void {
  super.connectedCallback();
  this.internals.setFormValue(this.checked ? this.value || 'on' : null);
}
```

See also: [CHARM-001](./CHARM-001.md), [PROP-009](../props/PROP-009.md), [A11Y-003](../accessibility/A11Y-003.md)
