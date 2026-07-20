# TEST-002: Use `@open-wc/testing` + web-test-runner, and await updates

Tests run in real browsers under `@web/test-runner` (Playwright). Use `@open-wc/testing`
for fixtures and assertions (`fixture`, `expect`, `elementUpdated`, `oneEvent`, the
`.to.be.accessible()` chai-a11y matcher). Because Lit renders asynchronously, always
`await elementUpdated(el)` after changing a property before asserting on the rendered
shadow DOM — asserting synchronously races the render and gives flaky results.

Each test file is auto-registered as a named group, so a single component's tests run with
`pnpm test -- --group <name>` (e.g. `--group button`). Run outside the ZD sandbox —
Chromium can't launch inside it.

**Do:**

```ts
import { elementUpdated, expect, fixture, html } from '@open-wc/testing';

const el = await fixture<CoreButton>(html`
  <ch-button>Go</ch-button>
`);
el.disabled = true;
await elementUpdated(el); // wait for the re-render
expect(el).to.have.attribute('disabled'); // now safe to assert
```

**Don't:**

```ts
const el = await fixture<CoreButton>(html`
  <ch-button>Go</ch-button>
`);
el.disabled = true;
// No await — reads the DOM before Lit has re-rendered → flaky.
expect(el.shadowRoot!.querySelector('button')).to.have.attribute('disabled');
```

See also: [TEST-001](./TEST-001.md), [TEST-003](./TEST-003.md)
