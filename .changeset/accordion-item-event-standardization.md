---
'@charm-ux/core': minor
---

### Accordion item event standardization

`<ch-accordion-item>` now emits the standard dismissible event surface that every other
show/hide component (`dialog`, `menu`, `tooltip`, `disclosure`, `alert`, ...) uses, instead of the
bespoke `accordion-item-open-change` event:

- `accordion-item-show` — emitted when the item begins to open.
- `accordion-item-after-show` — emitted after the item has opened and its animation has finished.
- `accordion-item-hide` — emitted when the item begins to close.
- `accordion-item-after-hide` — emitted after the item has closed and its animation has finished.

**Breaking:** `accordion-item-open-change` has been removed. Consumers listening for it should listen
for `accordion-item-show` / `accordion-item-hide` instead (or the `*-after-*` variants when the
animation matters).

**Behavior.**

- The `after-show` / `after-hide` events now settle after the block-size animation actually
  completes (they previously fired immediately). An unanimated item still settles them immediately.
- `<ch-accordion open-single>` now reacts to the item's `accordion-item-show` event, which also
  removed the accordion's now-unnecessary re-entrancy guard.
