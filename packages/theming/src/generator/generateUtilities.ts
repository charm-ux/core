// src/generator/generateUtilities.ts
import { cssVarName, toKebabCase } from '../helpers/cssVar.js';
import { expandColors, PALETTE_STEPS } from './colorPalette.js';
import type { PrimitiveTokens, TokenMap } from '../types/tokens.js';

/**
 * Options for utility class generation.
 */
export type UtilityOptions = {
  /** CSS variable prefix (default: 'charm') */
  prefix?: string;
  /** Utility class prefix (default: '') */
  classPrefix?: string;
  /** Wrap utilities in @layer directive (default: false) */
  useLayers?: boolean;
  /** Generate color utilities (default: true) */
  includeColors?: boolean;
  /** Generate spacing utilities (default: true) */
  includeSpacing?: boolean;
  /** Generate typography utilities (default: true) */
  includeTypography?: boolean;
  /** Generate border utilities (default: true) */
  includeBorders?: boolean;
  /** Generate shadow utilities (default: true) */
  includeShadows?: boolean;
};

const DEFAULT_OPTIONS: Required<UtilityOptions> = {
  prefix: 'charm',
  classPrefix: '',
  useLayers: false,
  includeColors: true,
  includeSpacing: true,
  includeTypography: true,
  includeBorders: true,
  includeShadows: true,
};

/**
 * Escape a class name for CSS (handles special characters).
 */
function escapeClassName(name: string | number): string {
  return String(name).replace(/[.:]/g, '\\$&');
}

/**
 * Generate color utility classes.
 */
function generateColorUtilities(primitives: PrimitiveTokens, prefix: string, classPrefix: string): string[] {
  const lines: string[] = [];

  if (!primitives.color) return lines;

  const expandedColors = expandColors(primitives.color);

  for (const [colorName, colorValue] of Object.entries(expandedColors)) {
    const kebabName = toKebabCase(colorName);

    if (typeof colorValue === 'object' && colorValue !== null && !('light' in colorValue)) {
      // Palette with steps
      for (const step of PALETTE_STEPS) {
        if (step in colorValue) {
          const className = `${classPrefix}${kebabName}-${step}`;
          const varRef = `var(${cssVarName(prefix, 'color', colorName, step)})`;

          // Text color
          lines.push(`.${classPrefix}text-${escapeClassName(kebabName)}-${step} { color: ${varRef}; }`);

          // Background color
          lines.push(`.${classPrefix}bg-${escapeClassName(kebabName)}-${step} { background-color: ${varRef}; }`);

          // Border color
          lines.push(`.${classPrefix}border-${escapeClassName(kebabName)}-${step} { border-color: ${varRef}; }`);
        }
      }
    } else {
      // Single color (no palette)
      const varRef = `var(${cssVarName(prefix, 'color', colorName)})`;

      lines.push(`.${classPrefix}text-${escapeClassName(kebabName)} { color: ${varRef}; }`);
      lines.push(`.${classPrefix}bg-${escapeClassName(kebabName)} { background-color: ${varRef}; }`);
      lines.push(`.${classPrefix}border-${escapeClassName(kebabName)} { border-color: ${varRef}; }`);
    }
  }

  return lines;
}

/**
 * Generate spacing utility classes.
 */
function generateSpacingUtilities(spacing: TokenMap | undefined, prefix: string, classPrefix: string): string[] {
  const lines: string[] = [];

  if (!spacing) return lines;

  for (const [name, value] of Object.entries(spacing)) {
    const escapedName = escapeClassName(name);
    const varRef = `var(${cssVarName(prefix, 'spacing', name)})`;

    // Margin utilities
    lines.push(`.${classPrefix}m-${escapedName} { margin: ${varRef}; }`);
    lines.push(`.${classPrefix}mx-${escapedName} { margin-inline: ${varRef}; }`);
    lines.push(`.${classPrefix}my-${escapedName} { margin-block: ${varRef}; }`);
    lines.push(`.${classPrefix}mt-${escapedName} { margin-block-start: ${varRef}; }`);
    lines.push(`.${classPrefix}mb-${escapedName} { margin-block-end: ${varRef}; }`);
    lines.push(`.${classPrefix}ml-${escapedName} { margin-inline-start: ${varRef}; }`);
    lines.push(`.${classPrefix}mr-${escapedName} { margin-inline-end: ${varRef}; }`);

    // Padding utilities
    lines.push(`.${classPrefix}p-${escapedName} { padding: ${varRef}; }`);
    lines.push(`.${classPrefix}px-${escapedName} { padding-inline: ${varRef}; }`);
    lines.push(`.${classPrefix}py-${escapedName} { padding-block: ${varRef}; }`);
    lines.push(`.${classPrefix}pt-${escapedName} { padding-block-start: ${varRef}; }`);
    lines.push(`.${classPrefix}pb-${escapedName} { padding-block-end: ${varRef}; }`);
    lines.push(`.${classPrefix}pl-${escapedName} { padding-inline-start: ${varRef}; }`);
    lines.push(`.${classPrefix}pr-${escapedName} { padding-inline-end: ${varRef}; }`);

    // Gap utilities
    lines.push(`.${classPrefix}gap-${escapedName} { gap: ${varRef}; }`);
    lines.push(`.${classPrefix}gap-x-${escapedName} { column-gap: ${varRef}; }`);
    lines.push(`.${classPrefix}gap-y-${escapedName} { row-gap: ${varRef}; }`);
  }

  return lines;
}

/**
 * Generate typography utility classes.
 */
function generateTypographyUtilities(primitives: PrimitiveTokens, prefix: string, classPrefix: string): string[] {
  const lines: string[] = [];

  if (!primitives.typography) return lines;

  const { fontFamily, fontSize, fontWeight, lineHeight, letterSpacing } = primitives.typography;

  // Font family
  if (fontFamily) {
    for (const name of Object.keys(fontFamily)) {
      const escapedName = escapeClassName(name);
      const varRef = `var(${cssVarName(prefix, 'font-family', name)})`;
      lines.push(`.${classPrefix}font-${escapedName} { font-family: ${varRef}; }`);
    }
  }

  // Font size
  if (fontSize) {
    for (const name of Object.keys(fontSize)) {
      const escapedName = escapeClassName(name);
      const varRef = `var(${cssVarName(prefix, 'font-size', name)})`;
      lines.push(`.${classPrefix}text-${escapedName} { font-size: ${varRef}; }`);
    }
  }

  // Font weight
  if (fontWeight) {
    for (const name of Object.keys(fontWeight)) {
      const escapedName = escapeClassName(name);
      const varRef = `var(${cssVarName(prefix, 'font-weight', name)})`;
      lines.push(`.${classPrefix}font-${escapedName} { font-weight: ${varRef}; }`);
    }
  }

  // Line height
  if (lineHeight) {
    for (const name of Object.keys(lineHeight)) {
      const escapedName = escapeClassName(name);
      const varRef = `var(${cssVarName(prefix, 'line-height', name)})`;
      lines.push(`.${classPrefix}leading-${escapedName} { line-height: ${varRef}; }`);
    }
  }

  // Letter spacing
  if (letterSpacing) {
    for (const name of Object.keys(letterSpacing)) {
      const escapedName = escapeClassName(name);
      const varRef = `var(${cssVarName(prefix, 'letter-spacing', name)})`;
      lines.push(`.${classPrefix}tracking-${escapedName} { letter-spacing: ${varRef}; }`);
    }
  }

  return lines;
}

/**
 * Generate border utility classes.
 */
function generateBorderUtilities(primitives: PrimitiveTokens, prefix: string, classPrefix: string): string[] {
  const lines: string[] = [];

  // Border radius
  if (primitives.borderRadius) {
    for (const name of Object.keys(primitives.borderRadius)) {
      const escapedName = escapeClassName(name);
      const varRef = `var(${cssVarName(prefix, 'border-radius', name)})`;
      lines.push(`.${classPrefix}rad-${escapedName} { border-radius: ${varRef}; }`);
    }
  }

  // Border width
  if (primitives.borderWidth) {
    for (const name of Object.keys(primitives.borderWidth)) {
      const escapedName = escapeClassName(name);
      const varRef = `var(${cssVarName(prefix, 'border-width', name)})`;
      lines.push(`.${classPrefix}border-${escapedName} { border-width: ${varRef}; }`);
    }
  }

  return lines;
}

/**
 * Generate shadow utility classes.
 */
function generateShadowUtilities(shadow: PrimitiveTokens['shadow'], prefix: string, classPrefix: string): string[] {
  const lines: string[] = [];

  if (!shadow) return lines;

  for (const name of Object.keys(shadow)) {
    const escapedName = escapeClassName(name);
    const varRef = `var(${cssVarName(prefix, 'shadow', name)})`;
    lines.push(`.${classPrefix}shadow-${escapedName} { box-shadow: ${varRef}; }`);
  }

  return lines;
}

/**
 * Generate utility CSS classes from primitive tokens.
 *
 * Creates Tailwind-like utility classes that reference design token CSS variables.
 *
 * @param primitives - Primitive token definitions
 * @param options - Generation options
 * @returns CSS string with utility class definitions
 *
 * @example
 * ```ts
 * const utilities = generateUtilities(myPrimitives, { prefix: 'charm' });
 * // .text-primary-500 { color: var(--charm-color-primary-500); }
 * // .bg-primary-500 { background-color: var(--charm-color-primary-500); }
 * // ...
 * ```
 */
export function generateUtilities(primitives: PrimitiveTokens, options: UtilityOptions = {}): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const lines: string[] = ['/* Generated by @charm-ux/theming - DO NOT EDIT */', ''];

  if (opts.includeColors) {
    lines.push('/* Color utilities */');
    lines.push(...generateColorUtilities(primitives, opts.prefix, opts.classPrefix));
    lines.push('');
  }

  if (opts.includeSpacing) {
    lines.push('/* Spacing utilities */');
    lines.push(...generateSpacingUtilities(primitives.spacing, opts.prefix, opts.classPrefix));
    lines.push('');
  }

  if (opts.includeTypography) {
    lines.push('/* Typography utilities */');
    lines.push(...generateTypographyUtilities(primitives, opts.prefix, opts.classPrefix));
    lines.push('');
  }

  if (opts.includeBorders) {
    lines.push('/* Border utilities */');
    lines.push(...generateBorderUtilities(primitives, opts.prefix, opts.classPrefix));
    lines.push('');
  }

  if (opts.includeShadows) {
    lines.push('/* Shadow utilities */');
    lines.push(...generateShadowUtilities(primitives.shadow, opts.prefix, opts.classPrefix));
    lines.push('');
  }

  let result = lines.join('\n').trim();

  if (opts.useLayers) {
    result = `@layer utilities {\n${result}\n}`;
  }

  return result;
}
