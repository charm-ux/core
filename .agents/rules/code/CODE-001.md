# CODE-001: End relative imports with `.js`

Every relative import and export specifier must end in `.js`, even though the source file
is `.ts`. This is required for the ESM output to resolve at runtime and is enforced by
`eslint-plugin-require-extensions` (`plugin:require-extensions/recommended`). Omitting the
extension — or writing `.ts` — fails lint (and, since lint runs `--max-warnings 0`, blocks
commit and CI). The rule is turned off only inside MDX.

**Do:**

```ts
import { project } from '../../utilities/project.js';
import button from './button.js';

export * from './button.js';
export * from './base/index.js';
```

**Don't:**

```ts
import { project } from '../../utilities/project'; // missing extension
import button from './button.ts'; // wrong extension
export * from './base'; // missing extension
```

See also: [CODE-003](./CODE-003.md), [CHARM-002](../internal/CHARM-002.md)
