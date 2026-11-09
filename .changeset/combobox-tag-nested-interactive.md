---
'@charm-ux/core': minor
---

[Combobox] Changed each multiple-selection tag's remove control from a `<button>` to a pointer-only `aria-hidden` `<span>`, fixing the axe `nested-interactive` violation; keyboard users still remove the focused tag with Delete or Backspace. The tag's accessible name ("Remove Apple") now comes from visually hidden `remove-label` text instead of a duplicated `aria-label`, and `::part(combobox-tag-remove):disabled` no longer matches (use `ch-combobox[disabled]::part(combobox-tag-remove)` instead).
