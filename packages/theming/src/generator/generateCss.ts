// src/generator/generateCss.ts
import { cssVarName, toKebabCase } from '../helpers/cssVar.js';
import {
  getColorForMode,
  getColorScheme,
  getContrastColor,
  isLightDarkValue,
  walkExpandedColors,
} from './colorPalette.js';
import { formatShadowValue } from './formatShadow.js';
import type { GeneratorConfig } from '../types/config.js';
import type {
  CubicBezierValue,
  LightDarkValue,
  PrimitiveTokens,
  ResolvedTokenDefinition,
  SemanticTokens,
  ShadowTokenValue,
  TokenDefinition,
  TokenMap,
} from '../types/tokens.js';

type CssConfig = Pick<
  GeneratorConfig,
  'prefix' | 'useLightDarkFunction' | 'useDataAttributes' | 'useLayers' | 'selector'
>;

/**
 * Format a token value to a CSS-compatible string.
 */
function formatValue(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return String(value);
}

/**
 * Format a cubic bezier timing function to CSS.
 */
function formatTimingFunction(value: CubicBezierValue): string {
  return `cubic-bezier(${value.join(', ')})`;
}

/**
 * Check if a value is a cubic bezier array.
 */
function isCubicBezier(value: unknown): value is CubicBezierValue {
  return Array.isArray(value) && value.length === 4 && value.every(v => typeof v === 'number');
}

/**
 * Emit one `--{prefix}-{category}-{name}: {value};` line per entry in a flat
 * token map, unwrapping a `TokenWithMetadata` wrapper first if present.
 * Shared by every flat primitive scale (spacing, border-radius, border-width,
 * duration, z-index, and each typography sub-category) - they all have the
 * same shape and only differ in which category name they emit under.
 */
function pushFlatTokenVariables(
  lines: string[],
  tokenMap: TokenMap | undefined,
  category: string,
  prefix: string
): void {
  if (!tokenMap) return;
  for (const [name, value] of Object.entries(tokenMap)) {
    const resolved =
      typeof value === 'object' && value !== null && 'value' in value ? (value as { value: unknown }).value : value;
    lines.push(`  ${cssVarName(prefix, category, name)}: ${formatValue(resolved)};`);
  }
}

/**
 * Generate CSS custom properties for primitive tokens.
 */
function generatePrimitiveVariables(primitives: PrimitiveTokens, prefix: string): string[] {
  const lines: string[] = [];

  // Colors
  if (primitives.color) {
    walkExpandedColors(primitives.color, ({ name, step, value }) => {
      const color = isLightDarkValue(value) ? value.light : value;
      const varName = cssVarName(prefix, 'color', name, ...(step !== undefined ? [step] : []));
      lines.push(`  ${varName}: ${color};`);
    });
  }

  // Spacing
  pushFlatTokenVariables(lines, primitives.spacing, 'spacing', prefix);

  // Border radius
  pushFlatTokenVariables(lines, primitives.borderRadius, 'border-radius', prefix);

  // Border width
  pushFlatTokenVariables(lines, primitives.borderWidth, 'border-width', prefix);

  // Shadows
  if (primitives.shadow) {
    for (const [name, rawValue] of Object.entries(primitives.shadow)) {
      const value =
        typeof rawValue === 'object' && rawValue !== null && 'value' in rawValue
          ? (rawValue as { value: ShadowTokenValue }).value
          : rawValue;
      lines.push(`  ${cssVarName(prefix, 'shadow', name)}: ${formatShadowValue(value)};`);
    }
  }

  // Duration
  pushFlatTokenVariables(lines, primitives.duration, 'duration', prefix);

  // Timing functions
  if (primitives.timingFunction) {
    for (const [name, rawValue] of Object.entries(primitives.timingFunction)) {
      const value =
        typeof rawValue === 'object' && rawValue !== null && 'value' in rawValue
          ? (rawValue as { value: CubicBezierValue }).value
          : rawValue;
      if (isCubicBezier(value)) {
        lines.push(`  ${cssVarName(prefix, 'timing-function', name)}: ${formatTimingFunction(value)};`);
      }
    }
  }

  // Z-index
  pushFlatTokenVariables(lines, primitives.zIndex, 'z-index', prefix);

  // Typography
  if (primitives.typography) {
    const typoCategories: [string, TokenMap | undefined][] = [
      ['font-family', primitives.typography.fontFamily],
      ['font-size', primitives.typography.fontSize],
      ['font-weight', primitives.typography.fontWeight],
      ['line-height', primitives.typography.lineHeight],
      ['letter-spacing', primitives.typography.letterSpacing],
    ];

    for (const [category, tokenMap] of typoCategories) {
      pushFlatTokenVariables(lines, tokenMap, category, prefix);
    }
  }

  return lines;
}

/**
 * Colors with no meaningful visible value - contrast/scheme calculation
 * against these is meaningless, so they're skipped.
 */
const AUTO_COLOR_VAR_SKIP_LIST = new Set(['transparent']);

/**
 * Generate CSS custom properties for auto-computed accessible text colors.
 *
 * Produces `--{prefix}-color-on-{name}[-{step}]` variables that resolve to
 * black or white (whichever has better contrast) based on the paired
 * color's luminance, for use as text/icon color on top of that background.
 */
function generateColorOnVars(
  primitives: PrimitiveTokens,
  prefix: string,
  useLightDarkFunction: boolean
): { base: string[]; light: string[]; dark: string[] } {
  const base: string[] = [];
  const light: string[] = [];
  const dark: string[] = [];

  if (!primitives.color) {
    return { base, light, dark };
  }

  function pushOn(name: string, value: string | LightDarkValue): void {
    if (typeof value === 'string') {
      base.push(`  ${name}: ${value};`);
    } else if (useLightDarkFunction) {
      base.push(`  ${name}: light-dark(${value.light}, ${value.dark});`);
    } else {
      light.push(`  ${name}: ${value.light};`);
      dark.push(`  ${name}: ${value.dark};`);
    }
  }

  walkExpandedColors(primitives.color, ({ name, step, value }) => {
    if (AUTO_COLOR_VAR_SKIP_LIST.has(name)) return;

    const varName = cssVarName(prefix, 'color', 'on', name, ...(step !== undefined ? [step] : []));
    if (isLightDarkValue(value)) {
      pushOn(varName, {
        light: getContrastColor(getColorForMode(value, 'light')),
        dark: getContrastColor(getColorForMode(value, 'dark')),
      });
    } else {
      pushOn(varName, getContrastColor(value));
    }
  });

  return { base, light, dark };
}

/**
 * Generate CSS custom properties for auto-computed color schemes.
 *
 * Produces `--{prefix}-color-scheme-{name}[-{step}]` variables set to the
 * literal keyword `light` or `dark` based on the paired color's luminance,
 * for use with the CSS `color-scheme` property (e.g. to hint native form
 * control rendering on a colored surface).
 *
 * Unlike other mode-dependent variables, these hold keyword values rather
 * than `<color>`s, so they can't be wrapped in the `light-dark()` CSS
 * function (which only resolves `<color>` values) - they're always split
 * into light/dark blocks regardless of `useLightDarkFunction`.
 */
function generateColorSchemeVars(primitives: PrimitiveTokens, prefix: string): { light: string[]; dark: string[] } {
  const light: string[] = [];
  const dark: string[] = [];

  if (!primitives.color) {
    return { light, dark };
  }

  function pushScheme(name: string, value: string | LightDarkValue): void {
    if (typeof value === 'string') {
      light.push(`  ${name}: ${value};`);
      dark.push(`  ${name}: ${value};`);
    } else {
      light.push(`  ${name}: ${value.light};`);
      dark.push(`  ${name}: ${value.dark};`);
    }
  }

  walkExpandedColors(primitives.color, ({ name, step, value }) => {
    if (AUTO_COLOR_VAR_SKIP_LIST.has(name)) return;

    const varName = cssVarName(prefix, 'color', 'scheme', name, ...(step !== undefined ? [step] : []));
    if (isLightDarkValue(value)) {
      pushScheme(varName, {
        light: getColorScheme(getColorForMode(value, 'light')),
        dark: getColorScheme(getColorForMode(value, 'dark')),
      });
    } else {
      pushScheme(varName, getColorScheme(value));
    }
  });

  return { light, dark };
}

/**
 * Generate CSS custom properties for semantic/component tokens.
 */
function generateSemanticVariables(
  semantics: SemanticTokens,
  prefix: string,
  config: CssConfig
): { base: string[]; light: string[]; dark: string[] } {
  const base: string[] = [];
  const light: string[] = [];
  const dark: string[] = [];

  function processValue(path: string[], value: unknown): void {
    const varName = cssVarName(prefix, ...path);

    if (isLightDarkValue(value)) {
      const ldValue = value as LightDarkValue;
      if (config.useLightDarkFunction) {
        base.push(`  ${varName}: light-dark(${ldValue.light}, ${ldValue.dark});`);
      } else {
        light.push(`  ${varName}: ${ldValue.light};`);
        dark.push(`  ${varName}: ${ldValue.dark};`);
      }
    } else if (typeof value === 'object' && value !== null) {
      // Check if it's a metadata wrapper
      if ('value' in value && !('light' in value) && !('dark' in value)) {
        processValue(path, (value as { value: unknown }).value);
      } else {
        // Nested object
        for (const [key, nested] of Object.entries(value)) {
          processValue([...path, toKebabCase(key)], nested);
        }
      }
    } else if (value !== undefined) {
      base.push(`  ${varName}: ${formatValue(value)};`);
    }
  }

  for (const [component, tokens] of Object.entries(semantics)) {
    processValue([toKebabCase(component)], tokens);
  }

  return { base, light, dark };
}

/**
 * Options for CSS generation.
 */
export type CssGenerationOptions = Partial<CssConfig>;

/**
 * Generate CSS custom properties from a token definition.
 *
 * @param definition - The token definition to generate CSS from
 * @param config - Generation configuration options
 * @returns CSS string with custom property declarations
 *
 * @example
 * ```ts
 * const css = generateCss(myDefinition, { prefix: 'charm' });
 * // :root {
 * //   color-scheme: light dark;
 * //   --charm-color-primary-500: #3b82f6;
 * //   ...
 * // }
 * ```
 */
export function generateCss(
  definition: TokenDefinition | ResolvedTokenDefinition,
  config: Partial<CssConfig> = {}
): string {
  const prefix = config.prefix ?? definition.prefix ?? 'charm';
  const useLightDarkFunction = config.useLightDarkFunction ?? true;
  const selector = config.selector ?? ':root';

  const lines: string[] = ['/* Generated by @charm-ux/theming - DO NOT EDIT */', ''];

  // Generate primitive variables
  const primitiveVars = generatePrimitiveVariables(definition.primitives, prefix);

  // Generate semantic variables
  let semanticVars = { base: [] as string[], light: [] as string[], dark: [] as string[] };
  if (definition.semantics) {
    // Check if semantics is a factory function or already resolved
    const resolved =
      typeof definition.semantics === 'function'
        ? (() => {
            const ref = (...segments: (string | number)[]) =>
              `var(${cssVarName(prefix, ...segments.map(s => (typeof s === 'string' ? toKebabCase(s) : s)))})`;
            return definition.semantics({ ref } as unknown as Parameters<typeof definition.semantics>[0]);
          })()
        : definition.semantics;
    semanticVars = generateSemanticVariables(resolved, prefix, {
      ...config,
      prefix,
      useLightDarkFunction,
    });
  }

  // Generate component variables
  let componentVars = { base: [] as string[], light: [] as string[], dark: [] as string[] };
  if (definition.components) {
    // Check if components is a factory function or already resolved
    const resolved =
      typeof definition.components === 'function'
        ? (() => {
            const ref = (...segments: (string | number)[]) =>
              `var(${cssVarName(prefix, ...segments.map(s => (typeof s === 'string' ? toKebabCase(s) : s)))})`;
            return definition.components({ ref } as unknown as Parameters<typeof definition.components>[0]);
          })()
        : definition.components;
    componentVars = generateSemanticVariables(resolved, prefix, {
      ...config,
      prefix,
      useLightDarkFunction,
    });
  }

  // Auto-generate --{prefix}-color-on-* (accessible text color) and
  // --{prefix}-color-scheme-* (light/dark keyword) variables from primitives.
  const colorOnVars = generateColorOnVars(definition.primitives, prefix, useLightDarkFunction);
  const colorSchemeVars = generateColorSchemeVars(definition.primitives, prefix);

  // Build CSS output
  if (useLightDarkFunction) {
    lines.push(`${selector} {`);
    lines.push('  color-scheme: light dark;');
    lines.push(...primitiveVars);
    lines.push(...semanticVars.base);
    lines.push(...componentVars.base);
    lines.push(...colorOnVars.base);
    lines.push(...colorSchemeVars.light);
    lines.push('}');

    // color-scheme vars hold keyword values, not colors, so they can't use
    // light-dark() - they always need an explicit dark-mode override block.
    if (colorSchemeVars.dark.length > 0) {
      lines.push('');
      if (config.useDataAttributes) {
        lines.push('[data-theme="dark"] {');
        lines.push(...colorSchemeVars.dark);
        lines.push('}');
      } else {
        lines.push('@media (prefers-color-scheme: dark) {');
        lines.push(`  ${selector} {`);
        lines.push(...colorSchemeVars.dark.map(l => '  ' + l));
        lines.push('  }');
        lines.push('}');
      }
    }
  } else {
    // Without light-dark(), we need separate selectors for light/dark modes
    lines.push(`${selector} {`);
    lines.push(...primitiveVars);
    lines.push(...semanticVars.base);
    lines.push(...componentVars.base);
    lines.push(...colorOnVars.base);
    lines.push(...semanticVars.light);
    lines.push(...componentVars.light);
    lines.push(...colorOnVars.light);
    lines.push(...colorSchemeVars.light);
    lines.push('}');

    if (
      semanticVars.dark.length > 0 ||
      componentVars.dark.length > 0 ||
      colorOnVars.dark.length > 0 ||
      colorSchemeVars.dark.length > 0
    ) {
      lines.push('');
      if (config.useDataAttributes) {
        lines.push('[data-theme="dark"] {');
        lines.push(...semanticVars.dark);
        lines.push(...componentVars.dark);
        lines.push(...colorOnVars.dark);
        lines.push(...colorSchemeVars.dark);
        lines.push('}');
      } else {
        lines.push('@media (prefers-color-scheme: dark) {');
        lines.push(`  ${selector} {`);
        lines.push(...semanticVars.dark.map(l => '  ' + l));
        lines.push(...componentVars.dark.map(l => '  ' + l));
        lines.push(...colorOnVars.dark.map(l => '  ' + l));
        lines.push(...colorSchemeVars.dark.map(l => '  ' + l));
        lines.push('  }');
        lines.push('}');
      }
    }
  }

  return lines.join('\n');
}

/**
 * Generate CSS custom properties as an object (for programmatic use).
 *
 * @param definition - The token definition
 * @param config - Generation configuration
 * @returns Object with variable names as keys and values
 */
export function generateCssVariables(
  definition: TokenDefinition,
  config: Partial<CssConfig> = {}
): Record<string, string> {
  const prefix = config.prefix ?? definition.prefix ?? 'charm';
  const variables: Record<string, string> = {};

  // Extract from primitives
  if (definition.primitives.color) {
    walkExpandedColors(definition.primitives.color, ({ name, step, value }) => {
      const varName = cssVarName(prefix, 'color', name, ...(step !== undefined ? [step] : []));
      variables[varName] = isLightDarkValue(value) ? value.light : value;
    });
  }

  return variables;
}

/**
 * Generate a CSS block string from variables object.
 *
 * @param variables - Object with CSS variable names and values
 * @param selector - CSS selector to wrap variables in
 * @returns CSS block string
 */
export function generateCssBlock(variables: Record<string, string>, selector: string = ':root'): string {
  const lines = Object.entries(variables).map(([name, value]) => `  ${name}: ${value};`);
  return `${selector} {\n${lines.join('\n')}\n}`;
}
