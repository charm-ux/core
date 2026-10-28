# A11Y — Accessibility (always applied)

Accessibility rules. Full details in [`.agents/rules/accessibility/`](../../.agents/rules/accessibility/).

- **A11Y-001** — Use native semantics first; use `ElementInternals` for host-based custom controls and avoid nested interactive controls. ([details](../../.agents/rules/accessibility/A11Y-001.md))
- **A11Y-002** — Prefer visually-hidden DOM text (the base `visually-hidden` class) over `aria-label` for user-facing labels; keep labels translatable. ([details](../../.agents/rules/accessibility/A11Y-002.md))
- **A11Y-003** — Manage focus and keyboard interaction; extend `CharmFocusableElement` for focus delegation and test keys with `sendKeys`. ([details](../../.agents/rules/accessibility/A11Y-003.md))
- **A11Y-004** — Ship an accessibility test for every component; keep the shared `.to.be.accessible()` harness test running. ([details](../../.agents/rules/accessibility/A11Y-004.md))
- **A11Y-005** — Generate deterministic, stable IDs in the same tree scope; capture per-instance identity before async work and never derive persistent child IDs from indexes. ([details](../../.agents/rules/accessibility/A11Y-005.md))
- **A11Y-006** — Capture the opener on open and restore focus to it when a dismissible closes. ([details](../../.agents/rules/accessibility/A11Y-006.md))
- **A11Y-007** — Use roving tabindex for composite widgets (one item `tabindex=0`, rest `-1`, swapped on arrow/focus nav); arrow/Home/End nav must skip disabled items and wrap. ([details](../../.agents/rules/accessibility/A11Y-007.md))
- **A11Y-008** — Compare `event.key` against the shared `keys` map (`src/utilities/key-map.ts`), not string literals (`Space` is `' '`). ([details](../../.agents/rules/accessibility/A11Y-008.md))
- **A11Y-009** — Honor reduced motion in CSS and imperative animation, including delays and pseudo-elements such as backdrops. ([details](../../.agents/rules/accessibility/A11Y-009.md))
- **A11Y-010** — Keep host ARIA, focusability, and nested option state synchronized with effective disabled state, including fieldset callbacks. ([details](../../.agents/rules/accessibility/A11Y-010.md))
- **A11Y-011** — Make closed or off-screen content `inert` so it leaves the tab order and a11y tree; bind to the `open` state. ([details](../../.agents/rules/accessibility/A11Y-011.md))
- **A11Y-012** — Meet 4.5:1 text contrast and 3:1 essential-boundary contrast; verify placeholder and theme token colors. ([details](../../.agents/rules/accessibility/A11Y-012.md))
- **A11Y-013** — Label every native field in a composite control, use a visible validation anchor, and preserve draft values on cancel. ([details](../../.agents/rules/accessibility/A11Y-013.md))
- **A11Y-014** — Name the element that carries a composite widget's role; host labels do not cross shadow roots. ([details](../../.agents/rules/accessibility/A11Y-014.md))
