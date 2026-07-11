// src/defineTokens.ts
import {
  createComponentHelpers,
  createHelpers,
  type CreateHelpersOptions,
  createSemanticHelpers,
  deepMerge,
  type TokenHelpers,
} from './helpers/index.js';
import type { TypedGet } from './helpers/typedGet.js';
import type {
  ComponentTokens,
  PrimitiveTokens,
  RefHelper,
  ResolvedTokenDefinition,
  SemanticTokens,
  TokenDefinition,
} from './types/index.js';

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
   * Receives the base resolved semantics so you can spread them.
   *
   * @example
   * ```ts
   * const customTokens = charmTokens.extendSemantics((ref, base) => ({
   *   ...base,
   *   body: {
   *     ...base?.body,
   *     bgColor: ref('color', 'neutral', 900),
   *   },
   * }));
   * ```
   */
  extendSemantics: <NewS extends SemanticTokens>(
    factory: (ref: RefHelper<P>, base: S | undefined) => NewS
  ) => DefinedTokens<P, NewS, C>;

  /**
   * Extend this theme with new or overridden component tokens.
   * Receives the base resolved components so you can spread them.
   *
   * @example
   * ```ts
   * const customTokens = charmTokens.extendComponents((ref, base) => ({
   *   ...base,
   *   button: {
   *     ...base?.button,
   *     borderRadius: ref('borderRadius', 'full'),
   *   },
   * }));
   * ```
   */
  extendComponents: <NewC extends ComponentTokens>(
    factory: (ref: RefHelper<P>, base: C | undefined) => NewC
  ) => DefinedTokens<P, S, NewC>;
};

/**
 * @deprecated Use {@link DefinedTokens} instead.
 */
export type DefineTokensResult<
  P extends PrimitiveTokens,
  S extends SemanticTokens = SemanticTokens,
  C extends ComponentTokens = ComponentTokens,
> = DefinedTokens<P, S, C>;

/**
 * Input accepted by {@link defineTokens} - primitives plus optional factory
 * functions for deriving semantic and component tokens from a type-safe
 * `ref()` helper.
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
 *
 * @example
 * ```ts
 * const charmTokens = defineTokens({
 *   primitives: {
 *     color: { primary: '#3b82f6' },
 *     spacing: { sm: '0.5rem', md: '0.75rem' },
 *   },
 *   semantics: (ref) => ({
 *     surface: { primary: ref('color', 'primary', 500) },
 *   }),
 *   components: (ref) => ({
 *     button: { background: ref('surface', 'primary') },
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

  const semantics = input.semantics ? input.semantics(helpers.ref) : undefined;
  const components = input.components ? input.components(helpers.ref) : undefined;

  const definition: ResolvedTokenDefinition<P, S, C> = {
    primitives: input.primitives,
    ...(resolvedPrefix && { prefix: resolvedPrefix }),
    ...(semantics !== undefined && { semantics }),
    ...(components !== undefined && { components }),
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
        },
        { prefix: resolvedPrefix }
      );
    },

    extendSemantics: <NewS extends SemanticTokens>(
      factory: (ref: RefHelper<P>, base: S | undefined) => NewS
    ): DefinedTokens<P, NewS, C> => {
      return defineTokens(
        {
          prefix: resolvedPrefix,
          primitives: input.primitives,
          semantics: ref => factory(ref, semantics),
          components: input.components,
        },
        { prefix: resolvedPrefix }
      );
    },

    extendComponents: <NewC extends ComponentTokens>(
      factory: (ref: RefHelper<P>, base: C | undefined) => NewC
    ): DefinedTokens<P, S, NewC> => {
      return defineTokens(
        {
          prefix: resolvedPrefix,
          primitives: input.primitives,
          semantics: input.semantics,
          components: ref => factory(ref, components),
        },
        { prefix: resolvedPrefix }
      );
    },
  };
}
