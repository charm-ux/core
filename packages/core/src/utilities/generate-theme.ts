import { type GenerateThemeResult, generateThemeSync, type ResolvedTokenDefinition } from '@charm-ux/theming';

/**
 * Generate theme CSS strings (theme CSS, reset CSS, utility classes, and token JSON)
 * from a resolved token definition and prefix.
 *
 * Import from the dedicated path to keep the main bundle lean:
 *
 * ```ts
 * import { generateTheme } from '@charm-ux/core/dist/utilities/generate-theme.js';
 * ```
 *
 * @param definition - The resolved token definition
 * @param prefix - CSS variable prefix
 * @returns An object with `css`, `cssReset`, `cssUtilities`, `tokensJson`, and other generated artifacts
 */
export function generateTheme(definition: ResolvedTokenDefinition, prefix: string): GenerateThemeResult {
  return generateThemeSync(definition, { prefix });
}
