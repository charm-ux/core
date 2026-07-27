# STYLE-006: Toggle conditional classes with `classMap()`, not string concatenation

Conditional classes on the host or shadow parts are expressed with `classMap()` from
`lit/directives/class-map.js`, keyed on reactive state and slot presence
(`HasSlotController`). Don't build class strings with template literals or ternaries.

**Do:**

```ts
import { classMap } from 'lit/directives/class-map.js';

// alert.ts
render() {
  return html`
    <div
      part="base"
      class=${classMap({
        'has-actions': this.hasSlotController.test('action'),
        [`variant-${this.variant}`]: true,
        open: this.open,
      })}
    ></div>
  `;
}
```

**Don't:**

```ts
// Brittle spacing, easy to emit empty/duplicate tokens, harder to read.
render() {
  return html`<div class="base ${this.open ? 'open' : ''} variant-${this.variant}"></div>`;
}
```

See also: [STYLE-005](./STYLE-005.md), [COMP-008](../component-design/COMP-008.md), [COMP-013](../component-design/COMP-013.md)
