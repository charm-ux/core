# CHARM-008: Register icons as inline SVG strings in the icon set, not `.svg` asset files

Charm ships **no `.svg` files**. Built-in icons are entries in the default-export record in
`src/components/icon/default-icons.ts`, mapping a kebab-case name to a full inline `<svg>`
string. Every icon uses `fill="currentColor"` (so it inherits text color) and
`aria-hidden="true"` (icons are decorative; the accessible name comes from surrounding text —
see A11Y-002). The set is exposed through `project.iconSet`, and consumers extend it via
`project.configuration.icons` (merged into `iconSet`). `<ch-icon>` renders the string with
`unsafeSVG`.

Add a new built-in icon by adding a key to `default-icons.ts` — never by importing an asset
file or inlining raw SVG markup into a component template.

**Do:**

```ts
// default-icons.ts
export default {
  'chevron-down': `<svg fill="currentColor" aria-hidden="true" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="..."/></svg>`,
  dismiss: `<svg fill="currentColor" aria-hidden="true" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="..."/></svg>`,
};

// consumers extend, they don't fork the set
project.configuration = {
  icons: { 'my-logo': `<svg fill="currentColor" aria-hidden="true" ...></svg>` },
};

// usage
html`<${this.scope.tag('icon')} name="chevron-down"></${this.scope.tag('icon')}>`;
```

**Don't:**

```ts
// No SVG asset files, and no hardcoded fill / missing aria-hidden.
import chevron from './chevron-down.svg';
const icon = `<svg fill="#333" viewBox="0 0 20 20"><path d="..."/></svg>`; // wrong: fixed color, not aria-hidden
```

See also: [CHARM-003](./CHARM-003.md), [CHARM-004](./CHARM-004.md), [A11Y-002](../accessibility/A11Y-002.md)
