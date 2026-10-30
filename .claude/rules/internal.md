# CHARM — Internal architecture (always applied)

Charm-specific architecture rules. Full details in [`.agents/rules/internal/`](../../.agents/rules/internal/).

- **CHARM-001** — Extend the lowest fitting base class: `CharmElement` → `CharmFocusableElement` → `CharmFormControlElement`, or `CharmDismissibleElement`. Never extend `LitElement` directly. ([details](../../.agents/rules/internal/CHARM-001.md))
- **CHARM-002** — Register via `static override baseName` + `project.scope.registerComponent()` in `index.ts`. Never `@customElement`/`customElements.define`. ([details](../../.agents/rules/internal/CHARM-002.md))
- **CHARM-003** — Declare nested Charm components in the `static dependencies` getter so they auto-register in the consumer's scope. ([details](../../.agents/rules/internal/CHARM-003.md))
- **CHARM-004** — Theme via `project.theme` `component(...)` tokens; never hardcode colors/radii/shadows/spacing. ([details](../../.agents/rules/internal/CHARM-004.md))
- **CHARM-005** — Keep the custom-elements manifest accurate: document `@tag`/`@event`/`@slot`/`@csspart`/`@cssproperty`/`@dependency` in the class JSDoc. ([details](../../.agents/rules/internal/CHARM-005.md))
- **CHARM-006** — Form controls extend `CharmFormControlElement`; centralize form-value hooks (`syncFormValue`/`getFormAssociatedState`), validity/constraint sync, and reset defaults. Bind invalid ARIA to `showInvalid`, not `invalid`; composites without an inner input override `updateValidity()`; group-forced state combines with each child's own. Keep fieldset-disabled state separate from the reflected `disabled` attribute. ([details](../../.agents/rules/internal/CHARM-006.md))
- **CHARM-007** — Dual export: `export class Core*` + trailing `export default`; keep the class in its own `.ts` (index.ts/types.ts are excluded from the manifest). ([details](../../.agents/rules/internal/CHARM-007.md))
- **CHARM-008** — Register icons as inline `fill="currentColor"` / `aria-hidden="true"` SVG strings in the `default-icons.ts` set (extended via `project.iconSet`); no `.svg` asset files. ([details](../../.agents/rules/internal/CHARM-008.md))
- **CHARM-010** — Resolve Charm tags via `this.scope.tagName('x')` in `querySelector`/`closest`/`matches`/`localName` checks; never hardcode `ch-*`. ([details](../../.agents/rules/internal/CHARM-010.md))
