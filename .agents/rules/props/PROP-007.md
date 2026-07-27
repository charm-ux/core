# PROP-007: Emit dismissible events with `emitScopedEvent`; gate closing on `request-close`

Components extending `CharmDismissibleElement` (dialog, popup, tooltip, menu, alert,
disclosure, accordion-item) emit lifecycle events through the base
`emitScopedEvent(name, detail)` helper, which prefixes the component's `baseName` to give
`dialog-show`, `dialog-after-show`, `dialog-hide`, `dialog-after-hide`. Don't build these
prefixed names by hand.

For user-initiated dismissal, emit a **cancelable** `{baseName}-request-close` event and
only proceed to `hide()` when it wasn't prevented — this lets consumers veto a close. Use
the base's `emitRequestClose` pattern; type the detail (e.g. `DialogRequestCloseEvent`,
`DialogCloseSource`) per [PROP-006](./PROP-006.md).

**Do:**

```ts
// Scoped lifecycle event (base helper).
protected emitScopedEvent(name: string, detail?: any) {
  return this.emit(`${(this.constructor as any).baseName}-${name}`, detail);
}

// Cancelable close — consumer can preventDefault to keep it open.
protected requestClose(source: DialogCloseSource) {
  const evt = this.emit('dialog-request-close', {
    cancelable: true,
    detail: { source },
  });
  if (!evt.defaultPrevented) this.hide();
}
```

**Don't:**

```ts
// Hand-built name, non-cancelable, closes unconditionally — consumers can't intervene.
this.emit('dialogHide'); // wrong casing + not scoped via the helper
this.hide(); // no request-close veto opportunity
```

See also: [PROP-003](./PROP-003.md), [PROP-006](./PROP-006.md), [CHARM-001](../internal/CHARM-001.md)
