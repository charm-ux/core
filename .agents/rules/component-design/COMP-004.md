# COMP-004: Do DOM-dependent work in lifecycle callbacks, not the constructor

A custom element's constructor runs before the element is attached to the document and
before its shadow root has rendered. Reading layout, measuring nodes, querying shadow DOM,
or attaching document/window listeners in the constructor is unreliable. Use the right Lit
/ custom-element lifecycle hook instead:

- `connectedCallback()` — element is in the DOM; add document/window listeners here (and
  remove them in `disconnectedCallback()`).
- `firstUpdated()` — shadow DOM has rendered once; safe to query `this.shadowRoot` and
  measure. (The base fires its `ready` event here.)
- `updated(changed)` — react to property changes after re-render.

The constructor should only set up instance state (fields, controllers).

**Do:**

```ts
protected override firstUpdated() {
  this.control = this.shadowRoot!.querySelector('.control');
}

public override connectedCallback() {
  super.connectedCallback();
  document.addEventListener('keydown', this.handleKeydown);
}

public override disconnectedCallback() {
  super.disconnectedCallback();
  document.removeEventListener('keydown', this.handleKeydown);
}
```

**Don't:**

```ts
constructor() {
  super();
  // shadowRoot isn't rendered yet — this is null; listener never cleaned up.
  this.control = this.shadowRoot!.querySelector('.control');
  document.addEventListener('keydown', this.handleKeydown);
}
```

See also: [COMP-005](./COMP-005.md), [A11Y-003](../accessibility/A11Y-003.md)
