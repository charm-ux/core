---
'@charm-ux/core': patch
---

### Fixes

- **`ch-tabs`**: Arrow-key navigation now respects RTL — in a right-to-left context, ArrowRight moves to the previous tab and ArrowLeft to the next (matching the visual direction), for horizontal layouts. Vertical layouts are unaffected.
