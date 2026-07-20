# PROP-009: Author side-effecting properties as getter/setter pairs

When setting a reactive property must do more than store a value — run validation, toggle
an attribute, wire/unwire listeners, drive a transition — implement it as a getter/setter
pair over a private backing field, put `@property` on the accessor, and call
`requestUpdate('name', oldValue)` so Lit still schedules a render. Guard against no-op
writes (`oldVal === newVal`) to avoid redundant work. Plain `@property` class fields can't
carry side effects.

This is the pattern behind form-control `value`/`disabled`, dismissible `open`, and
button's `shows`/`hides`/`toggles`.

**Do:**

```ts
@property({ type: Boolean, reflect: true })
public get open() {
  return this._open;
}
public set open(value: boolean) {
  if (this._open === value) return;        // guard no-op writes
  const oldValue = this._open;
  this._open = value;
  this.toggleAttribute('open', value);
  this.requestUpdate('open', oldValue);    // keep Lit's reactivity
  value ? this.show() : this.hide();       // the side effect
}
private _open = false;
```

**Don't:**

```ts
// A plain field can't run the show()/hide() side effect or toggle related state.
@property({ type: Boolean, reflect: true })
public open = false;

// ...forcing side effects to be duplicated at every call site that sets `open`.
```

See also: [PROP-001](./PROP-001.md), [PROP-008](./PROP-008.md), [CHARM-006](../internal/CHARM-006.md)
