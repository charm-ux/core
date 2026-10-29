# COMP-008: Detect slotted content with `HasSlotController`

When rendering depends on whether a slot has content (e.g. show a wrapper only when the
`start` slot is filled), use the shared `HasSlotController` reactive controller rather than
wiring up `slotchange` listeners by hand. Construct it in the constructor with the slot
names to watch — it self-registers via `host.addController(this)` and triggers re-render
when slotted content changes. Use the `'[default]'` sentinel for the default (unnamed)
slot.

`slotchange` only fires for slots that exist in the shadow tree. If slotted content may be
added after the first render, render the slot unconditionally and toggle only its fallback;
conditionally creating the `<slot>` makes late content invisible to the controller. For the
default slot, treat `slot=""` as default content and account for text that changes in place.

Watch every slot whose presence changes ARIA or structure, not just the visual ones. A `heading`
slot that drives `aria-labelledby` must be in `watchedSlots`, or a heading added after the first
render never names the group. Branch on `hasNamedSlot(name)`; never run
`this.querySelector('[slot="…"]')` inside `render()`, which re-queries the light DOM on every update.

**Do:**

```ts
import { HasSlotController } from '../../controller/slot.js';

export class CoreButton extends CharmFocusableElement {
  private readonly hasSlotController = new HasSlotController(this, '[default]', 'start', 'end');
  // fire-and-forget registration; query it in templates to branch on slotted content
}
```

**Don't:**

```ts
// Conditional slots cannot receive slotchange before they exist, so late content is missed.
return this.hasImage ? html`<slot name="image"></slot>` : html`<span>Fallback</span>`;

// Manual slotchange plumbing — easy to leak listeners and to miss the default slot.
public override connectedCallback() {
  super.connectedCallback();
  this.shadowRoot!.querySelector('slot[name="start"]')!
    .addEventListener('slotchange', () => this.requestUpdate());
  // ...repeated per slot, no cleanup
}
```

See also: [COMP-004](./COMP-004.md), [COMP-009](./COMP-009.md), [COMP-001](./COMP-001.md)
