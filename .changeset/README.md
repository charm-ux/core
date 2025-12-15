# Changesets

Hello! 👋

This folder contains "changesets" - files that describe changes to packages in this monorepo.

## What are changesets?

Changesets are a way of documenting changes to packages. They help us:

- Track which packages are affected by changes
- Specify the type of change (major, minor, or patch)
- Provide human-readable descriptions for changelogs

## How to create a changeset

When you make changes that should be published, run:

```bash
pnpm changeset
```

This will:

1. Prompt you to select which packages have changed
2. Ask for the type of change (major, minor, or patch)
3. Request a summary of the changes
4. Create a markdown file in this directory

## Changeset file format

Each changeset file contains:

- YAML frontmatter listing affected packages and their version bump types
- A markdown description of the changes

Example:

```markdown
---
'@charm-ux/core': minor
---

Add tooltip component with customizable positioning
```

## What happens to changesets?

When a PR with changesets is merged to main:

1. A "Version Packages" PR is automatically created by GitHub Actions
2. This PR updates package.json versions and CHANGELOG.md files
3. When merged, packages are published and changesets are removed

For more detailed information, see [CONTRIBUTING.md](../CONTRIBUTING.md#creating-a-changeset)

For full documentation on changesets, visit [the official repository](https://github.com/changesets/changesets)
