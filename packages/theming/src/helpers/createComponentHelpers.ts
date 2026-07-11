import { cssVar, toKebabCase, type CssVarOptions } from './cssVar.js';

/**
 * Component token helpers - provides generic accessor for any component token path.
 *
 * This accessor is shape-agnostic: it works for any component's token tree,
 * regardless of naming convention or nesting depth.
 *
 * @example
 * ```ts
 * const helpers = createComponentHelpers({ prefix: 'charm' });
 *
 * helpers.get('button', 'borderRadius')                       // → var(--charm-button-border-radius)
 * helpers.get('button', 'bgColor')                             // → var(--charm-button-bg-color)
 * helpers.get('checkbox', 'hover', 'borderColor')              // → var(--charm-checkbox-hover-border-color)
 * ```
 */
export type ComponentHelpers = {
  /**
   * Generic accessor for any component token path.
   * Converts camelCase segments to kebab-case for CSS variable names.
   * Requires at least one path segment.
   */
  get: (...path: [string, ...string[]]) => string;
};

/**
 * Create component helpers for a token definition.
 */
export function createComponentHelpers(options: CssVarOptions = {}): ComponentHelpers {
  return {
    get: (...path: [string, ...string[]]) => {
      if (path.length === 0) {
        throw new Error('component.get() requires at least one path segment');
      }
      const kebabPath = path.map(segment => toKebabCase(segment));
      return cssVar(...kebabPath, options);
    },
  };
}
