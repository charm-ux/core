---
'@charm-ux/theming': minor
---

Add Custom Elements Manifest (CEM) helper tooling to normalize documented CSS custom property names to the theme prefix. Includes:

- `cssPrefixPlugin()` — analyzer plugin for `cem analyze`.
- `applyThemePrefix()` — in-place transform for parsed manifests.
- `rewriteCssVarName()` — pure per-name transform.

Also converted related tests to TypeScript/Vitest and added documentation in the theming README.
