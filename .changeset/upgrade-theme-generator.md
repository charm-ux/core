---
'@charm-ux/core': major
'@charm-ux/theming': minor
---

Upgrade theming system with configurable project themes and token extension API

### Breaking Changes

**Component styles now use project-configured theme:**

Component styles import token helpers from `project.theme` instead of a static tokens file. This enables extending projects to configure their own themes.

**Migration:** If you were importing from `@charm-ux/core/theme/tokens`, update to use the project:

```typescript
// Before
import { component } from '@charm-ux/core/theme/tokens';

// After
import { project } from '@charm-ux/core';
const { component } = project.theme;
```

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

**Project theme configuration** (`@charm-ux/core`):

Configure custom themes via `project.updateProject()`:

```typescript
import { project } from '@charm-ux/core';

project.updateProject({
  prefix: 'myapp',
  theme: {
    definition: myTokens.definition,
    tokenPrefix: 'myapp',
  },
});

// Access theme helpers
const { component, semantic, primitive } = project.theme;

// Generate CSS
const { css, cssReset, cssUtilities } = project.generateTheme();
```

**New exports:**

- `demoTokens` - Demo theme that extends charmTokens
- `project.theme` - Token helpers (primitive, semantic, component)
- `project.generateTheme()` - Generate theme CSS
- `project.css`, `project.cssReset`, `project.cssUtilities` - Quick access to generated CSS
