---
'@charm-ux/core': patch
---

### Fixes

- Fixed `ch-checkbox` and `ch-switch` form reset and submission behavior so checked-dependent values are restored and submitted correctly.
- Simplified checkbox click handling to avoid double-triggering and removed the invalid internal id binding.
