---
'@charm-ux/core': patch
---

### Fixes

- **Switch performance**: Match checked-state styles through an internal class instead of the reflected host attribute, reducing style invalidation during bulk toggles while preserving the switch animation and state visuals.
- **Reduced motion**: Disable switch transitions when `prefers-reduced-motion: reduce` is active.
