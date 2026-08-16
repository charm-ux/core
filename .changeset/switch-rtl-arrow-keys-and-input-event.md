---
'@charm-ux/core': patch
---

### Fixes

- **`ch-switch`**:
  - Arrow-key toggling now respects RTL: in a right-to-left context the left arrow checks the switch and the right arrow unchecks it, matching the mirrored thumb travel. The thumb position now also mirrors the direction (`switch-rtl` flips the checked/unchecked transform).
  - Arrow-key toggles now emit an `input` event (in addition to `change`), matching native checkbox semantics and the other form controls.
  - Fixed the thumb travel: the `--charm-switch-thumb-transform` token was being emitted as a full `translateX(...)` value and then wrapped in another `translateX()` in the stylesheet (invalid CSS, so the thumb never moved). It is now a length (default `0px`) that the stylesheet wraps, so a custom shift actually works — and `switch-rtl` mirrors it.
