---
'@charm-ux/core': patch
---

Fix `ch-tooltip` hover flicker and flash-on-click

- Moving the pointer between the anchor and the tooltip no longer dismisses the tooltip
  (the `mouseout` handler now ignores transitions whose target is still inside the anchor
  or the tooltip).
- Pressing the anchor now light-dismisses the tooltip so it doesn't flash while the click
  is in progress, and hover/focus won't reopen it until the pointer fully leaves or the
  anchor blurs.
