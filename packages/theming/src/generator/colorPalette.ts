// src/generator/colorPalette.ts
import { clampChroma, displayable, formatHex, oklch, parse, wcagContrast } from 'culori';
import { isLightDarkValue } from './lightDark.js';
import { unwrapTokenValue } from './internal/tokenUtils.js';
import type { Oklch } from 'culori';
import type { ColorDefinitions, LightDarkValue } from '../types/tokens.js';

export { isLightDarkValue } from './lightDark.js';

/**
 * Options for palette generation.
 */
export type PaletteOptions = {
  /** How much chroma to preserve when lightening (0-1, default: 0.5) */
  chromaPreservation?: number;
  /** Hue shift for darker shades in degrees (default: 0) */
  hueShift?: number;
  /** Use pure white/black for endpoints (default: false) */
  pureEndpoints?: boolean;
};

const DEFAULT_OPTIONS: Required<PaletteOptions> = {
  chromaPreservation: 0.5,
  hueShift: 0,
  pureEndpoints: false,
};

/**
 * Standard palette steps from lightest (50) to darkest (950).
 * Step 500 is the base color.
 */
export const PALETTE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

/**
 * Type representing a valid palette step.
 */
export type PaletteStep = (typeof PALETTE_STEPS)[number];

/**
 * A generated color palette with all 11 steps.
 */
export type ColorPalette = Record<PaletteStep, string>;

/**
 * Check if a value is a single color string that should be auto-expanded.
 */
export function isAutoExpandColor(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  return parse(value) !== undefined;
}

/**
 * Check if a value has light or dark properties (partial light/dark).
 */
export function hasLightDarkValue(value: unknown): value is { light?: string; dark?: string } {
  return typeof value === 'object' && value !== null && ('light' in value || 'dark' in value);
}

/**
 * Get the color for a specific mode from a light/dark pair.
 */
export function getColorForMode(value: { light?: string; dark?: string }, mode: 'light' | 'dark'): string {
  const resolved = mode === 'light' ? (value.light ?? value.dark) : (value.dark ?? value.light);
  if (!resolved) {
    throw new Error(`No color value defined for mode "${mode}".`);
  }
  return resolved;
}

/**
 * Create an OKLCH color and clamp to sRGB gamut if needed.
 */
function createOklchInGamut(l: number, c: number, h: number): string {
  const safeH = isNaN(h) ? 0 : h;
  const color: Oklch = { mode: 'oklch', l, c, h: safeH };

  if (displayable(color)) {
    return formatHex(color);
  }

  const clamped = clampChroma(color, 'oklch');
  return formatHex(clamped);
}

/**
 * Expand a single base color into an 11-step palette using OKLCH color space.
 *
 * The base color becomes step 500. Lighter steps (50-400) increase lightness
 * while reducing chroma. Darker steps (600-950) decrease lightness.
 *
 * @param baseColor - The base color (hex, rgb, hsl, etc.)
 * @param options - Palette generation options
 * @returns A record with all 11 palette steps
 *
 * @example
 * ```ts
 * const bluePalette = expandColorPalette('#3b82f6');
 * // { 50: '#eff6ff', 100: '#dbeafe', ..., 500: '#3b82f6', ..., 950: '#0f172a' }
 * ```
 */
export function expandColorPalette(baseColor: string, options: PaletteOptions = {}): ColorPalette {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const parsed = parse(baseColor);

  if (!parsed) {
    throw new Error(`Invalid color: ${baseColor}`);
  }

  const base = oklch(parsed);
  if (!base) {
    throw new Error(`Cannot convert to OKLCH: ${baseColor}`);
  }

  const baseL = base.l ?? 0;
  const baseC = base.c ?? 0;
  const baseH = base.h ?? 0;

  // Target lightness offsets for each step relative to 500
  const idealLighterOffset = 0.42;
  const idealDarkerOffset = 0.43;
  const maxLightness = 0.97;
  const minLightness = 0.03;

  // Calculate available room for lighter/darker
  const availableLighter = maxLightness - baseL;
  const availableDarker = baseL - minLightness;

  // Scale factors to fit palette in available range
  const lighterScale = Math.min(1, availableLighter / idealLighterOffset);
  const darkerScale = Math.min(1, availableDarker / idealDarkerOffset);

  // Base offsets for each step (negative = lighter, positive = darker)
  const baseOffsets: Record<number, number> = {
    50: -0.42,
    100: -0.38,
    200: -0.3,
    300: -0.2,
    400: -0.1,
    500: 0,
    600: 0.1,
    700: 0.2,
    800: 0.3,
    900: 0.37,
    950: 0.43,
  };

  const palette = {} as Record<number, string>;
  const baseHex = formatHex(parsed);

  for (const step of PALETTE_STEPS) {
    // Base color stays unchanged
    if (step === 500) {
      palette[step] = baseHex;
      continue;
    }

    // Pure endpoints if requested
    if (opts.pureEndpoints) {
      if (step === 50) {
        palette[step] = '#ffffff';
        continue;
      }
      if (step === 950) {
        palette[step] = '#000000';
        continue;
      }
    }

    const baseOffset = baseOffsets[step];
    const scale = baseOffset < 0 ? lighterScale : darkerScale;
    const offset = baseOffset * scale;

    // Calculate target lightness
    const targetL = Math.max(minLightness, Math.min(maxLightness, baseL - offset));

    // Calculate chroma scaling
    const distanceFromBase = Math.abs(baseOffset);
    let chromaScale: number;

    if (targetL > baseL) {
      // For lighter shades, reduce chroma more gradually
      chromaScale = 1 - distanceFromBase * (1 - opts.chromaPreservation) * 0.7;
    } else {
      // For darker shades, reduce chroma more aggressively
      chromaScale = 1 - distanceFromBase * 0.5;
    }

    const targetC = baseC * Math.max(0, chromaScale);

    // Apply hue shift for darker shades
    const targetH = baseH + (targetL < baseL ? opts.hueShift * distanceFromBase : 0);

    palette[step] = createOklchInGamut(targetL, targetC, targetH);
  }

  return palette as ColorPalette;
}

/**
 * Alias for expandColorPalette for backward compatibility.
 */
export const generatePalette = expandColorPalette;

/**
 * Get the contrasting text color (black or white) for a background color.
 *
 * @param color - The background color
 * @returns '#000000' for light backgrounds, '#ffffff' for dark backgrounds
 */
export function getContrastColor(color: string): '#000000' | '#ffffff' {
  const contrastWithBlack = wcagContrast(color, '#000000');
  const contrastWithWhite = wcagContrast(color, '#ffffff');
  return contrastWithBlack >= contrastWithWhite ? '#000000' : '#ffffff';
}

/**
 * Determine if a color represents a light or dark color scheme.
 *
 * @param color - The color to check
 * @returns 'light' if the color is light (needs dark text), 'dark' if dark (needs light text)
 */
export function getColorScheme(color: string): 'light' | 'dark' {
  return getContrastColor(color) === '#000000' ? 'light' : 'dark';
}

/**
 * Expand all single-color values in a color definitions object to palettes.
 *
 * - Single hex strings are expanded to 11-step palettes
 * - Light/dark pairs are preserved as-is
 * - Pre-defined palettes (objects with numeric keys) are preserved
 *
 * @param colors - Color definitions object
 * @returns Colors with single values expanded to palettes
 *
 * @example
 * ```ts
 * const expanded = expandColors({
 *   primary: '#3b82f6',        // Will be expanded to palette
 *   white: { light: '#fff', dark: '#fff' },  // Preserved
 * });
 * ```
 */
export function expandColors(colors: ColorDefinitions): ColorDefinitions {
  const result: ColorDefinitions = {};

  for (const [name, rawValue] of Object.entries(colors)) {
    const value = unwrapTokenValue(rawValue);

    if (isAutoExpandColor(value)) {
      // Single color string - expand to palette
      result[name] = expandColorPalette(value, {}) as Record<string, string>;
    } else if (isLightDarkValue(value)) {
      // Light/dark pair - preserve as-is
      result[name] = value;
    } else if (typeof value === 'object' && value !== null) {
      // Pre-defined palette or nested object - preserve as-is
      result[name] = value as Record<string, string>;
    } else {
      // Unknown type - preserve as-is
      result[name] = value as string;
    }
  }

  return result;
}

/**
 * A single resolved leaf in an expanded color tree - either a base color
 * (`step` undefined) or one step of a palette.
 */
export type ColorLeaf = {
  name: string;
  step?: string;
  value: string | LightDarkValue;
};

/**
 * Walk `colors` (after {@link expandColors}) and visit every leaf value -
 * a base color, a light/dark pair, or one step of a palette. This is the one
 * light/dark-vs-palette-vs-plain branch every generator that touches
 * `primitives.color` needs; callers that only care about each leaf's CSS var
 * name/value (as opposed to producing name-grouped output, e.g. markdown
 * section headers per color family) should use this instead of
 * re-implementing the branch.
 */
export function walkExpandedColors(colors: ColorDefinitions, visit: (leaf: ColorLeaf) => void): void {
  const expanded = expandColors(colors);

  for (const [name, colorValue] of Object.entries(expanded)) {
    if (isLightDarkValue(colorValue)) {
      visit({ name, value: colorValue });
    } else if (typeof colorValue === 'object' && colorValue !== null) {
      for (const [step, stepValue] of Object.entries(colorValue)) {
        visit({ name, step, value: isLightDarkValue(stepValue) ? stepValue : (stepValue as string) });
      }
    } else {
      visit({ name, value: colorValue as string });
    }
  }
}
