# COMP-012: Store timers in a field; clear before re-setting and on teardown

`setTimeout`/`setInterval` handles are stored on a field, cleared immediately before the timer
is (re)armed, and cleared again in `disconnectedCallback`. This prevents overlapping timers
from a rapid open/close (or hover in/out) and stops a pending timer from firing after the
element is removed — another source of leaked work that keeps a test session from going idle.

**Do:**

```ts
// charm-dismissible-element.ts
public override disconnectedCallback() {
  if (this.transitionSettleTimer) {
    clearTimeout(this.transitionSettleTimer);
    this.transitionSettleTimer = undefined;
  }
  super.disconnectedCallback();
}

protected onOpenChange(open: boolean) {
  // clear any in-flight timer before arming a new one
  if (this.transitionSettleTimer) {
    clearTimeout(this.transitionSettleTimer);
    this.transitionSettleTimer = undefined;
  }
  this.transitionSettleTimer = setTimeout(() => this.settleTransition(waitId), this.transitionMaxTime + 50);
}
```

**Don't:**

```ts
// Fire-and-forget: overlapping opens stack timers, and a pending one fires after removal.
protected onOpenChange(open: boolean) {
  setTimeout(() => this.settleTransition(), this.transitionMaxTime + 50);
}
```

See also: [COMP-010](./COMP-010.md), [COMP-011](./COMP-011.md), [COMP-015](./COMP-015.md)
