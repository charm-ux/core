# TEST-003: Assert events with `oneEvent`, keys with `sendKeys`, spies with `sinon`

Test behavior through the same surfaces consumers use — events and real user input — not
private internals.

- **Events**: await `oneEvent(el, 'change')` to capture an emitted event and assert its
  `target`/`detail`, and/or attach a `sinon.spy()` listener to assert call counts.
- **Keyboard/input**: drive interaction with `sendKeys` from `@web/test-runner-commands`
  (`{ press: 'Enter' }`, `{ type: '...' }`) after focusing the element — this exercises the
  real accessibility path ([A11Y-003](../accessibility/A11Y-003.md)).
- **Spies/stubs**: use `sinon` for callbacks and timers.
- **Focus**: assert the resulting `document.activeElement` (or the relevant shadow root's
  `activeElement`). Do not replace or spy on `.focus()`; that proves a method was called, not that
  the browser moved focus.
- **Forms**: assert submitted values at the consumer boundary, e.g. `new FormData(form).getAll(name)`
  for multi-value controls, rather than checking only the component's `value` property.
- **Lifecycle events**: await the exact public event (`dialog-after-hide`, not `after-close`) before
  asserting its effects. A listener that is never awaited is not a regression test.

**Do:**

```ts
import { expect, oneEvent } from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import sinon from 'sinon';

// Event emission
const clickSpy = sinon.spy();
el.addEventListener('change', clickSpy);
setTimeout(() => el.shadowRoot?.querySelector('button')!.click());
const event = (await oneEvent(el, 'change')) as CustomEvent;
expect(event.target).to.equal(el);
expect(clickSpy.callCount).to.equal(1);

// Keyboard
el.focus();
await sendKeys({ press: 'Enter' });

// Focus and repeated form values
expect(document.activeElement).to.equal(nextItem);
expect(new FormData(form).getAll('choice')).to.deep.equal(['one', 'two']);
```

**Don't:**

```ts
// Reaching into private state and synthesizing a bare event instead of real interaction.
(el as any)._handleClick();
expect((el as any)._clicked).to.be.true;
```

See also: [TEST-002](./TEST-002.md), [A11Y-003](../accessibility/A11Y-003.md), [PROP-003](../props/PROP-003.md)
