# CODE-003: Order and sort imports

Import structure is enforced (errors, `--max-warnings 0`):

- **`import/order`** — groups in this order: builtin → external → internal → parent →
  sibling → index → object → **type** (type-only imports come last).
- **`import/newline-after-import`** — a blank line after the import block.
- **`sort-imports`** (declaration sort disabled) — named members **within** an import must
  be alphabetized, case-insensitive.

Run `pnpm lint:fix` (or rely on lint-staged) to autofix ordering rather than arranging by
hand.

**Do:**

```ts
import { css } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { project } from '../../utilities/project.js';
import styles from './button.styles.js';
import type { CoreIcon } from '../icon/icon.js';

export class CoreButton extends CharmFocusableElement {}
```

**Don't:**

```ts
import styles from './button.styles.js'; // sibling before external
import type { CoreIcon } from '../icon/icon.js';
import { property, css } from 'lit'; // members not alphabetized (css, property)
import { project } from '../../utilities/project.js';
export class CoreButton extends CharmFocusableElement {} // no blank line after imports
```

See also: [CODE-001](./CODE-001.md), [CODE-004](./CODE-004.md)
