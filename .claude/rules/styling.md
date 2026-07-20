---
globs: packages/*/src/**/*.styles.ts,packages/theming/src/**
---

# STYLE — Styling

Styling rules. Full details in [`.agents/rules/styling/`](../../.agents/rules/styling/).

- **STYLE-001** — Author styles in `<name>.styles.ts` as a default-exported Lit `css` template. No inline/raw-`.css` styles. ([details](../../.agents/rules/styling/STYLE-001.md))
- **STYLE-002** — Theme with `project.theme` tokens + `--charm-*` custom properties; never hardcode colors/spacing/shadows. ([details](../../.agents/rules/styling/STYLE-002.md))
- **STYLE-003** — Aggregate with `static override styles = [...super.styles, styles]` (super first) to preserve base styles. ([details](../../.agents/rules/styling/STYLE-003.md))
- **STYLE-004** — Use CSS logical properties (`margin-inline-start`, `inset-inline-*`, `text-align: start`) for RTL, not physical left/right. ([details](../../.agents/rules/styling/STYLE-004.md))
- **STYLE-005** — Expose restyle hooks via `part=` (documented `@csspart`) and `::slotted()`; avoid dynamic inline `style=`. ([details](../../.agents/rules/styling/STYLE-005.md))
- **STYLE-006** — Toggle conditional classes with `classMap()` (from `lit/directives/class-map.js`), not string concatenation. ([details](../../.agents/rules/styling/STYLE-006.md))
- **STYLE-007** — Author theme tokens (`packages/theming/src/themes/`) as one three-tier `defineTokens({primitives, semantics, components})`; alias with `ref()` (no raw literals in semantics/components), write mode differences as inline `{light,dark}`, and `.extend*()` the base theme rather than forking. ([details](../../.agents/rules/styling/STYLE-007.md))
