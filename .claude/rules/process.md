# PROC — Process (always applied)

Changeset, PR, and release process. Full details in [`.agents/rules/process/`](../../.agents/rules/process/).

- **PROC-001** — Add a changeset (`pnpm changeset`) for consumer-affecting changes; CI fails without one. One-line, present-tense message prefixed `[Component]`, leading with Added/Changed/Deprecated/Removed/Fixed/Bumped. Releases are automated — never publish by hand. ([details](../../.agents/rules/process/PROC-001.md))
- **PROC-002** — Run `pnpm lint && pnpm test && pnpm build` locally before a PR (tests run outside the ZD sandbox); PR needs description, linked issue, and screenshots for UI changes; branch from `main` with a descriptive prefix. ([details](../../.agents/rules/process/PROC-002.md))
