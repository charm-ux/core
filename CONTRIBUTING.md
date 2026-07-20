# Contributing to Charm

## Prerequisites

- Node.js 20+
- pnpm 8+

## Setup

```bash
git clone https://github.com/charm-ux/core.git
cd core
pnpm install
```

## Coding Standards

Authoring standards for this repo are codified as **rules** in
[`.agents/rules/`](.agents/rules/README.md) — one rule per file, referenced by ID (e.g.
`COMP-001`, `PROP-003`, `CODE-001`) in code review. **That directory is the canonical source**;
the guidelines in this document only summarize the highlights and link back to it.

The same rules are wired into AI coding tools: [`AGENTS.md`](AGENTS.md) and
[`CLAUDE.md`](CLAUDE.md) load the always-applied categories (CHARM, A11Y, CODE, PROC) on every
task, and the path-gated categories (COMP, PROP, STYLE, I18N, TEST, DOC) when you edit matching
files.

Skim the [rules index](.agents/rules/README.md) before your first contribution.

## Development

### Storybook

Storybook is the primary development environment. Run from the project root:

```bash
pnpm dev
```

This starts Storybook at http://localhost:6006 with stories for all packages:

- **Core** — Component stories with interactive examples
- **Theming** — Design token documentation
  - Primitives: colors, spacing, typography, border radius, shadows
  - Semantic: surfaces, text, borders, actions, indicators

### Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm build:core
pnpm build:theming
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run core package tests only
pnpm test:core
```

### Linting & Formatting

```bash
# Check for issues
pnpm lint
pnpm prettier:check

# Auto-fix
pnpm lint:fix
pnpm prettier
```

## Making Changes

### Creating a Component

Use the generator to scaffold a new component:

```bash
pnpm generate
```

This creates the component file, tests, and Storybook stories.

### Component Guidelines

Highlights only — see [`.agents/rules/`](.agents/rules/README.md) for the full, ID-referenced
standards:

- Extend the lowest fitting base class (never `LitElement` directly) and register through the
  project scope, not `customElements.define`
  ([CHARM-001](.agents/rules/internal/CHARM-001.md), [CHARM-002](.agents/rules/internal/CHARM-002.md))
- Expose structure through slots; declare config with `@property`/`@state`
  ([COMP-001](.agents/rules/component-design/COMP-001.md), [PROP-001](.agents/rules/props/PROP-001.md))
- Emit events through the base `emit()` helper
  ([PROP-003](.agents/rules/props/PROP-003.md))
- Implement keyboard navigation and ARIA, and tear down listeners/observers/timers
  symmetrically ([A11Y-003](.agents/rules/accessibility/A11Y-003.md),
  [COMP-010](.agents/rules/component-design/COMP-010.md)–[COMP-012](.agents/rules/component-design/COMP-012.md))
- Ship tests via the test-harness pattern, including an accessibility test
  ([TEST-001](.agents/rules/testing/TEST-001.md), [A11Y-004](.agents/rules/accessibility/A11Y-004.md))
- Provide Storybook stories and a component docs page
  ([DOC-001](.agents/rules/documentation/DOC-001.md), [DOC-003](.agents/rules/documentation/DOC-003.md))

## Changesets

We use [Changesets](https://github.com/changesets/changesets) to manage versions and changelogs.
Canonical rule: [PROC-001](.agents/rules/process/PROC-001.md).

### When to Add a Changeset

Add a changeset for:

- New features
- Bug fixes
- Breaking changes
- Dependency updates affecting consumers

Skip changesets for:

- Internal refactoring
- Test updates
- Tooling changes
- Documentation typos

### Creating a Changeset

```bash
pnpm changeset
```

Follow the prompts:

1. **Select packages** — Space to select, Enter to confirm
2. **Select version bump**:
   - `major` — Breaking changes
   - `minor` — New features
   - `patch` — Bug fixes
3. **Write a summary** — Use present tense ("Add tooltip component")

This creates a file in `.changeset/`:

```markdown
---
'@charm-ux/core': minor
---

Add tooltip component with customizable positioning
```

Commit the changeset file with your changes:

```bash
git add .changeset/*.md
git commit -m "Add tooltip component"
```

### Multi-Package Changes

Select all affected packages when prompted:

```markdown
---
'@charm-ux/core': minor
'@charm-ux/theming': patch
---

Add new color tokens and update button to use them
```

## Pull Request Process

Canonical rule: [PROC-002](.agents/rules/process/PROC-002.md).

1. Create a branch:

   ```bash
   git checkout -b feature/your-feature
   ```

2. Make changes and add a changeset

3. Verify everything passes:

   ```bash
   pnpm lint
   pnpm test
   pnpm build
   ```

4. Push and open a PR with:
   - Clear description of changes
   - Reference to related issues
   - Screenshots for UI changes

## Release Process

Releases are automated:

1. PRs with changesets merge to `main`
2. GitHub Actions creates a "Version Packages" PR
3. Merging that PR publishes to npm and updates changelogs

## Code Style

Lint and formatting are **CI-enforced** — `pnpm lint` runs with `--max-warnings 0`. The full
conventions live in the `CODE-*` rules ([`.agents/rules/code/`](.agents/rules/code/)); the
essentials:

- TypeScript for all code; relative imports end in `.js`
  ([CODE-001](.agents/rules/code/CODE-001.md))
- Explicit member accessibility + `override`; ordered/sorted imports
  ([CODE-002](.agents/rules/code/CODE-002.md), [CODE-003](.agents/rules/code/CODE-003.md))
- JSDoc comments for public APIs ([PROP-005](.agents/rules/props/PROP-005.md))
- Small, focused components; never hand-edit generated files
  ([CODE-005](.agents/rules/code/CODE-005.md))

## Questions?

- Check [existing issues](https://github.com/charm-ux/core/issues)
- Open a new issue with details
