# Charm UX — Agent Guide

Charm is an accessible, headless **web-component** library built on **Lit 3**, published from
a pnpm workspace (`packages/core`, `packages/theming`, `packages/docs`). Components are
authored as custom elements / web components.

## Rules

Authoring standards live in [`.agents/rules/`](.agents/rules/README.md), one rule per file,
referenced by ID (e.g. `PROP-003`) in reviews. Start from the
[rules README](.agents/rules/README.md) for the full index.

### Always applied

These foundational categories apply to all component work regardless of which files you
touch:

- **CHARM** — Charm architecture: base classes, scope registration, dependencies, theming,
  manifest, exports. → [`.agents/rules/internal/`](.agents/rules/internal/)
- **A11Y** — accessibility: semantics, focus, keyboard, a11y testing. →
  [`.agents/rules/accessibility/`](.agents/rules/accessibility/)
- **CODE** — enforced TypeScript / lint / import conventions (hard CI failures). →
  [`.agents/rules/code/`](.agents/rules/code/)
- **PROC** — changesets, PR, and release process. →
  [`.agents/rules/process/`](.agents/rules/process/)

### Path-gated

These activate when you edit matching files:

| Rules                           | Applies to (glob)                                                               |
| ------------------------------- | ------------------------------------------------------------------------------- |
| `COMP-*` (component design)     | `packages/*/src/components/**/*.ts`                                             |
| `PROP-*` (properties/events)    | `packages/*/src/components/**/*.ts`                                             |
| `STYLE-*` (styling)             | `packages/*/src/**/*.styles.ts`, `packages/theming/src/**`                      |
| `I18N-*` (internationalization) | `packages/*/src/components/**/*.ts`                                             |
| `TEST-*` (testing)              | `packages/*/src/**/*.test.ts`, `packages/*/src/**/*.test-harness.ts`            |
| `DOC-*` (documentation)         | `packages/*/src/**/*.stories.ts`, `packages/*/src/**/*.mdx`, `packages/docs/**` |

### Reference

- **ADR** — Architecture Decision Records: when and how to record architectural decisions
  (read when making or reviewing one; stored in `/.adrs/`). →
  [`.agents/rules/adr/`](.agents/rules/adr/)

## Key conventions (quick reference)

- **Tags** are scoped: a component sets `static override baseName = 'button'` and is
  registered via `project.scope.registerComponent()` in `index.ts` → `<ch-button>`. Never
  `@customElement`/`customElements.define` directly. (CHARM-002)
- **Base classes**: `CharmElement` → `CharmFocusableElement` → `CharmFormControlElement`,
  plus `CharmDismissibleElement`. Extend the lowest one that fits. (CHARM-001)
- **Events** go through the base `emit()` helper (composed by default); names are `change`
  or `{component}-{action}`, never `ch-`-prefixed. (PROP-003)
- **Styling** is token-driven via `project.theme` `component(...)`; styles live in
  `*.styles.ts` and aggregate with `[...super.styles, styles]`. (STYLE-001/002/003)
- **Docs**: JSDoc tags feed the custom-elements manifest; Storybook stories use
  `getStorybookHelpers`. Scaffold new components with `pnpm plop`. (CHARM-005, DOC-001/002)
- **Tests** run in real browsers via `@web/test-runner` + `@open-wc/testing` using the
  test-harness pattern. Run outside the ZD sandbox (Chromium can't launch inside it). (TEST-\*)
- **Code style** is CI-enforced (`--max-warnings 0`): relative imports must end in `.js`,
  every class member needs an explicit accessibility modifier + `override` where it applies,
  imports are ordered/sorted, no enums/namespaces, type-only imports marked `type`. (CODE-\*)
- **Process**: add a changeset for consumer-affecting changes (CI fails without one), and
  run `pnpm lint && pnpm test && pnpm build` before opening a PR. (PROC-\*)
- **Cleanup**: observers/listeners/timers must be torn down symmetrically — `start()` disposes
  before re-arming, timers are cleared before re-set and on disconnect, observer callbacks
  guard on `isConnected`. Leaks here manifest as a hanging test session, not a failing
  assertion. (COMP-010/011/012)
- **Generated files**: `kitchen-sink.ts` and `custom-elements.json` are generated — never
  hand-edit them; regenerate. Overlays position through `ch-popup`, never a direct
  `@floating-ui/dom` import. (CODE-005, COMP-014)

## Tooling notes

- Package manager: **pnpm** (workspaces). Run a single component's tests with
  `pnpm test -- --group <name>`.
- Build: Vite + `tsc`; manifest via `@custom-elements-manifest/analyzer`.
- Dev: `pnpm dev` runs Storybook on port 6006.
