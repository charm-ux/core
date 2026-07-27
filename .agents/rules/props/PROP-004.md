# PROP-004: Support controlled and uncontrolled usage via property + event

Interactive components should work both ways:

- **Uncontrolled** — the component manages its own state internally, and the consumer just
  listens for the change event.
- **Controlled** — the consumer sets the value property and updates it in response to the
  event, treating the component as a view of their state.

Achieve this by (1) keeping a reactive `value`/`checked`/`open` property, (2) updating it
internally on user interaction, and (3) emitting the corresponding event so a controlling
consumer can react. Don't hide state in a non-reactive field that the consumer can't read
or override, and don't refuse to update just because a property was set externally.

**Do:**

```ts
@property({ type: Boolean, reflect: true })
public checked = false;

private toggle() {
  this.checked = !this.checked; // update reactive state...
  this.emit('change');          // ...and announce it (controlled consumers sync here)
}
```

```html
<!-- Uncontrolled: just listen. -->
<ch-switch></ch-switch>

<!-- Controlled: consumer owns `checked`, reacts to `change`. -->
<ch-switch checked></ch-switch>
```

**Don't:**

```ts
// State trapped in a private, non-reactive field: consumer can't control or read it,
// and setting the property from outside has no effect.
#internalChecked = false;
private toggle() { this.#internalChecked = !this.#internalChecked; }
```

See also: [PROP-003](./PROP-003.md), [PROP-001](./PROP-001.md), [COMP-005](../component-design/COMP-005.md)
