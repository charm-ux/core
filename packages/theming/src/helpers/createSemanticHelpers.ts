import { cssVar, type CssVarOptions, toKebabCase } from './cssVar.js';

/**
 * Semantic token helpers - provides generic accessor for any semantic token path.
 *
 * This accessor is shape-agnostic: it works for any semantic category, regardless
 * of how deeply nested it is (e.g. `surface.primary` or `formControl.focus.borderColor`).
 *
 * @example
 * ```ts
 * const helpers = createSemanticHelpers({ prefix: 'charm' });
 *
 * helpers.get('surface', 'primary')                    // → var(--charm-surface-primary)
 * helpers.get('body', 'bgColor')                        // → var(--charm-body-bg-color)
 * helpers.get('formControl', 'focus', 'borderColor')    // → var(--charm-form-control-focus-border-color)
 * ```
 */
export type SemanticHelpers = {
  /**
   * Generic accessor for any semantic token path.
   * Converts camelCase segments to kebab-case for CSS variable names.
   * Requires at least one path segment.
   */
  get: (...path: [string, ...string[]]) => string;
};

/**
 * Create semantic helpers for a token definition.
 */
export function createSemanticHelpers(options: CssVarOptions = {}): SemanticHelpers {
  return {
    get: (...path: [string, ...string[]]) => {
      if (path.length === 0) {
        throw new Error('semantic.get() requires at least one path segment');
      }
      const kebabPath = path.map(segment => toKebabCase(segment));
      return cssVar(...kebabPath, options);
    },
  };
}
