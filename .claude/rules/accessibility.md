# A11Y — Accessibility (always applied)

Accessibility rules. Full details in [`.agents/rules/accessibility/`](../../.agents/rules/accessibility/).

- **A11Y-001** — Use native semantic elements/roles first; add ARIA only to express state the DOM can't. No `<div>` widgets. ([details](../../.agents/rules/accessibility/A11Y-001.md))
- **A11Y-002** — Prefer visually-hidden DOM text (the base `visually-hidden` class) over `aria-label` for user-facing labels; keep labels translatable. ([details](../../.agents/rules/accessibility/A11Y-002.md))
- **A11Y-003** — Manage focus and keyboard interaction; extend `CharmFocusableElement` for focus delegation and test keys with `sendKeys`. ([details](../../.agents/rules/accessibility/A11Y-003.md))
- **A11Y-004** — Ship an accessibility test for every component; keep the shared `.to.be.accessible()` harness test running. ([details](../../.agents/rules/accessibility/A11Y-004.md))
- **A11Y-005** — Generate IDs deterministically: static string IDs for shadow-internal `aria-*` targets, a module-level counter (assigned only if absent) for slotted/light-DOM targets. No `randomUUID`/`nanoid`/`Math.random`. ([details](../../.agents/rules/accessibility/A11Y-005.md))
- **A11Y-006** — Capture the opener on open and restore focus to it when a dismissible closes. ([details](../../.agents/rules/accessibility/A11Y-006.md))
- **A11Y-007** — Use roving tabindex for composite widgets (one item `tabindex=0`, rest `-1`, swapped on arrow/focus nav). ([details](../../.agents/rules/accessibility/A11Y-007.md))
- **A11Y-008** — Compare `event.key` against the shared `keys` map (`src/utilities/key-map.ts`), not string literals (`Space` is `' '`). ([details](../../.agents/rules/accessibility/A11Y-008.md))
- **A11Y-009** — Honor `prefers-reduced-motion` via the `prefersReducedMotion()` helper / a `@media (prefers-reduced-motion: reduce)` block. _Aspirational_ — currently unmet library-wide; apply to new/changed animations. ([details](../../.agents/rules/accessibility/A11Y-009.md))
