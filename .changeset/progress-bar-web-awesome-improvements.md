---
'@charm-ux/core': patch
---

### Fixes

- **`ch-progress-bar`**:
  - The indicator width now animates reliably in Safari. Width updates are deferred by one animation frame so the `--progress-percent` change is applied after the browser has settled on the previous value. The initial render is still applied synchronously so the bar doesn't sweep in from 0 on mount, and a pending frame is cancelled on disconnect.
  - The indicator percentage is now clamped to `0`–`100`, so `value` above `max` (or a non-positive `max`) can no longer overflow the track or invert the fill.

### Improvements

- **`ch-progress-bar`**:
  - The label element is now always rendered and `aria-labelledby` is always wired, so the bar has a stable accessible name. When neither the `label` attribute nor the default slot is provided, a fallback `Progress` text names the bar for assistive tech.
  - The indeterminate animation now moves a fixed-width indicator and animates only `inset-inline-start`, avoiding a width flicker against the width transition token.

### Tests

- Updated the progress-bar harness to await the deferred frame before asserting `--progress-percent`, and added coverage for value clamping and the fallback label/`aria-labelledby` wiring.
