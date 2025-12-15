# Contributing to Charm

Thank you for your interest in contributing to Charm! This document provides guidelines and instructions for contributing to the project.

## Getting Started

### Prerequisites

- Node.js 20 or higher
- pnpm 8 or higher

### Setup

1. Fork and clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Build the packages:
   ```bash
   pnpm run build
   ```

## Development Workflow

### Running the Development Server

To start the development server for the core package:

```bash
pnpm run dev:core
```

To start the documentation site:

```bash
pnpm run dev:docs
```

To start the demo:

```bash
pnpm run dev:demo
```

### Running Tests

Run all tests:

```bash
pnpm run test
```

Run tests for the core package only:

```bash
pnpm run test:core
```

Run tests in watch mode:

```bash
pnpm run test:watch
```

### Linting and Formatting

Check for linting errors:

```bash
pnpm run lint
```

Fix linting errors automatically:

```bash
pnpm run lint:fix
```

Check code formatting:

```bash
pnpm run prettier:check
```

Format code:

```bash
pnpm run prettier
```

## Creating a Changeset

We use [Changesets](https://github.com/changesets/changesets) to manage versions and changelogs. When you make changes that should be published, you need to create a changeset.

### When to Add a Changeset

Add a changeset when your changes include:

- **New features** - Any new functionality, components, or capabilities
- **Bug fixes** - Corrections to existing functionality
- **Breaking changes** - Changes that may break existing code
- **Dependency updates** - Updates to external dependencies that affect consumers
- **Documentation updates** - Significant documentation improvements

You **don't** need a changeset for:

- Internal refactoring that doesn't affect the public API
- Test updates
- Development tooling changes
- README or comment updates

### How to Add a Changeset

1. Make your changes to the codebase
2. Run the changeset command:
   ```bash
   pnpm changeset
   ```
3. Follow the interactive prompts:
   - Select which packages have changed (use space to select, enter to confirm)
   - Select the type of change:
     - **major** - Breaking changes (e.g., removing a public API, changing behavior significantly)
     - **minor** - New features (e.g., adding a new component, new props to existing components)
     - **patch** - Bug fixes and small improvements
   - Write a summary of the changes
     - First line should be a short summary
     - Add more details on subsequent lines if needed
     - Use present tense (e.g., "Add new button variant" not "Added new button variant")

4. Commit the generated changeset file along with your changes:
   ```bash
   git add .changeset/*.md
   git commit -m "Add changeset for [your changes]"
   ```

### Changeset Example

After running `pnpm changeset`, you'll create a file like `.changeset/mighty-bears-dance.md`:

```markdown
---
'@charm-ux/core': minor
---

Add new tooltip component with customizable positioning and animation options
```

### Multiple Package Changes

If your changes affect multiple packages, select all relevant packages when prompted. For example:

```markdown
---
'@charm-ux/core': minor
'@charm-ux/theming': patch
---

Add new color tokens and update button component to use them
```

## Pull Request Process

1. Create a feature branch from `main`:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and add a changeset (if applicable)

3. Ensure all tests pass and code is properly formatted:

   ```bash
   pnpm run verify
   pnpm run test
   ```

4. Push your branch and create a pull request:
   - Provide a clear description of the changes
   - Reference any related issues
   - Ensure CI checks pass

5. Wait for review and address any feedback

## Release Process

Releases are automated via GitHub Actions:

1. When PRs with changesets are merged to `main`, a "Version Packages" PR is automatically created
2. This PR updates package versions and CHANGELOGs based on the changesets
3. When the "Version Packages" PR is merged, packages are automatically published
4. The changesets are consumed and removed from the `.changeset` directory

## Code Style

- Follow the existing code style in the project
- Use TypeScript for all new code
- Write tests for new features and bug fixes
- Document public APIs with JSDoc comments
- Keep components small and focused on a single responsibility

## Component Development

When creating a new component:

1. Use the component generator:

   ```bash
   pnpm run generate
   ```

2. Implement the component following the existing patterns:
   - Extend from appropriate base classes
   - Use Lit decorators for properties and state
   - Implement proper accessibility features
   - Add comprehensive tests
   - Create Storybook stories

3. Document the component:
   - Add JSDoc comments to the component class and public methods
   - Create usage examples in Storybook
   - Update relevant documentation

## Questions or Issues?

If you have questions or run into issues:

- Check existing [GitHub Issues](https://github.com/your-org/charm-core/issues)
- Create a new issue with a clear description
- Join our community discussions

Thank you for contributing to Charm! 🎉
