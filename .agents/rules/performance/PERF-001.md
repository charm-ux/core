# PERF-001: Ruthlessly prioritize performance in every change

Treat performance as a first-class requirement for all code, not a follow-up task. Default to
the fastest reasonable approach that keeps behavior, accessibility, and maintainability intact.
Assume every extra render, observer, listener, allocation, and DOM mutation has a cost.

When choosing between designs, prefer the one that:

- Reduces work on initial render and on every update.
- Avoids repeated computation in hot paths and lifecycle hooks.
- Minimizes layout/reflow churn and unnecessary style recalculation.
- Keeps memory pressure low and tears down observers/listeners/timers predictably.
- Preserves existing performance budgets and tests (see [TEST-004](../testing/TEST-004.md)).

If a change trades performance for convenience, document the trade-off and why it is necessary.

**Do:**

```ts
// Cache expensive derived data behind explicit invalidation.
protected override willUpdate(changedProperties: PropertyValues<this>): void {
  if (changedProperties.has('items')) {
    this._visibleItems = this.items.filter((item) => !item.hidden);
  }
}

// Start/stop observers idempotently; avoid leaked background work.
private startResizeObserver(): void {
  this.stopResizeObserver();
  this.resizeObserver = new ResizeObserver(() => {
    if (!this.isConnected) {
      return;
    }

    this.reposition();
  });
  this.resizeObserver.observe(this);
}
```

**Don't:**

```ts
// Recompute on every render even when inputs did not change.
protected override render(): TemplateResult {
  const visibleItems = this.items.filter((item) => !item.hidden);
  return html`${visibleItems.map((item) => html`<li>${item.label}</li>`)}`;
}

// Re-arm observers/listeners repeatedly without symmetric teardown.
private startResizeObserver(): void {
  this.resizeObserver = new ResizeObserver(() => this.reposition());
  this.resizeObserver.observe(this);
}
```

See also: [COMP-010](../component-design/COMP-010.md), [COMP-011](../component-design/COMP-011.md), [COMP-012](../component-design/COMP-012.md), [TEST-004](../testing/TEST-004.md), [PROC-002](../process/PROC-002.md)
