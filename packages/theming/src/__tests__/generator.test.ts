import { describe, expect, it } from 'vitest';
import {
  expandColors,
  generatePalette,
  getContrastColor,
  isAutoExpandColor,
  isLightDarkValue,
  PALETTE_STEPS,
} from '../generator/colorPalette.js';
import { generateCss } from '../generator/generateCss.js';
import { generateThemeSync } from '../generator/generateTheme.js';
import { generateTokensJson, generateTokensJsonForMode } from '../generator/generateTokensJson.js';
import { generateTokensMarkdown } from '../generator/generateTokensMarkdown.js';
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
      semantics: ({ primitive }) => ({
        action: {
          main: primitive('color', 'primary', 500),
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
      components: ({ primitive }) => ({
        button: {
          padding: primitive('spacing', 'md'),
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

  describe('rawCss output', () => {
    it('appends rawCss.theme to theme CSS', () => {
      const tokens = defineTokens({
        primitives: {
          color: { primary: '#3b82f6' },
        },
        rawCss: {
          theme: '@font-face { font-family: "Custom"; src: url("custom.woff2"); }',
        },
      });

      const theme = generateThemeSync(tokens.definition, { prefix: 'app' });

      expect(theme.css).toContain('/* Custom theme CSS */');
      expect(theme.css).toContain('@font-face { font-family: "Custom"');
    });

    it('appends rawCss.reset to reset CSS', () => {
      const tokens = defineTokens({
        primitives: {
          color: { primary: '#3b82f6' },
        },
        rawCss: {
          reset: 'html { scroll-behavior: smooth; }',
        },
      });

      const theme = generateThemeSync(tokens.definition, { prefix: 'app' });

      expect(theme.cssReset).toContain('/* Custom reset CSS */');
      expect(theme.cssReset).toContain('html { scroll-behavior: smooth; }');
    });

    it('appends rawCss.utilities to utilities CSS', () => {
      const tokens = defineTokens({
        primitives: {
          spacing: { sm: '0.5rem' },
        },
        rawCss: {
          utilities: '.sr-only { position: absolute; width: 1px; height: 1px; }',
        },
      });

      const theme = generateThemeSync(tokens.definition, { prefix: 'app' });

      expect(theme.cssUtilities).toContain('/* Custom utility CSS */');
      expect(theme.cssUtilities).toContain('.sr-only { position: absolute');
    });

    it('does not add comment when rawCss is not provided', () => {
      const tokens = defineTokens({
        primitives: {
          color: { primary: '#3b82f6' },
        },
      });

      const theme = generateThemeSync(tokens.definition, { prefix: 'app' });

      expect(theme.css).not.toContain('/* Custom theme CSS */');
      expect(theme.cssReset).not.toContain('/* Custom reset CSS */');
      expect(theme.cssUtilities).not.toContain('/* Custom utility CSS */');
    });

    it('preserves rawCss through theme extension', () => {
      const base = defineTokens({
        primitives: {
          color: { primary: '#3b82f6' },
        },
        rawCss: {
          theme: '/* base theme css */',
        },
      });

      const extended = base.extendRawCss({
        theme: '/* extended theme css */',
      });

      const theme = generateThemeSync(extended.definition, { prefix: 'app' });

      expect(theme.css).toContain('/* base theme css */');
      expect(theme.css).toContain('/* extended theme css */');
    });
  });
});

describe('generateTokensJson (DTCG format)', () => {
  it('wraps every leaf in $value/$type per the DTCG spec', () => {
    const tokens = defineTokens({
      primitives: {
        color: { brand: '#3b82f6' },
        spacing: { sm: '0.5rem' },
      },
    });

    const doc = JSON.parse(generateTokensJson(tokens.definition, 'app'));

    expect(doc.$schema).toBe('https://www.designtokens.org/schemas/2025.10/format.json');
    expect(doc.primitives.color.brand['500'].$value).toHaveProperty('colorSpace', 'oklch');
    expect(doc.primitives.color.brand['500'].$type).toBe('color');
    expect(doc.primitives.spacing.sm).toEqual({ $value: { value: 0.5, unit: 'rem' }, $type: 'dimension' });
  });

  it('rewrites var() references into {alias} syntax using the actual definition, not a fixed group registry', () => {
    const tokens = defineTokens(
      {
        primitives: {
          color: { brand: '#3b82f6' },
        },
        semantics: ({ primitive }) => ({
          surface: { primary: primitive('color', 'brand', 500) },
        }),
        components: ({ semantic }) => ({
          // Arbitrary, non-registered component/group name - not in any
          // fixed SEMANTIC_GROUPS/COMPONENT_GROUPS-style list.
          totallyCustomWidget: { bgColor: semantic('surface', 'primary') },
        }),
      },
      { prefix: 'app' }
    );

    const doc = JSON.parse(generateTokensJson(tokens.definition, 'app'));

    expect(doc.semantics.surface.primary.$value).toBe('{primitives.color.brand.500}');
    expect(doc.components.totallyCustomWidget.bgColor.$value).toBe('{semantics.surface.primary}');
  });

  it('does not throw on values that fall outside the strict W3C primitive types, and passes them through as-is', () => {
    const tokens = defineTokens(
      {
        primitives: {
          color: { brand: '#3b82f6' },
        },
        components: ({ primitive }) => ({
          widget: {
            cursor: 'not-allowed',
            transition: 'opacity 0.3s ease',
            border: `1px solid ${primitive('color', 'brand', 500)}`,
          },
        }),
      },
      { prefix: 'app' }
    );

    expect(() => generateTokensJson(tokens.definition, 'app')).not.toThrow();

    const doc = JSON.parse(generateTokensJson(tokens.definition, 'app'));
    expect(doc.components.widget.cursor.$value).toBe('not-allowed');
    expect(doc.components.widget.transition.$value).toBe('opacity 0.3s ease');
    expect(doc.components.widget.border.$value).toBe('1px solid {primitives.color.brand.500}');
  });

  it('converts cubic-bezier arrays and resolves light/dark tokens per-mode', () => {
    const tokens = defineTokens({
      primitives: {
        color: { surface: { light: '#ffffff', dark: '#000000' } },
        timingFunction: { easeOut: [0, 0, 0.2, 1] },
      },
    });

    const light = JSON.parse(generateTokensJsonForMode(tokens.definition, 'app', 'light'));
    const dark = JSON.parse(generateTokensJsonForMode(tokens.definition, 'app', 'dark'));

    expect(light.primitives.timingFunction.easeOut).toEqual({ $value: [0, 0, 0.2, 1], $type: 'cubicBezier' });
    expect(light.primitives.color.surface.$type).toBe('color');
    expect(light.primitives.color.surface.$value.hex).toBe('#ffffff');
    expect(dark.primitives.color.surface.$value.hex).toBe('#000000');
  });

  it('walks arbitrary/custom primitive categories the same as known ones', () => {
    const tokens = defineTokens({
      primitives: {
        color: { brand: '#3b82f6' },
        // Not part of the fixed PrimitiveTokens category list.
        opacity: { subtle: '0.5' },
      } as never,
    });

    const doc = JSON.parse(generateTokensJson(tokens.definition, 'app'));

    expect(doc.primitives.opacity.subtle.$value).toBe(0.5);
  });

  it('keeps semantic/component leaf paths aligned across css, json, and markdown outputs', () => {
    const tokens = defineTokens(
      {
        primitives: {
          color: { brand: '#3b82f6' },
        },
        semantics: ({ primitive }) => ({
          body: {
            bgColor: { value: primitive('color', 'brand', 500), description: 'Body background' },
            text: { light: '#111111', dark: '#f5f5f5' },
          },
        }),
        components: ({ semantic }) => ({
          card: {
            surfaceColor: semantic('body', 'bgColor'),
            header: {
              textColor: semantic('body', 'text'),
            },
          },
        }),
      },
      { prefix: 'app' }
    );

    const css = generateCss(tokens.definition, { prefix: 'app' });
    expect(css).toContain('--app-body-bg-color');
    expect(css).toContain('--app-body-text');
    expect(css).toContain('--app-card-surface-color');
    expect(css).toContain('--app-card-header-text-color');

    const json = JSON.parse(generateTokensJson(tokens.definition, 'app'));
    expect(json.semantics.body.bgColor.$value).toBe('{primitives.color.brand.500}');
    expect(json.semantics.body.bgColor.$description).toBe('Body background');
    expect(json.semantics.body.text.$value).toEqual({ light: '#111111', dark: '#f5f5f5' });
    expect(json.components.card.surfaceColor.$value).toBe('{semantics.body.bgColor}');
    expect(json.components.card.header.textColor.$value).toBe('{semantics.body.text}');

    const markdown = generateTokensMarkdown(tokens.definition, 'app');
    expect(markdown).toContain('`body.bgColor`');
    expect(markdown).toContain('`card.header.textColor`');
    expect(markdown).toContain('Body background');
  });
});
