import { generateThemeSync } from '../generator/generateTheme.js';
import { charmTokens } from './charm.js';

/**
 * Demo theme that extends the charm base theme with vibrant colors
 * for showcasing components in documentation and demos.
 *
 * Uses the `.extendPrimitives()` and `.extendSemantics()` methods to override
 * specific tokens while inheriting the rest from charm, plus `.extendRawCss()`
 * to layer demo-only styles on top of the raw CSS inherited from charm.
 */
export const demoTokens = charmTokens
  .extendPrimitives({
    color: {
      brand: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
        950: '#172554',
      },
      accent: {
        50: '#faf5ff',
        100: '#f3e8ff',
        200: '#e9d5ff',
        300: '#d8b4fe',
        400: '#c084fc',
        500: '#a855f7',
        600: '#9333ea',
        700: '#7c3aed',
        800: '#6b21a8',
        900: '#581c87',
        950: '#3b0764',
      },
      success: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#14532d',
        950: '#052e16',
      },
      warning: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f',
        950: '#451a03',
      },
      danger: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',
        950: '#450a0a',
      },
      neutral: {
        50: '#fafafa',
        100: '#f4f4f5',
        200: '#e4e4e7',
        300: '#d4d4d8',
        400: '#a1a1aa',
        500: '#71717a',
        600: '#52525b',
        700: '#3f3f46',
        800: '#27272a',
        900: '#18181b',
        950: '#09090b',
      },
    },
  })
  // Only the overridden tokens need to be listed - they are deep-merged into
  // the semantics inherited from charm, so untouched groups (text, border, ...)
  // and untouched keys within these groups are preserved automatically.
  .extendSemantics(({ primitive }) => ({
    surface: {
      primary: { light: primitive('color', 'white'), dark: primitive('color', 'neutral', 950) },
      secondary: { light: primitive('color', 'neutral', 50), dark: primitive('color', 'neutral', 900) },
      tertiary: { light: primitive('color', 'neutral', 100), dark: primitive('color', 'neutral', 800) },
    },

    action: {
      primary: {
        color: primitive('color', 'brand', 500),
        hover: { color: { light: primitive('color', 'brand', 600), dark: primitive('color', 'brand', 400) } },
        active: { color: { light: primitive('color', 'brand', 700), dark: primitive('color', 'brand', 300) } },
      },
    },
  }))
  .extendRawCss(({ primitive, semantic }, base) => ({
    // The factory return *replaces* the raw CSS inherited from charm. Spread
    // `base` to keep any inherited buckets and interpolate `base?.theme` to
    // append after — rather than drop — them.
    ...base,
    theme: `${base?.theme ?? ''}
:root {
  accent-color: ${primitive('color', 'brand', 500)};
}

body {
  background: ${semantic('surface', 'primary')};
}`,
  }));

/** The resolved token definition for the demo theme */
export const demoDefinition = demoTokens.definition;
/** Token helpers for the demo theme */
export const demoHelpers = demoTokens.helpers;

/** Pre-generated CSS theme for the demo tokens (lazily computed) */
let _demoTheme: ReturnType<typeof generateThemeSync> | undefined;

function getDemoTheme(): ReturnType<typeof generateThemeSync> {
  if (!_demoTheme) {
    _demoTheme = generateThemeSync(demoDefinition, { prefix: 'charm' });
  }
  return _demoTheme;
}

/**
 * Lazy-evaluated proxy for the generated demo theme.
 * Generation only runs on first property access.
 */
export const demoTheme: ReturnType<typeof generateThemeSync> = new Proxy({} as ReturnType<typeof generateThemeSync>, {
  get(_target, prop: keyof ReturnType<typeof generateThemeSync>) {
    return getDemoTheme()[prop];
  },
});

export default demoTokens;
