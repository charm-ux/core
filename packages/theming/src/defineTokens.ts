// src/defineTokens.ts
import {
  createComponentHelpers,
  createHelpers,
  type CreateHelpersOptions,
  createSemanticHelpers,
  cssVar,
  deepMerge,
  type TokenHelpers,
} from './helpers/index.js';
import type { TypedGet } from './helpers/typedGet.js';
import type {
  ComponentFactoryHelpers,
  ComponentRefFn,
  ComponentTokens,
  PrimitiveRefFn,
  PrimitiveTokens,
  RawCss,
  RawCssFactory,
  RawCssFactoryHelpers,
  ResolvedTokenDefinition,
  SemanticFactoryHelpers,
  SemanticRefFn,
  SemanticTokens,
  TokenDefinition,
} from './types/index.js';

function concatCss(base: string | undefined, addition: string | undefined): string | undefined {
  if (!base && !addition) return undefined;
  if (!base) return addition;
  if (!addition) return base;
  return `${base}\n${addition}`;
}

/**
 * Semantic token namespace with a typed `get()` accessor - provides
 * autocomplete for valid token paths based on the theme's actual semantic
 * definition, rather than a fixed schema.
 *
 * @example
 * ```ts
 * tokens.semantic.get('surface', 'primary')                  // -> autocompletes
 * tokens.semantic.get('formControl', 'focus', 'borderColor') // -> autocompletes
 * ```
 */
export type SemanticNamespace<S extends SemanticTokens = SemanticTokens> = {
  get: TypedGet<S>;
};

/**
 * Component token namespace with a typed `get()` accessor - provides
 * autocomplete for valid token paths based on the theme's actual component
 * definitions, rather than a fixed schema.
 *
 * @example
 * ```ts
 * tokens.component.get('button', 'bgColor')
 * tokens.component.get('checkbox', 'hover', 'borderColor')
 * ```
 */
export type ComponentNamespace<C extends ComponentTokens = ComponentTokens> = {
  get: TypedGet<C>;
};

/**
 * Return value of {@link defineTokens} - the resolved token definition plus
 * the type-safe helpers for referencing tokens, with chainable extension methods.
 */
export type DefinedTokens<
  P extends PrimitiveTokens = PrimitiveTokens,
  S extends SemanticTokens = SemanticTokens,
  C extends ComponentTokens = ComponentTokens,
> = {
  /** The resolved token definition (primitives + resolved semantics/components) */
  definition: ResolvedTokenDefinition<P, S, C>;
  /** Type-safe helpers for referencing tokens as CSS variables */
  helpers: TokenHelpers<P>;
  /** Generic, typed accessor for any semantic token path */
  semantic: SemanticNamespace<S>;
  /** Generic, typed accessor for any component token path */
  component: ComponentNamespace<C>;

  /**
   * Extend this theme with primitive overrides, returning a new theme.
   *
   * @example
   * ```ts
   * const customTokens = charmTokens.extendPrimitives({
   *   color: { brand: '#ff6600' },
   * });
   * ```
   */
  extendPrimitives: (overrides?: Partial<PrimitiveTokens>) => DefinedTokens<P, S, C>;

  /**
   * Extend this theme with new or overridden semantic tokens.
   *
   * The returned tokens are deep-merged into the inherited semantics, so you
   * only describe what changes - no need to spread `base`. Nested groups merge
   * key-by-key (inherited siblings are preserved). The inherited semantics are
   * still passed as the second arg (`base`) for when you need to derive a value
   * from them. Merging can add or override keys but cannot remove an inherited
   * one.
   *
   * @example
   * ```ts
   * const customTokens = charmTokens.extendSemantics(({ primitive }) => ({
   *   body: {
   *     bgColor: primitive('color', 'neutral', 900),
   *   },
   * }));
   * ```
   */
  extendSemantics: <NewS extends SemanticTokens>(
    factory: (helpers: SemanticFactoryHelpers<P>, base: S | undefined) => NewS
  ) => DefinedTokens<P, S & NewS, C>;

  /**
   * Extend this theme with new or overridden component tokens.
   *
   * The returned tokens are deep-merged into the inherited components, so you
   * only describe what changes - no need to spread `base`. Nested groups merge
   * key-by-key (inherited siblings are preserved). The inherited components are
   * still passed as the second arg (`base`) for when you need to derive a value
   * from them. Merging can add or override keys but cannot remove an inherited
   * one.
   *
   * @example
   * ```ts
   * const customTokens = charmTokens.extendComponents(({ primitive, semantic }) => ({
   *   button: {
   *     borderRadius: primitive('borderRadius', 'full'),
   *     bgColor: semantic('surface', 'primary'),
   *   },
   * }));
   * ```
   */
  extendComponents: <NewC extends ComponentTokens>(
    factory: (helpers: ComponentFactoryHelpers<P>, base: C | undefined) => NewC
  ) => DefinedTokens<P, S, C & NewC>;

  /**
   * Extend this theme with raw CSS injected into the generated files.
   *
   * Accepts either a plain object or a factory function - the two forms
   * combine with the inherited raw CSS differently:
   *
   * - **Plain object** - each bucket is *appended* after the base theme's
   *   value (the common case: adding CSS on top of what you inherited).
   * - **Factory function** - receives token helpers and the inherited raw CSS
   *   as `base`; its return value *replaces* the inherited raw CSS. This is
   *   how you opt out of or override inherited CSS: append by interpolating
   *   `base`, drop a bucket by omitting it, or replace it by returning a
   *   fresh value.
   *
   * @example
   * ```ts
   * // Plain object - appends after inherited CSS
   * const customTokens = charmTokens.extendRawCss({
   *   reset: `html { scroll-behavior: smooth; }`,
   * });
   *
   * // Factory function - full control via `base`
   * const customTokens = charmTokens.extendRawCss(({ primitive, semantic, component }, base) => ({
   *   // Append explicitly by interpolating the inherited value
   *   theme: `${base?.theme ?? ''}
   *     .brand-surface {
   *       background: ${primitive('color', 'primary', 500)};
   *       color: ${semantic('text', 'primary')};
   *       padding: ${component('button', 'paddingX')};
   *     }
   *   `,
   *   // `reset` and `utilities` omitted -> inherited values are dropped
   * }));
   * ```
   */
  extendRawCss: (additions: RawCssFactory<P>) => DefinedTokens<P, S, C>;
};

/**
 * Input accepted by {@link defineTokens} - primitives plus optional factory
 * functions for deriving semantic and component tokens from layer-specific
 * helpers (`primitive`, `semantic`, `component`).
 *
 * This is the same shape as {@link TokenDefinition}.
 */
export type DefineTokensInput<
  P extends PrimitiveTokens,
  S extends SemanticTokens = SemanticTokens,
  C extends ComponentTokens = ComponentTokens,
> = TokenDefinition<P, S, C>;

/**
 * Define a design token system from primitives, and optional semantic and
 * component layers that reference those primitives (or each other).
 *
 * Returns chainable methods for extending the theme:
 * - `.extendPrimitives()` - Override primitive values
 * - `.extendSemantics()` - Override/extend semantic tokens
 * - `.extendComponents()` - Override/extend component tokens
 * - `.extendRawCss()` - Append raw CSS to generated files
 *
 * @example
 * ```ts
 * const charmTokens = defineTokens({
 *   primitives: {
 *     color: { primary: '#3b82f6' },
 *     spacing: { sm: '0.5rem', md: '0.75rem' },
 *   },
 *   semantics: ({ primitive }) => ({
 *     surface: { primary: primitive('color', 'primary', 500) },
 *   }),
 *   components: ({ primitive, semantic }) => ({
 *     button: {
 *       background: semantic('surface', 'primary'),
 *       padding: primitive('spacing', 'md'),
 *     },
 *   }),
 * }, { prefix: 'charm' });
 *
 * // Extend with custom colors
 * const customTokens = charmTokens.extendPrimitives({
 *   color: { brand: '#ff6600' },
 * });
 *
 * charmTokens.helpers.color('primary', 500); // -> 'var(--charm-color-primary-500)'
 * ```
 */
export function defineTokens<
  P extends PrimitiveTokens,
  S extends SemanticTokens = SemanticTokens,
  C extends ComponentTokens = ComponentTokens,
>(input: DefineTokensInput<P, S, C>, options: CreateHelpersOptions = {}): DefinedTokens<P, S, C> {
  // Unlike the lower-level `cssVar()` helper (which defaults to a 'charm'
  // prefix), `defineTokens()` defaults to no prefix unless the caller opts
  // into one - either via `options.prefix` or `input.prefix`.
  const resolvedPrefix = options.prefix ?? input.prefix ?? '';
  const resolvedOptions: CreateHelpersOptions = {
    ...options,
    prefix: resolvedPrefix,
  };

  const helpers = createHelpers(input.primitives, resolvedOptions);
  const semanticHelpers = createSemanticHelpers(resolvedOptions);
  const componentHelpers = createComponentHelpers(resolvedOptions);

  // Create layer-specific ref functions
  const primitiveRef = ((...segments: (string | number)[]) =>
    cssVar(...segments, resolvedOptions)) as PrimitiveRefFn<P>;

  const semanticRef = ((...segments: (string | number)[]) => cssVar(...segments, resolvedOptions)) as SemanticRefFn;

  const componentRef = ((...segments: (string | number)[]) => cssVar(...segments, resolvedOptions)) as ComponentRefFn;

  // Create helper objects for each layer
  const semanticFactoryHelpers: SemanticFactoryHelpers<P> = { primitive: primitiveRef };
  const componentFactoryHelpers: ComponentFactoryHelpers<P> = { primitive: primitiveRef, semantic: semanticRef };
  const rawCssFactoryHelpers: RawCssFactoryHelpers<P> = {
    primitive: primitiveRef,
    semantic: semanticRef,
    component: componentRef,
  };

  const semantics = input.semantics ? input.semantics(semanticFactoryHelpers) : undefined;
  const components = input.components ? input.components(componentFactoryHelpers) : undefined;

  const definition: ResolvedTokenDefinition<P, S, C> = {
    primitives: input.primitives,
    ...(resolvedPrefix && { prefix: resolvedPrefix }),
    ...(semantics !== undefined && { semantics }),
    ...(components !== undefined && { components }),
    ...(input.rawCss && { rawCss: input.rawCss }),
  };

  return {
    definition,
    helpers,
    semantic: semanticHelpers as SemanticNamespace<S>,
    component: componentHelpers as ComponentNamespace<C>,

    extendPrimitives: (overrides?: Partial<PrimitiveTokens>): DefinedTokens<P, S, C> => {
      const mergedPrimitives = overrides ? (deepMerge(input.primitives, overrides) as P) : input.primitives;

      return defineTokens(
        {
          prefix: resolvedPrefix,
          primitives: mergedPrimitives,
          semantics: input.semantics,
          components: input.components,
          rawCss: input.rawCss,
        },
        { prefix: resolvedPrefix }
      );
    },

    extendSemantics: <NewS extends SemanticTokens>(
      factory: (helpers: SemanticFactoryHelpers<P>, base: S | undefined) => NewS
    ): DefinedTokens<P, S & NewS, C> => {
      return defineTokens(
        {
          prefix: resolvedPrefix,
          primitives: input.primitives,
          // Deep-merge the delta into the inherited semantics so callers only
          // describe what changes (spreading `base` still works, since merging
          // a superset is a no-op).
          semantics: h => {
            const delta = factory(h, semantics);
            return (semantics ? deepMerge<SemanticTokens>(semantics, delta) : delta) as S & NewS;
          },
          components: input.components,
          rawCss: input.rawCss,
        },
        { prefix: resolvedPrefix }
      );
    },

    extendComponents: <NewC extends ComponentTokens>(
      factory: (helpers: ComponentFactoryHelpers<P>, base: C | undefined) => NewC
    ): DefinedTokens<P, S, C & NewC> => {
      return defineTokens(
        {
          prefix: resolvedPrefix,
          primitives: input.primitives,
          semantics: input.semantics,
          // Deep-merge the delta into the inherited components (see above).
          components: h => {
            const delta = factory(h, components);
            return (components ? deepMerge<ComponentTokens>(components, delta) : delta) as C & NewC;
          },
          rawCss: input.rawCss,
        },
        { prefix: resolvedPrefix }
      );
    },

    extendRawCss: (additions: RawCssFactory<P>): DefinedTokens<P, S, C> => {
      // The factory form receives the inherited raw CSS as `base` and its
      // return value *replaces* it - the author controls appending (by
      // interpolating `base`), removing (by omitting a bucket), or replacing
      // (by returning a fresh value). The plain-object form keeps the
      // ergonomic append-after-inherited default.
      const mergedRawCss: RawCss =
        typeof additions === 'function'
          ? additions(rawCssFactoryHelpers, input.rawCss)
          : {
              reset: concatCss(input.rawCss?.reset, additions.reset),
              theme: concatCss(input.rawCss?.theme, additions.theme),
              utilities: concatCss(input.rawCss?.utilities, additions.utilities),
            };

      return defineTokens(
        {
          prefix: resolvedPrefix,
          primitives: input.primitives,
          semantics: input.semantics,
          components: input.components,
          rawCss: mergedRawCss,
        },
        { prefix: resolvedPrefix }
      );
    },
  };
}
