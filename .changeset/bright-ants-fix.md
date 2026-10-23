---
'@charm-ux/core': minor
'@charm-ux/theming': patch
---

Fix form submission and validity synchronization, fieldset disabled-state handling, reset defaults, dismissible transition settlement, date localization/input normalization, scoped slot detection, and accessible form-control focus and contrast. `createScope()` now returns an independent scope instance; the incorrect internal `customTag` getter was removed. Test-only helpers that remain in production barrels are deprecated ahead of a future removal.
