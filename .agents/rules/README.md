# Charm UX Design System Rules

Authoring standards for the Charm web-component library (`packages/core`, built on Lit 3).
Each rule is a single Markdown file so it can be referenced by ID in reviews and loaded
selectively by agents.

## Rule ID format

`{CODE}-{NNN}` — a category code plus a zero-padded three-digit number (e.g. `COMP-003`,
`A11Y-001`). One rule per file; the filename is the rule ID. Files live in a directory named
for the category.

## Categories

| Code    | Directory           | Scope                                                                                                   |
| ------- | ------------------- | ------------------------------------------------------------------------------------------------------- |
| `CHARM` | `internal/`         | Charm-specific architecture: base classes, scope registration, dependencies, theming, manifest, exports |
| `COMP`  | `component-design/` | Custom-element design: slots, Shadow DOM, lifecycle, composition, render structure                      |
| `PROP`  | `props/`            | Reactive properties, attributes, and events                                                             |
| `STYLE` | `styling/`          | Lit `css`, tokens, custom properties, RTL, parts                                                        |
| `A11Y`  | `accessibility/`    | Semantics, focus, keyboard, a11y testing                                                                |
| `I18N`  | `i18n/`             | Translatable text and RTL support                                                                       |
| `TEST`  | `testing/`          | web-test-runner + `@open-wc/testing` harness pattern, performance budgets                               |
| `DOC`   | `documentation/`    | Storybook stories, manifest docs, docs pages, scaffolding                                               |
| `CODE`  | `code/`             | Enforced TypeScript / lint / import conventions                                                         |
| `PROC`  | `process/`          | Changesets, PR, and release process                                                                     |
| `ADR`   | `adr/`              | When and how to record architecture decisions                                                           |

## Delivery model

Rules are delivered to agents in two tiers (wired in the repo-root `AGENTS.md` and
`.claude/rules/`):

- **Always loaded** — foundational rules injected for every task: `CHARM-*`, `A11Y-*`,
  `CODE-*`, `PROC-*`.
- **Path-gated** — activated when the files being edited match a glob: `COMP-*`, `PROP-*`,
  `STYLE-*`, `I18N-*`, `TEST-*`, `DOC-*`.
- **Reference** — consulted on demand rather than injected: `ADR-*` (read when making or
  reviewing an architectural decision).

## Rule index

### CHARM — internal architecture (always loaded)

- [CHARM-001](internal/CHARM-001.md) — Extend the correct base class
- [CHARM-002](internal/CHARM-002.md) — Register components through the project scope
- [CHARM-003](internal/CHARM-003.md) — Declare nested components in `static dependencies`
- [CHARM-004](internal/CHARM-004.md) — Theme through the theming package, never hardcode
- [CHARM-005](internal/CHARM-005.md) — Keep the custom-elements manifest accurate with JSDoc
- [CHARM-006](internal/CHARM-006.md) — Build form controls on `CharmFormControlElement`
- [CHARM-007](internal/CHARM-007.md) — Use the dual named + default export, class in its own `.ts`
- [CHARM-008](internal/CHARM-008.md) — Register icons as inline SVG strings in the icon set, not asset files
- [CHARM-009](internal/CHARM-009.md) — Use correct JSDoc annotation tags (`@cssprop`, not `@cssproperty`)

### COMP — component design (path-gated)

- [COMP-001](component-design/COMP-001.md) — Expose structure through slots, not config objects
- [COMP-002](component-design/COMP-002.md) — Encapsulate in Shadow DOM; expose `::part` + custom properties
- [COMP-003](component-design/COMP-003.md) — Render polymorphic tags with static-html `literal`
- [COMP-004](component-design/COMP-004.md) — Do DOM-dependent work in lifecycle callbacks, not the constructor
- [COMP-005](component-design/COMP-005.md) — Keep components headless and self-contained
- [COMP-006](component-design/COMP-006.md) — Split `render()` into small named `protected *Template()` methods
- [COMP-007](component-design/COMP-007.md) — Compose slot scaffolding with the shared `src/templates/` helpers
- [COMP-008](component-design/COMP-008.md) — Detect slotted content with `HasSlotController`
- [COMP-009](component-design/COMP-009.md) — Query slotted children with `@queryAssignedElements`, shadow nodes with `@query`
- [COMP-010](component-design/COMP-010.md) — Make positioner/observer `start()` idempotent — tear down before re-arming
- [COMP-011](component-design/COMP-011.md) — Mirror listeners/observers across connect/disconnect; guard callbacks with `isConnected`
- [COMP-012](component-design/COMP-012.md) — Store timers in a field; clear before re-setting and on teardown
- [COMP-013](component-design/COMP-013.md) — Bind optional attributes with `ifDefined()` so they collapse when unset
- [COMP-014](component-design/COMP-014.md) — Position overlays through `ch-popup`, never import a positioning library directly
- [COMP-015](component-design/COMP-015.md) — Drive show/hide from a `visible` state settled on `transitionend` with a fallback timer

### PROP — properties, attributes, events (path-gated)

- [PROP-001](props/PROP-001.md) — Declare public API with `@property`; reflect state used for styling
- [PROP-002](props/PROP-002.md) — Name attributes consistently; keep native names native
- [PROP-003](props/PROP-003.md) — Emit `CustomEvent`s through the base `emit()` helper
- [PROP-004](props/PROP-004.md) — Support controlled and uncontrolled usage via property + event
- [PROP-005](props/PROP-005.md) — Document every property, event, slot, and part
- [PROP-006](props/PROP-006.md) — Type custom-event details with an exported interface + `emitX()` wrapper
- [PROP-007](props/PROP-007.md) — Emit dismissible events with `emitScopedEvent`; gate closing on `request-close`
- [PROP-008](props/PROP-008.md) — Use `@state()` for internal state; compute derived state in `willUpdate`
- [PROP-009](props/PROP-009.md) — Author side-effecting properties as getter/setter pairs

### STYLE — styling (path-gated)

- [STYLE-001](styling/STYLE-001.md) — Author styles in `*.styles.ts` with the Lit `css` template
- [STYLE-002](styling/STYLE-002.md) — Theme with tokens and CSS custom properties, never hardcode
- [STYLE-003](styling/STYLE-003.md) — Aggregate styles with `[...super.styles, styles]`
- [STYLE-004](styling/STYLE-004.md) — Use CSS logical properties for RTL support
- [STYLE-005](styling/STYLE-005.md) — Expose parts intentionally and avoid inline styles
- [STYLE-006](styling/STYLE-006.md) — Toggle conditional classes with `classMap()`, not string concatenation
- [STYLE-007](styling/STYLE-007.md) — Author theme tokens as a three-tier `defineTokens` set; alias with `ref()`, extend don't fork
- [STYLE-008](styling/STYLE-008.md) — Set runtime-computed CSS custom properties with `this.style.setProperty()`

### A11Y — accessibility (always loaded)

- [A11Y-001](accessibility/A11Y-001.md) — Use semantic elements and roles; add ARIA only to fill gaps
- [A11Y-002](accessibility/A11Y-002.md) — Prefer visually-hidden text over `aria-label` for user-facing labels
- [A11Y-003](accessibility/A11Y-003.md) — Manage focus and keyboard interaction
- [A11Y-004](accessibility/A11Y-004.md) — Ship an accessibility test for every component
- [A11Y-005](accessibility/A11Y-005.md) — Generate IDs deterministically — static in the shadow root, a module counter for light DOM
- [A11Y-006](accessibility/A11Y-006.md) — Return focus to the opener when a dismissible closes
- [A11Y-007](accessibility/A11Y-007.md) — Use roving tabindex for composite widgets
- [A11Y-008](accessibility/A11Y-008.md) — Compare `event.key` against the shared `keys` map, not string literals
- [A11Y-009](accessibility/A11Y-009.md) — Honor `prefers-reduced-motion` (aspirational)

### I18N — internationalization (path-gated)

- [I18N-001](i18n/I18N-001.md) — Render user-facing text via slots and DOM, not attributes
- [I18N-002](i18n/I18N-002.md) — Support RTL through direction-aware styling and behavior

### TEST — testing (path-gated)

- [TEST-001](testing/TEST-001.md) — Use the test-harness pattern
- [TEST-002](testing/TEST-002.md) — Use `@open-wc/testing` + web-test-runner, and await updates
- [TEST-003](testing/TEST-003.md) — Assert events with `oneEvent`, keys with `sendKeys`, spies with `sinon`
- [TEST-004](testing/TEST-004.md) — Ship a `*.performance.ts` render-time budget for every component

### DOC — documentation (path-gated)

- [DOC-001](documentation/DOC-001.md) — Provide Storybook stories via `getStorybookHelpers`
- [DOC-002](documentation/DOC-002.md) — Scaffold new components with plop
- [DOC-003](documentation/DOC-003.md) — Follow the component `.mdx` docs-page structure

### CODE — code & TypeScript conventions (always loaded)

- [CODE-001](code/CODE-001.md) — End relative imports with `.js`
- [CODE-002](code/CODE-002.md) — Explicit member accessibility, `override`, and member ordering
- [CODE-003](code/CODE-003.md) — Order and sort imports
- [CODE-004](code/CODE-004.md) — Respect the TS/Lit compiler contract (erasable syntax, type-only imports, decorators)
- [CODE-005](code/CODE-005.md) — Respect module boundaries — never edit generated entrypoints, don't rely on deep imports
- [CODE-006](code/CODE-006.md) — Re-export external dependency types through the owning module

### PROC — process (always loaded)

- [PROC-001](process/PROC-001.md) — Add a changeset for consumer-affecting changes
- [PROC-002](process/PROC-002.md) — Pass the local gate before opening a PR

### ADR — architecture decision records (reference)

- [ADR-001](adr/ADR-001.md) — When to write an ADR
- [ADR-002](adr/ADR-002.md) — ADR format and content
- [ADR-003](adr/ADR-003.md) — Example: register components through a scoped registry

## Adding a new rule

1. Create the rule file `{CODE}-{NNN}.md` in the category directory, following the existing
   format: an `H1` `# CODE-NNN: Title`, prose, `**Do:**` / `**Don't:**` code-block pairs, and
   a `See also:` line linking related rules.
2. Add it to the **Rule index** above.
3. Add a one-line summary to the corresponding `.claude/rules/<category>.md` file, linking
   back to the rule.
4. If it belongs to an always-loaded category (`CHARM`, `A11Y`, `CODE`, `PROC`), it is
   already covered by `AGENTS.md`; otherwise confirm the path-gated glob in
   `.claude/rules/<category>.md` matches where the rule applies.

## How to use these rules

- **Agents** read the always-loaded categories on every task and the path-gated categories
  when touching matching files. Cite rule IDs in code review (e.g. "PROP-003: emit through
  `emit()`").
- **Humans** treat this as the design-system contribution guide; the `Do`/`Don't` pairs are
  copy-paste-ready references grounded in the actual `packages/core` codebase.
