---
'@charm-ux/core': major
---

Upgrade theming system to use type-safe token helpers

**Breaking Change:** Component styles now use the new `component()` token helper from `@charm-ux/theming` instead of manually declared CSS custom properties.

### What changed

- Removed verbose CSS custom property declarations (e.g., `--button-bg-color: inherit`) from component `:host` blocks
- Replaced inline `var(--component-property)` references with `component('componentName', 'property')` helper calls
- Updated all component styles to use the new centralized token system

### Migration

If you were overriding component styles via CSS custom properties, you'll need to update your approach:

**Before:**

```css
:root {
  --button-bg-color: blue;
}
```

**After:**
Use the theming package's token definition system to customize component tokens at the theme level.
