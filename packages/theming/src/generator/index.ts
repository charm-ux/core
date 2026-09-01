// src/generator/index.ts

// Color palette generation
export {
  expandColorPalette,
  generatePalette,
  expandColors,
  getContrastColor,
  getColorScheme,
  isAutoExpandColor,
  isLightDarkValue,
  hasLightDarkValue,
  getColorForMode,
  PALETTE_STEPS,
  type PaletteOptions,
  type PaletteStep,
  type ColorPalette,
} from './colorPalette.js';

// CSS generation
export { generateCss, generateCssVariables, generateCssBlock, type CssGenerationOptions } from './generateCss.js';

// CSS reset generation
export { generateReset, generateMinimalReset, type ResetOptions } from './generateReset.js';

// Utility class generation
export { generateUtilities, type UtilityOptions } from './generateUtilities.js';

// DTCG (W3C Design Tokens) JSON generation
export { generateTokensJson, generateTokensJsonForMode } from './generateTokensJson.js';

// Theme orchestrator
export {
  generateTheme,
  generateThemeSync,
  type GenerateThemeResult,
  type GenerateThemeOptions,
} from './generateTheme.js';

// Pre-generated theme artifacts (build-time only)
export { charmTheme, demoTheme } from '../themes/generated.js';
