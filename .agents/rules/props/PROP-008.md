# PROP-008: Use `@state()` for internal state; compute derived state in `willUpdate`

Separate public API from internal reactivity:

- **`@property`** — public, consumer-facing configuration (part of the API and the
  manifest). See [PROP-001](./PROP-001.md).
- **`@state()`** — private/protected reactive state that's internal or derived
  (`hasFocus`, `hasLabel`, `hasHelpText`, `customErrorMessage`). It triggers re-render but
  is not part of the public API and is never reflected to an attribute.

Compute derived state in `willUpdate(changedProperties)` (calling `super.willUpdate(...)`
first), **not** in `updated()`. `willUpdate` runs before render so derived values are ready
for the same paint; computing in `updated()` forces a second render pass. `shouldUpdate` is
not used in this codebase.

**Do:**

```ts
@state()
protected hasLabel = false;

protected override willUpdate(changed: PropertyValues) {
  super.willUpdate(changed);
  this.hasLabel = !!(this.label || this.querySelector('slot[name="label"]')?.hasChildNodes());
}
```

**Don't:**

```ts
// Public @property for internal-only state (pollutes the manifest/API)...
@property({ type: Boolean }) public hasLabel = false;

// ...and deriving in updated() causes an extra render pass.
protected override updated() {
  this.hasLabel = !!this.label; // too late for this paint → re-render
}
```

See also: [PROP-001](./PROP-001.md), [PROP-009](./PROP-009.md), [COMP-004](../component-design/COMP-004.md)
