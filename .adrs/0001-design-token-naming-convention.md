# ADR-0001: Normalize design token naming before the 1.0 contract

**Date:** 2026-07-31

## Context

The theme-engine upgrade (PR #17, "upgrade theme engine") replaced the legacy flat token map
with a three-tier `defineTokens()` system: `primitives` (scales and base values), `semantics`
(cross-component meaning), and `components` (per-component surface). Tokens are referenced in
source through `primitive()` / `semantic()` / `component()` helpers and emitted as CSS custom
properties (`--charm-<kebab-path>`).

The dominant convention was clear but not applied uniformly. An audit of
`packages/theming/src/themes/charm.ts` found several concurrent ways of expressing the same
kind of token:

- **Two focus groups** — `focusOutline.{color,width,style,offset}` and
  `focus.{outlineColor,outlineOffset,outlineSize,outlineStyle}`, plus a third spelling in
  `generateReset()`.
- **Flattened states** — `action.primaryHover`, `menu.item.inputHoverBgColor`,
  `radio.label.checkedHoverFgColor` put the state in the leaf name.
- **Same concept, different leaf names** — `shadow` vs `boxShadow`; `borderWidth` vs
  `borderSize`; combined `border` shorthands alongside decomposed
  `borderWidth`/`borderStyle`/`borderColor`.
- **Mixed scale notation** — `spacing.xxs` beside `spacing.2xs`/`3xl`.
- **Non-`bgColor`/`fgColor` colors** — `indicatorColor` (no `bg`/`fg` pair),
  `backgroundColor`/`foregroundColor`.

CSS custom property names are a public, hard-to-reverse contract: `charm-fui` and `charm-cui`
override and consume these names, and external consumers style against them. The 1.0 release
of `@charm-ux/core` / `@charm-ux/theming` is the last moment we can normalize without an
additional breaking-change cycle.

## Decision

Adopt the dominant convention as canonical and **fully normalize the token set before 1.0** —
no divergent names ship in the 1.0 contract.

The **authoritative, living grammar is [STYLE-009](../.agents/rules/styling/STYLE-009.md)**;
update that rule when the convention changes, not this ADR.
[STYLE-007](../.agents/rules/styling/STYLE-007.md) covers the `defineTokens()` structure. In
short, every token follows `<category> [.<role>] [.<state>…] .<property>`:

- states nest (conditional before interaction), never flattened into the leaf;
- `gap` for between-element spacing, `paddingX`/`paddingY` for internal space;
- `bgColor` for backgrounds, `fgColor` for the generic component foreground; text-scoped
  element groups use `color` (`label`, `placeholder`, `helpText`, `message`) and icon-scoped
  colors use `iconColor`; `Color` suffix otherwise — never `backgroundColor`/`foregroundColor`;
- `shadow` (not `boxShadow`), decomposed `borderWidth`/`borderStyle`/`borderColor`;
- numeric scale steps (`spacing.2xs`, not `xxs`).

The normalization folds the duplicate focus groups into a single `focus` group
(`outlineWidth`), renames the divergent leaves listed in the Context, and aligns
`generateReset()` so the reset's `body` colors resolve. The exhaustive old→new rename table is
tracked in the [`normalize-token-naming` changeset](../.changeset/normalize-token-naming.md).

## Alternatives considered

- **Codify convention only, no renames** — zero churn, but the codebase stays internally
  inconsistent and the divergence becomes a permanent tax on reviewers, tooling (CEM, prefix
  plugin, unresolved-variable audit), and consumers who must learn two spellings for one
  concept.
- **Phased normalization after 1.0** — pushes the renames into 1.x minor releases, each
  another breaking change for consumers; defeats the purpose of a clean 1.0 contract.

## Consequences

**Positive:**

- A single, predictable token vocabulary; naming is now derivable from the rules rather than
  memory
- The unresolved-variable audit, `cssPrefixPlugin`, and the migration guide operate against
  one schema
- The `focus`-group collision with `generateReset()` (which emitted `--focus-outline-width`)
  is eliminated
- The reset's `body` colors now resolve (they previously referenced nonexistent
  `--charm-body-background-color` / `--charm-body-foreground-color`)

**Negative:**

- Breaking renames for theme extenders and downstream consumers between 0.5.x and 1.0
  (mitigated by the published migration guide and changeset)
- Non-trivial churn in `charm.ts`, component styles, the tokens type, and generated artifacts
  before release

**Assumptions:**

- CSS custom property names in the 1.0 contract are stable thereafter; further naming changes
  require a new ADR.
- Renaming token _paths_ (used in JS helpers) and their emitted CSS variables stays in sync —
  `cssVarName()` produces the CSS name from the path, so one rename covers both.

See also: [STYLE-009](../.agents/rules/styling/STYLE-009.md),
[STYLE-007](../.agents/rules/styling/STYLE-007.md),
[ADR-001](../.agents/rules/adr/ADR-001.md),
[ADR-002](../.agents/rules/adr/ADR-002.md),
[CHARM-004](../.agents/rules/internal/CHARM-004.md),
issue [#27](https://github.com/charm-ux/core/issues/27),
PR [#17](https://github.com/charm-ux/core/pull/17)
