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

Component style files read `project.theme` once, when the style module first evaluates. Call `project.updateProject()` in its own module and import that module before anything that imports a component — writing `project.updateProject()` above a component import in the same file does not work, since all of a file's own imports resolve before any of that file's own code runs.

**Components are no longer exported from the main entry point:**

`@charm-ux/core`'s main entry point previously re-exported every component, so simply importing anything from `@charm-ux/core` (even just `project`) would evaluate every component's styles. Components are now only available via their own paths:

```typescript
// Before
import { CoreButton } from '@charm-ux/core';

// After
import { CoreButton } from '@charm-ux/core/dist/components/button/button.js';
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

**Project theme configuration** (`@charm-ux/core`):

Configure custom themes via `project.updateProject()`, in its own module imported before anything that imports a component:

```typescript
// project-config.ts
import { project } from '@charm-ux/core';

project.updateProject({
  prefix: 'myapp',
  theme: {
    definition: myTokens.definition,
    tokenPrefix: 'myapp',
  },
});
```

```typescript
// main.ts
import './project-config.js'; // must run first
import { project } from '@charm-ux/core';

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
