// src/generator/formatShadow.ts
import { isLightDarkValue } from './lightDark.js';
import type { ShadowTokenValue, ShadowValue } from '../types/tokens.js';

/**
 * Format a single shadow layer as CSS `box-shadow` shorthand
 * (`[inset] offsetX offsetY blur spread color`). A light/dark shadow color
 * resolves to its light value - the surrounding generated CSS already
 * selects the right value at runtime via `light-dark()`/media-query blocks,
 * so only one needs to be embedded in this shorthand string.
 */
export function formatShadowLayer(shadow: ShadowValue): string {
  const color = isLightDarkValue(shadow.color) ? shadow.color.light : shadow.color;
  const parts = [shadow.inset ? 'inset' : undefined, shadow.offsetX, shadow.offsetY, shadow.blur, shadow.spread, color];
  return parts.filter(Boolean).join(' ');
}

/**
 * Format a shadow token (raw string, single layer, or array of layers) as a
 * CSS `box-shadow`-compatible value.
 */
export function formatShadowValue(value: ShadowTokenValue): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(formatShadowLayer).join(', ');
  return formatShadowLayer(value);
}
