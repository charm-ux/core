# Docsite — Charm documentation for the Charm component library

This site hosts the Charm documentation (guides, component references, examples, and changelogs) powered by Astro + Starlight.

Quick links:

- Getting started — [Installation](packages/docsite/src/content/docs/getting-started/installation.md)
- Usage patterns — [Usage](packages/docsite/src/content/docs/getting-started/usage.md)
- Extending Charm — [Extending Charm](packages/docsite/src/content/docs/getting-started/extending.md)
- Scoping components — [Scoping](packages/docsite/src/content/docs/getting-started/scoping.md)
- Versioning & changelogs — [Version Management](packages/docsite/src/content/docs/contributing/version-management.mdx) and changelogs: [CHANGELOG.md](packages/docsite/CHANGELOG.md) / [CHANGELOG.json](packages/docsite/CHANGELOG.json)
- Testing guide — [Testing](packages/docsite/src/content/docs/overview/testing.md)

Getting started (local)

1. From repository root:

   ```sh
   pnpm install
   pnpm --filter @charm-ux/docsite dev
   ```

2. Open http://localhost:4321 and verify site.

Build & preview

```sh
pnpm --filter @charm-ux/docsite build
pnpm --filter @charm-ux/docsite preview
```

Content structure

- Docs source: packages/docsite/src/content/docs/
  - Getting started: packages/docsite/src/content/docs/getting-started/
  - Overview: packages/docsite/src/content/docs/overview/
  - Contributing: packages/docsite/src/content/docs/contributing/
- Site config: packages/docsite/astro.config.mjs
- Scripts that help generate doc content: packages/docsite/scripts/copy-support-files.js

Generating reference pages

- Component README files are generated/updated from the core package manifests. The helper script is at: packages/docsite/scripts/copy-support-files.js. Run it from the docsite package root if you need to refresh copied READMEs for component reference pages.

Custom elements manifest helpers

- See the core helper used to create README content from custom-elements.json: packages/core/scripts/cem-to-markdown.js
- Demo variant: packages/demo/scripts/cem-to-markdown.cjs

Versioning & changelogs

- The project uses Beachball for change files and release bumps. See the doc: packages/docsite/src/content/docs/contributing/version-management.mdx
- Changelogs are published under: packages/docsite/CHANGELOG.md and packages/docsite/CHANGELOG.json

How to contribute docs

- Add or update Markdown/MDX under packages/docsite/src/content/docs/.
- If adding a component reference, ensure the component README exists in ../core/src/components (the copy script will generate docsite pages).
- Follow the versioning workflow in packages/docsite/src/content/docs/contributing/version-management.mdx.

Helpful files

- Site config: packages/docsite/astro.config.mjs
- Docsite scripts: packages/docsite/scripts/copy-support-files.js
- Core manifest → markdown helper: packages/core/scripts/cem-to-markdown.js
- Demo manifest helper: packages/demo/scripts/cem-to-markdown.cjs
- Docsite changelogs: packages/docsite/CHANGELOG.md, packages/docsite/CHANGELOG.json
- Root project readme: README.md

If you need to change the sidebar or autogeneration settings, edit: packages/docsite/astro.config.mjs
