---
'@charm-ux/core': patch
'@charm-ux/theming': patch
---

### Fixes

- **Live theme helpers**: Replaced frozen destructured `const { component } = tokens.lit` pattern with live function wrappers so prefix/definition changes at runtime are reflected in already-evaluated styles.
- **CSS var migration**: Migrated bare `var(--default-border-*)`, `var(--focus-outline-*)`, `var(--border-radius-md)` references in `form-control`, `menu-item`, `tooltip`, `skeleton`, and `select` to `semantic()` / `component()` helpers. Deleted `base-theme.css` (dead file with 400+ obsolete names).
- **Dead code**: Removed `generate-theme.ts` (thin re-export); updated docs to point to `@charm-ux/theming`. Removed 7 unused component tokens: `button.contentAlignment`, `popup.{arrowSizeDiagonal,arrowPaddingOffset,autoSizeAvailableHeight,autoSizeAvailableWidth}`, `select.iconInset`, `skeleton.animation`.
- **`generateCss` fix**: `useDataAttributes` dark blocks now respect the `selector` option.
- **Dismissible fix**: Added `getPropertyValue` fallback for browsers that don't enumerate CSS custom properties via `item()`.
- **JSDoc fix**: Updated stale `@cssproperty` docs in `checkbox.ts` (flat suffix → nested group pattern) and `accordion-item.ts` (unprefixed → `charm-` prefixed, 19 deleted names).
- **Token fix**: Added missing `menu.item.radio.activeBorderColor` token.
- **CEM plugin fix**: Changed `cssPrefixPlugin` default `defaultPrefix` from `ANY_PREFIX` regex to `['charm']`.
- **lit-plugin**: Fixed `CSSResult` type resolution in wrapper functions by using explicit return type and function declarations.
- **Dependencies**: Moved `@charm-ux/theming` from devDependencies to dependencies.
