---
'@charm-ux/core': patch
---

### Fixes

- **`ch-radio-group`**:
  - Disabling the group no longer un-checks the selected radio. The group now force-disables its radios via a `forceDisabled` state that preserves each radio's own `disabled` attribute, so selection survives a disable/re-enable cycle and independently disabled radios stay disabled.
  - Emits an `input` event (in addition to `change`) whenever the selection changes, both on click and keyboard navigation.
  - The roving tabindex, checked state, and force-disabled state are now synchronized in one place (`syncRadioElements`) and keep the "first enabled radio focusable when nothing is selected" behavior.
  - Arrow-key navigation now reuses the shared `findNextEnabledIndex` utility and skips force-disabled radios.
  - The browser's constraint-validation message is anchored to the first enabled radio via `ElementInternals.setValidity(..., validationTarget)` instead of the group host.
  - The `fieldset` now reflects `aria-orientation` from the `layout` attribute.

- **`ch-radio`**:
  - Added an internal `forceDisabled` state so a radio group can disable radios without clobbering their own `disabled` state; force-disabled radios render with the same disabled styling (`force-disabled` attribute) and are excluded from click/keyboard selection and the tab order.

### Tests

- Added coverage for: selection surviving group disable/re-enable, independently disabled radios staying disabled, `input` + `change` firing on click, `aria-orientation` reflection, and radio `forceDisabled` blocking selection and reflecting disabled styling.
