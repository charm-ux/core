---
'@charm-ux/core': minor
---

### Features

- **`ch-combobox`**: In multiple selection, selected tags can be reached from the keyboard. Tab from the input moves into the tags, and the arrow keys, `Home`, and `End` move between them. `Left` at the start of the input enters the last tag, and `Right` on the last tag returns to the input. `Delete` and `Backspace` remove the focused tag and move focus to the next tag.

### Accessibility

- **`ch-combobox`**: The tag container now has `role="listbox"` and each tag has `role="option"` with `aria-selected="true"`. Only one tag is in the tab order at a time (roving tabindex).
