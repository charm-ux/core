# TEST-003: Assert events with `oneEvent`, keys with `sendKeys`, spies with `sinon`

Test behavior through the same surfaces consumers use — events and real user input — not
private internals.

- **Events**: await `oneEvent(el, 'change')` to capture an emitted event and assert its
  `target`/`detail`, and/or attach a `sinon.spy()` listener to assert call counts.
- **Keyboard/input**: drive interaction with `sendKeys` from `@web/test-runner-commands`
  (`{ press: 'Enter' }`, `{ type: '...' }`) after focusing the element — this exercises the
  real accessibility path ([A11Y-003](../accessibility/A11Y-003.md)).
- **Spies/stubs**: use `sinon` for callbacks and timers.

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
```

**Don't:**

```ts
// Reaching into private state and synthesizing a bare event instead of real interaction.
(el as any)._handleClick();
expect((el as any)._clicked).to.be.true;
```

See also: [TEST-002](./TEST-002.md), [A11Y-003](../accessibility/A11Y-003.md), [PROP-003](../props/PROP-003.md)
