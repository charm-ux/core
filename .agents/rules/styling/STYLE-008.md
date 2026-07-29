# STYLE-008: Set runtime-computed values with `this.style.setProperty()`

When a CSS value cannot be known at build time — it depends on layout measurements, dynamic percentages, or user interaction coordinates — compute it in JavaScript and set it as a CSS custom property via `this.style.setProperty()`. Reference the property in component styles with `var()` and a sensible default.

This is distinct from **inline `style=` bindings** (which set presentation directly and bypass the theme/token system — see [STYLE-005](./STYLE-005.md)). Setting a custom property is acceptable because the consumer can still override it via `var()` in their own styles.

Use this pattern for:

- Layout-derived values based on element measurements (hover bridge coordinates, auto-size dimensions).
- Runtime-computed percentages (progress bar fill).
- Values that must be set in an observer/middleware callback where template bindings aren't available.

**Do:**

```ts
// progress-bar.ts — set a computed percentage as a CSS custom property
this.style.setProperty('--progress-percent', `${(value / max) * 100}%`);
```

```css
/* progress-bar.styles.ts — reference with var() and a fallback */
.progress-indicator {
  width: var(--progress-percent, 0%);
}
```

**Don't:**

```ts
// Don't set component appearance state with style.setProperty
// (use classes and the theming system instead)
this.style.setProperty('color', 'red');
this.style.setProperty('background', '#0265dc');

// Don't use inline style= for these — it bypasses the theming system
html`
  <div style="background: ${this.activeColor}">...</div>
`;
```

Always clean up custom properties in `stop()` / teardown methods when they are no longer relevant (see [COMP-010](../component-design/COMP-010.md), [COMP-011](../component-design/COMP-011.md)).

See also: [STYLE-005](./STYLE-005.md), [COMP-010](../component-design/COMP-010.md), [COMP-011](../component-design/COMP-011.md)
