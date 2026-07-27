# CHARM-007: Use the dual named + default export, with the class in its own `.ts`

Each component's class file uses **both** a named export at the declaration and a trailing
default export of the same class:

- The **named export** (`export class CoreButton`) is what consumers import for the type
  and what `index.ts` re-exports (`export * from './button.js'`).
- The **default export** is what `index.ts` imports to register with the scope
  (`import button from './button.js'`).

The class must live in its own `<name>.ts` file — **not** in `index.ts` or `types.ts`,
which the custom-elements-manifest analyzer excludes. Class names are `Core<Name>`
(PascalCase) while the tag/`baseName` is unprefixed (`baseName = 'button'` → `<ch-button>`).

**Do:**

```ts
// button.ts
export class CoreButton extends CharmFocusableElement {
  public static override baseName = 'button';
}
export default CoreButton;
```

```ts
// index.ts
import { project } from '../../utilities/project.js';
import button from './button.js';

export * from './button.js';

project.scope.registerComponent(button);
```

**Don't:**

```ts
// Class defined in index.ts — excluded from the manifest, and no default export to register.
// index.ts
export class CoreButton extends CharmFocusableElement {
  /* ... */
}
customElements.define('ch-button', CoreButton); // also violates CHARM-002
```

See also: [CHARM-002](./CHARM-002.md), [CHARM-005](./CHARM-005.md), [CODE-004](../code/CODE-004.md)
