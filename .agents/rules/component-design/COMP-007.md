# COMP-007: Compose slot scaffolding with the shared `src/templates/` helpers

The `start` / default / `end` slot triad is standardized in `src/templates/`
(`startTemplate()`, `endTemplate()`, `startContentEndTemplate()`). Compose these instead of
re-authoring the slot scaffolding per component — they guarantee consistent `part` names
(`start`, `content`, `end`) and class names across the library, so consumers can rely on
the same styling hooks everywhere. The helpers are named factory functions returning `html`
from `lit/static-html.js`, with parameterized part names that default sensibly.

**Do:**

```ts
import { startContentEndTemplate } from '../../templates/start-content-end.js';

protected contentTemplate() {
  return startContentEndTemplate();
}
```

```ts
// The shared helper — consistent parts for every component that uses it.
export const startContentEndTemplate = (classOptions = defaultClassOptions) => {
  return html`
    ${startTemplate()}
    <span part="content" class=${classMap(classOptions.content)}>
      <slot></slot>
    </span>
    ${endTemplate()}
  `;
};
```

**Don't:**

```ts
// Hand-rolled triad — drifts from the shared part/class names and duplicates scaffolding.
protected contentTemplate() {
  return html`
    <slot name="start" part="prefix"></slot>   <!-- inconsistent part name -->
    <span class="label"><slot></slot></span>
    <slot name="end" part="suffix"></slot>
  `;
}
```

See also: [COMP-006](./COMP-006.md), [COMP-001](./COMP-001.md), [STYLE-005](../styling/STYLE-005.md)
