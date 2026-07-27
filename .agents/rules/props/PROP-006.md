# PROP-006: Type custom-event details with an exported interface + `emitX()` wrapper

When an event carries a structured `detail`, declare an exported `interface` (or `type`)
for it at the top of the component file, emit it through a dedicated
`protected emitX(detail: Type)` wrapper, and document it with a typed `@event` tag
(`@event {TabsChangeEvent} tabs-change`). This gives consumers an importable type for the
event payload and keeps the emit site in one place. Convention: the type lives inline in
the component module (no separate events file, no `declare global` `HTMLElementEventMap`
augmentation), named `<Component><Thing>Event` with no `Detail` suffix.

**Do:**

```ts
export interface TabsChangeEvent {
  activeTab: CoreTab;
}

export class CoreTabs extends CharmElement {
  /** ... @event {TabsChangeEvent} tabs-change - Fired when the active tab changes. */
  protected emitChange(detail: TabsChangeEvent) {
    this.emit('tabs-change', { detail });
  }
}
```

**Don't:**

```ts
// Untyped detail emitted inline in multiple places — consumers can't type the payload,
// and the shape drifts between call sites.
this.emit('tabs-change', { detail: { activeTab: tab } as any });
// ...elsewhere...
this.emit('tabs-change', { detail: { tab } }); // different shape!
```

See also: [PROP-003](./PROP-003.md), [PROP-007](./PROP-007.md), [PROP-005](./PROP-005.md), [CHARM-005](../internal/CHARM-005.md)
