# CHARM-003: Declare nested components in `static dependencies`

When a component renders another Charm component in its shadow DOM, declare it in the
`static dependencies` getter. The base constructor auto-registers every dependency with
the current scope, so the nested component resolves to the correct scoped tag name
regardless of import order — and consumers don't have to import it separately.

Import the dependency's class and reference the scoped tag via `this.customTag`-style
lookup rather than a hardcoded `<ch-icon>` literal.

Every direct dependency must also be documented with an `@dependency` JSDoc tag on the
class — one tag per dependency, using the class name (see [CHARM-009](./CHARM-009.md)).
Without the tag the dependency is absent from the generated custom-elements manifest, so
consumers and tooling have no way to discover it. Inherited dependencies (from a parent
class's `super.dependencies`) are already documented by the parent and do not need to be
repeated.

**Do:**

```ts
import { CoreIcon } from '../icon/icon.js';

/**
 * @dependency CoreIcon
 */
export class CoreDialog extends CharmDismissibleElement {
  public static override get dependencies(): (typeof CharmElement)[] {
    return [CoreIcon];
  }
}
```

**Don't:**

```ts
// Rendering a nested component without declaring it as a dependency means it may
// never be registered in the consumer's scope — the tag renders as an unknown element.
export class CoreDialog extends CharmDismissibleElement {
  protected override render() {
    return html`
      <ch-icon name="close"></ch-icon>
    `; // hardcoded tag + undeclared dep
  }
}
```

See also: [CHARM-002](./CHARM-002.md), [COMP-005](../component-design/COMP-005.md)
