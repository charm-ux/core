---
'@charm-ux/core': patch
'@charm-ux/theming': patch
---

### Focus ring consolidation

- **Theming**: the generated reset is now the single source of the document-level `:focus-visible` ring. The duplicate `:where(:focus-visible)` block that the charm theme appended via `.extendRawCss()` was removed — `generateReset()` already emits the identical token-driven rule. The remaining rule uses `:where()` so consumers/components can override it with any selector.
- **Core**: added a shared `relocateFocusRing()` style helper (exported from `@charm-ux/core`) for the common "suppress the host ring and re-apply it around an inner visual element" pattern. `ch-radio` and `ch-menu-item` now use it instead of hand-writing the two `:host(:focus-visible)` rules. Existing `:focus-visible` overrides in components (form controls, accordion, checkbox, switch) are unchanged.
