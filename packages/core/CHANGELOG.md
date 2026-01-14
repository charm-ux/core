# CHARM-UX Core Changelog

## 0.3.0

### Minor Changes

- de1129c: Add tooltip component with customizable positioning options:
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
  ```

- de1129c: [Menu] Keyboard navigation / focus and state fixes
- de1129c: [Tooltip] Fix issue with fixed placement popup and tooltip open state falling out of sync

### Patch Changes

- de1129c: Added missing README for core package

## 0.2.1

### Patch Changes

- fdd4082: Added missing README for core package

## 0.2.0

### Minor Changes

- c700977: Add tooltip component with customizable positioning options:
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
  ```

- 2115492: initial release

## 0.0.0

- Initial commit
