# COMP-013: Bind optional attributes with `ifDefined()` so they collapse when unset

When a template attribute should be omitted entirely for some values (not rendered as
`attr="undefined"` or an empty string), bind it through `ifDefined()` from
`lit/directives/if-defined.js`. Passing `undefined` makes Lit remove the attribute. This is the
standard idiom across the library for optional native attributes (`href`, `type`, `inputmode`,
`autocomplete`) and conditional ARIA attributes.

**Do:**

```ts
import { ifDefined } from 'lit/directives/if-defined.js';

// button.ts
html`
  <a
    href=${ifDefined(this.href ? this.href : undefined)}
    target=${ifDefined(this.target ? this.target : undefined)}
    aria-current=${ifDefined(this.current ? 'page' : undefined)}
  ></a>
`;
```

**Don't:**

```ts
// Renders href="undefined" / target="" and emits an attribute that shouldn't exist.
html`
  <a href=${this.href} target="${this.target}"></a>
`;
```

See also: [PROP-002](../props/PROP-002.md), [COMP-003](./COMP-003.md)
