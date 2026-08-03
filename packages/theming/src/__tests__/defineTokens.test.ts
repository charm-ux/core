import { describe, expect, it } from 'vitest';
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
      semantics: ({ primitive }) => ({
        action: {
          main: primitive('color', 'primary', 500),
        },
      }),
    });

    expect(tokens.definition.semantics?.action.main).toBe('var(--charm-color-primary-500)');
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
      semantics: ({ primitive }) => ({
        action: {
          primary: primitive('color', 'primary', 500),
        },
      }),
      components: ({ primitive, semantic }) => ({
        button: {
          bgColor: semantic('action', 'primary'),
          borderRadius: primitive('borderRadius', 'md'),
        },
      }),
    });

    expect(tokens.definition.components?.button.bgColor).toBe('var(--charm-action-primary)');
    expect(tokens.definition.components?.button.borderRadius).toBe('var(--charm-border-radius-md)');
  });

  it('applies prefix to CSS variables', () => {
    const tokens = defineTokens(
      {
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
        semantics: ({ primitive }) => ({
          action: {
            main: primitive('color', 'primary', 500),
          },
        }),
      });

      const extended = base.extendPrimitives({
        color: {
          primary: '#ff6600',
        },
      });

      expect(extended.definition.semantics?.action.main).toBe('var(--charm-color-primary-500)');
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
        semantics: ({ primitive }) => ({
          action: {
            main: primitive('color', 'primary', 500),
          },
        }),
      });

      const extended = base.extendSemantics(({ primitive }, baseSemantics) => ({
        ...baseSemantics,
        action: {
          ...baseSemantics?.action,
          main: primitive('color', 'secondary', 500),
        },
      }));

      expect(extended.definition.semantics?.action.main).toBe('var(--charm-color-secondary-500)');
    });

    it('provides base semantics to factory', () => {
      const base = defineTokens({
        primitives: {
          color: {
            primary: '#3b82f6',
          },
        },
        semantics: ({ primitive }) => ({
          surface: {
            primary: primitive('color', 'primary', 50),
          },
          action: {
            main: primitive('color', 'primary', 500),
          },
        }),
      });

      const extended = base.extendSemantics(({ primitive }, baseSemantics) => ({
        ...baseSemantics,
        custom: {
          value: primitive('color', 'primary', 700),
        },
      }));

      expect(extended.definition.semantics?.surface.primary).toBe('var(--charm-color-primary-50)');
      expect(extended.definition.semantics?.action.main).toBe('var(--charm-color-primary-500)');
      expect(extended.definition.semantics?.custom.value).toBe('var(--charm-color-primary-700)');
    });

    it('deep-merges the delta into inherited semantics without spreading base', () => {
      const base = defineTokens({
        primitives: {
          color: { primary: '#3b82f6', secondary: '#9333ea' },
        },
        semantics: ({ primitive }) => ({
          surface: {
            primary: primitive('color', 'primary', 50),
            secondary: primitive('color', 'primary', 100),
          },
          action: {
            main: primitive('color', 'primary', 500),
          },
        }),
      });

      // No spread, no base param - only the changed leaf is listed.
      const extended = base.extendSemantics(({ primitive }) => ({
        surface: {
          primary: primitive('color', 'secondary', 500),
        },
      }));

      // Overridden leaf changed
      expect(extended.definition.semantics?.surface.primary).toBe('var(--charm-color-secondary-500)');
      // Sibling key within the same group preserved
      expect(extended.definition.semantics?.surface.secondary).toBe('var(--charm-color-primary-100)');
      // Untouched group preserved
      expect(extended.definition.semantics?.action.main).toBe('var(--charm-color-primary-500)');
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
        components: ({ primitive }) => ({
          button: {
            borderRadius: primitive('borderRadius', 'sm'),
          },
        }),
      });

      const extended = base.extendComponents(({ primitive }, baseComponents) => ({
        ...baseComponents,
        button: {
          ...baseComponents?.button,
          borderRadius: primitive('borderRadius', 'full'),
        },
      }));

      expect(extended.definition.components?.button.borderRadius).toBe('var(--charm-border-radius-full)');
    });

    it('allows adding new component tokens', () => {
      const base = defineTokens({
        primitives: {
          spacing: {
            sm: '0.5rem',
          },
        },
        components: ({ primitive }) => ({
          button: {
            padding: primitive('spacing', 'sm'),
          },
        }),
      });

      const extended = base.extendComponents(({ primitive }, baseComponents) => ({
        ...baseComponents,
        card: {
          padding: primitive('spacing', 'sm'),
        },
      }));

      expect(extended.definition.components?.button.padding).toBe('var(--charm-spacing-sm)');
      expect(extended.definition.components?.card.padding).toBe('var(--charm-spacing-sm)');
    });

    it('deep-merges the delta into inherited components without spreading base', () => {
      const base = defineTokens({
        primitives: {
          borderRadius: { sm: '4px', full: '9999px' },
          spacing: { sm: '0.5rem' },
        },
        components: ({ primitive }) => ({
          button: {
            borderRadius: primitive('borderRadius', 'sm'),
            padding: primitive('spacing', 'sm'),
          },
        }),
      });

      // No spread, no base param - only the changed leaf is listed.
      const extended = base.extendComponents(({ primitive }) => ({
        button: {
          borderRadius: primitive('borderRadius', 'full'),
        },
      }));

      // Overridden leaf changed
      expect(extended.definition.components?.button.borderRadius).toBe('var(--charm-border-radius-full)');
      // Sibling key within the same component preserved
      expect(extended.definition.components?.button.padding).toBe('var(--charm-spacing-sm)');
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
        semantics: ({ primitive }) => ({
          action: {
            main: primitive('color', 'primary', 500),
          },
        }),
        components: ({ semantic }) => ({
          button: {
            bgColor: semantic('action', 'main'),
          },
        }),
      });

      const extended = base
        .extendPrimitives({
          color: {
            brand: '#ff6600',
          },
        })
        .extendSemantics(({ primitive }, baseSem) => ({
          ...baseSem,
          action: {
            ...baseSem?.action,
            secondary: primitive('color', 'brand', 500),
          },
        }))
        .extendComponents(({ primitive }, baseComp) => ({
          ...baseComp,
          button: {
            ...baseComp?.button,
            borderRadius: primitive('borderRadius', 'md'),
          },
        }));

      expect(extended.definition.primitives.color?.brand).toBe('#ff6600');
      expect(extended.definition.semantics?.action.secondary).toBe('var(--charm-color-brand-500)');
      expect(extended.definition.components?.button.borderRadius).toBe('var(--charm-border-radius-md)');
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
  });

  describe('rawCss', () => {
    it('stores rawCss in definition', () => {
      const tokens = defineTokens({
        primitives: {
          color: { primary: '#3b82f6' },
        },
        rawCss: {
          reset: 'html { scroll-behavior: smooth; }',
          theme: '@font-face { font-family: "Brand"; }',
          utilities: '.sr-only { position: absolute; }',
        },
      });

      expect(tokens.definition.rawCss?.reset).toBe('html { scroll-behavior: smooth; }');
      expect(tokens.definition.rawCss?.theme).toBe('@font-face { font-family: "Brand"; }');
      expect(tokens.definition.rawCss?.utilities).toBe('.sr-only { position: absolute; }');
    });

    it('allows partial rawCss', () => {
      const tokens = defineTokens({
        primitives: {
          color: { primary: '#3b82f6' },
        },
        rawCss: {
          reset: 'html { box-sizing: border-box; }',
        },
      });

      expect(tokens.definition.rawCss?.reset).toBe('html { box-sizing: border-box; }');
      expect(tokens.definition.rawCss?.theme).toBeUndefined();
      expect(tokens.definition.rawCss?.utilities).toBeUndefined();
    });
  });

  describe('extendRawCss', () => {
    it('appends raw CSS to existing', () => {
      const base = defineTokens({
        primitives: {
          color: { primary: '#3b82f6' },
        },
        rawCss: {
          reset: '/* base reset */',
          theme: '/* base theme */',
        },
      });

      const extended = base.extendRawCss({
        reset: '/* extended reset */',
        theme: '/* extended theme */',
      });

      expect(extended.definition.rawCss?.reset).toBe('/* base reset */\n/* extended reset */');
      expect(extended.definition.rawCss?.theme).toBe('/* base theme */\n/* extended theme */');
    });

    it('creates rawCss when base has none', () => {
      const base = defineTokens({
        primitives: {
          color: { primary: '#3b82f6' },
        },
      });

      const extended = base.extendRawCss({
        utilities: '.custom { display: flex; }',
      });

      expect(extended.definition.rawCss?.utilities).toBe('.custom { display: flex; }');
    });

    it('preserves base rawCss when addition is partial', () => {
      const base = defineTokens({
        primitives: {
          color: { primary: '#3b82f6' },
        },
        rawCss: {
          reset: '/* base reset */',
          theme: '/* base theme */',
        },
      });

      const extended = base.extendRawCss({
        utilities: '/* new utilities */',
      });

      expect(extended.definition.rawCss?.reset).toBe('/* base reset */');
      expect(extended.definition.rawCss?.theme).toBe('/* base theme */');
      expect(extended.definition.rawCss?.utilities).toBe('/* new utilities */');
    });

    it('accepts factory function with layer helpers', () => {
      const base = defineTokens(
        {
          primitives: {
            color: { primary: '#3b82f6' },
            spacing: { md: '1rem' },
          },
        },
        { prefix: 'app' }
      );

      const extended = base.extendRawCss(({ primitive }) => ({
        theme: `.custom { background: ${primitive('color', 'primary', 500)}; padding: ${primitive('spacing', 'md')}; }`,
      }));

      expect(extended.definition.rawCss?.theme).toBe(
        '.custom { background: var(--app-color-primary-500); padding: var(--app-spacing-md); }'
      );
    });

    it('factory receives inherited raw CSS as base and can append to it', () => {
      const base = defineTokens(
        {
          primitives: {
            color: { primary: '#3b82f6' },
          },
        },
        { prefix: 'app' }
      );

      const extended = base.extendRawCss({ theme: '/* plain css */' }).extendRawCss(({ primitive }, inherited) => ({
        theme: `${inherited?.theme ?? ''}\n.ref { color: ${primitive('color', 'primary', 500)}; }`,
      }));

      expect(extended.definition.rawCss?.theme).toBe('/* plain css */\n.ref { color: var(--app-color-primary-500); }');
    });

    it('factory return replaces inherited raw CSS (does not auto-append)', () => {
      const base = defineTokens({
        primitives: { color: { primary: '#3b82f6' } },
        rawCss: { theme: '/* inherited theme */' },
      });

      // Return a fresh value without interpolating base -> base is discarded.
      const extended = base.extendRawCss(() => ({ theme: '/* replaced theme */' }));

      expect(extended.definition.rawCss?.theme).toBe('/* replaced theme */');
    });

    it('factory can drop an inherited bucket by omitting it', () => {
      const base = defineTokens({
        primitives: { color: { primary: '#3b82f6' } },
        rawCss: {
          reset: '/* inherited reset */',
          theme: '/* inherited theme */',
        },
      });

      // Keep theme, drop reset by not returning it.
      const extended = base.extendRawCss((_, inherited) => ({ theme: inherited?.theme }));

      expect(extended.definition.rawCss?.reset).toBeUndefined();
      expect(extended.definition.rawCss?.theme).toBe('/* inherited theme */');
    });

    it('factory can drop all inherited raw CSS by returning an empty object', () => {
      const base = defineTokens({
        primitives: { color: { primary: '#3b82f6' } },
        rawCss: {
          reset: '/* inherited reset */',
          theme: '/* inherited theme */',
          utilities: '/* inherited utilities */',
        },
      });

      const extended = base.extendRawCss(() => ({}));

      expect(extended.definition.rawCss?.reset).toBeUndefined();
      expect(extended.definition.rawCss?.theme).toBeUndefined();
      expect(extended.definition.rawCss?.utilities).toBeUndefined();
    });
  });

  describe('rawCss preservation', () => {
    it('preserves rawCss through extendPrimitives', () => {
      const base = defineTokens({
        primitives: {
          color: { primary: '#3b82f6' },
        },
        rawCss: {
          reset: '/* custom reset */',
        },
      });

      const extended = base.extendPrimitives({
        color: { secondary: '#9333ea' },
      });

      expect(extended.definition.rawCss?.reset).toBe('/* custom reset */');
    });

    it('preserves rawCss through extendSemantics', () => {
      const base = defineTokens({
        primitives: {
          color: { primary: '#3b82f6' },
        },
        rawCss: {
          theme: '/* custom theme */',
        },
      });

      const extended = base.extendSemantics(({ primitive }) => ({
        action: { main: primitive('color', 'primary', 500) },
      }));

      expect(extended.definition.rawCss?.theme).toBe('/* custom theme */');
    });

    it('preserves rawCss through extendComponents', () => {
      const base = defineTokens({
        primitives: {
          spacing: { md: '1rem' },
        },
        rawCss: {
          utilities: '/* custom utilities */',
        },
      });

      const extended = base.extendComponents(({ primitive }) => ({
        button: { padding: primitive('spacing', 'md') },
      }));

      expect(extended.definition.rawCss?.utilities).toBe('/* custom utilities */');
    });

    it('supports chaining extendRawCss with other extensions', () => {
      const base = defineTokens({
        primitives: {
          color: { primary: '#3b82f6' },
        },
      });

      const extended = base
        .extendRawCss({ reset: '/* step 1 */' })
        .extendPrimitives({ color: { secondary: '#9333ea' } })
        .extendRawCss({ reset: '/* step 2 */' })
        .extendSemantics(({ primitive }) => ({
          action: { main: primitive('color', 'primary', 500) },
        }))
        .extendRawCss({ theme: '/* custom theme */' });

      expect(extended.definition.rawCss?.reset).toBe('/* step 1 */\n/* step 2 */');
      expect(extended.definition.rawCss?.theme).toBe('/* custom theme */');
      expect(extended.definition.primitives.color?.secondary).toBe('#9333ea');
    });
  });

  describe('updatePrefix', () => {
    const makeBase = () =>
      defineTokens({
        primitives: {
          color: { primary: '#3b82f6' },
          spacing: { md: '1rem' },
        },
        semantics: ({ primitive }) => ({
          surface: { primary: primitive('color', 'primary', 500) },
        }),
        components: ({ primitive, semantic }) => ({
          button: {
            bgColor: semantic('surface', 'primary'),
            padding: primitive('spacing', 'md'),
          },
        }),
      });

    it('re-prefixes the definition', () => {
      const tokens = makeBase().updatePrefix('app');

      expect(tokens.definition.prefix).toBe('app');
    });

    it('re-prefixes the references inside inherited semantic and component values', () => {
      const tokens = makeBase().updatePrefix('app');

      expect(tokens.definition.semantics?.surface.primary).toBe('var(--app-color-primary-500)');
      expect(tokens.definition.components?.button.bgColor).toBe('var(--app-surface-primary)');
      expect(tokens.definition.components?.button.padding).toBe('var(--app-spacing-md)');
    });

    it('re-prefixes the helpers', () => {
      const tokens = makeBase().updatePrefix('app');

      expect(tokens.helpers.color('primary', 500)).toBe('var(--app-color-primary-500)');
    });

    it('leaves the theme it was called on untouched', () => {
      const base = makeBase();
      base.updatePrefix('app');

      expect(base.definition.prefix).toBe('charm');
      expect(base.definition.semantics?.surface.primary).toBe('var(--charm-color-primary-500)');
    });

    it('propagates the prefix to themes derived afterwards', () => {
      const tokens = makeBase()
        .updatePrefix('app')
        .extendPrimitives({ color: { secondary: '#9333ea' } })
        .extendSemantics(({ primitive }) => ({
          text: { primary: primitive('color', 'secondary', 500) },
        }));

      expect(tokens.definition.prefix).toBe('app');
      expect(tokens.definition.semantics?.text.primary).toBe('var(--app-color-secondary-500)');
      // Inherited from before the extensions - must be re-prefixed too.
      expect(tokens.definition.semantics?.surface.primary).toBe('var(--app-color-primary-500)');
      expect(tokens.definition.components?.button.bgColor).toBe('var(--app-surface-primary)');
    });

    it('is order-independent within a chain', () => {
      const before = makeBase()
        .updatePrefix('app')
        .extendSemantics(({ primitive }) => ({
          text: { primary: primitive('color', 'primary', 900) },
        }));

      const after = makeBase()
        .extendSemantics(({ primitive }) => ({
          text: { primary: primitive('color', 'primary', 900) },
        }))
        .updatePrefix('app');

      expect(after.definition).toEqual(before.definition);
    });

    it('passes the re-prefixed base to an extendSemantics factory', () => {
      const tokens = makeBase()
        .updatePrefix('app')
        .extendSemantics((_helpers, base) => ({
          surface: { raised: base?.surface.primary ?? '' },
        }));

      expect(tokens.definition.semantics?.surface.raised).toBe('var(--app-color-primary-500)');
    });

    it('keeps the prefix when extending without it', () => {
      const tokens = makeBase().extendPrimitives({ color: { secondary: '#9333ea' } });

      expect(tokens.definition.prefix).toBe('charm');
      expect(tokens.definition.semantics?.surface.primary).toBe('var(--charm-color-primary-500)');
    });
  });
});
