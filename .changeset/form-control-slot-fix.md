---
'@charm-ux/core': patch
---

Expose slotted form control labels to the accessibility tree

`ch-input`, `ch-select` and `ch-text-area` rendered their `<label>` with
`aria-hidden=${this.label ? 'false' : 'true'}`, which only accounted for the `label`
property. A label supplied through the `label` **slot** was therefore removed from the
accessibility tree, and because `ch-input` and `ch-text-area` set no `aria-label`, the
control was left with no accessible name at all — a WCAG 2.2 AA failure (4.1.2) for the
documented slot API. The condition is now `this.hasLabel`, which
`CharmFormControlElement` already computes from the property _and_ the slot, and which the
sibling `form-control-has-label` class was already using.

`ch-select` also set `aria-label` on its native `<select>`. That masked the bug for select
alone, and an attribute cannot be reached by browser translation, so the name went
untranslated in every non-English locale. It is removed; the `<label for="input">` names
the control on its own.

No change for consumers using the `label` property.
