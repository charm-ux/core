// src/themes/generated.ts
//
// Generator-coupled theme artifacts (`charmTheme`, `demoTheme`, and the
// pre-generated token getters). This module intentionally imports the theme
// generator (which pulls in `node:fs`/`node:path`), so it must NOT be reached
// from the browser-safe runtime entry (`./runtime.ts`). Import it via the
// `@charm-ux/theming/generator` subpath for build-time tooling.
import { type GenerateThemeResult, generateThemeSync } from '../generator/generateTheme.js';
import { charmTokens } from './charm.js';
import { demoTokens } from './demo.js';

/** Pre-generated CSS theme for the charm tokens (lazily computed) */
let _charmTheme: GenerateThemeResult | undefined;

function getCharmTheme(): GenerateThemeResult {
  if (!_charmTheme) {
    _charmTheme = generateThemeSync(charmTokens.definition, { prefix: 'charm' });
  }
  return _charmTheme;
}

/**
 * Lazy-evaluated proxy for the generated charm theme.
 * Generation only runs on first property access.
 */
export const charmTheme: GenerateThemeResult = new Proxy({} as GenerateThemeResult, {
  get(_target, prop: keyof GenerateThemeResult) {
    return getCharmTheme()[prop];
  },
});

/** Pre-generated CSS theme for the demo tokens (lazily computed) */
let _demoTheme: GenerateThemeResult | undefined;

function getDemoTheme(): GenerateThemeResult {
  if (!_demoTheme) {
    _demoTheme = generateThemeSync(demoTokens.definition, { prefix: 'charm' });
  }
  return _demoTheme;
}

/**
 * Lazy-evaluated proxy for the generated demo theme.
 * Generation only runs on first property access.
 */
export const demoTheme: GenerateThemeResult = new Proxy({} as GenerateThemeResult, {
  get(_target, prop: keyof GenerateThemeResult) {
    return getDemoTheme()[prop];
  },
});

/**
 * The charm theme tokens augmented with the pre-generated theme getters
 * (`theme`, `css`, `cssReset`, ...). Build-time only - see the module doc.
 */
export const charmTokensWithTheme = Object.defineProperties(charmTokens, {
  theme: { get: getCharmTheme, enumerable: true },
  css: { get: () => getCharmTheme().css, enumerable: true },
  cssReset: { get: () => getCharmTheme().cssReset, enumerable: true },
  cssUtilities: { get: () => getCharmTheme().cssUtilities, enumerable: true },
  hasLightDarkTokens: { get: () => getCharmTheme().hasLightDarkTokens, enumerable: true },
  tokensJson: { get: () => getCharmTheme().tokensJson, enumerable: true },
  tokensLightJson: { get: () => getCharmTheme().tokensLightJson, enumerable: true },
  tokensDarkJson: { get: () => getCharmTheme().tokensDarkJson, enumerable: true },
  tokensMarkdown: { get: () => getCharmTheme().tokensMarkdown, enumerable: true },
});
