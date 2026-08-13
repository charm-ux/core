---
'@charm-ux/core': patch
---

### Fixes

- **`ch-button-group`**:
  - Roving tabindex now lives on the slotted children — the same index space arrow-key navigation uses — so the initial tab stop and keyboard movement can't drift apart (previously the tab stop was assigned via a flattened button list while navigation used the slotted children, so they mismatched).
  - The initial tab stop lands on the first _enabled_ slotted item instead of index `0`, and all items including a disabled first one get `tabindex="-1"` as appropriate (A11Y-007).
  - Added `Home` / `End` key handling to jump to the first/last enabled item.
  - Added a `focusin` handler so the roving index stays in sync when an item is focused by click/tab, not just arrow keys — arrow navigation after a mouse click now continues from the clicked item.
  - Attribute changes to `toolbar`, `vertical`, `split`, and `select` now re-run propagation immediately instead of waiting for a slotchange, and removing them clears stale child attributes (`tabindex`, `toolbar`, `vertical`, `split`, `toggle`). Removing `toolbar` restores default tab behavior on children.
  - Removing the group now resets all attributes it propagated to children so re-attaching doesn't leave children tab-trapped or carrying stale state.
  - The base element now reflects `aria-orientation` (`vertical` / `horizontal`) in toolbar mode.
  - Single-select mode no longer wipes `pressed` from the button that was just clicked — only the other buttons are cleared.

### Tests

- Updated the toolbar roving index test to assert on slotted children and added coverage for: tab stop skipping disabled items, `Home`/`End` navigation, focus-anchored arrow navigation, runtime attribute re-propagation and stale-attribute removal, `toolbar` removal restoring tab order, and single-select preserving the clicked button's pressed state.
