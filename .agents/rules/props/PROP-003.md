# PROP-003: Emit `CustomEvent`s through the base `emit()` helper

Components communicate outward with `CustomEvent`s dispatched through the base class
`emit()` helper — never `new CustomEvent(...)` + `dispatchEvent` by hand. `emit()` applies
Charm's defaults (`bubbles: true`, `cancelable: false`, `composed: true`, `detail: {}`),
all overridable per call. `composed: true` is what lets the event cross the shadow boundary
to reach consumers, so keep that default unless the event is intentionally internal.

Event naming: mirror native DOM names where the semantics match (`change`, `focus`,
`blur`), otherwise use a `{component}-{action}` name (`tabs-change`, `dialog-show`,
`menu-group-select`). Events are **not** prefixed with `ch-`/`charm-`. Pass structured data
under `detail`, and type the detail for events consumers depend on.

**Do:**

```ts
// Native-mirroring event.
this.emit('change');

// Component-scoped event with typed detail.
protected emitChange(detail: TabsChangeEvent) {
  this.emit('tabs-change', { detail });
}

// Intentionally internal — override the composed/bubbles defaults.
this.emit('ready', { bubbles: false, composed: false });
```

**Don't:**

```ts
// Bypasses Charm defaults; non-composed event never escapes the shadow root.
this.dispatchEvent(new CustomEvent('change'));

// Redundant vendor prefix on the event name.
this.emit('ch-change');
```

See also: [PROP-004](./PROP-004.md), [CHARM-001](../internal/CHARM-001.md), [PROP-005](./PROP-005.md)
