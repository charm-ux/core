# STYLE-001: Author styles in `*.styles.ts` with the Lit `css` template

Each component keeps its styles in a sibling `<name>.styles.ts` module that exports a Lit
`css` tagged-template literal as the default export. This keeps styles co-located,
type-checked, and consumable by the `static styles` aggregation
([STYLE-003](./STYLE-003.md)). Don't inline large style blocks in the component file, and
don't import plain `.css` files.

**Do:**

```ts
// button.styles.ts
import { css } from 'lit';
import { project } from '../../utilities/project.js';

const { component } = project.theme;

export default css`
  :host {
    display: inline-block;
    cursor: pointer;
  }

  .control {
    background-color: ${component('button', 'bgColor')};
    border-radius: ${component('button', 'borderRadius')};
  }
`;
```

**Don't:**

```ts
// button.ts — styles inlined into the component, or pulled from a raw .css file.
import buttonCss from './button.css'; // not supported / not type-checked

export class CoreButton extends CharmFocusableElement {
  public static override styles = css`
    .control {
      background: #fff;
    }
  `;
}
```

See also: [STYLE-003](./STYLE-003.md), [STYLE-002](./STYLE-002.md), [CHARM-004](../internal/CHARM-004.md)
