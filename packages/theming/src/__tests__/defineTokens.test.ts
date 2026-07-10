import { describe, it, expect } from 'vitest';
import { defineTokens } from '../defineTokens.js';

describe('defineTokens', () => {
  it('creates a token definition with primitives', () => {
    const tokens = defineTokens({
      primitives: {
        color: {
          primary: '#3b82f6',
        },
        spacing: {
          sm: '0.5rem',
          md: '1rem',
        },
      },
    });

    expect(tokens.definition.primitives.color).toEqual({
      primary: '#3b82f6',
    });
    expect(tokens.definition.primitives.spacing).toEqual({
      sm: '0.5rem',
      md: '1rem',
    });
  });

  it('resolves semantics using ref helper', () => {
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

    expect(tokens.definition.semantics?.action.main).toBe('var(--color-primary-500)');
  });

  it('resolves components using ref helper', () => {
    const tokens = defineTokens({
      primitives: {
        color: {
          primary: '#3b82f6',
        },
        borderRadius: {
          md: '8px',
        },
      },
      semantics: ref => ({
        action: {
          primary: ref('color', 'primary', 500),
        },
      }),
      components: ref => ({
        button: {
          bgColor: ref('action', 'primary'),
          borderRadius: ref('borderRadius', 'md'),
        },
      }),
    });

    expect(tokens.definition.components?.button.bgColor).toBe('var(--action-primary)');
    expect(tokens.definition.components?.button.borderRadius).toBe('var(--border-radius-md)');
  });

  it('applies prefix to CSS variables', () => {
    const tokens = defineTokens(
      {
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
      },
      { prefix: 'app' }
    );

    expect(tokens.definition.semantics?.action.main).toBe('var(--app-color-primary-500)');
  });

  describe('extendPrimitives', () => {
    it('merges primitive overrides', () => {
      const base = defineTokens({
        primitives: {
          color: {
            primary: '#3b82f6',
            neutral: '#71717a',
          },
          spacing: {
            sm: '0.5rem',
          },
        },
      });

      const extended = base.extendPrimitives({
        color: {
          primary: '#ff6600',
        },
      });

      expect(extended.definition.primitives.color?.primary).toBe('#ff6600');
      expect(extended.definition.primitives.color?.neutral).toBe('#71717a');
      expect(extended.definition.primitives.spacing?.sm).toBe('0.5rem');
    });

    it('allows color palettes in extensions', () => {
      const base = defineTokens({
        primitives: {
          color: {
            brand: '#3b82f6',
          },
        },
      });

      const extended = base.extendPrimitives({
        color: {
          brand: {
            50: '#eff6ff',
            500: '#3b82f6',
            900: '#1e3a8a',
          },
        },
      });

      expect(extended.definition.primitives.color?.brand).toEqual({
        50: '#eff6ff',
        500: '#3b82f6',
        900: '#1e3a8a',
      });
    });

    it('preserves semantics factory after extension', () => {
      const base = defineTokens({
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

      const extended = base.extendPrimitives({
        color: {
          primary: '#ff6600',
        },
      });

      expect(extended.definition.semantics?.action.main).toBe('var(--color-primary-500)');
    });
  });

  describe('extendSemantics', () => {
    it('allows overriding semantic tokens', () => {
      const base = defineTokens({
        primitives: {
          color: {
            primary: '#3b82f6',
            secondary: '#9333ea',
          },
        },
        semantics: ref => ({
          action: {
            main: ref('color', 'primary', 500),
          },
        }),
      });

      const extended = base.extendSemantics((ref, baseSemantics) => ({
        ...baseSemantics,
        action: {
          ...baseSemantics?.action,
          main: ref('color', 'secondary', 500),
        },
      }));

      expect(extended.definition.semantics?.action.main).toBe('var(--color-secondary-500)');
    });

    it('provides base semantics to factory', () => {
      const base = defineTokens({
        primitives: {
          color: {
            primary: '#3b82f6',
          },
        },
        semantics: ref => ({
          surface: {
            primary: ref('color', 'primary', 50),
          },
          action: {
            main: ref('color', 'primary', 500),
          },
        }),
      });

      const extended = base.extendSemantics((ref, baseSemantics) => ({
        ...baseSemantics,
        custom: {
          value: ref('color', 'primary', 700),
        },
      }));

      expect(extended.definition.semantics?.surface.primary).toBe('var(--color-primary-50)');
      expect(extended.definition.semantics?.action.main).toBe('var(--color-primary-500)');
      expect(extended.definition.semantics?.custom.value).toBe('var(--color-primary-700)');
    });
  });

  describe('extendComponents', () => {
    it('allows overriding component tokens', () => {
      const base = defineTokens({
        primitives: {
          borderRadius: {
            sm: '4px',
            full: '9999px',
          },
        },
        components: ref => ({
          button: {
            borderRadius: ref('borderRadius', 'sm'),
          },
        }),
      });

      const extended = base.extendComponents((ref, baseComponents) => ({
        ...baseComponents,
        button: {
          ...baseComponents?.button,
          borderRadius: ref('borderRadius', 'full'),
        },
      }));

      expect(extended.definition.components?.button.borderRadius).toBe('var(--border-radius-full)');
    });

    it('allows adding new component tokens', () => {
      const base = defineTokens({
        primitives: {
          spacing: {
            sm: '0.5rem',
          },
        },
        components: ref => ({
          button: {
            padding: ref('spacing', 'sm'),
          },
        }),
      });

      const extended = base.extendComponents((ref, baseComponents) => ({
        ...baseComponents,
        card: {
          padding: ref('spacing', 'sm'),
        },
      }));

      expect(extended.definition.components?.button.padding).toBe('var(--spacing-sm)');
      expect(extended.definition.components?.card.padding).toBe('var(--spacing-sm)');
    });
  });

  describe('chaining', () => {
    it('supports chaining all extension methods', () => {
      const base = defineTokens({
        primitives: {
          color: {
            primary: '#3b82f6',
          },
          borderRadius: {
            md: '8px',
          },
        },
        semantics: ref => ({
          action: {
            main: ref('color', 'primary', 500),
          },
        }),
        components: ref => ({
          button: {
            bgColor: ref('action', 'main'),
          },
        }),
      });

      const extended = base
        .extendPrimitives({
          color: {
            brand: '#ff6600',
          },
        })
        .extendSemantics((ref, baseSem) => ({
          ...baseSem,
          action: {
            ...baseSem?.action,
            secondary: ref('color', 'brand', 500),
          },
        }))
        .extendComponents((ref, baseComp) => ({
          ...baseComp,
          button: {
            ...baseComp?.button,
            borderRadius: ref('borderRadius', 'md'),
          },
        }));

      expect(extended.definition.primitives.color?.brand).toBe('#ff6600');
      expect(extended.definition.semantics?.action.secondary).toBe('var(--color-brand-500)');
      expect(extended.definition.components?.button.borderRadius).toBe('var(--border-radius-md)');
    });
  });

  describe('helpers', () => {
    it('provides typed helpers for primitives', () => {
      const tokens = defineTokens(
        {
          primitives: {
            color: {
              primary: '#3b82f6',
            },
            spacing: {
              md: '1rem',
            },
          },
        },
        { prefix: 'app' }
      );

      expect(tokens.helpers.color('primary', 500)).toBe('var(--app-color-primary-500)');
      expect(tokens.helpers.spacing('md')).toBe('var(--app-spacing-md)');
    });

    it('provides ref helper for cross-references', () => {
      const tokens = defineTokens(
        {
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
        },
        { prefix: 'test' }
      );

      expect(tokens.helpers.ref('action', 'main')).toBe('var(--test-action-main)');
    });
  });
});
