# STYLE-005: Expose parts intentionally and avoid inline styles

Style customization is API. Give consumers stable hooks and document them; don't leave them
to reverse-engineer internals or force them to override via `!important`.

- Add `part="…"` to any element a consumer might reasonably restyle, and document it with
  `@csspart` ([CHARM-005](../internal/CHARM-005.md)). Use kebab-case part names scoped to
  the component (`button-control`, `content`, `start`, `end`).
- Style shadow content with classes/parts and `::slotted()` for projected light-DOM nodes.
- Don't set dynamic appearance with inline `style=` bindings when a class or custom
  property expresses it; inline styles are hard for consumers to override and bypass the
  token system.

**Do:**

```ts
protected override render() {
  return html`
    <button part="button-control" class=${classMap({ control: true, pressed: this.pressed })}>
      <span part="content"><slot></slot></span>
    </button>
  `;
}
```

```ts
export default css`
  ::slotted(*) {
    pointer-events: none;
  }
  .control.pressed {
    background-color: ${component('button', 'active', 'bgColor')};
  }
`;
```

**Don't:**

```ts
// Inline style for state that belongs in a class; no exposed part to restyle.
return html`
  <button style="background:${this.pressed ? '#004' : '#06c'}">
    <slot></slot>
  </button>
`;
```

See also: [COMP-002](../component-design/COMP-002.md), [STYLE-002](./STYLE-002.md), [CHARM-005](../internal/CHARM-005.md)
