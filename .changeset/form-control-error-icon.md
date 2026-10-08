---
'@charm-ux/core': patch
---

### Fixes

- **Form controls**: Render the error icon only when an interacted control is invalid, while keeping the error live region available for assistive technology in all states. This avoids creating an unused icon custom element for valid controls.
