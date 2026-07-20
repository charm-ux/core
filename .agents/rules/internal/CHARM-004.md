# CHARM-004: Theme through the theming package, never hardcode

Visual values come from the `@charm-ux/theming` package, surfaced in styles through the
`project.theme` helper. Destructure `component` from `project.theme` and reference tokens
by component + key (with optional nested state keys). Never hardcode a color, radius,
shadow, or spacing value in a component's styles — a hardcoded value can't be re-themed
and won't stay in sync across web/iOS/Android token targets.

**Do:**

```ts
import { css } from 'lit';
import { project } from '../../utilities/project.js';

const { component } = project.theme;

export default css`
  .control {
    background-color: ${component('button', 'bgColor')};
    border-radius: ${component('button', 'borderRadius')};
    box-shadow: ${component('button', 'shadow')};
  }

  .control:focus-visible {
    background-color: ${component('button', 'focus', 'bgColor')}; /* nested state key */
  }
`;
```

**Don't:**

```ts
export default css`
  .control {
    background-color: #0a66c2; /* hardcoded — not themeable, drifts from tokens */
    border-radius: 4px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
  }
`;
```

See also: [STYLE-002](../styling/STYLE-002.md), [STYLE-001](../styling/STYLE-001.md)
