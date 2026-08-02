---
'@charm-ux/theming': minor
'@charm-ux/core': minor
---

Normalize design token names to the slot grammar from ADR-0001

Token paths now follow `<category> [.<role>] [.<state>…] .<property>`. Conditional states
(`checked`/`unchecked`) come before interaction states (`hover`/`active`).

### Breaking Changes

**`action` semantic tokens** are now nested under the variant with a `color` leaf:

```typescript
// Before
semantic('action', 'primaryHover');

// After
semantic('action', 'primary', 'hover', 'color');
```

**Focus outline merged into `focus`.** The separate `focusOutline` group is removed and the
`focus` group property `outlineSize` is renamed to `outlineWidth`:

```typescript
// Before
semantic('focusOutline', 'width');
semantic('focus', 'outlineSize');

// After
semantic('focus', 'outlineWidth');
```

**Renamed component/semantic tokens:**

| Before                                                                                                                                                         | After                                                                                                                                                         |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `card.borderSize`                                                                                                                                              | `card.borderWidth`                                                                                                                                            |
| `card.boxShadow`, `tabPanel.boxShadow`, `tooltip.boxShadow`                                                                                                    | `card.shadow`, `tabPanel.shadow`, `tooltip.shadow`                                                                                                            |
| `alert.border`, `divider.border`, `dialog.border` (composed)                                                                                                   | decomposed into `{borderColor,borderStyle,borderWidth}`                                                                                                       |
| `spacing.xxs`                                                                                                                                                  | `spacing.2xs`                                                                                                                                                 |
| `menu.item.submenuItemIconSize`, `menu.item.submenuItemIconRotation`                                                                                           | `menu.item.submenu.iconSize`, `menu.item.submenu.iconRotation`                                                                                                |
| `menu.item.inputHoverBgColor`                                                                                                                                  | `menu.item.input.hover.bgColor`                                                                                                                               |
| `menu.item.radio.hoverBorderColor`, `menu.item.radio.activeBorderColor`, `menu.item.radio.activeBgColor`                                                       | `menu.item.radio.hover.borderColor`, `menu.item.radio.active.borderColor`, `menu.item.radio.active.bgColor`                                                   |
| `radio.hover.borderColorChecked/Unchecked`, `radio.active.borderColorChecked/Unchecked`                                                                        | `radio.checked.hover.borderColor`, `radio.unchecked.hover.borderColor`, `radio.checked.active.borderColor`, `radio.unchecked.active.borderColor`              |
| `radio.label.checkedFgColor`, `radio.label.checkedHoverFgColor`, `radio.label.uncheckedHoverFgColor`, `radio.label.activeFgColor`, `radio.label.disabledColor` | `radio.label.checked.color`, `radio.label.checked.hover.color`, `radio.label.unchecked.hover.color`, `radio.label.active.color`, `radio.label.disabled.color` |
| `alert.iconFgColor`                                                                                                                                            | `alert.iconColor`                                                                                                                                             |
| `progressBar.indicatorColor`                                                                                                                                   | `progressBar.indicatorBgColor`                                                                                                                                |
| `avatar.indicatorColor`, `spinner.indicatorColor`                                                                                                              | `avatar.indicatorFgColor`, `spinner.indicatorFgColor`                                                                                                         |
| `tabs.tablistSpacing`                                                                                                                                          | `tabs.tablistGap`                                                                                                                                             |

Some renames change the emitted CSS custom property (e.g. `--charm-action-primary-hover` →
`--charm-action-primary-hover-color`, `--charm-card-box-shadow` → `--charm-card-shadow`,
`--charm-spacing-xxs` → `--charm-spacing-2xs`,
`--charm-radio-label-checked-fg-color` → `--charm-radio-label-checked-color`,
`--charm-form-control-invalid-message-fg-color` → `--charm-form-control-invalid-message-color`).
Where a flattened name already matched the nested path's CSS variable, the CSS variable is
unchanged and only the token path API moves.

### Added

**New token:** `radio.checked.bgColor` (CSS `--charm-radio-checked-bg-color`, defaults to
`action.primary.color`) sets the color of the radio check indicator when checked.

```typescript
component('radio', 'checked', 'bgColor');
```

**New token:** `tabs.tablistGap` (CSS `--charm-tabs-tablist-gap`, defaults to
`spacing.md`) sets the gap between the tab list and the tab panels. The tabs host grid
previously had no row/column gap, so the list touched the panel.

```typescript
component('tabs', 'tablistGap');
```

### Behavior change

The CSS reset's `body` color and background now resolve: the reset referenced
`--charm-body-foreground-color` / `--charm-body-background-color`, which the theme never
emitted, so the body styles silently fell back to `inherit`. They now read
`--charm-body-fg-color` / `--charm-body-bg-color`.

`--charm-radio-bg-color` now styles the radio **control background** instead of the check
icon color. The radio's checked/hover/active/disabled state colors previously were written to
custom properties that nothing consumed (`--radio-bg-color`, `--radio-border-color`,
`--form-control-label-fg-color`, `--radio-checked-disabled-bg-color`), so the control never
reflected its state. These are now applied directly to the control, indicator, and label, and
the checked indicator renders in the brand color instead of blending into the control
background.

### Internal

- Renamed the type-level `backgroundColor`/`foregroundColor` leaves in `BodySemanticTokens`,
  `HeadingSemanticTokens`, `FormSemanticTokens`, and `FormControlTextSemanticTokens` to
  `bgColor`/`fgColor` to match the emitted tokens.
- Rewrote the stale `LinkSemanticTokens` type (flattened `foregroundColor` shape) to the
  nested `fgColor`/`hover`/`active`/`visited` shape the theme already emits.
- Fixed the `generateReset()` body block to emit `--charm-body-fg-color` / `--charm-body-bg-color`.

- Merged the duplicate focus-outline groups into a single `focus` group; the global
  focus-visible reset ring now resolves `focus.outlineWidth`.
- Updated `radio`, `checkbox`, `switch`, `menu-item`, `card`, `dialog`, `divider`,
  `tab-panel`, and `tooltip` component styles to the normalized paths.
- Corrected `@cssprop` documentation for `radio`, `card`, `divider`, `tab-panel`, `tooltip`,
  `menu-item`, and `disclosure` (the disclosure transitions were documented under stale names
  `--charm-disclosure-open/close-transition`).
- Updated `BaseSemanticTokens`/`FocusSemanticTokens` types and the theming README examples.
