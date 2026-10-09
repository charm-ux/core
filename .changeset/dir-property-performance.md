---
'@charm-ux/core': patch
---

### Fixes

- **Directionality (`dir`) performance**: `CharmElement.dir` no longer calls `getComputedStyle()` while reading the property. Lit reads `dir` on every update, so the previous getter forced a synchronous style recalculation on each render and made mount cost grow faster than linearly. `dir` now mirrors native `HTMLElement.dir` (returns the attribute value, `''` when unset) and reflects writes back to the attribute. Components resolve effective direction through an internal `resolvedDir` getter (using `:dir()`, with a `getComputedStyle()` fallback for browsers without `:dir()`).

  Behavior note: reading `dir` no longer returns the resolved `'ltr' | 'rtl'`; it returns the authored value (`''`, `'ltr'`, `'rtl'`, or `'auto'`). Components resolve direction from the `dir` attribute tree, so set `dir` on the element or an ancestor rather than the CSS `direction` property when a component must render RTL.
