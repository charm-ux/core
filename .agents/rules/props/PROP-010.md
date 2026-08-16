# PROP-010: Prefer getter/setter pairs for managing property/attribute values; use lifecycle hooks only when they fit better

When a reactive property must validate, coerce, normalize, or guard its own value, do it in
the property's getter/setter pair over a private backing field. The setter runs synchronously
on **every** assignment path — both the property and the reflected attribute (Lit routes
`attributeChangedCallback` through the same setter) — and can reject or clamp a value before
it ever enters reactive state.

Prefer this over patching the value later in a lifecycle hook because:

- **Invariants hold at the boundary.** A corrected value is observable immediately — a
  synchronous `el.max` read right after `el.max = -5` already returns the normalized value.
  A hook-based fix only applies once the microtask update runs, so the raw value is briefly
  observable state.
- **No render for no-op/ignored writes.** A guarded setter that keeps the old value skips
  `requestUpdate` entirely; a hook-based repair necessarily ran a full update cycle first.
- **One path for property + attribute.** The same setter covers both assignment routes, so
  validation can't be bypassed through the attribute.

Only move the work to a lifecycle hook when a hook is genuinely a better fit:

- **`willUpdate(changedProperties)`** — cross-property derivation where the value depends on
  several properties at once. A setter only sees its own incoming value; `willUpdate` sees the
  whole change picture (see [PROP-008](./PROP-008.md)).
- **`updated()` / `firstUpdated()`** — DOM-dependent work that needs the rendered tree (see
  [COMP-004](../component-design/COMP-004.md)). Never for computing reactive values, which
  forces a second render pass.

**Do:**

```ts
// Coerce at the point of assignment — a negative value never becomes observable state.
@property({ type: Number })
public get max() {
  return this._max;
}
public set max(value: number) {
  const next = Math.max(0, value);
  if (next === this._max) return;            // no-op: skip the update cycle
  const oldValue = this._max;
  this._max = next;
  this.requestUpdate('max', oldValue);       // keep Lit's reactivity
}
private _max = 100;

// Cross-property derivation belongs in willUpdate, where the whole change set is visible.
protected override willUpdate(changed: PropertyValues) {
  super.willUpdate(changed);
  if (changed.has('min') || changed.has('max')) {
    this._clampedValue = clamp(this.value, this.min, this.max);
  }
}
```

**Don't:**

```ts
// A plain field lets the raw value into state; repairing it in a hook runs a full
// update cycle with the invalid value stored, and reads can observe it in between.
@property({ type: Number })
public max = 100;

protected override updated() {
  if (this.max < 0) this.max = 0; // too late — invalid value already stored + rendered
}
```

See also: [PROP-001](./PROP-001.md), [PROP-008](./PROP-008.md), [PROP-009](./PROP-009.md), [COMP-004](../component-design/COMP-004.md)
