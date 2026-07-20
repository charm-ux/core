# COMP-015: Drive show/hide from a `visible` state settled on `transitionend` with a fallback timer

Dismissible/overlay components animate via CSS transitions rather than imperative Web
Animations. Toggle a reactive `visible` state (inside `requestAnimationFrame` so the transition
runs), then apply post-transition side effects — and emit `{baseName}-after-show`/`-after-hide`
— only after the transition settles. Detect transition presence/duration from the component's
`--{baseName}-*-transition` custom properties, listen for `transitionend`, and always arm a
fallback timer (`transitionMaxTime + 50`) so the `after-*` step runs even if `transitionend`
never fires. `CharmDismissibleElement` already implements this; reuse it rather than
re-inventing.

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
