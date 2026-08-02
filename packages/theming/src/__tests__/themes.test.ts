import { describe, expect, it } from 'vitest';
import { charmTheme, charmTokens, demoTheme, demoTokens } from '../themes/index.js';

describe('charmTokens', () => {
  it('has primitives defined', () => {
    expect(charmTokens.definition.primitives).toBeDefined();
    expect(charmTokens.definition.primitives.color).toBeDefined();
    expect(charmTokens.definition.primitives.spacing).toBeDefined();
    expect(charmTokens.definition.primitives.borderRadius).toBeDefined();
  });

  it('has semantics defined', () => {
    expect(charmTokens.definition.semantics).toBeDefined();
    expect(charmTokens.definition.semantics?.surface).toBeDefined();
    expect(charmTokens.definition.semantics?.text).toBeDefined();
    expect(charmTokens.definition.semantics?.action).toBeDefined();
  });

  it('has components defined', () => {
    expect(charmTokens.definition.components).toBeDefined();
    expect(charmTokens.definition.components?.button).toBeDefined();
    expect(charmTokens.definition.components?.card).toBeDefined();
  });

  it('provides helpers', () => {
    expect(charmTokens.helpers).toBeDefined();
    expect(charmTokens.helpers.color).toBeInstanceOf(Function);
    expect(charmTokens.helpers.spacing).toBeInstanceOf(Function);
  });

  it('helpers produce correct CSS variables', () => {
    expect(charmTokens.helpers.color('brand', 500)).toBe('var(--charm-color-brand-500)');
    expect(charmTokens.helpers.spacing('md')).toBe('var(--charm-spacing-md)');
  });

  describe('extension methods', () => {
    it('extendPrimitives returns new tokens', () => {
      const extended = charmTokens.extendPrimitives({
        color: {
          custom: '#ff0000',
        },
      });

      expect(extended.definition.primitives.color?.custom).toBe('#ff0000');
      // Original should still have brand
      expect(extended.definition.primitives.color?.brand).toBeDefined();
    });

    it('extendSemantics returns new tokens', () => {
      const extended = charmTokens.extendSemantics(({ primitive }, base) => ({
        ...base,
        custom: {
          value: primitive('color', 'brand', 500),
        },
      }));

      expect(extended.definition.semantics?.custom?.value).toBe('var(--charm-color-brand-500)');
      // Original semantics should be preserved
      expect(extended.definition.semantics?.surface).toBeDefined();
    });

    it('extendComponents returns new tokens', () => {
      const extended = charmTokens.extendComponents(({ primitive }, base) => ({
        ...base,
        customComponent: {
          padding: primitive('spacing', 'md'),
        },
      }));

      expect(extended.definition.components?.customComponent?.padding).toBe('var(--charm-spacing-md)');
      // Original components should be preserved
      expect(extended.definition.components?.button).toBeDefined();
    });
  });
});

describe('charmTheme', () => {
  it('has generated CSS', () => {
    expect(charmTheme.css).toBeDefined();
    expect(charmTheme.css.length).toBeGreaterThan(0);
  });

  it('CSS contains charm prefix', () => {
    expect(charmTheme.css).toContain('--charm-');
  });

  it('has CSS reset', () => {
    expect(charmTheme.cssReset).toBeDefined();
    expect(charmTheme.cssReset).toContain('box-sizing');
  });

  it('reset focus ring is token-driven, not a hardcoded palette literal', () => {
    expect(charmTheme.cssReset).toContain('--charm-focus-outline-color');
    expect(charmTheme.cssReset).toContain('--charm-focus-outline-width');
    expect(charmTheme.cssReset).not.toContain('--charm-color-brand-500');
  });

  it('has utility classes', () => {
    expect(charmTheme.cssUtilities).toBeDefined();
    expect(charmTheme.cssUtilities).toContain('.p-');
  });

  it('has tokens markdown', () => {
    expect(charmTheme.tokensMarkdown).toBeDefined();
    expect(charmTheme.tokensMarkdown.length).toBeGreaterThan(0);
  });
});

describe('demoTokens', () => {
  it('extends charmTokens', () => {
    // Demo should have the same structure as charm
    expect(demoTokens.definition.primitives).toBeDefined();
    expect(demoTokens.definition.semantics).toBeDefined();
  });

  it('has custom color palettes', () => {
    const brandColor = demoTokens.definition.primitives.color?.brand;
    // Demo defines explicit palettes instead of single colors
    expect(brandColor).toHaveProperty('50');
    expect(brandColor).toHaveProperty('500');
    expect(brandColor).toHaveProperty('950');
  });

  it('has all semantic colors with palettes', () => {
    const colors = demoTokens.definition.primitives.color;
    expect(colors?.brand).toHaveProperty('500');
    expect(colors?.accent).toHaveProperty('500');
    expect(colors?.success).toHaveProperty('500');
    expect(colors?.warning).toHaveProperty('500');
    expect(colors?.danger).toHaveProperty('500');
    expect(colors?.neutral).toHaveProperty('500');
  });
});

describe('demoTheme', () => {
  it('has generated CSS', () => {
    expect(demoTheme.css).toBeDefined();
    expect(demoTheme.css.length).toBeGreaterThan(0);
  });

  it('CSS contains charm prefix', () => {
    // Demo uses charm prefix
    expect(demoTheme.css).toContain('--charm-');
  });
});
