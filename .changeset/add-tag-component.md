---
'@charm-ux/core': minor
'@charm-ux/theming': minor
---

Add the `ch-tag` and `ch-tag-group` components.

- `ch-tag`: a compact, focusable label with an optional remove button (`removable`), `disabled` and `selected` states, a `value`, a translatable `remove-label` slot, and a cancelable `tag-remove` event triggered by the remove button or the Delete/Backspace keys.
- `ch-tag-group`: a list of tags with a single tab stop, arrow/Home/End/type-ahead navigation, optional `single` or `multiple` selection exposed as a listbox (`valueAsArray`, `value`, `change` event), label and help-text wiring, an `empty` slot, and focus management when tags are removed.
- Adds `tag` and `tagGroup` tokens to the charm theme.
