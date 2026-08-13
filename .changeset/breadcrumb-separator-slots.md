---
'@charm-ux/core': minor
---

### Breadcrumb separator slots and RTL

`<ch-breadcrumb>` now supports a `separator` slot that acts as the default separator for the whole
trail, mirroring `<sp-breadcrumb>`:

- A separator placed in `<ch-breadcrumb>`'s `separator` slot is cloned into every
  `<ch-breadcrumb-item>` that does not provide its own, and is refreshed whenever the trail or the
  separator changes.
- A single item can still override the group separator by placing content in its own `separator`
  slot — that content is left untouched.
- Injected separators carry a `data-default` marker and clone the breadcrumb's separator, so ids in
  the slotted separator are stripped on each clone.

The default separator is now direction-aware:

- `<ch-breadcrumb-item>` renders `chevron-left` in `rtl` and `chevron-right` in `ltr` (previously
  always `chevron-right`).
- The breadcrumb regenerates default separators when its own direction changes.

`chevron-left` was added to the default icon set.
