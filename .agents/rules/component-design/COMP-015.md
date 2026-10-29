# COMP-015: Drive show/hide from a `visible` state settled on `transitionend` with a fallback timer

Dismissible/overlay components animate via CSS transitions rather than imperative Web
Animations. Toggle a reactive `visible` state (inside `requestAnimationFrame` so the transition
runs), then apply post-transition side effects — and emit `{baseName}-after-show`/`-after-hide`
— only after the transition settles. Detect transition presence/duration from the component's
`--{baseName}-*-transition` custom properties, listen for `transitionend`, and always arm a
fallback timer (`transitionMaxTime + 50`) so the `after-*` step runs even if `transitionend`
never fires. `CharmDismissibleElement` already implements this; reuse it rather than
re-inventing.

`transitionend` fires once per transitioned property, so ignore pseudo-element events and events
from other elements. Compare `elapsedTime` against the longest transition **duration**, not
duration + delay: `elapsedTime` excludes `transition-delay`, so comparing against the delayed total
rejects the real event and every settle falls through to the fallback timer. Allow about 1ms of
tolerance for float rounding (`elapsedTime * 1000 >= maxDuration - 1`). Under
`prefers-reduced-motion`, durations collapse to near 0, so settle on any matching event. The base
tracks `transitionMaxDuration` (without delay) next to `transitionMaxTime` (with delay, used for the
fallback timer). Reuse both rather than re-deriving them, and give each pending settle an id so
stale events and late timers are ignored. Keep the fallback timer for missing events. When there is no transition, wait for
`updateComplete` before emitting `after-*`; listeners must see the updated DOM. On disconnect,
clear the timer, invalidate the pending wait, and resume settlement on reconnect if the same
open/closed transition is still pending. If a `show`/`hide` listener reverses `open`, do not arm
the stale after-event.

Test through the public event flow: initially-open elements, multiple transition durations,
pseudo-element/unrelated transition events, no-transition DOM ordering, fallback settlement,
disconnect/reconnect during a transition, a `transition-delay`, a fractional duration such as
`1.001s`, and reduced motion. Dispatch real `TransitionEvent`s on the transitioning element rather
than calling the handler through a cast.

**Do:**

```ts
// dialog.ts — let the base class settle the transition; just flip visible and listen
protected override firstUpdated() {
  super.firstUpdated();
  requestAnimationFrame(() => (this.visible = true));
}

render() {
  return html`
    <div part="panel" class=${classMap({ visible: this.visible })} @transitionend=${this.handleTransitionEnd}>
      <slot></slot>
    </div>
  `;
}
```

**Don't:**

```ts
// Hides synchronously with no transition, or runs after-hide work before the animation ends.
public hide() {
  this.style.display = 'none';
  this.emit('dialog-after-hide');
}
```

See also: [COMP-012](./COMP-012.md), [PROP-007](../props/PROP-007.md), [PROP-008](../props/PROP-008.md), [A11Y-009](../accessibility/A11Y-009.md)
