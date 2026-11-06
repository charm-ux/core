---
'@charm-ux/core': patch
---

[Calendar] Fixed screen readers not announcing a day's selected or current-date state by moving `role="gridcell"`, `aria-selected`, and `aria-current` from the `<td>` onto the focusable day button.
