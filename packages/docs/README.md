# docs — Charm documentation site

This package hosts the Charm documentation (guides, component references, examples, and changelogs) powered by **Astro + [Starlight](https://starlight.astro.build/)**. Live component examples are rendered with `code-bubble`, and API tables are generated from the core package's custom-elements manifest via `wc-dox`.

The package name is `docs` (unscoped); the libraries it documents are `@charm-ux/core` and `@charm-ux/theming`.

## Quick links

- Getting started — [Installation](./src/content/docs/getting-started/installation.md)
- Usage patterns — [Usage](./src/content/docs/getting-started/usage.md)
- Extending Charm — [Extending](./src/content/docs/getting-started/extending.md)
- Scoping components — [Scoping](./src/content/docs/getting-started/scoping.md)
- Testing guide — [Testing](./src/content/docs/overview/testing.md)
- Versioning & changelogs — [Version Management](./src/content/docs/contributing/version-management.mdx)

## Local development

From the repository root:

```sh
pnpm install
pnpm --filter docs dev
```

Then open http://localhost:4321 (Astro's default dev port).

The `dev` script first runs `charm-setup` (see below), so `@charm-ux/core` and `@charm-ux/theming` must already be built — their `dist/` output is copied into the site. If you hit a "Source file not found" error, build the libraries first:

```sh
pnpm --filter @charm-ux/core build
pnpm --filter @charm-ux/theming build
```

## Build & preview

```sh
pnpm --filter docs build
pnpm --filter docs preview
```

`build:docs` at the repo root runs the same `build` script for this package.

## How the build wires up

The `charm-setup` script (run by both `dev` and `build`) does two things:

1. **`build:charm`** — bundles the Charm modules (`vite build`) and generates types (`tsup` over `../core/src/kitchen-sink.ts`).
2. **`copy-files`** — runs `node ./scripts/copy-support-files.js`, which:
   - copies `../core/custom-elements.json` into this package,
   - copies the built theme CSS (`reset.css`, `theme.css`, `dark-theme.css`) from `../core/dist/themes/charm` into `public/charm/`, and
   - generates `src/content/docs/changelog/core.md` and `theming.md` from each library's `CHANGELOG.md`.

`scripts/copy-custom-elements.js` is a standalone helper that copies just the core manifest (`../core/custom-elements.json`) — useful when you only need to refresh the API data.

## Content structure

- Docs source: `src/content/docs/`
  - `getting-started/` — installation, usage, extending, scoping
  - `overview/` — testing and other cross-cutting guides
  - `contributing/` — version management workflow
  - `components/` — component reference pages
  - `changelog/` — generated from library `CHANGELOG.md` files (do not edit by hand)
  - `index.mdx`, `config.ts`
- Site config: `astro.config.mjs`
- Manifest data: `custom-elements.json` (copied from core; do not edit)

## Versioning & changelogs

The monorepo uses **[Changesets](https://github.com/changesets/changesets)** for change files and release bumps — not Beachball. See [Version Management](./src/content/docs/contributing/version-management.mdx) for the full workflow.

Changelog pages under `src/content/docs/changelog/` are **generated** at build time from `@charm-ux/core` and `@charm-ux/theming`'s `CHANGELOG.md`; there is no changelog checked in at this package's root.

## Contributing to the docs

- Add or update Markdown/MDX under `src/content/docs/`.
- To document a component, add or update its reference page under `src/content/docs/components/`; API tables are generated from the core manifest, so keep the component's JSDoc/CEM tags accurate rather than hand-writing prop tables.
- Follow the release workflow in [Version Management](./src/content/docs/contributing/version-management.mdx).
- To change the sidebar or content-collection settings, edit `astro.config.mjs`.

## Helpful files

- Site config: `astro.config.mjs`
- Support-file generator: `scripts/copy-support-files.js`
- Manifest copier: `scripts/copy-custom-elements.js`
- Version management guide: `src/content/docs/contributing/version-management.mdx`
- Root project readme: `../../README.md`
