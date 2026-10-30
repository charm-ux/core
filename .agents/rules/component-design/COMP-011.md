# COMP-011: Mirror listeners/observers across connect/disconnect; guard callbacks with `isConnected`

Every `addEventListener` / `observe()` in `connectedCallback` (or a `start`/`attach` helper)
must have an exact counterpart `removeEventListener` / `disconnect()` in `disconnectedCallback`
(or a matching `stop`/`remove` helper). Pair them as symmetric methods so the two sides can't
drift. Because observer callbacks can fire after the element leaves the DOM, guard work inside
them with `if (this.isConnected)`.

Don't decide whether to attach a listener from state that can change after connect (for
example, "attach hover listeners only if a submenu exists"). The state flips, the listener never
arrives, and the matching removal is skipped too. Attach unconditionally while connected and return
early in the handler, or attach and detach whenever that state changes.

Listeners tied to `open` state (a document `pointerdown` for outside-click, a document `keydown`)
must be re-added in `connectedCallback` when the element is still open. Moving an element in the
DOM disconnects and reconnects it without changing `open`. Re-resolve slotted anchors or triggers on
reconnect too, using the same lookup as first render.

When a listener is attached to an optional slotted element, remove it from the previous element
before checking whether the slot is now empty. Clear it on disconnect and rebind after reconnect.

**Do:**

```ts
// tooltip.ts
public override connectedCallback() {
  super.connectedCallback();
  this.attachListeners();
}

public override disconnectedCallback() {
  super.disconnectedCallback();
  this.removeListeners();
}

protected attachListeners() {
  this.addEventListener('pointerenter', this.handlePointerEnter);
  this.addEventListener('focusin', this.handleFocusIn);
}

protected removeListeners() {
  this.removeEventListener('pointerenter', this.handlePointerEnter);
  this.removeEventListener('focusin', this.handleFocusIn);
}

// overflow.ts — observer callback ignores late-firing events
private resizeObserver = new ResizeObserver(() => {
  if (this.isConnected) this.updateOverflow();
});
```

**Don't:**

```ts
// Registers in connect but never removes — the listener/observer outlives the element.
public override connectedCallback() {
  super.connectedCallback();
  this.addEventListener('pointerenter', this.handlePointerEnter);
  new ResizeObserver(() => this.updateOverflow()).observe(this); // handle discarded, can't disconnect
}
```

See also: [COMP-004](./COMP-004.md), [COMP-010](./COMP-010.md), [COMP-012](./COMP-012.md)
