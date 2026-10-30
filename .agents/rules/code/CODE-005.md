# CODE-005: Respect the module boundaries — never edit generated entrypoints, don't rely on deep imports

The public API surface is deliberate:

- **`src/kitchen-sink.ts` is generated** (by `scripts/make-kitchen-sink.js` from the
  custom-elements manifest) and side-effect-registers every component. Never hand-edit it;
  regenerate instead. It is **not** a published entry (`package.json` `files` omits it).
- **`src/index.ts` is a curated barrel** exporting the infrastructure layers. `package.json`
  also declares explicit subpath exports for component and infrastructure modules; consumers
  should use those exports rather than source-tree deep imports.
- **`@charm-ux/theming`** exposes explicit subpath entrypoints (`.`, `./themes`, `./lit`,
  `./cem-plugin`) and re-exports through per-folder `index.ts` barrels; when names collide,
  re-export explicitly with a rename rather than `export *`.

(Relative-import `.js` extensions are covered by [CODE-001](./CODE-001.md).)

**Do:**

```ts
// src/index.ts — add public API through the curated barrel
export * from './utilities/index.js';

// regenerate the kitchen sink; don't touch the file by hand
// $ pnpm --filter @charm-ux/core generate:kitchen-sink   (runs make-kitchen-sink.js)
```

**Don't:**

```ts
// Hand-editing the generated file — your change is lost on the next regenerate.
// src/kitchen-sink.ts
export { CoreButton } from './components/button/button.js'; // ← don't

// Depending on a deep path that isn't part of the published entry.
import CoreButton from '@charm-ux/core/src/components/button/button.js';
```

See also: [CODE-001](./CODE-001.md), [CHARM-002](../internal/CHARM-002.md), [CHARM-007](../internal/CHARM-007.md)
