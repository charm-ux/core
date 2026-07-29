# CODE-006: Re-export external dependency types through the owning module

When a module's public API includes a type from an external dependency (e.g. `@floating-ui/dom`, `lit`), that type should be re-exported through the owning module rather than imported directly by consumers. This keeps the dependency boundary clean: consumers import from the Charm module that owns the type, not from the external package directly.

The owning module should either:

- Define its own type alias that mirrors the external type (preferred — gives control over the API surface and avoids version coupling), or
- Re-export the type with `export type { X }`.

Consumers (test files, sibling components, test harnesses) then import the type from the owning module, not from the external package directly.

**Do:**

```ts
// popup.ts — owning module defines or re-exports the type
export type PopupPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end';

// consumer — imports from the owning module, not from @floating-ui/dom
import type { PopupPlacement } from '../popup/popup.js';
```

**Don't:**

```ts
// test-harness.ts — imports a Floating UI type directly
import { type Placement } from '@floating-ui/dom';
// instead: import type { PopupPlacement } from './popup.js';
```

Exceptions:

- The owning module itself (`popup.ts`) may import directly from the external dependency — that's where the boundary lives.
- Test utilities that specifically test the external library's types may import them directly, but this is rare.

See also: [CODE-005](./CODE-005.md), [CHARM-005](../internal/CHARM-005.md)
