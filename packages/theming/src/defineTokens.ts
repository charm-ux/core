// src/defineTokens.ts
import { createHelpers, type TokenHelpers, type CreateHelpersOptions } from './helpers/index.js';
import type {
  PrimitiveTokens,
  SemanticTokens,
  ComponentTokens,
  TokenDefinition,
  ResolvedTokenDefinition,
} from './types/index.js';

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
 * Return value of {@link defineTokens} - the resolved token definition plus
 * the type-safe helpers for referencing tokens (e.g. in component styles).
 */
export type DefineTokensResult<
  P extends PrimitiveTokens,
  S extends SemanticTokens = SemanticTokens,
  C extends ComponentTokens = ComponentTokens,
> = {
  /** The resolved token definition (primitives + resolved semantics/components) */
  definition: ResolvedTokenDefinition<P, S, C>;
  /** Type-safe helpers for referencing tokens as CSS variables */
  helpers: TokenHelpers<P>;
};

/**
 * Define a design token system from primitives, and optional semantic and
 * component layers that reference those primitives (or each other).
 *
 * @example
 * ```ts
 * const { definition, helpers } = defineTokens({
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
 * helpers.color('primary', 500); // -> 'var(--charm-color-primary-500)'
 * ```
 */
export function defineTokens<
  P extends PrimitiveTokens,
  S extends SemanticTokens = SemanticTokens,
  C extends ComponentTokens = ComponentTokens,
>(input: DefineTokensInput<P, S, C>, options: CreateHelpersOptions = {}): DefineTokensResult<P, S, C> {
  // Unlike the lower-level `cssVar()` helper (which defaults to a 'charm'
  // prefix), `defineTokens()` defaults to no prefix unless the caller opts
  // into one - either via `options.prefix` or `input.prefix`.
  const resolvedOptions: CreateHelpersOptions = {
    ...options,
    prefix: options.prefix ?? input.prefix ?? '',
  };

  const helpers = createHelpers(input.primitives, resolvedOptions);

  const semantics = input.semantics ? input.semantics(helpers.ref) : undefined;
  const components = input.components ? input.components(helpers.ref) : undefined;

  const definition: ResolvedTokenDefinition<P, S, C> = {
    primitives: input.primitives,
    ...(input.prefix !== undefined && { prefix: input.prefix }),
    ...(semantics !== undefined && { semantics }),
    ...(components !== undefined && { components }),
  };

  return { definition, helpers };
}
