import { type CSSResult } from 'lit';
import { charmDefinition } from '@charm-ux/theming/themes';
import { createCssHelpers, type CssHelpers } from '@charm-ux/theming/lit';
import type { ResolvedTokenDefinition } from '@charm-ux/theming';

// Local copy to avoid pulling in the `@charm-ux/theming` root barrel (and its culori-based generator)
// from component style modules. Matches `helpers/toKebabCase` in the theming package.
function toKebabCase(value: string): string {
  return value.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function varName(prefix: string, ...segments: (string | number)[]): string {
  const parts = segments.map(s => toKebabCase(String(s)));
  return `--${prefix}-${parts.join('-')}`;
}

let _themePrefix = 'charm';
let _themeDefinition: ResolvedTokenDefinition = charmDefinition;
let _themeHelpers = createCssHelpers(_themeDefinition, _themePrefix);

// Flips once any component style module has evaluated `tokens.lit`. Because Lit
// `css` templates bake their interpolations at module load, a prefix or definition
// change made after that point cannot affect already-imported components.
let _stylesEvaluated = false;

function rebuild() {
  _themeHelpers = createCssHelpers(_themeDefinition, _themePrefix);
  tokens.lit = _themeHelpers;
}

function warnIfStylesEvaluated(operation: string) {
  if (!_stylesEvaluated) return;
  console.warn(
    `[charm-ux] ${operation}() was called after component styles were already evaluated. ` +
      'Component styles bake CSS custom-property names at module load, so this change will not apply to ' +
      `components that were already imported. Call ${operation}() before importing any @charm-ux/core ` +
      'component modules.'
  );
}

const _varProxy = {
  primitive: (category: string, ...rest: (string | number)[]): string =>
    `var(${varName(_themePrefix, category, ...rest)})`,
  semantic: (...segments: (string | number)[]): string => `var(${varName(_themePrefix, ...segments)})`,
  component: (...segments: (string | number)[]): string => `var(${varName(_themePrefix, ...segments)})`,
};

const _propProxy = {
  primitive: (category: string, ...rest: (string | number)[]): string => varName(_themePrefix, category, ...rest),
  semantic: (...segments: (string | number)[]): string => varName(_themePrefix, ...segments),
  component: (...segments: (string | number)[]): string => varName(_themePrefix, ...segments),
};

/**
 * Token reference helpers for accessing design tokens in component styles and JS code.
 *
 * Contains three namespaces:
 *
 * - `tokens.lit` — Lit `CSSResult` values (`var(--charm-path)`) for use in `css` templates.
 * - `tokens.var` — Plain string `var()` references, suitable for JS contexts.
 * - `tokens.prop` — CSS custom property names only (`--charm-path`) for `setProperty`/`getPropertyValue`.
 *
 * Each namespace exposes `primitive()`, `semantic()`, and `component()` helpers
 * that stay in sync with the current theme configuration.
 *
 * @example
 * ```ts
 * import { tokens, setThemeDefinition } from '@charm-ux/core';
 *
 * // Lit component styles
 * const { component } = tokens.lit;
 * css`background: ${component('button', 'bgColor')};`
 *
 * // JS context
 * const surfaceVar = tokens.var.semantic('surface', 'primary');
 * element.style.setProperty(tokens.prop.semantic('surface', 'primary'), '#fff');
 * ```
 */
export const tokens: {
  lit: CssHelpers;
  var: {
    primitive: (category: string, ...rest: (string | number)[]) => string;
    semantic: (...segments: (string | number)[]) => string;
    component: (...segments: (string | number)[]) => string;
  };
  prop: {
    primitive: (category: string, ...rest: (string | number)[]) => string;
    semantic: (...segments: (string | number)[]) => string;
    component: (...segments: (string | number)[]) => string;
  };
} = {
  get lit(): CssHelpers {
    _stylesEvaluated = true;
    return _themeHelpers;
  },
  set lit(helpers: CssHelpers) {
    _themeHelpers = helpers;
  },
  var: _varProxy,
  prop: _propProxy,
};

/**
 * Set the CSS variable prefix for all theme tokens.
 *
 * Must be called before any component styles are evaluated.
 *
 * @param prefix - The prefix to use (e.g. `'fui'` → `--fui-button-bg-color`)
 */
export function setThemePrefix(prefix: string) {
  warnIfStylesEvaluated('setThemePrefix');
  _themePrefix = prefix;
  rebuild();
}

/**
 * Set the theme token definition and optionally the CSS variable prefix.
 *
 * Must be called before any component styles are evaluated.
 *
 * @param definition - The resolved token definition from `defineTokens()` or `charmTokens.extend*()`
 * @param prefix - Optional CSS variable prefix (defaults to the current prefix)
 */
export function setThemeDefinition(definition: ResolvedTokenDefinition, prefix?: string) {
  warnIfStylesEvaluated('setThemeDefinition');
  _themeDefinition = definition;
  if (prefix !== undefined) _themePrefix = prefix;
  rebuild();
}

/**
 * Streamlined Lit CSS helpers for component styles.
 *
 * These delegate through `tokens.lit` so they reflect runtime prefix changes
 * made via `setThemePrefix()` / `setThemeDefinition()`.
 *
 * @example
 * ```ts
 * import { component } from '../../utilities/theme.js';
 * css`background: ${component('button', 'bgColor')};`
 * ```
 */
export function primitive(...args: (string | number)[]): CSSResult {
  return tokens.lit.primitive(...args);
}
export function semantic(...args: (string | number)[]): CSSResult {
  return tokens.lit.semantic(...args);
}
export function component(...args: (string | number)[]): CSSResult {
  return tokens.lit.component(...args);
}
