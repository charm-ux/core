# CODE — Code & TypeScript conventions (always applied)

Enforced lint/TS conventions (hard CI failures — lint runs `--max-warnings 0`). Full details in [`.agents/rules/code/`](../../.agents/rules/code/).

- **CODE-001** — End every relative import/export with `.js` (even from `.ts` source); `require-extensions` enforces it. ([details](../../.agents/rules/code/CODE-001.md))
- **CODE-002** — Explicit `public`/`private`/`protected` on every class member, `override` keyword on overrides, enforced member ordering. ([details](../../.agents/rules/code/CODE-002.md))
- **CODE-003** — Ordered import groups (…→type last), blank line after imports, alphabetized named members; use `pnpm lint:fix`. ([details](../../.agents/rules/code/CODE-003.md))
- **CODE-004** — No enums/namespaces/param-properties (`erasableSyntaxOnly`); mark type-only imports `type` (`isolatedModules`); never change the Lit decorator tsconfig. ([details](../../.agents/rules/code/CODE-004.md))
- **CODE-005** — Respect module boundaries: never hand-edit generated `kitchen-sink.ts` (regenerate); export public API through the curated `index.ts` barrel; `@charm-ux/core` is single-entry (no deep-import contract), `@charm-ux/theming` uses explicit subpath `exports`. ([details](../../.agents/rules/code/CODE-005.md))
