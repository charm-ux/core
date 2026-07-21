// Core API
export { defineTokens, type DefineTokensInput, type DefinedTokens } from './defineTokens.js';

// Types
export * from './types/index.js';

// Helpers
export { createHelpers, type TokenHelpers, type CreateHelpersOptions } from './helpers/index.js';

// Generator
// Note: `PaletteStep` and `ColorPalette` are exported explicitly (rather than
// via `export *`) because the generator's palette-step types share names
// with - but are distinct from - the canonical token types of the same name
// exported above from './types/index.js'.
export {
  // Palette generation
  generatePalette,
  expandColorPalette,
  expandColors,
  getContrastColor,
  getColorScheme,
  isAutoExpandColor,
  isLightDarkValue,
  hasLightDarkValue,
  getColorForMode,
  PALETTE_STEPS,
  // CSS generation
  generateCss,
  generateCssVariables,
  generateCssBlock,
  // Reset generation
  generateReset,
  generateMinimalReset,
  // Utilities generation
  generateUtilities,
  // Theme orchestrator
  generateTheme,
  generateThemeSync,
  // DTCG (W3C Design Tokens) JSON generation
  generateTokensJson,
  generateTokensJsonForMode,
} from './generator/index.js';
export type {
  PaletteStep as GeneratedPaletteStep,
  ColorPalette as GeneratedColorPalette,
  PaletteOptions,
  CssGenerationOptions,
  ResetOptions,
  UtilityOptions,
  GenerateThemeOptions,
  GenerateThemeResult,
} from './generator/index.js';

// Pre-built themes
export {
  charmTokens,
  charmDefinition,
  charmHelpers,
  charmTheme,
  demoTokens,
  demoDefinition,
  demoHelpers,
  demoTheme,
} from './themes/index.js';

// Lit CSS helpers (requires lit peer dependency)
export { createCssHelpers, type CssHelpers } from './lit/index.js';

// Custom Elements Manifest (CEM) plugin helpers
export { cssPrefixPlugin, applyThemePrefix, rewriteCssVarName } from './cem-plugin/index.js';
