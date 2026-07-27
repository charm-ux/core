# TEST-001: Use the test-harness pattern

Component tests follow a two-file pattern:

- **`<name>.test.ts`** — a thin entry point that imports the component, instantiates the
  component's harness class, and calls `runTests()` with a render function that produces the
  element from a config spread.
- **`<name>.test-harness.ts`** — a reusable harness class extending `CharmElementTests`
  (via a component-specific subclass like `CoreButtonTests`). It inherits the shared base
  tests (accessibility, `ready` event, attribute-name, RTL-safe CSS) and adds
  component-specific tests through `updateTests`.

This gives every component baseline coverage for free and keeps custom tests organized and
reusable. Don't write ad-hoc `describe`/`it` blocks in the `.test.ts` entry file.

**Do:**

```ts
// button.test.ts — the entire file.
import { html } from '@open-wc/testing';
import './index.js';
import { CoreButtonTests } from './button.test-harness.js';

new CoreButtonTests().runTests(
  config => html`
    <ch-button ${config}>Click here</ch-button>
  `
);
```

```ts
// button.test-harness.ts
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import { CoreButton } from './index.js';

export class CoreButtonTests<T extends CoreButton> extends CharmElementTests<T> {
  // adds button-specific tests; inherits the shared base tests.
}
```

**Don't:**

```ts
// button.test.ts with hand-rolled specs — skips the shared harness and its a11y coverage.
describe('ch-button', () => {
  it('renders', async () => {
    /* ... */
  });
});
```

See also: [TEST-002](./TEST-002.md), [A11Y-004](../accessibility/A11Y-004.md), [DOC-002](../documentation/DOC-002.md)
