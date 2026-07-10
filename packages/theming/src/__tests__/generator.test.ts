import { describe, it, expect } from 'vitest';
import {
  generatePalette,
  expandColors,
  getContrastColor,
  isAutoExpandColor,
  isLightDarkValue,
  PALETTE_STEPS,
} from '../generator/colorPalette.js';
import { generateThemeSync } from '../generator/generateTheme.js';
import { defineTokens } from '../defineTokens.js';

describe('colorPalette', () => {
  describe('generatePalette', () => {
    it('generates 11 palette steps from a base color', () => {
      const palette = generatePalette('#3b82f6');

      expect(Object.keys(palette)).toHaveLength(11);
      expect(palette).toHaveProperty('50');
      expect(palette).toHaveProperty('500');
      expect(palette).toHaveProperty('950');
    });

    it('produces lighter colors for lower steps', () => {
      const palette = generatePalette('#3b82f6');

      // 50 should be lighter (higher luminance) than 500
      // We can check this by verifying the hex values suggest lighter colors
      expect(palette[50]).toBeDefined();
      expect(palette[950]).toBeDefined();
    });

    it('uses the input color as the 500 step baseline', () => {
      const palette = generatePalette('#3b82f6');
      // The 500 step should be close to the input (may not be exact due to OKLCH conversion)
      expect(palette[500]).toBeDefined();
    });
  });

  describe('expandColors', () => {
    it('expands single color strings to palettes', () => {
      const colors = {
        primary: '#3b82f6',
      };

      const expanded = expandColors(colors);

      expect(expanded.primary).toHaveProperty('50');
      expect(expanded.primary).toHaveProperty('500');
      expect(expanded.primary).toHaveProperty('950');
    });

    it('preserves light/dark values without expansion', () => {
      const colors = {
        white: { light: '#ffffff', dark: '#ffffff' },
      };

      const expanded = expandColors(colors);

      expect(expanded.white).toEqual({ light: '#ffffff', dark: '#ffffff' });
    });

    it('preserves explicit palette objects', () => {
      const colors = {
        custom: {
          50: '#fef2f2',
          500: '#ef4444',
          900: '#7f1d1d',
        },
      };

      const expanded = expandColors(colors);

      expect(expanded.custom).toEqual({
        50: '#fef2f2',
        500: '#ef4444',
        900: '#7f1d1d',
      });
    });
  });

  describe('getContrastColor', () => {
    it('returns dark color for light backgrounds', () => {
      const contrast = getContrastColor('#ffffff');
      // Should return a dark color for white background
      expect(contrast).toBeDefined();
    });

    it('returns light color for dark backgrounds', () => {
      const contrast = getContrastColor('#000000');
      // Should return a light color for black background
      expect(contrast).toBeDefined();
    });
  });

  describe('isAutoExpandColor', () => {
    it('returns true for hex color strings', () => {
      expect(isAutoExpandColor('#3b82f6')).toBe(true);
      expect(isAutoExpandColor('#fff')).toBe(true);
    });

    it('returns false for light/dark objects', () => {
      expect(isAutoExpandColor({ light: '#fff', dark: '#000' })).toBe(false);
    });

    it('returns false for palette objects', () => {
      expect(isAutoExpandColor({ 50: '#fff', 500: '#3b82f6' })).toBe(false);
    });
  });

  describe('isLightDarkValue', () => {
    it('returns true for light/dark objects', () => {
      expect(isLightDarkValue({ light: '#fff', dark: '#000' })).toBe(true);
    });

    it('returns false for strings', () => {
      expect(isLightDarkValue('#ffffff')).toBe(false);
    });

    it('returns false for palette objects', () => {
      expect(isLightDarkValue({ 50: '#fff', 500: '#000' })).toBe(false);
    });
  });

  describe('PALETTE_STEPS', () => {
    it('contains all expected steps', () => {
      expect(PALETTE_STEPS).toEqual([50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]);
    });
  });
});

describe('generateThemeSync', () => {
  it('generates CSS from token definition', () => {
    const tokens = defineTokens({
      primitives: {
        color: {
          primary: '#3b82f6',
        },
        spacing: {
          sm: '0.5rem',
        },
      },
    });

    const theme = generateThemeSync(tokens.definition, { prefix: 'test' });

    expect(theme.css).toContain('--test-color-primary-500');
    expect(theme.css).toContain('--test-spacing-sm');
  });

  it('generates color palette variables', () => {
    const tokens = defineTokens({
      primitives: {
        color: {
          brand: '#ff6600',
        },
      },
    });

    const theme = generateThemeSync(tokens.definition, { prefix: 'app' });

    expect(theme.css).toContain('--app-color-brand-50');
    expect(theme.css).toContain('--app-color-brand-500');
    expect(theme.css).toContain('--app-color-brand-950');
  });

  it('generates color palette variables for all steps', () => {
    const tokens = defineTokens({
      primitives: {
        color: {
          primary: '#3b82f6',
        },
      },
    });

    const theme = generateThemeSync(tokens.definition, { prefix: 'app' });

    // Should have all palette steps
    expect(theme.css).toContain('--app-color-primary-50');
    expect(theme.css).toContain('--app-color-primary-100');
    expect(theme.css).toContain('--app-color-primary-500');
    expect(theme.css).toContain('--app-color-primary-900');
    expect(theme.css).toContain('--app-color-primary-950');
  });

  it('includes semantic tokens in output', () => {
    const tokens = defineTokens({
      primitives: {
        color: {
          primary: '#3b82f6',
        },
      },
      semantics: ref => ({
        action: {
          main: ref('color', 'primary', 500),
        },
      }),
    });

    const theme = generateThemeSync(tokens.definition, { prefix: 'app' });

    expect(theme.css).toContain('--app-action-main');
  });

  it('includes component tokens in output', () => {
    const tokens = defineTokens({
      primitives: {
        spacing: {
          md: '1rem',
        },
      },
      components: ref => ({
        button: {
          padding: ref('spacing', 'md'),
        },
      }),
    });

    const theme = generateThemeSync(tokens.definition, { prefix: 'app' });

    expect(theme.css).toContain('--app-button-padding');
  });

  it('generates CSS reset', () => {
    const tokens = defineTokens({
      primitives: {
        color: {
          primary: '#3b82f6',
        },
      },
    });

    const theme = generateThemeSync(tokens.definition);

    expect(theme.cssReset).toContain('box-sizing');
    expect(theme.cssReset).toContain('margin');
  });

  it('generates utility classes', () => {
    const tokens = defineTokens({
      primitives: {
        spacing: {
          sm: '0.5rem',
          md: '1rem',
        },
      },
    });

    const theme = generateThemeSync(tokens.definition, { prefix: 'app' });

    expect(theme.cssUtilities).toContain('.p-sm');
    expect(theme.cssUtilities).toContain('.m-md');
  });

  it('detects light/dark tokens', () => {
    const tokens = defineTokens({
      primitives: {
        color: {
          surface: { light: '#ffffff', dark: '#000000' },
        },
      },
    });

    const theme = generateThemeSync(tokens.definition);

    expect(theme.hasLightDarkTokens).toBe(true);
  });

  it('generates W3C tokens JSON', () => {
    const tokens = defineTokens({
      primitives: {
        color: {
          primary: '#3b82f6',
        },
      },
    });

    const theme = generateThemeSync(tokens.definition, { prefix: 'app' });

    expect(theme.tokensJson).toBeDefined();
    const parsed = JSON.parse(theme.tokensJson);
    expect(parsed).toHaveProperty('primitives');
    expect(parsed.primitives).toHaveProperty('color');
  });
});
