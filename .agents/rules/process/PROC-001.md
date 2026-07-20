# PROC-001: Add a changeset for consumer-affecting changes

Any change that affects a published package's consumers must include a changeset, committed
alongside the change. CI (`changeset-check`) fails a PR with "No changeset found!" unless a
changeset file exists or the PR carries a `no-changeset` / `dependencies` label. Create one
with `pnpm changeset`, select every affected package, and pick the correct semver bump.

**When to add one:** new features, bug fixes, breaking changes, dependency updates that
affect consumers.
**When you can skip it:** internal refactoring, test-only changes, tooling changes,
documentation typos (use the `no-changeset` label).

**Changelog message style:**

- One line, brief and to the point, present tense.
- Prefix component changes with `[ComponentName]`.
- Lead with a consistent verb: **Added** (new feature), **Changed**, **Deprecated**,
  **Removed**, **Fixed**, or **Bumped `<package>` from x.x.x to x.x.x** (dependency updates).

**Do:**

```md
---
'@charm-ux/core': minor
---

[Button] Added `icon-only` attribute for compact icon buttons
```

**Don't:**

```md
---
'@charm-ux/core': major
---

fixed some stuff and refactored the button and also bumped a dep <!-- multi-topic, past tense, no [Component], wrong bump -->
```

Releases are automated — merging changesets to `main` opens a "Version Packages" PR; merging
that publishes to npm. Never hand-edit versions or publish manually.

See also: [PROC-002](./PROC-002.md), [DOC-002](../documentation/DOC-002.md)
