# COMP-002: Encapsulate in Shadow DOM; expose styling hooks via `::part` and custom properties

Components render into Shadow DOM (Lit's default). Encapsulation is a feature: internal
structure stays private and consumer styles can't accidentally break the component. But
that also means consumers can only style what you deliberately expose. Provide two hooks:

- **`part="…"`** on elements consumers may need to restyle — targetable via `::part()`.
- **CSS custom properties** (`--charm-<component>-*`) for themeable values.

Never expose internals by dropping Shadow DOM or by documenting brittle internal selectors.

**Do:**

```ts
protected override render() {
  return html`
    <button part="button-control" class="control">
      <span part="content"><slot></slot></span>
    </button>
  `;
}
```

```css
/* Consumer restyles the exposed part — stable, intentional API. */
ch-button::part(button-control) {
  text-transform: uppercase;
}
```

**Don't:**

```ts
// Disabling Shadow DOM leaks internals and lets consumer CSS collide with the component.
protected override createRenderRoot() {
  return this; // renders into light DOM — no encapsulation
}
```

See also: [COMP-001](./COMP-001.md), [STYLE-005](../styling/STYLE-005.md), [CHARM-004](../internal/CHARM-004.md)
