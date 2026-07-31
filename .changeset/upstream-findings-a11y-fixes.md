---
'@charm-ux/core': patch
'@charm-ux/theming': patch
---

### Fixes

- **`ch-switch`**: form submission now preserves checked-state semantics — an unchecked switch submits no value and a checked switch submits `value` (or `"on"` by default). Re-connecting the element (e.g. moving it into a form) no longer clobbers the checked-dependent form value, and the base class' value sync no longer overrides it. Form value is now set from a single `willUpdate` path (mirroring `ch-checkbox`), and a form reset restores the switch to its initial checked state.
- **`ch-tabs` / `ch-button-group`**: arrow-key roving navigation now skips disabled items (arrows, Home, and End wrap to the nearest enabled item) instead of moving focus onto disabled controls. `ch-tab` also removes `aria-disabled` when a tab is re-enabled.
- **`ch-tab-panel`**: the `transitionend` listener is now removed on disconnect, so panels don't leak listeners when re-parented.
- **`ch-checkbox`**: indeterminate state is now reflected on the internal input; `aria-describedby` points at `help-text` only when help text is present.
- **`ch-radio-group`**: now participates in form submission (`formValue` / `formValueWhenNoneSelected`), focuses the selected radio by default, and wires up the fieldset legend/label a11y correctly.
- **`ch-breadcrumb-item`**: renders a native `<button>` for non-link items and an `<a>` for link items (instead of a generic element with click handling).
- **`ch-progress-bar`**: `hideLabel` no longer hides the whole bar; renders a `<meter>` for determinate progress with proper role/`aria-labelledby`, and omits `aria-valuenow` in the indeterminate state.
- **`ch-disclosure` / `ch-push-pane`**: closed content is now `inert` (removed from the tab order and a11y tree); `ch-disclosure` links the toggle to the panel via `aria-controls`.
- **`ch-icon`**: labeled icons render with `role="img"` + `aria-label`; unlabeled icons are `aria-hidden="true"`.
- **`ch-avatar`**: the initials fallback only gets `role="img"` when there is no image (no duplicate img role when an image is present).
- **`ch-menu`**: `popup-request-close` now closes the menu; `ch-menu-item` moves `aria-disabled` onto the host (which carries `role="menuitem"`) instead of the inner control, and syncs `aria-checked` when the role changes.
- **`ch-dialog`**: reflects `alert` instead of rendering a redundant `alertdialog` role, and body-scroll-lock is now reference-counted so stacked/nested dialogs restore overflow correctly.
- **`ch-divider`**: renders `role="separator"` with `aria-orientation` by default; `presentation` role omits them.
- **`ch-scoped-styles`**: failed stylesheet loads are now counted (via `onerror`) so `writeStyle()` isn't stuck waiting on links that errored, and `:root` replacement no longer double-replaces already-minified rules.
- **Theming**: `defineTokens()` and `createCssHelpers()` now default to the `charm` prefix (matching `cssVar()`/`createCssHelpers()`), so token helpers without an explicit prefix produce consistent variable names. `ch` utilities now import from `@charm-ux/theming/themes` and `@charm-ux/theming/lit` subpaths (with a local `toKebabCase`) instead of the root barrel, and tag prefixes are validated as lowercase-alphanumeric tokens.

### Tests

- Added regression tests across the affected components: switch/checkbox/radio-group form submission, tabs/button-group roving navigation with disabled items, progress-bar meter semantics, disclosure/push-pane `inert`, icon/avatar roles, menu close on popup-request, dialog alert role + nested body-scroll-lock, divider separator role, tab `aria-disabled` on re-enable, and breadcrumb-item button/anchor rendering.
