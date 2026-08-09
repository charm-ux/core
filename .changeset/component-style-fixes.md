---
'@charm-ux/core': patch
'@charm-ux/theming': patch
---

Component style and layout fixes

- **`ch-dialog`**: the host and native `<dialog>` now inherit the document's `color-scheme`, so `light-dark()` values and form controls inside the dialog resolve correctly in Firefox and WebKit when the document color scheme changes dynamically.
- **`ch-avatar`**: initials text now uses a `--charm-avatar-fg-color` token (new default `text.primary`); previously the initials color could only be inherited, leaving no token to theme.
- **`ch-menu-group`**: the full-width rule moved from the never-matching `::slotted(menu-item)` selector (the element is `ch-menu-item`) onto a `.group-content` wrapper, so menu items actually stretch to the group width.
- **`ch-alert`**: action and icon containers no longer shrink below their content (`flex: none`), and the heading no longer uses `display: contents`, which removed the heading from the accessibility tree in Chromium.
- **`ch-checkbox`**: label color now uses the shared form-control label token (matching the other form controls) instead of per-state component colors, and the stray label background was removed.
