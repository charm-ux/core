# PROC-002: Pass the local gate before opening a PR

Before opening a pull request, run the same checks CI will and make them pass locally:

```bash
pnpm lint     # eslint . --max-warnings 0
pnpm test     # web-test-runner (run outside the ZD sandbox — Chromium can't launch inside it)
pnpm build    # manifest validate + theming + core + docs
```

`pnpm verify` (`lint && prettier:check`) is the fast formatting/lint gate; `pnpm prettier`
autofixes formatting (also applied by the pre-commit hook and lint-staged).

The PR itself must include:

- A clear description of the changes.
- A reference to the related issue.
- Screenshots for any UI change.
- A changeset when consumers are affected ([PROC-001](./PROC-001.md)).

Branch from `main` with a descriptive prefix (e.g. `feature/…`, `fix/…`). Scaffold new
components with `pnpm generate` rather than hand-copying ([DOC-002](../documentation/DOC-002.md)).

**Do:**

```bash
git checkout -b feature/button-icon-only
pnpm lint && pnpm test && pnpm build   # all green
pnpm changeset                          # consumer-affecting change
```

**Don't:**

- Open a PR that hasn't been linted/tested/built locally ("let CI catch it").
- Publish or bump versions by hand instead of letting the changeset release flow run.

See also: [PROC-001](./PROC-001.md), [TEST-002](../testing/TEST-002.md), [CODE-002](../code/CODE-002.md)
