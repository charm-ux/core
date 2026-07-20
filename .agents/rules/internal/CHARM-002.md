# CHARM-002: Register components through the project scope

Charm does not call `customElements.define()` or use the `@customElement` decorator in
component files. Instead, each concrete component declares a `static override baseName`,
and the project scope builds the tag name as `${prefix}-${baseName}` (default prefix `ch`,
so `baseName = 'button'` → `<ch-button>`). This is what lets consumers re-scope the whole
library under a custom prefix/suffix.

Registration happens in the component's `index.ts` via `project.scope.registerComponent()`.
A component with no `baseName` is skipped and logs a console error from `scope.ts`.

**Do:**

```ts
// button.ts
export class CoreButton extends CharmFocusableElement {
  public static override baseName = 'button';
}

// index.ts
import { project } from '../../utilities/project.js';
import button from './button.js';

export * from './button.js';

project.scope.registerComponent(button);
```

**Don't:**

```ts
// Hardcoding the tag defeats scoping and bypasses the scope registry.
@customElement('ch-button')
export class CoreButton extends LitElement {}

// or
customElements.define('ch-button', CoreButton);
```

See also: [CHARM-001](./CHARM-001.md), [CHARM-003](./CHARM-003.md)
