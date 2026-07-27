---
globs: packages/*/src/**/*.stories.ts,packages/*/src/**/*.mdx,packages/docs/**
---

# DOC — Documentation

Documentation rules. Full details in [`.agents/rules/documentation/`](../../.agents/rules/documentation/).

- **DOC-001** — Provide `<name>.html.stories.ts` deriving `args`/`argTypes`/`events`/`template` from `getStorybookHelpers('<tag>')`; don't hand-maintain `argTypes`. ([details](../../.agents/rules/documentation/DOC-001.md))
- **DOC-002** — Scaffold new components with `pnpm plop` ("Core component") to get the full canonical file set and wiring. ([details](../../.agents/rules/documentation/DOC-002.md))
- **DOC-003** — Component `.mdx` pages follow the standard shape: `title` frontmatter → `ComponentMetadata` → intro + `<code-bubble>` examples → `## Best Practices` (Do/Don't) → `## Examples` → generated `## API` (don't hand-write props tables). ([details](../../.agents/rules/documentation/DOC-003.md))
