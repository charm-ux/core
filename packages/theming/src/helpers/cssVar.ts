const DEFAULT_PREFIX = 'charm';

export type CssVarOptions = {
  prefix?: string;
  fallback?: string;
};

/**
 * Convert camelCase to kebab-case
 */
export function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Escape special characters in CSS identifiers
 */
export function escapeCssIdentifier(str: string): string {
  return str.replace(/([.:])/g, '\\$1');
}

/**
 * Build a CSS variable name (without var()) from path segments
 */
export function cssVarName(prefix: string, ...segments: (string | number)[]): string {
  const parts = segments.map(s => escapeCssIdentifier(toKebabCase(String(s))));
  return prefix ? `--${prefix}-${parts.join('-')}` : `--${parts.join('-')}`;
}

/**
 * Build a CSS var() reference from path segments
 */
export function cssVar(...args: (string | number | CssVarOptions)[]): string {
  const lastArg = args[args.length - 1];
  const hasOptions =
    typeof lastArg === 'object' &&
    lastArg !== null &&
    !Array.isArray(lastArg) &&
    typeof lastArg !== 'string' &&
    typeof lastArg !== 'number';

  const segments = hasOptions ? (args.slice(0, -1) as (string | number)[]) : (args as (string | number)[]);
  const options = hasOptions ? (lastArg as CssVarOptions) : {};

  const prefix = options.prefix !== undefined ? options.prefix : DEFAULT_PREFIX;
  const name = cssVarName(prefix, ...segments);

  if (options.fallback) {
    return `var(${name}, ${options.fallback})`;
  }
  return `var(${name})`;
}
