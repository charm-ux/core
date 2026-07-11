// src/generator/generateTokensJson.ts
import { formatHex, oklch, parse as parseCssColor } from 'culori';
import { cssVarName } from '../helpers/cssVar.js';
import { isAutoExpandColor, walkExpandedColors } from './colorPalette.js';
import { collectTokenTreeLeaves, resolveMaybeFactory, unwrapTokenMetadata } from './internal/tokenUtils.js';
import { isLightDarkValue, resolveToMode } from './lightDark.js';
import type {
  ComponentTokens,
  CubicBezierValue,
  PrimitiveTokens,
  ResolvedTokenDefinition,
  SemanticTokens,
  ShadowValue,
  TokenDefinition,
} from '../types/tokens.js';

/**
 * The 2025.10 W3C Design Tokens Community Group format schema this generator
 * targets. See https://www.designtokens.org/tr/2025.10/format/
 */
const DESIGN_TOKENS_FORMAT_SCHEMA = 'https://www.designtokens.org/schemas/2025.10/format.json';

/**
 * A best-effort DTCG `$type` hint. Unlike a strict schema, this is never
 * required to match - it's a soft signal derived from a primitive category
 * or property name that gets attached to the output when nothing about the
 * value's own shape contradicts it. Any category or property not covered by
 * a hint still gets walked and emitted; it just goes out with no `$type`
 * (or one wholly inferred from the value's own shape).
 */
type TypeHint =
  | 'color'
  | 'dimension'
  | 'duration'
  | 'cubicBezier'
  | 'shadow'
  | 'number'
  | 'fontFamily'
  | 'fontWeight'
  | undefined;

const PRIMITIVE_CATEGORY_TYPE_HINTS: Record<string, TypeHint> = {
  color: 'color',
  spacing: 'dimension',
  borderRadius: 'dimension',
  borderWidth: 'dimension',
  duration: 'duration',
  zIndex: 'number',
};

const TYPOGRAPHY_SUBCATEGORY_TYPE_HINTS: Record<string, TypeHint> = {
  fontFamily: 'fontFamily',
  fontSize: 'dimension',
  fontWeight: 'fontWeight',
  lineHeight: 'number',
  letterSpacing: 'dimension',
};

/**
 * Soft, best-effort hints from a semantic/component property name. These are
 * generic CSS-property-name conventions, not a closed registry of known
 * component/group names (there is no such registry - semantics/components
 * are user-extensible) - anything that doesn't match falls through with no
 * hint, and is still emitted using purely structural inference.
 */
const PROPERTY_NAME_TYPE_HINTS: Array<[RegExp, TypeHint]> = [
  [/color$/i, 'color'],
  [/^lineHeight$/i, 'number'],
  [/(width|height|size|radius|spacing|margin|padding|gap|offset|inset|indent)$/i, 'dimension'],
  [/duration$/i, 'duration'],
  [/weight$/i, 'fontWeight'],
  [/family$/i, 'fontFamily'],
];

function inferTypeHintFromPropertyName(name: string): TypeHint {
  for (const [pattern, hint] of PROPERTY_NAME_TYPE_HINTS) {
    if (pattern.test(name)) return hint;
  }
  return undefined;
}

const STRICT_DIMENSION_RE = /^(-?\d+(?:\.\d+)?)(px|rem)$/;
const LOOSE_DIMENSION_RE = /^-?\d+(?:\.\d+)?(px|rem|em|%|vh|vw|vmin|vmax|ch|ex|pt|pc|in|cm|mm|q)$/i;
const NUMBER_RE = /^-?\d+(?:\.\d+)?$/;
const ALIAS_RE = /^\{[^{}]+\}$/;
const VAR_REF_RE = /var\((--[a-zA-Z0-9-]+)(?:\s*,[^)]*)?\)/g;

function isCubicBezierArray(value: unknown): value is CubicBezierValue {
  return Array.isArray(value) && value.length === 4 && value.every(v => typeof v === 'number');
}

function isShadowLayer(value: unknown): value is ShadowValue {
  return (
    typeof value === 'object' &&
    value !== null &&
    'offsetX' in value &&
    'offsetY' in value &&
    'blur' in value &&
    'spread' in value &&
    'color' in value
  );
}

/**
 * Replace every `var(--x)` occurrence in a string with the `{alias.path}`
 * it corresponds to, per the alias map built from the actual definition.
 * Handles both a value that's entirely one alias and a composite value with
 * one or more `var()` references embedded in a larger CSS string (e.g.
 * `1px solid var(--charm-border-primary)`). References with no matching
 * entry (e.g. an auto-computed `--{prefix}-color-on-*` var with no source
 * token) are left as-is.
 */
function substituteAliases(value: string, aliasMap: Map<string, string>): string {
  return value.replace(VAR_REF_RE, (match, varName: string) => {
    const alias = aliasMap.get(varName);
    return alias ? `{${alias}}` : match;
  });
}

/** Convert a CSS color string to a structured DTCG color value via culori, in OKLCH. */
function toColorDtcgValue(raw: string): { $value: unknown; $type: 'color' } {
  const parsed = parseCssColor(raw);
  if (!parsed) {
    return { $value: raw, $type: 'color' };
  }
  const c = oklch(parsed);
  if (!c) {
    return { $value: raw, $type: 'color' };
  }
  const value: Record<string, unknown> = {
    colorSpace: 'oklch',
    components: [c.l ?? 0, c.c ?? 0, c.h ?? 0],
    hex: formatHex(parsed),
  };
  if (c.alpha !== undefined && c.alpha !== 1) {
    value.alpha = c.alpha;
  }
  return { $value: value, $type: 'color' };
}

/**
 * Convert a dimension-like string to a structured `{value, unit}` when the
 * unit is one the DTCG spec recognizes (`px`/`rem`). Any other unit (`%`,
 * `vh`, `deg`, ...) is real, present-in-the-theme data the spec doesn't have
 * a strict slot for - rather than rejecting it, it's kept as a plain string
 * so the token still shows up with everything callers need.
 */
function toDimensionDtcgValue(raw: string): { $value: unknown; $type: 'dimension' } {
  const strict = raw.match(STRICT_DIMENSION_RE);
  if (strict) {
    return { $value: { value: Number(strict[1]), unit: strict[2] }, $type: 'dimension' };
  }
  return { $value: raw, $type: 'dimension' };
}

type DtcgLeaf = {
  $value: unknown;
  $type?: string;
  $description?: string;
  $deprecated?: string | boolean;
};

/**
 * Convert an already-unwrapped value into a DTCG leaf value shape, using
 * structural inspection first and a soft `$type` hint as a fallback/tiebreaker
 * - never throwing on a value that doesn't fit cleanly, per the design goal
 * of surfacing whatever tokens actually exist rather than enforcing a fixed
 * schema of expected shapes.
 */
function valueToDtcg(value: unknown, hint: TypeHint, aliasMap: Map<string, string>): DtcgLeaf {
  if (isCubicBezierArray(value)) {
    return { $value: value, $type: 'cubicBezier' };
  }

  if (Array.isArray(value)) {
    if (value.length > 0 && value.every(isShadowLayer)) {
      return { $value: value.map(layer => shadowLayerToDtcg(layer, aliasMap)), $type: 'shadow' };
    }
    return hint ? { $value: value, $type: hint } : { $value: value };
  }

  if (isShadowLayer(value)) {
    return { $value: shadowLayerToDtcg(value, aliasMap), $type: 'shadow' };
  }

  if (typeof value === 'number') {
    return { $value: value, $type: hint ?? 'number' };
  }

  if (typeof value === 'boolean' || value === null) {
    return hint ? { $value: value, $type: hint } : { $value: value };
  }

  if (typeof value !== 'string') {
    return { $value: value };
  }

  // A value that's entirely one alias reference - we can't verify its shape,
  // but the hint (if any) is still worth attaching for downstream tooling.
  if (ALIAS_RE.test(value)) {
    return hint ? { $value: value, $type: hint } : { $value: value };
  }

  if (isAutoExpandColor(value)) {
    return toColorDtcgValue(value);
  }

  if (hint === 'dimension' || LOOSE_DIMENSION_RE.test(value)) {
    return toDimensionDtcgValue(value);
  }

  if (hint === 'duration' && /^-?\d+(?:\.\d+)?m?s$/.test(value)) {
    return { $value: value, $type: 'duration' };
  }

  if (NUMBER_RE.test(value)) {
    return { $value: Number(value), $type: hint ?? 'number' };
  }

  // Generic CSS keyword or composite shorthand (e.g. `1px solid {border.primary}`,
  // `flex-start`, `not-allowed`) - kept verbatim, tagged with the hint if we have one.
  return hint ? { $value: value, $type: hint } : { $value: value };
}

function shadowLayerToDtcg(shadow: ShadowValue, aliasMap: Map<string, string>): Record<string, unknown> {
  const dimensionValue = (v: string) => toDimensionDtcgValue(v).$value;
  const color = isLightDarkValue(shadow.color) ? shadow.color.light : shadow.color;

  return {
    color: substituteAliases(color, aliasMap),
    offsetX: dimensionValue(shadow.offsetX),
    offsetY: dimensionValue(shadow.offsetY),
    blur: dimensionValue(shadow.blur),
    spread: dimensionValue(shadow.spread),
    ...(shadow.inset && { inset: true }),
  };
}

/** Unwrap a `TokenWithMetadata<T>` wrapper, if present. */
function withMetadata(
  leaf: DtcgLeaf,
  description: string | undefined,
  deprecated: string | boolean | undefined
): DtcgLeaf {
  return {
    ...leaf,
    ...(description && { $description: description }),
    ...(deprecated !== undefined && { $deprecated: deprecated }),
  };
}

function primitiveLeafToDtcg(raw: unknown, hint: TypeHint, aliasMap: Map<string, string>): DtcgLeaf {
  const { value, description, deprecated } = unwrapTokenMetadata(raw);
  return withMetadata(valueToDtcg(value, hint, aliasMap), description, deprecated);
}

function flatMapToDtcg(
  tokenMap: Record<string, unknown>,
  hint: TypeHint,
  aliasMap: Map<string, string>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [name, raw] of Object.entries(tokenMap)) {
    result[name] = primitiveLeafToDtcg(raw, hint, aliasMap);
  }
  return result;
}

/**
 * Convert primitive colors to DTCG shape. Expansion (auto-palette vs.
 * preserved light/dark pair vs. explicit palette object) must happen on the
 * *original*, un-mode-resolved color value - a light/dark pair collapsed to
 * a plain string beforehand would look identical to a single base color
 * that's meant to be auto-expanded into a palette, which is why `mode` is
 * threaded through here instead of resolving the whole tree upfront.
 */
function colorGroupToDtcg(
  colors: NonNullable<PrimitiveTokens['color']>,
  mode?: 'light' | 'dark'
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const pick = (value: { light: string; dark: string }) => (mode ? value[mode] : value.light);

  walkExpandedColors(colors, ({ name, step, value }) => {
    const dtcg = toColorDtcgValue(isLightDarkValue(value) ? pick(value) : value);
    if (step !== undefined) {
      (result[name] as Record<string, unknown>) ??= {};
      (result[name] as Record<string, unknown>)[step] = dtcg;
    } else {
      result[name] = dtcg;
    }
  });

  return result;
}

/**
 * Convert primitive tokens to a DTCG group. Walks whatever categories are
 * actually present on `primitives` - `color` and `typography` get dedicated
 * handling (they have internal structure/CSS-var-naming quirks that need to
 * be modeled correctly - see {@link collectPrimitiveAliases}), and every
 * other category (known or user-added) is walked the same generic way.
 */
function primitivesToDtcg(
  primitives: PrimitiveTokens,
  aliasMap: Map<string, string>,
  mode?: 'light' | 'dark'
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [category, rawGroup] of Object.entries(primitives)) {
    if (rawGroup === undefined || rawGroup === null) continue;

    if (category === 'color') {
      result.color = colorGroupToDtcg(rawGroup as NonNullable<PrimitiveTokens['color']>, mode);
      continue;
    }

    if (category === 'typography') {
      const typo: Record<string, unknown> = {};
      for (const [subCategory, tokenMap] of Object.entries(rawGroup as Record<string, unknown>)) {
        if (!tokenMap) continue;
        typo[subCategory] = flatMapToDtcg(
          tokenMap as Record<string, unknown>,
          TYPOGRAPHY_SUBCATEGORY_TYPE_HINTS[subCategory],
          aliasMap
        );
      }
      result.typography = typo;
      continue;
    }

    if (category === 'timingFunction') {
      result.timingFunction = flatMapToDtcg(rawGroup as Record<string, unknown>, 'cubicBezier', aliasMap);
      continue;
    }

    if (category === 'shadow') {
      result.shadow = flatMapToDtcg(rawGroup as Record<string, unknown>, 'shadow', aliasMap);
      continue;
    }

    result[category] = flatMapToDtcg(
      rawGroup as Record<string, unknown>,
      PRIMITIVE_CATEGORY_TYPE_HINTS[category],
      aliasMap
    );
  }

  return result;
}

/**
 * Convert a semantic/component node to DTCG shape. Fully shape-agnostic: a
 * plain object with no metadata wrapper is always treated as a nested group
 * and recursed into, regardless of what the group/property is named - there
 * is no closed registry of expected group names to check against, since
 * semantics/components are user-extensible.
 */
function setNestedValue(target: Record<string, unknown>, path: string[], value: unknown): void {
  let current = target;
  for (const segment of path.slice(0, -1)) {
    const existing = current[segment];
    if (existing && typeof existing === 'object' && !Array.isArray(existing)) {
      current = existing as Record<string, unknown>;
    } else {
      const next: Record<string, unknown> = {};
      current[segment] = next;
      current = next;
    }
  }
  current[path[path.length - 1]] = value;
}

function semanticGroupToDtcg(group: Record<string, unknown>, aliasMap: Map<string, string>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [name, node] of Object.entries(group)) {
    const leaves = collectTokenTreeLeaves(node, {
      path: [name],
      isLeafValue: value => isShadowLayer(value),
    });

    for (const leaf of leaves) {
      const propertyName = leaf.path[leaf.path.length - 1];
      const hint = inferTypeHintFromPropertyName(propertyName);
      const substituted = typeof leaf.value === 'string' ? substituteAliases(leaf.value, aliasMap) : leaf.value;
      const dtcg = withMetadata(valueToDtcg(substituted, hint, aliasMap), leaf.description, leaf.deprecated);
      setNestedValue(result, leaf.path, dtcg);
    }
  }

  return result;
}

/**
 * Walk `primitives` and record the CSS variable name every leaf resolves to
 * (mirroring the exact naming `generateCss.ts` produces, including its one
 * structural quirk: `typography` sub-categories are flattened into the CSS
 * var name directly, e.g. `--{prefix}-font-family-{name}`, with no
 * `typography` segment) against the token's own path within this JSON
 * document (e.g. `primitives.typography.fontFamily.sans`). This is what
 * makes `{alias}` references possible without depending on a fixed registry
 * of category/group names: any `var(--x)` encountered later just gets
 * looked up here.
 */
function collectPrimitiveAliases(primitives: PrimitiveTokens, prefix: string, map: Map<string, string>): void {
  for (const [category, rawGroup] of Object.entries(primitives)) {
    if (rawGroup === undefined || rawGroup === null) continue;

    if (category === 'typography') {
      for (const [subCategory, tokenMap] of Object.entries(rawGroup as Record<string, unknown>)) {
        if (!tokenMap) continue;
        for (const name of Object.keys(tokenMap as Record<string, unknown>)) {
          map.set(cssVarName(prefix, subCategory, name), `primitives.typography.${subCategory}.${name}`);
        }
      }
      continue;
    }

    if (category === 'color') {
      walkExpandedColors(rawGroup as NonNullable<PrimitiveTokens['color']>, ({ name, step }) => {
        const varName = cssVarName(prefix, 'color', name, ...(step !== undefined ? [step] : []));
        const jsonPath = step !== undefined ? `primitives.color.${name}.${step}` : `primitives.color.${name}`;
        map.set(varName, jsonPath);
      });
      continue;
    }

    for (const name of Object.keys(rawGroup as Record<string, unknown>)) {
      map.set(cssVarName(prefix, category, name), `primitives.${category}.${name}`);
    }
  }
}

/**
 * Walk a semantic/component group and record each leaf's CSS var name
 * against its path (`semantics.surface.primary`, `components.button.bgColor`,
 * ...). Any plain object without a metadata wrapper or light/dark shape is
 * assumed to be a nested group and recursed into - there's no fixed set of
 * group names being matched against, since components/semantics are
 * user-extensible via `.extendSemantics()`/`.extendComponents()`.
 */
function collectGroupAliases(
  group: Record<string, unknown>,
  layerName: 'semantics' | 'components',
  prefix: string,
  map: Map<string, string>
): void {
  for (const [name, node] of Object.entries(group)) {
    const leaves = collectTokenTreeLeaves(node, {
      path: [name],
      isLeafValue: value => isShadowLayer(value),
    });
    for (const leaf of leaves) {
      map.set(cssVarName(prefix, ...leaf.path), [layerName, ...leaf.path].join('.'));
    }
  }
}

function buildAliasMap(
  primitives: PrimitiveTokens,
  semantics: SemanticTokens | undefined,
  components: ComponentTokens | undefined,
  prefix: string
): Map<string, string> {
  const map = new Map<string, string>();
  collectPrimitiveAliases(primitives, prefix, map);
  if (semantics) collectGroupAliases(semantics, 'semantics', prefix, map);
  if (components) collectGroupAliases(components, 'components', prefix, map);
  return map;
}

type AnyDefinition<P extends PrimitiveTokens = PrimitiveTokens> = TokenDefinition<P> | ResolvedTokenDefinition<P>;

/**
 * Generate tokens as a DTCG (W3C Design Tokens Community Group, 2025.10)
 * conformant JSON document - every leaf is `{ $value, $type? }`, and
 * `var()` references between layers are rewritten to `{group.token}` alias
 * syntax.
 *
 * This walks whatever categories/groups actually exist on the definition
 * rather than requiring them to match a fixed schema - custom primitive
 * categories and arbitrary semantic/component groups (added via
 * `.extendSemantics()`/`.extendComponents()`) are emitted the same way as
 * the built-in ones, using structural inference (plus soft, best-effort
 * `$type` hints) rather than a closed registry of expected shapes.
 */
export function generateTokensJson<P extends PrimitiveTokens>(definition: AnyDefinition<P>, prefix: string): string {
  const semantics = resolveMaybeFactory<P, SemanticTokens>(definition.semantics, prefix);
  const components = resolveMaybeFactory<P, ComponentTokens>(definition.components, prefix);

  const aliasMap = buildAliasMap(definition.primitives, semantics, components, prefix);

  const tokens: Record<string, unknown> = {
    $schema: DESIGN_TOKENS_FORMAT_SCHEMA,
    prefix,
    primitives: primitivesToDtcg(definition.primitives, aliasMap),
  };

  if (semantics) tokens.semantics = semanticGroupToDtcg(semantics, aliasMap);
  if (components) tokens.components = semanticGroupToDtcg(components, aliasMap);

  return JSON.stringify(tokens, null, 2);
}

/**
 * Generate tokens as a DTCG-conformant JSON document for a specific mode
 * (light or dark). `LightDarkValue` nodes anywhere in the tree are resolved
 * to the given mode before conversion - the alias map is built from the
 * mode-independent shape of the definition (a light/dark pair still maps to
 * exactly one CSS variable, regardless of which mode's value it holds).
 */
export function generateTokensJsonForMode<P extends PrimitiveTokens>(
  definition: AnyDefinition<P>,
  prefix: string,
  mode: 'light' | 'dark'
): string {
  const semantics = resolveMaybeFactory<P, SemanticTokens>(definition.semantics, prefix);
  const components = resolveMaybeFactory<P, ComponentTokens>(definition.components, prefix);

  const aliasMap = buildAliasMap(definition.primitives, semantics, components, prefix);

  // `color` is deliberately excluded from this whole-tree resolution and
  // passed to `primitivesToDtcg` in its original, unresolved shape - see
  // `colorGroupToDtcg` for why mode resolution must happen after (not
  // before) the auto-expand-vs-preserve-light/dark decision.
  const { color: rawColor, ...otherPrimitives } = definition.primitives;
  const resolvedPrimitives = {
    ...(resolveToMode(otherPrimitives, mode) as PrimitiveTokens),
    ...(rawColor !== undefined && { color: rawColor }),
  } as PrimitiveTokens;
  const resolvedSemantics = semantics ? (resolveToMode(semantics, mode) as SemanticTokens) : undefined;
  const resolvedComponents = components ? (resolveToMode(components, mode) as ComponentTokens) : undefined;

  const tokens: Record<string, unknown> = {
    $schema: DESIGN_TOKENS_FORMAT_SCHEMA,
    prefix,
    mode,
    primitives: primitivesToDtcg(resolvedPrimitives, aliasMap, mode),
  };

  if (resolvedSemantics) tokens.semantics = semanticGroupToDtcg(resolvedSemantics, aliasMap);
  if (resolvedComponents) tokens.components = semanticGroupToDtcg(resolvedComponents, aliasMap);

  return JSON.stringify(tokens, null, 2);
}
