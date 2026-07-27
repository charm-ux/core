// src/generator/lightDark.ts
import type { PrimitiveTokens, ResolvedTokenDefinition, TokenDefinition } from '../types/tokens.js';

/**
 * Check if a value is a LightDarkValue object (`{ light: string; dark: string }`).
 */
export function isLightDarkValue(value: unknown): value is { light: string; dark: string } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'light' in value &&
    'dark' in value &&
    typeof (value as { light: unknown; dark: unknown }).light === 'string' &&
    typeof (value as { light: unknown; dark: unknown }).dark === 'string'
  );
}

/**
 * Recursively check if any LightDarkValue exists in the value tree.
 */
export function containsLightDarkValue(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value !== 'object') {
    return false;
  }

  if (isLightDarkValue(value)) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.some(item => containsLightDarkValue(item));
  }

  return Object.values(value as Record<string, unknown>).some(val => containsLightDarkValue(val));
}

/**
 * Check if the token definition contains any LightDarkValue tokens.
 */
export function definitionHasLightDarkTokens<P extends PrimitiveTokens>(
  definition: TokenDefinition<P> | ResolvedTokenDefinition<P>
): boolean {
  if (containsLightDarkValue(definition.primitives)) {
    return true;
  }

  if ('semantics' in definition && definition.semantics && typeof definition.semantics !== 'function') {
    if (containsLightDarkValue(definition.semantics)) {
      return true;
    }
  }

  if ('components' in definition && definition.components && typeof definition.components !== 'function') {
    if (containsLightDarkValue(definition.components)) {
      return true;
    }
  }

  return false;
}

/**
 * Recursively resolve LightDarkValue objects to a specific mode.
 */
export function resolveToMode(value: unknown, mode: 'light' | 'dark'): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value !== 'object') {
    return value;
  }

  if (isLightDarkValue(value)) {
    return value[mode];
  }

  if (Array.isArray(value)) {
    return value.map(item => resolveToMode(item, mode));
  }

  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    result[key] = resolveToMode(val, mode);
  }
  return result;
}
