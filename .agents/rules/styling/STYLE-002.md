# STYLE-002: Theme with tokens and CSS custom properties, never hardcode values

All colors, radii, shadows, spacing, and typography come from design tokens via the
`project.theme` `component()` helper (see [CHARM-004](../internal/CHARM-004.md)), and any
value a consumer may need to override is exposed as a `--charm-<component>-*` CSS custom
property. Hardcoded literals can't be re-themed, break dark mode / brand themes, and drift
from the cross-platform token source of truth. Consume a custom property with `var()` and a
token-backed fallback.

**Do:**

```ts
export default css`
  .control {
    /* Themeable hook with a token-backed default. */
    background-color: var(--charm-button-bg-color, ${component('button', 'bgColor')});
    color: var(--charm-button-color, ${component('button', 'color')});
  }
`;
```

**Don't:**

```ts
export default css`
  .control {
    background-color: #0a66c2; /* hardcoded brand color */
    color: #ffffff;
    padding: 8px 16px; /* hardcoded spacing, no token, no override hook */
  }
`;
```

See also: [CHARM-004](../internal/CHARM-004.md), [STYLE-005](./STYLE-005.md), [PROP-001](../props/PROP-001.md)
