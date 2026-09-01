// src/runtime.ts
//
// Browser-safe runtime entry point. This module must NOT import the theme
// generator (which pulls in `node:fs`/`node:path`). Everything reachable from
// here is safe to bundle for browsers (~2KB rather than ~170KB).
//
// Generator functions (`generateTheme`, `generateThemeSync`, `generateCss`,
// `generatePalette`, ...) live in `./generator/index.js` and are imported via
// the `@charm-ux/theming/generator` subpath instead.

// Core API
export { defineTokens, type DefineTokensInput, type DefinedTokens } from './defineTokens.js';

// Types
export * from './types/index.js';

// Helpers
export {
  createHelpers,
  type TokenHelpers,
  type CreateHelpersOptions,
  cssVarName,
  toKebabCase,
  cssVarWithOptions,
} from './helpers/index.js';

// Pre-built themes (runtime-safe token definitions/helpers - the generated
// `charmTheme`/`demoTheme` artifacts live in the generator subpath)
export { charmTokens, charmDefinition, charmHelpers, demoTokens, demoDefinition, demoHelpers } from './themes/index.js';

// Lit CSS helpers (requires lit peer dependency)
export { createCssHelpers, type CssHelpers } from './lit/index.js';

// Custom Elements Manifest (CEM) plugin helpers
export { cssPrefixPlugin, applyThemePrefix, rewriteCssVarName } from './cem-plugin/index.js';
