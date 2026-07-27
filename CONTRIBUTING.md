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

- Extend from appropriate base classes
- Use Lit decorators for properties and state
- Implement keyboard navigation and ARIA attributes
- Add comprehensive tests
- Create Storybook stories demonstrating all variants

## Changesets

We use [Changesets](https://github.com/changesets/changesets) to manage versions and changelogs.

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

- TypeScript for all code
- Tests for new features and bug fixes
- JSDoc comments for public APIs
- Small, focused components

## Questions?

- Check [existing issues](https://github.com/charm-ux/core/issues)
- Open a new issue with details
