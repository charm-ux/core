# PROP-001: Declare public API with `@property`; reflect state used for styling

A component's configuration API is its reactive properties, declared with `@property` from
`lit/decorators.js`. Reflect a property to its attribute (`reflect: true`) when the value
represents state that CSS or consumers need to observe on the host (e.g. `disabled`,
`open`, a `variant`). Reflection keeps the attribute in sync so `:host([disabled])` and
attribute selectors work. Do **not** reflect large, high-churn, or object-valued
properties — reflection serializes to a string on every change.

**Do:**

```ts
// Reflected: drives :host([type=...]) and is observable by consumers.
@property({ reflect: true })
public type: 'button' | 'submit' | 'reset' = 'button';

// Reflected boolean state.
@property({ type: Boolean, reflect: true })
public disabled = false;

// Not reflected: internal-ish config that CSS doesn't need.
@property({ attribute: 'help-text' })
public helpText?: string;
```

```ts
// Styling can now key off the reflected attribute.
:host([disabled]) { cursor: not-allowed; }
```

**Don't:**

```ts
// Reflecting an object serializes "[object Object]" to the DOM on every update.
@property({ type: Object, reflect: true })
public config = {};

// Plain class field with no @property — not reactive, no attribute, invisible to the CEM.
public variant = 'primary';
```

See also: [PROP-002](./PROP-002.md), [PROP-005](./PROP-005.md), [STYLE-002](../styling/STYLE-002.md)
