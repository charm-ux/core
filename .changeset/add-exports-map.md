---
'@charm-ux/core': minor
---

Add sub-path exports map and remove deprecated barrel files

`@charm-ux/core` now has a proper `exports` map in `package.json`, enabling clean import paths:

```typescript
// Before
import { CoreButton } from '@charm-ux/core/dist/components/button/button.js';

// After
import { CoreButton } from '@charm-ux/core/components/button/button.js';
```

Removed the `index.js` and `index.d.ts` barrel re-export files — `main` and `types` now point directly to `./dist/index.js` and `./dist/index.d.ts`.
