# COMP-010: Make positioner/observer `start()` idempotent — tear down before re-arming

Anything that installs a long-lived observer (floating-ui `autoUpdate`, `ResizeObserver`,
`IntersectionObserver`, scroll listeners) must store its cleanup handle and dispose the
previous one **before** creating a new one. `start()` can be called more than once — e.g.
`firstUpdated()` and then `onOpenChange()` — and overwriting the cleanup handle orphans the
previous observers, which keep firing forever and prevent the page (and the test runner) from
ever going idle. This is the most common cause of "all tests pass but the session hangs."

**Do:**

```ts
// popup.ts
protected start() {
  if (!this.anchorEl || !this.popup) return;

  // Starting is idempotent: tear down any existing positioner first, or a second start()
  // orphans the previous autoUpdate's observers and they keep firing forever.
  if (this.cleanup) {
    this.cleanup();
    this.cleanup = undefined;
    window.removeEventListener('scroll', this.handleScrollDismiss);
  }

  this.cleanup = autoUpdate(this.anchorEl, this.popup, async () => {
    await this.reposition();
  });
  window.addEventListener('scroll', this.handleScrollDismiss, { passive: true });
}

protected stop(): void {
  if (this.cleanup) {
    this.cleanup();
    this.cleanup = undefined;
    window.removeEventListener('scroll', this.handleScrollDismiss);
  }
}
```

**Don't:**

```ts
protected start() {
  // Overwrites this.cleanup on the second call — the first autoUpdate's observers leak
  // and never stop firing.
  this.cleanup = autoUpdate(this.anchorEl, this.popup, () => this.reposition());
}
```

See also: [COMP-004](./COMP-004.md), [COMP-011](./COMP-011.md), [COMP-012](./COMP-012.md), [COMP-014](./COMP-014.md)
