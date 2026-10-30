---
'@charm-ux/core': minor
'@charm-ux/theming': minor
---

### Combobox

Added `<ch-combobox>`, `<ch-option>`, and `<ch-option-group>`:

- A filterable listbox with single and multiple selection, option groups, disabled options, custom
  values, loading and empty states, clear and tag removal actions, and form association.
- An opt-in `select-only` mode with typeahead, selection-oriented keyboard controls, and a
  screen-reader-accessible listbox toggle.
- A `mode` property with `none`, `inline`, `list`, and `both` autocomplete behaviors (`both` by
  default).
- Keyboard support for arrows, Home/End, PageUp/PageDown, Enter, Escape, and Backspace, with
  `should-focus-wrap` for wrapping navigation.
- Configurable through `menu-trigger`, `filter`, `allows-custom-value`,
  `allows-empty-collection`, `auto-highlight`, `with-clear`, and inherited form-control properties.
- Options are data sources authored in the light DOM; the combobox renders the accessible listbox
  inside its shadow root.

Added `combobox` component tokens for tags, the listbox, groups, options, and selected-option
checks, derived from the shared form-control semantic tokens.
