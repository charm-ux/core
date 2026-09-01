---
'@charm-ux/theming': major
---

Split the package into a browser-safe runtime entry and a Node.js-backed generator entry to reduce bundle size.

- The root `@charm-ux/theming` entry now only exports browser-safe runtime utilities (`cssVarName`, `toKebabCase`, `defineTokens`, theme definitions/helpers, `createCssHelpers`, CEM helpers, ...). It no longer re-exports any generator functions, so importing only runtime utilities no longer pulls in `node:fs`/`node:path` (~170KB).
- Generator functions (`generateTheme`, `generateThemeSync`, `generateCss`, `generatePalette`, `generateReset`, `generateUtilities`, `generateTokensJson`, ...) now live behind the `@charm-ux/theming/generator` subpath. Update build scripts and SSR imports to use it.
- The pre-generated `charmTheme`/`demoTheme` artifacts (and the `generateThemeSync`-backed getters previously on `charmTokens`, e.g. `charmTokens.theme`/`.css`) moved to the generator subpath. Use `generateThemeSync(charmTokens.definition, ...)` or import `charmTheme`/`demoTheme` from `@charm-ux/theming/generator`.
- Added `"sideEffects": false` so bundlers can tree-shake unused runtime exports.
