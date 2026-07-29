---
'@charm-ux/core': minor
'@charm-ux/theming': minor
---

Upgrade theming system with configurable project token prefix and streamlined helpers

### Breaking Changes

**Components are no longer exported from the main entry point:**

`@charm-ux/core`'s main entry point previously re-exported every component, so simply importing anything from `@charm-ux/core` (even just `project`) would evaluate every component's styles. Components are now only available via their own paths:

```typescript
// Before
import { CoreButton } from '@charm-ux/core';

// After
import { CoreButton } from '@charm-ux/core/components/button/button.js';
```

Utilities like `project`, `CharmElement`, and `CharmDismissibleElement` remain on the main entry point.

### New Features

**Theme extension API** (`@charm-ux/theming`):

- `.extendPrimitives()` - Override primitive token values
- `.extendSemantics()` - Override/extend semantic tokens
- `.extendComponents()` - Override/extend component tokens

```typescript
import { charmTokens } from '@charm-ux/theming';

const myTokens = charmTokens
  .extendPrimitives({ color: { brand: '#ff6600' } })
  .extendSemantics((ref, base) => ({ ...base /* ... */ }))
  .extendComponents((ref, base) => ({ ...base /* ... */ }));
```

**Project token prefix** (`@charm-ux/core`):

`ProjectConfiguration` now accepts a separate `tokenPrefix` field for CSS variable names, independent of the tag `prefix`:

```typescript
project.updateProject({
  prefix: 'myapp', // tag prefix: <myapp-button>
  tokenPrefix: 'charm', // CSS var prefix: --charm-button-bgColor
});
```

`CharmProject` also accepts an optional constructor argument:

```typescript
const project = new CharmProject({ prefix: 'myapp', tokenPrefix: 'charm' });
```

When `tokenPrefix` is omitted, it falls back to the tag `prefix`.

**Streamlined Lit CSS helpers** (`@charm-ux/core`):

Helpers are now exported directly from the theme module for use in component styles:

```typescript
import { component } from '../../utilities/theme.js';
```

Equivalent to the existing `const { component } = tokens.lit;` pattern.

**CSS variable utilities now public** (`@charm-ux/theming`):

- `cssVarName`, `toKebabCase`, `cssVarWithOptions` are now exported from the main entry point for reuse by consumers.

### Internal

- Core's `theme.ts` now imports `toKebabCase` from `@charm-ux/theming` instead of duplicating the implementation.

### Additional fixes included in this release

- Improved `CharmDismissibleElement` transition settling:
  - transition timing is derived from matching CSS custom properties (including prefixed tokens)
  - `*-after-show` / `*-after-hide` now settle via a guarded transition-end + timeout fallback path
- Updated dismissible consumers (`alert`, `dialog`) to rely on generic transition settle behavior rather than a specific transitioned property name.
- Updated `tooltip` to use base dismissible transition settling while keeping tooltip-specific hide side effects (`body.hidden`, `popup.open = false`) in `settleTransition`.
- Stabilized disclosure max-height coverage in tests for cross-browser transition timing.
