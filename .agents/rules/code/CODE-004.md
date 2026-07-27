# CODE-004: Respect the TS/Lit compiler contract — erasable syntax, type-only imports, decorators

The `tsconfig` settings impose authoring constraints that keep the code transpilable
per-file and keep Lit decorators working. Don't fight them:

- **`erasableSyntaxOnly`** — no runtime-emitting TS constructs: no `enum` / `const enum`,
  no `namespace`, no constructor parameter-properties. Use `const` objects / union types
  instead of enums, plain fields instead of parameter-properties.
- **`isolatedModules`** — every file must transpile standalone, so type-only imports/exports
  must be marked `type` (`import type { X }`, `export type { X }`). Value and type imports
  can't be merged into one un-typed statement when the binding is only a type.
- **Decorators** — the project uses the legacy Lit setup (`experimentalDecorators: true`,
  `useDefineForClassFields: false`). Never flip these; changing class-field semantics breaks
  every `@property`/`@state` decorator.

**Do:**

```ts
// Union type instead of an enum.
export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

// Type-only import marked `type`.
import type { CoreIcon } from '../icon/icon.js';
import { property } from 'lit/decorators.js';
```

**Don't:**

```ts
export enum ButtonVariant {
  Primary,
  Secondary,
} // enum emits runtime code → erasableSyntaxOnly error
namespace Button {} // namespaces are banned

// Type imported as a value under isolatedModules → build error.
import { CoreIcon } from '../icon/icon.js'; // CoreIcon used only as a type
```

See also: [CODE-002](./CODE-002.md), [CODE-003](./CODE-003.md), [CHARM-001](../internal/CHARM-001.md)
