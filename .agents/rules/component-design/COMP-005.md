# COMP-005: Keep components headless and self-contained

Charm components are a headless, reusable library — they own their own state and behavior
and know nothing about any consuming application. Don't reach for global app state, don't
assume a router or store exists, and don't leave global side effects behind. Communicate
outward through events ([PROP-003](../props/PROP-003.md)) and inward through properties
and slots; let the consumer wire those into their app.

Every listener, observer, timer, or global registration a component adds outside of the component
must be torn down in `disconnectedCallback()` — leaked observers/timers are a known cause of hung test
sessions.

**Do:**

```ts
// Owns its state, announces changes via an event, cleans up after itself.
private resizeObserver = new ResizeObserver(() => this.requestUpdate());

public override connectedCallback() {
  super.connectedCallback();
  this.resizeObserver.observe(this);
}

public override disconnectedCallback() {
  super.disconnectedCallback();
  this.resizeObserver.disconnect(); // no leak
}

protected select(value: string) {
  this.value = value;
  this.emit('change'); // consumer decides what to do
}
```

**Don't:**

```ts
import { store } from '@my-app/redux';           // library must not know the app

protected select(value: string) {
  store.dispatch(setValue(value));                // couples the component to one app
  window.__lastSelected = value;                  // global side effect, never cleaned up
}
```

See also: [COMP-004](./COMP-004.md), [PROP-004](../props/PROP-004.md), [PROP-003](../props/PROP-003.md)
