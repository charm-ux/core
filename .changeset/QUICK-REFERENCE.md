# Changesets Quick Reference

This guide provides quick answers for common changeset scenarios.

## Quick Commands

```bash
# Add a changeset
pnpm changeset

# Preview what version bump will happen
pnpm changeset status

# Apply version bumps (maintainers only)
pnpm changeset:version

# Publish packages (automated via CI)
pnpm changeset:publish
```

## When to Use Each Version Type

### Patch (0.0.X)

**Use for:** Bug fixes, minor tweaks, dependency updates that don't affect the API

**Examples:**

- Fix button hover state not working
- Correct typo in component documentation
- Update internal dependency versions
- Performance improvements without API changes

### Minor (0.X.0)

**Use for:** New features, new components, non-breaking API additions

**Examples:**

- Add new tooltip component
- Add new `variant` prop to existing button component
- Add new utility function to exports
- Deprecate old API (but keep it working)

### Major (X.0.0)

**Use for:** Breaking changes that require users to update their code

**Examples:**

- Remove previously deprecated API
- Change component prop names
- Change default behavior significantly
- Remove or rename exported functions/components
- Update peer dependencies to new major versions

## Common Scenarios

### Adding a New Component

```bash
pnpm changeset
# Select: @charm-ux/core
# Type: minor
# Description: "Add tooltip component with customizable positioning"
```

### Fixing a Bug

```bash
pnpm changeset
# Select: @charm-ux/core
# Type: patch
# Description: "Fix button focus outline not visible in high contrast mode"
```

### Breaking Change

```bash
pnpm changeset
# Select: @charm-ux/core
# Type: major
# Description: "Remove deprecated `color` prop from Button component. Use `variant` instead."
```

### Multiple Packages

```bash
pnpm changeset
# Select: @charm-ux/core AND @charm-ux/theming
# Type for each: minor
# Description: "Add dark mode theme tokens and update components to support them"
```

### Documentation Only Changes

**No changeset needed!** Just add the `no-changeset` label to your PR.

## Changeset File Structure

When you run `pnpm changeset`, it creates a file like `.changeset/weird-cats-sleep.md`:

```markdown
---
'@charm-ux/core': minor
---

Add tooltip component with customizable positioning options:

- Support for top, bottom, left, right positions
- Auto-positioning when near viewport edges
- Customizable offset and padding
```

## Tips

1. **Be descriptive:** Write clear summaries that will appear in CHANGELOGs
2. **Use present tense:** "Add tooltip" not "Added tooltip"
3. **List key features:** Use bullet points for multiple changes
4. **Reference issues:** Mention related issue numbers if applicable
5. **Think about users:** Write for people who will read the CHANGELOG

## Skipping Changeset Requirements

Add one of these labels to your PR to skip the changeset check:

- `no-changeset` - For documentation, tests, or tooling changes
- `dependencies` - For dependency update PRs

## Troubleshooting

### "No changeset found" error on PR

**Solution:** Run `pnpm changeset` and commit the generated file, or add a `no-changeset` label.

### Changeset asks about wrong packages

**Solution:** Use space bar to deselect/select packages. Only select packages with actual changes.

### Need to change a submitted changeset

**Solution:** Edit the `.changeset/*.md` file directly or delete it and run `pnpm changeset` again.

### Multiple changesets in one PR

**Totally fine!** You can run `pnpm changeset` multiple times if you want to document different types of changes separately.

## Release Process (Automated)

1. **Make changes** → Create PR with changeset
2. **PR merged** → GitHub Actions creates "Version Packages" PR
3. **Review versions** → Check the automated PR for correct versions/changelogs
4. **Merge version PR** → Packages are automatically published to npm
5. **Done!** → New versions are available, CHANGELOGs are updated

## Additional Resources

- [Full CONTRIBUTING guide](./CONTRIBUTING.md)
- [Official Changesets docs](https://github.com/changesets/changesets)
- [Semantic Versioning](https://semver.org/)
