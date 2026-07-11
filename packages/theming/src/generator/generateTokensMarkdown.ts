// src/generator/generateTokensMarkdown.ts
import { cssVar, cssVarName } from '../helpers/cssVar.js';
import { expandColors, isLightDarkValue, getContrastColor, getColorScheme } from './colorPalette.js';
import type {
  PrimitiveTokens,
  SemanticTokens,
  ComponentTokens,
  TokenDefinition,
  ResolvedTokenDefinition,
  RefHelper,
  LightDarkValue,
  TokenMap,
  ShadowTokenValue,
  ShadowValue,
  CubicBezierValue,
} from '../types/tokens.js';

/**
 * Colors with no meaningful visible value - documenting an auto-computed
 * on-color/scheme for these would be misleading, so they're skipped.
 * Mirrors the skip list in generateCss.ts.
 */
const AUTO_COLOR_DOC_SKIP_LIST = new Set(['transparent']);

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/** Unwrap a `TokenWithMetadata<T>` wrapper, if present, returning the inner value plus any metadata. */
function unwrapMetadata(value: unknown): {
  value: unknown;
  description?: string;
  deprecated?: string | boolean;
} {
  if (typeof value === 'object' && value !== null && 'value' in value && !('light' in value && 'dark' in value)) {
    const wrapper = value as { value: unknown; description?: string; deprecated?: string | boolean };
    return { value: wrapper.value, description: wrapper.description, deprecated: wrapper.deprecated };
  }
  return { value };
}

/** Resolve a semantics/components field that may be a factory function or an already-resolved object. */
function resolveGroup<P extends PrimitiveTokens, T extends Record<string, unknown>>(
  input: T | ((ref: RefHelper<P>) => T) | undefined,
  prefix: string
): T | undefined {
  if (input === undefined) return undefined;
  if (typeof input === 'function') {
    const ref = ((...segments: (string | number)[]) => cssVar(...segments, { prefix })) as unknown as RefHelper<P>;
    return (input as (ref: RefHelper<P>) => T)(ref);
  }
  return input;
}

type TokenLeaf = {
  path: string[];
  value: string | LightDarkValue;
  description?: string;
  deprecated?: string | boolean;
};

/** Recursively walk a semantic/component token tree into a flat list of leaves. */
function walkTokenTree(node: unknown, path: string[] = []): TokenLeaf[] {
  if (node === null || node === undefined) return [];

  const { value, description, deprecated } = unwrapMetadata(node);

  if (typeof value === 'string') {
    return [{ path, value, description, deprecated }];
  }
  if (isLightDarkValue(value)) {
    return [{ path, value: value as LightDarkValue, description, deprecated }];
  }
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) =>
      walkTokenTree(child, [...path, key])
    );
  }
  return [{ path, value: String(value), description, deprecated }];
}

/** Render a leaf's value for a markdown table cell. */
function renderLeafValue(value: string | LightDarkValue): string {
  if (isLightDarkValue(value)) {
    return `Light: \`${value.light}\`<br>Dark: \`${value.dark}\``;
  }
  return `\`${value}\``;
}

function renderLeafNotes(leaf: TokenLeaf): string {
  const notes: string[] = [];
  if (leaf.description) notes.push(leaf.description);
  if (leaf.deprecated) {
    notes.push(typeof leaf.deprecated === 'string' ? `Deprecated: ${leaf.deprecated}` : 'Deprecated');
  }
  return notes.join(' ');
}

/** Render a flat list of token leaves as a markdown table (Path / CSS Variable / Value / Notes). */
function renderLeafTable(leaves: TokenLeaf[], prefix: string, basePath: string[] = []): string[] {
  if (leaves.length === 0) return [];

  const hasNotes = leaves.some(leaf => renderLeafNotes(leaf) !== '');
  const header = hasNotes ? '| Path | CSS Variable | Value | Notes |' : '| Path | CSS Variable | Value |';
  const divider = hasNotes ? '|------|--------------|-------|-------|' : '|------|--------------|-------|';

  const rows = leaves.map(leaf => {
    const fullPath = [...basePath, ...leaf.path];
    const dotPath = fullPath.join('.');
    const varName = cssVarName(prefix, ...fullPath);
    const valueCell = renderLeafValue(leaf.value);
    return hasNotes
      ? `| \`${dotPath}\` | \`${varName}\` | ${valueCell} | ${renderLeafNotes(leaf)} |`
      : `| \`${dotPath}\` | \`${varName}\` | ${valueCell} |`;
  });

  return [header, divider, ...rows];
}

function firstEntry<T>(obj: Record<string, T> | undefined): [string, T] | undefined {
  if (!obj) return undefined;
  const entries = Object.entries(obj);
  return entries.length > 0 ? entries[0] : undefined;
}

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

function formatShadowLayer(shadow: ShadowValue): string {
  const color = isLightDarkValue(shadow.color) ? shadow.color.light : shadow.color;
  const parts = [shadow.inset ? 'inset' : undefined, shadow.offsetX, shadow.offsetY, shadow.blur, shadow.spread, color];
  return parts.filter(Boolean).join(' ');
}

function formatShadowValue(value: ShadowTokenValue): string {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map(formatShadowLayer).join(', ');
  return formatShadowLayer(value);
}

function isCubicBezier(value: unknown): value is CubicBezierValue {
  return Array.isArray(value) && value.length === 4 && value.every(v => typeof v === 'number');
}

/**
 * Colors are already fully documented (name -> value) in the `primitive`
 * frontmatter, so this table drops the value column and lists only what the
 * frontmatter can't express: the CSS variable backing each token.
 */
function renderColorPrimitives(colors: NonNullable<PrimitiveTokens['color']>, prefix: string): string[] {
  const lines = ['### Colors', ''];
  const expanded = expandColors(colors);

  for (const [name, value] of Object.entries(expanded)) {
    if (isLightDarkValue(value)) {
      lines.push(`#### \`${name}\` (base color, no palette expansion)`, '');
      lines.push('| Mode | CSS Variable |');
      lines.push('|------|--------------|');
      lines.push(`| Light | \`${cssVarName(prefix, 'color', name)}\` |`);
      lines.push(`| Dark | \`${cssVarName(prefix, 'color', name)}\` |`);
      lines.push('');
    } else if (typeof value === 'object' && value !== null) {
      lines.push(`#### \`${name}\` (palette)`, '');
      lines.push('| Step | CSS Variable |');
      lines.push('|------|--------------|');
      for (const step of Object.keys(value)) {
        lines.push(`| ${step} | \`${cssVarName(prefix, 'color', name, step)}\` |`);
      }
      lines.push('');
    } else {
      lines.push(`| \`${name}\` | \`${cssVarName(prefix, 'color', name)}\` |`, '');
    }
  }

  return lines;
}

/** Every flat scale category is fully documented in the `primitive` frontmatter, so this table drops the value column. */
function renderFlatTokenMap(title: string, category: string, tokenMap: TokenMap, prefix: string): string[] {
  const lines = [`### ${title}`, '', '| Name | CSS Variable |', '|------|--------------|'];
  for (const name of Object.keys(tokenMap)) {
    lines.push(`| \`${name}\` | \`${cssVarName(prefix, category, name)}\` |`);
  }
  lines.push('');
  return lines;
}

/** Shadows are fully documented in the `primitive` frontmatter, so this table drops the value column. */
function renderShadowPrimitives(shadows: NonNullable<PrimitiveTokens['shadow']>, prefix: string): string[] {
  const lines = ['### Shadows', '', '| Name | CSS Variable |', '|------|--------------|'];
  for (const name of Object.keys(shadows)) {
    lines.push(`| \`${name}\` | \`${cssVarName(prefix, 'shadow', name)}\` |`);
  }
  lines.push('');
  return lines;
}

/** Timing functions are fully documented in the `primitive` frontmatter, so this table drops the value column. */
function renderTimingFunctionPrimitives(
  timingFunctions: NonNullable<PrimitiveTokens['timingFunction']>,
  prefix: string
): string[] {
  const lines = ['### Timing Functions', '', '| Name | CSS Variable |', '|------|--------------|'];
  for (const name of Object.keys(timingFunctions)) {
    lines.push(`| \`${name}\` | \`${cssVarName(prefix, 'timing-function', name)}\` |`);
  }
  lines.push('');
  return lines;
}

/**
 * Typography is already fully documented (property -> name -> value) in
 * the `primitive` frontmatter, so - like colors - this table drops the
 * value column and lists only the CSS variable backing each token.
 */
function renderTypographyPrimitives(typography: NonNullable<PrimitiveTokens['typography']>, prefix: string): string[] {
  const lines = ['### Typography', ''];
  const subcategories: [string, string, TokenMap | undefined][] = [
    ['Font Families', 'font-family', typography.fontFamily],
    ['Font Sizes', 'font-size', typography.fontSize],
    ['Font Weights', 'font-weight', typography.fontWeight],
    ['Line Heights', 'line-height', typography.lineHeight],
    ['Letter Spacing', 'letter-spacing', typography.letterSpacing],
  ];

  for (const [title, category, tokenMap] of subcategories) {
    if (!tokenMap) continue;
    lines.push(`#### ${title}`, '', '| Name | CSS Variable |', '|------|--------------|');
    for (const name of Object.keys(tokenMap)) {
      lines.push(`| \`${name}\` | \`${cssVarName(prefix, category, name)}\` |`);
    }
    lines.push('');
  }

  return lines;
}

function renderPrimitivesSection(primitives: PrimitiveTokens, prefix: string): string[] {
  const lines = ['## Primitives', '', 'The foundational design values every other layer references.', ''];

  if (primitives.color) lines.push(...renderColorPrimitives(primitives.color, prefix));
  if (primitives.spacing) lines.push(...renderFlatTokenMap('Spacing', 'spacing', primitives.spacing, prefix));
  if (primitives.borderRadius) {
    lines.push(...renderFlatTokenMap('Border Radius', 'border-radius', primitives.borderRadius, prefix));
  }
  if (primitives.borderWidth) {
    lines.push(...renderFlatTokenMap('Border Width', 'border-width', primitives.borderWidth, prefix));
  }
  if (primitives.shadow) lines.push(...renderShadowPrimitives(primitives.shadow, prefix));
  if (primitives.typography) lines.push(...renderTypographyPrimitives(primitives.typography, prefix));
  if (primitives.duration) {
    lines.push(...renderFlatTokenMap('Duration', 'duration', primitives.duration, prefix));
  }
  if (primitives.timingFunction) lines.push(...renderTimingFunctionPrimitives(primitives.timingFunction, prefix));
  if (primitives.zIndex) lines.push(...renderFlatTokenMap('Z-Index', 'z-index', primitives.zIndex, prefix));

  return lines;
}

// ---------------------------------------------------------------------------
// Quick reference
// ---------------------------------------------------------------------------

type QuickRefRow = {
  properties: string;
  helper: string;
  present: (p: PrimitiveTokens) => boolean;
};

const QUICK_REF_ROWS: QuickRefRow[] = [
  {
    properties: '`color`, `background-color`, `border-color`, `fill`, `stroke`',
    helper: "helpers.color('name', step?)",
    present: p => !!p.color,
  },
  { properties: '`margin`, `padding`, `gap`', helper: "helpers.spacing('name')", present: p => !!p.spacing },
  { properties: '`border-radius`', helper: "helpers.borderRadius('name')", present: p => !!p.borderRadius },
  { properties: '`border-width`', helper: "helpers.borderWidth('name')", present: p => !!p.borderWidth },
  { properties: '`box-shadow`', helper: "helpers.shadow('name')", present: p => !!p.shadow },
  { properties: '`font-family`', helper: "helpers.fontFamily('name')", present: p => !!p.typography?.fontFamily },
  { properties: '`font-size`', helper: "helpers.fontSize('name')", present: p => !!p.typography?.fontSize },
  { properties: '`font-weight`', helper: "helpers.fontWeight('name')", present: p => !!p.typography?.fontWeight },
  { properties: '`line-height`', helper: "helpers.lineHeight('name')", present: p => !!p.typography?.lineHeight },
  {
    properties: '`letter-spacing`',
    helper: "helpers.letterSpacing('name')",
    present: p => !!p.typography?.letterSpacing,
  },
  {
    properties: '`transition-duration`, `animation-duration`',
    helper: "helpers.duration('name')",
    present: p => !!p.duration,
  },
  {
    properties: '`transition-timing-function`, `animation-timing-function`',
    helper: "helpers.timingFunction('name')",
    present: p => !!p.timingFunction,
  },
  { properties: '`z-index`', helper: "helpers.zIndex('name')", present: p => !!p.zIndex },
];

/** Property -> helper lookup, filtered to categories this theme actually defines. */
function renderQuickReferenceSection(primitives: PrimitiveTokens): string[] {
  const rows = QUICK_REF_ROWS.filter(row => row.present(primitives));
  if (rows.length === 0) return [];

  const lines = [
    '## Quick Reference',
    '',
    'Before reaching for a primitive helper directly, check whether a semantic or',
    'component token already covers your case - primitives are the last resort,',
    'not the first.',
    '',
    '| CSS Property | Primitive Helper |',
    '|--------------|-------------------|',
  ];
  for (const row of rows) {
    lines.push(`| ${row.properties} | \`${row.helper}\` |`);
  }
  lines.push('');
  return lines;
}

// ---------------------------------------------------------------------------
// Semantic / component tokens (shape-agnostic)
// ---------------------------------------------------------------------------

/**
 * Render a semantics or components object. Both share the same recursive
 * shape - a map of top-level category/component names to (possibly nested)
 * token groups - so this walks the tree dynamically instead of assuming any
 * fixed set of category names or nesting depth.
 */
function renderTokenGroupSection(
  heading: string,
  intro: string,
  group: Record<string, unknown>,
  prefix: string
): string[] {
  const lines = [`## ${heading}`, '', intro, ''];

  for (const [categoryName, categoryValue] of Object.entries(group)) {
    lines.push(`### \`${categoryName}\``, '');
    const leaves = walkTokenTree(categoryValue);
    lines.push(...renderLeafTable(leaves, prefix, [categoryName]));
    lines.push('');
  }

  return lines;
}

// ---------------------------------------------------------------------------
// Dark mode / auto-generated accessibility helpers
// ---------------------------------------------------------------------------

function renderColorOnSchemeSection(primitives: PrimitiveTokens, prefix: string): string[] {
  if (!primitives.color) return [];

  const lines = [
    '## Accessible Text Color & Color Scheme',
    '',
    'Every primitive color automatically gets two derived CSS variables, computed from its luminance:',
    '',
    `- \`--${prefix}-color-on-{name}[-{step}]\` - the more accessible of black or white for text/icons placed on top of that color.`,
    `- \`--${prefix}-color-scheme-{name}[-{step}]\` - the literal keyword \`light\` or \`dark\`, for feeding into the CSS \`color-scheme\` property or JS logic.`,
    '',
  ];

  const expanded = expandColors(primitives.color);
  const example = Object.entries(expanded).find(([name]) => !AUTO_COLOR_DOC_SKIP_LIST.has(name));

  if (example) {
    const [name, value] = example;
    const sample = isLightDarkValue(value)
      ? value.light
      : typeof value === 'object' && value !== null
        ? String(Object.values(value)[0])
        : String(value);

    lines.push(
      '**Example:**',
      '',
      `Given \`${name}\`: \`${sample}\` →`,
      `- \`${cssVarName(prefix, 'color', 'on', name)}\`: \`${getContrastColor(sample)}\``,
      `- \`${cssVarName(prefix, 'color', 'scheme', name)}\`: \`${getColorScheme(sample)}\``,
      ''
    );
  }

  return lines;
}

function renderDarkModeSection(): string[] {
  return [
    '## Dark Mode',
    '',
    "Colors with light/dark variants resolve automatically based on the user's",
    'system preference (`prefers-color-scheme`) or an explicit `[data-theme]`',
    'override, depending on how the theme was generated. You never need to write',
    'dark-mode-specific CSS in consuming code - reference the semantic or',
    'component token and the correct value is already selected for you.',
    '',
  ];
}

// ---------------------------------------------------------------------------
// DESIGN.md-spec YAML frontmatter
// https://github.com/google-labs-code/design.md/blob/main/docs/spec.md
// ---------------------------------------------------------------------------

function yamlScalar(value: unknown): string {
  if (value === null) return 'null';
  if (typeof value === 'boolean' || typeof value === 'number') return String(value);
  const str = String(value);
  return /^[\w./%-]+$/.test(str) ? str : JSON.stringify(str);
}

/** Minimal, generic JS-value-to-YAML-lines formatter - only handles the plain shapes DTCG leaves produce. */
function toYamlLines(value: unknown, indent = 0): string[] {
  const pad = '  '.repeat(indent);

  if (Array.isArray(value)) {
    if (value.length === 0) return [`${pad}[]`];
    return value.flatMap(item => {
      if (item !== null && typeof item === 'object') {
        const [first, ...rest] = toYamlLines(item, indent + 1);
        return [`${pad}- ${first.trim()}`, ...rest];
      }
      return [`${pad}- ${yamlScalar(item)}`];
    });
  }

  if (value !== null && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) => {
      const isEmptyContainer = typeof child === 'object' && child !== null && Object.keys(child).length === 0;
      if (child !== null && typeof child === 'object' && !isEmptyContainer) {
        return [`${pad}${key}:`, ...toYamlLines(child, indent + 1)];
      }
      return [`${pad}${key}: ${Array.isArray(child) ? '[]' : yamlScalar(child)}`];
    });
  }

  return [`${pad}${yamlScalar(value)}`];
}

const DESIGN_MD_VAR_REF_RE = /var\((--[a-zA-Z0-9-]+)(?:\s*,[^)]*)?\)/g;
const DESIGN_MD_MAX_REF_DEPTH = 5;

/**
 * Replace every `var(--x)` in a string with its DESIGN.md-conformant
 * replacement text - either a `{path}` token reference (already fully
 * formed, braces included, in `resolutionMap`) for a primitive category the
 * spec's schema has a slot for, or the primitive's literal resolved value
 * for one it doesn't (e.g. `border-width`, `duration`) - the spec allows a
 * component token value to be a plain string, just never a CSS `var()`. The
 * spec's schema has no `semantics` slot, so a reference that points at a
 * semantic token (one level of indirection above a primitive) is resolved
 * through `semanticVarMap` down to the primitive it ultimately reflects,
 * recursing up to `DESIGN_MD_MAX_REF_DEPTH` hops.
 */
function substituteDesignMdRefs(
  value: string,
  resolutionMap: Map<string, string>,
  semanticVarMap: Map<string, string>,
  depth = 0
): string {
  return value.replace(DESIGN_MD_VAR_REF_RE, (match, varName: string) => {
    const direct = resolutionMap.get(varName);
    if (direct !== undefined) return direct;
    if (depth < DESIGN_MD_MAX_REF_DEPTH) {
      const semanticRaw = semanticVarMap.get(varName);
      if (semanticRaw) {
        const resolved = substituteDesignMdRefs(semanticRaw, resolutionMap, semanticVarMap, depth + 1);
        if (!resolved.includes('var(')) return resolved;
      }
    }
    return match;
  });
}

/**
 * Map each semantic leaf's CSS var name to the raw value it holds (typically
 * itself a `var(--x)` pointing at a primitive), so component values that go
 * through one level of semantic indirection can still be resolved down to a
 * primitive `{path}` reference.
 */
function buildSemanticVarMap<S extends SemanticTokens>(semantics: S | undefined, prefix: string): Map<string, string> {
  const map = new Map<string, string>();
  if (!semantics) return map;
  for (const [categoryName, categoryValue] of Object.entries(semantics)) {
    for (const leaf of walkTokenTree(categoryValue)) {
      const varName = cssVarName(prefix, categoryName, ...leaf.path);
      const raw = isLightDarkValue(leaf.value) ? leaf.value.light : leaf.value;
      map.set(varName, raw);
    }
  }
  return map;
}

/**
 * Flatten `primitives.color` into `primitive.colors: <token-name>: <Color>`,
 * recording each token's YAML path in `resolutionMap` so component values
 * below can reference it. This deviates from the spec in two ways, both at
 * explicit user request: (1) colors nest under a top-level `primitive` key,
 * which the published schema doesn't define; (2) multi-step palettes nest
 * as `<family>: <step>: <Color>` rather than the spec's own dash-joined
 * reference example (`colors.primary-60`). Light/dark pairs use the light
 * value only - the spec's `colors` schema has no slot for a light/dark
 * pair, and dark-mode resolution stays automatic in the generated CSS
 * regardless.
 */
function buildDesignMdColors(
  colors: PrimitiveTokens['color'] | undefined,
  prefix: string,
  resolutionMap: Map<string, string>
): Record<string, string | Record<string, string>> {
  if (!colors) return {};
  const expanded = expandColors(colors);
  const result: Record<string, string | Record<string, string>> = {};

  for (const [name, value] of Object.entries(expanded)) {
    if (isLightDarkValue(value)) {
      result[name] = value.light;
      resolutionMap.set(cssVarName(prefix, 'color', name), `{primitive.colors.${name}}`);
    } else if (typeof value === 'object' && value !== null) {
      const family: Record<string, string> = {};
      for (const [step, stepValue] of Object.entries(value)) {
        family[step] = isLightDarkValue(stepValue) ? stepValue.light : String(stepValue);
        resolutionMap.set(cssVarName(prefix, 'color', name, step), `{primitive.colors.${name}.${step}}`);
      }
      result[name] = family;
    } else {
      result[name] = String(value);
      resolutionMap.set(cssVarName(prefix, 'color', name), `{primitive.colors.${name}}`);
    }
  }

  return result;
}

/**
 * Every primitive color also gets two auto-computed CSS variables
 * (`--{prefix}-color-on-{name}[-{step}]`, `--{prefix}-color-scheme-{name}[-{step}]`
 * - see `renderColorOnSchemeSection`). Neither has a source token, so a
 * component that references one has nothing to point a `{path}` reference
 * at; record its literal computed value instead so it never surfaces as a
 * raw `var()` in the frontmatter.
 */
function buildDesignMdAutoColorLiterals(
  colors: PrimitiveTokens['color'] | undefined,
  prefix: string,
  resolutionMap: Map<string, string>
): void {
  if (!colors) return;
  const expanded = expandColors(colors);

  for (const [name, value] of Object.entries(expanded)) {
    if (AUTO_COLOR_DOC_SKIP_LIST.has(name)) continue;
    if (isLightDarkValue(value) || typeof value !== 'object' || value === null) {
      const sample = isLightDarkValue(value) ? value.light : String(value);
      resolutionMap.set(cssVarName(prefix, 'color', 'on', name), getContrastColor(sample));
      resolutionMap.set(cssVarName(prefix, 'color', 'scheme', name), getColorScheme(sample));
    } else {
      for (const [step, stepValue] of Object.entries(value)) {
        const sample = isLightDarkValue(stepValue) ? stepValue.light : String(stepValue);
        resolutionMap.set(cssVarName(prefix, 'color', 'on', name, step), getContrastColor(sample));
        resolutionMap.set(cssVarName(prefix, 'color', 'scheme', name, step), getColorScheme(sample));
      }
    }
  }
}

const DESIGN_MD_TYPOGRAPHY_PROPERTIES: Record<string, { property: string; category: string }> = {
  fontFamily: { property: 'fontFamily', category: 'font-family' },
  fontSize: { property: 'fontSize', category: 'font-size' },
  fontWeight: { property: 'fontWeight', category: 'font-weight' },
  lineHeight: { property: 'lineHeight', category: 'line-height' },
  letterSpacing: { property: 'letterSpacing', category: 'letter-spacing' },
};

/**
 * Nest `primitives.typography`'s flat per-property maps into
 * `primitive.typography.<property>.<name>: <value>`, mirroring the
 * `colors.<family>.<step>` nesting - a deliberate deviation from the spec's
 * per-token `Typography` object shape, at the same explicit user request as
 * the color-palette nesting, to avoid dash-joining `<property>-<name>` into
 * a single flat key.
 */
function buildDesignMdTypography(
  typography: PrimitiveTokens['typography'] | undefined,
  prefix: string,
  resolutionMap: Map<string, string>
): Record<string, Record<string, string>> {
  if (!typography) return {};
  const result: Record<string, Record<string, string>> = {};

  for (const [subCategory, tokenMap] of Object.entries(typography)) {
    const mapping = DESIGN_MD_TYPOGRAPHY_PROPERTIES[subCategory];
    if (!tokenMap || !mapping) continue;
    const family: Record<string, string> = {};
    for (const [name, raw] of Object.entries(tokenMap)) {
      const { value } = unwrapMetadata(raw);
      family[name] = String(value);
      resolutionMap.set(
        cssVarName(prefix, mapping.category, name),
        `{primitive.typography.${mapping.property}.${name}}`
      );
    }
    result[mapping.property] = family;
  }

  return result;
}

/** Flatten a flat primitive token map (spacing, border-radius, border-width, duration, z-index) into `primitive.<yamlKey>`'s `<scale-level>: <Dimension>` shape. */
function buildDesignMdFlatScale(
  tokenMap: TokenMap | undefined,
  category: string,
  yamlKey: string,
  prefix: string,
  resolutionMap: Map<string, string>
): Record<string, string> {
  if (!tokenMap) return {};
  const result: Record<string, string> = {};
  for (const [name, raw] of Object.entries(tokenMap)) {
    const { value } = unwrapMetadata(raw);
    result[name] = String(value);
    resolutionMap.set(cssVarName(prefix, category, name), `{primitive.${yamlKey}.${name}}`);
  }
  return result;
}

/**
 * Same idea as {@link buildDesignMdFlatScale}, for shadows (formatted
 * layer syntax) - a primitive category the DESIGN.md schema has no
 * top-level slot for, given its own `primitive.shadow` group anyway, at
 * explicit user request that every primitive category be captured in the
 * frontmatter, not just the ones the spec happens to define.
 */
function buildDesignMdShadows(
  shadows: NonNullable<PrimitiveTokens['shadow']> | undefined,
  prefix: string,
  resolutionMap: Map<string, string>
): Record<string, string> {
  if (!shadows) return {};
  const result: Record<string, string> = {};
  for (const [name, raw] of Object.entries(shadows)) {
    const { value } = unwrapMetadata(raw);
    const rendered = formatShadowValue(value as ShadowTokenValue);
    result[name] = rendered;
    resolutionMap.set(cssVarName(prefix, 'shadow', name), `{primitive.shadow.${name}}`);
  }
  return result;
}

/** Same as {@link buildDesignMdShadows}, for timing functions (cubic-bezier or keyword syntax). */
function buildDesignMdTimingFunctions(
  timingFunctions: NonNullable<PrimitiveTokens['timingFunction']> | undefined,
  prefix: string,
  resolutionMap: Map<string, string>
): Record<string, string> {
  if (!timingFunctions) return {};
  const result: Record<string, string> = {};
  for (const [name, raw] of Object.entries(timingFunctions)) {
    const { value } = unwrapMetadata(raw);
    const rendered = isCubicBezier(value) ? `cubic-bezier(${value.join(', ')})` : String(value);
    result[name] = rendered;
    resolutionMap.set(cssVarName(prefix, 'timing-function', name), `{primitive.timingFunction.${name}}`);
  }
  return result;
}

/**
 * Set `value` at a nested path within `target`, creating intermediate
 * objects as needed - e.g. `setNestedPath(t, ['hover', 'bgColor'], 'x')`
 * produces `{ hover: { bgColor: 'x' } }`.
 */
function setNestedPath(target: Record<string, unknown>, path: string[], value: string): void {
  let node = target;
  for (const segment of path.slice(0, -1)) {
    const existing = node[segment];
    node =
      typeof existing === 'object' && existing !== null ? (existing as Record<string, unknown>) : (node[segment] = {});
  }
  node[path[path.length - 1] ?? 'value'] = value;
}

/**
 * Nest each component's token tree into `component-name: { ...tree }`,
 * preserving its original nested shape rather than dash-joining path
 * segments into a flat key - a deviation from the spec's stated
 * `<component-name>: <token-name>: <value>` two-level map, at the same
 * explicit user request as the `primitive` nesting above, for consistency.
 * Any resolved `var()` reference is rewritten into a spec `{path}` token
 * reference via `resolutionMap`.
 */
function buildDesignMdComponents<C extends ComponentTokens>(
  components: C | undefined,
  resolutionMap: Map<string, string>,
  semanticVarMap: Map<string, string>
): Record<string, Record<string, unknown>> {
  if (!components) return {};
  const result: Record<string, Record<string, unknown>> = {};

  for (const [componentName, componentValue] of Object.entries(components)) {
    const nested: Record<string, unknown> = {};
    for (const leaf of walkTokenTree(componentValue)) {
      const path = leaf.path.length > 0 ? leaf.path : ['value'];
      const raw = isLightDarkValue(leaf.value) ? leaf.value.light : leaf.value;
      setNestedPath(nested, path, substituteDesignMdRefs(raw, resolutionMap, semanticVarMap));
    }
    result[componentName] = nested;
  }

  return result;
}

/**
 * Render the document's YAML frontmatter, based on the DESIGN.md open
 * specification
 * (https://github.com/google-labs-code/design.md/blob/main/docs/spec.md),
 * with deliberate deviations requested by the design system's maintainers:
 * every primitive category nests under a top-level `primitive` key,
 * including `borderWidth`/`shadow`/`duration`/`timingFunction`/`zIndex`
 * (the published schema only defines `colors`/`typography`/`rounded`/
 * `spacing` as top-level siblings of `components`, with no wrapper and no
 * slot at all for the rest - captured here anyway so every primitive
 * category is represented, not just the ones the spec happens to define);
 * multi-step color palettes and per-property typography scales nest as
 * `<group>: <name>: <value>` rather than dash-joined keys (the spec's own
 * reference-syntax example uses a dash, e.g. `colors.primary-60`, but its
 * examples only ever show flat single-role names/tokens); and each
 * component's token tree keeps its original nested shape rather than being
 * dash-joined into the spec's stated `<component-name>: <token-name>:
 * <value>` two-level map. Every component value resolves to a `{path}`
 * token reference into this same YAML tree; the only literal fallback left
 * is for auto-computed on-color/scheme vars, which have no source
 * primitive to reference (see {@link buildDesignMdAutoColorLiterals}) -
 * per spec, a component token value is a string or a `{path}` reference,
 * never a CSS `var()`.
 */
function renderDesignMdFrontmatter<P extends PrimitiveTokens, S extends SemanticTokens, C extends ComponentTokens>(
  primitives: P,
  semantics: S | undefined,
  components: C | undefined,
  prefix: string
): string[] {
  const resolutionMap = new Map<string, string>();

  const colors = buildDesignMdColors(primitives.color, prefix, resolutionMap);
  const typography = buildDesignMdTypography(primitives.typography, prefix, resolutionMap);
  const rounded = buildDesignMdFlatScale(primitives.borderRadius, 'border-radius', 'rounded', prefix, resolutionMap);
  const spacing = buildDesignMdFlatScale(primitives.spacing, 'spacing', 'spacing', prefix, resolutionMap);
  const borderWidth = buildDesignMdFlatScale(
    primitives.borderWidth,
    'border-width',
    'borderWidth',
    prefix,
    resolutionMap
  );
  const duration = buildDesignMdFlatScale(primitives.duration, 'duration', 'duration', prefix, resolutionMap);
  const zIndex = buildDesignMdFlatScale(primitives.zIndex, 'z-index', 'zIndex', prefix, resolutionMap);
  const shadow = buildDesignMdShadows(primitives.shadow, prefix, resolutionMap);
  const timingFunction = buildDesignMdTimingFunctions(primitives.timingFunction, prefix, resolutionMap);
  buildDesignMdAutoColorLiterals(primitives.color, prefix, resolutionMap);

  const semanticVarMap = buildSemanticVarMap(semantics, prefix);
  const componentsYaml = buildDesignMdComponents(components, resolutionMap, semanticVarMap);

  const primitiveBody: Record<string, unknown> = {};
  if (Object.keys(colors).length > 0) primitiveBody.colors = colors;
  if (Object.keys(typography).length > 0) primitiveBody.typography = typography;
  if (Object.keys(rounded).length > 0) primitiveBody.rounded = rounded;
  if (Object.keys(spacing).length > 0) primitiveBody.spacing = spacing;
  if (Object.keys(borderWidth).length > 0) primitiveBody.borderWidth = borderWidth;
  if (Object.keys(shadow).length > 0) primitiveBody.shadow = shadow;
  if (Object.keys(duration).length > 0) primitiveBody.duration = duration;
  if (Object.keys(timingFunction).length > 0) primitiveBody.timingFunction = timingFunction;
  if (Object.keys(zIndex).length > 0) primitiveBody.zIndex = zIndex;

  const body: Record<string, unknown> = {};
  if (Object.keys(primitiveBody).length > 0) body.primitive = primitiveBody;
  if (Object.keys(componentsYaml).length > 0) body.components = componentsYaml;

  return [
    '---',
    'version: "alpha"',
    `name: "${prefix}"`,
    'description: "Design tokens generated by @charm-ux/theming, per the DESIGN.md open specification (https://github.com/google-labs-code/design.md)."',
    ...toYamlLines(body),
    '---',
    '',
  ];
}

/**
 * Points to the fully DTCG-conformant JSON export as the canonical,
 * complete machine-readable source - the frontmatter above is a
 * DESIGN.md-conformant summary, not a replacement for it.
 */
function renderMachineReadableSection(): string[] {
  return [
    '## Machine-Readable Token Data',
    '',
    'This document opens with a YAML frontmatter block conformant to the',
    '[DESIGN.md open specification](https://github.com/google-labs-code/design.md/blob/main/docs/spec.md),',
    'summarizing colors, typography, rounded (border-radius), spacing, and',
    'components as flat, machine-parseable data - component values that',
    "reference a primitive use the spec's `{path}` token-reference syntax (an",
    'object path into this same YAML tree), not a CSS `var()`.',
    '',
    'For a complete, precise export - every primitive category, dark-mode-',
    'resolved values, and description/deprecation metadata - use',
    '`generateTokensJson()` (or `generateTokensJsonForMode()` for a single',
    'resolved light/dark mode), which produce a fully',
    '[DTCG](https://www.designtokens.org/tr/2025.10/format/) (2025.10)-conformant',
    'JSON document. That JSON is the canonical machine-readable source; this',
    "file's frontmatter is a convenience summary.",
    '',
  ];
}

// ---------------------------------------------------------------------------
// API reference
// ---------------------------------------------------------------------------

function renderApiReferenceSection(
  primitives: PrimitiveTokens,
  semantics: SemanticTokens | undefined,
  components: ComponentTokens | undefined,
  prefix: string
): string[] {
  const lines = ['## Token API Reference', '', 'Runtime helpers for referencing tokens from TypeScript/Lit code.', ''];

  const expandedColors = primitives.color ? expandColors(primitives.color) : undefined;
  const paletteExample = expandedColors
    ? Object.entries(expandedColors).find(
        ([, value]) => typeof value === 'object' && value !== null && !isLightDarkValue(value)
      )
    : undefined;
  const baseColorExample = firstEntry(primitives.color);

  lines.push('### `helpers.*`', '', 'Typed accessors for primitive tokens, one per category:', '', '```ts');
  if (paletteExample) {
    const [name] = paletteExample;
    lines.push(
      `helpers.color('${name}', 500); // -> 'var(--${prefix}-color-${name}-500)'`,
      `helpers.colorOn('${name}', 500); // -> accessible text color for that background`,
      `helpers.colorScheme('${name}', 500); // -> 'light' | 'dark' keyword var`
    );
  } else if (baseColorExample) {
    const [name] = baseColorExample;
    lines.push(
      `helpers.color('${name}'); // -> 'var(--${prefix}-color-${name})'`,
      `helpers.colorOn('${name}'); // -> accessible text color for that background`,
      `helpers.colorScheme('${name}'); // -> 'light' | 'dark' keyword var`
    );
  } else {
    lines.push(
      `helpers.color('primary', 500);`,
      `helpers.colorOn('primary', 500);`,
      `helpers.colorScheme('primary', 500);`
    );
  }
  lines.push(`helpers.spacing('md');`, '```', '');

  const semanticExample = semantics ? firstEntry(semantics) : undefined;
  const semanticLeaf = semanticExample ? walkTokenTree(semanticExample[1])[0] : undefined;
  lines.push(
    '### `semantic.get(...path)`',
    '',
    'Generic, shape-agnostic accessor for any semantic token path - it works',
    'regardless of how deeply the theme nests a given category, so it never',
    'needs updating when the semantic schema changes.',
    '',
    '```ts',
    semanticExample && semanticLeaf
      ? `semantic.get(${["'" + semanticExample[0] + "'", ...semanticLeaf.path.map(p => `'${p}'`)].join(', ')});`
      : `semantic.get('surface', 'primary');`,
    '```',
    ''
  );

  const componentExample = components ? firstEntry(components) : undefined;
  const componentLeaf = componentExample ? walkTokenTree(componentExample[1])[0] : undefined;
  lines.push(
    '### `component.get(...path)`',
    '',
    'Same generic accessor as `semantic.get()`, scoped to component tokens.',
    '',
    '```ts',
    componentExample && componentLeaf
      ? `component.get(${["'" + componentExample[0] + "'", ...componentLeaf.path.map(p => `'${p}'`)].join(', ')});`
      : `component.get('button', 'bgColor');`,
    '```',
    ''
  );

  lines.push(
    '### `ref(...)`',
    '',
    'Low-level reference helper passed into `semantics`/`components` factory',
    'functions when defining a theme. Returns a `var()` string pointing at',
    'another token, letting semantic and component layers compose on top of',
    'primitives (or on top of each other).',
    '',
    '```ts',
    'defineTokens({',
    "  primitives: { color: { brand: '#0265dc' } },",
    '  semantics: (ref) => ({',
    "    action: { primary: ref('color', 'brand', 500) },",
    '  }),',
    '});',
    '```',
    ''
  );

  lines.push(
    '### Lit CSS Helpers (`createCssHelpers()`)',
    '',
    'For Lit components, `createCssHelpers()` (from `@charm-ux/theming/lit`) returns',
    'the same three layers as `CSSResult`-wrapped values, safe to interpolate',
    "directly inside a `css` tagged template. This is what this repo's actual",
    "`*.styles.ts` files call, one level removed - `@charm-ux/core`'s",
    '`project.theme` is this same function with the theme definition and prefix',
    'already bound, so `project.theme.component(...)` in component code and',
    '`component(...)` below are the same call.',
    '',
    '```ts',
    "import { createCssHelpers } from '@charm-ux/theming/lit';",
    "import { css } from 'lit';",
    '',
    `const { primitive, semantic, component } = createCssHelpers(definition, '${prefix}');`,
    '',
    'css`'
  );

  if (paletteExample) {
    const [name] = paletteExample;
    lines.push(`  background: \${primitive('color', '${name}', 500)};`);
  } else if (baseColorExample) {
    const [name] = baseColorExample;
    lines.push(`  background: \${primitive('color', '${name}')};`);
  }
  if (semanticExample && semanticLeaf) {
    const args = [semanticExample[0], ...semanticLeaf.path].map(p => `'${p}'`).join(', ');
    lines.push(`  color: \${semantic(${args})};`);
  }
  if (componentExample && componentLeaf) {
    const args = [componentExample[0], ...componentLeaf.path].map(p => `'${p}'`).join(', ');
    lines.push(`  border-radius: \${component(${args})};`);
  }

  lines.push('`;', '```', '');

  return lines;
}

function renderDosAndDontsSection<C extends ComponentTokens>(components: C | undefined, prefix: string): string[] {
  const lines = [
    "## Do's and Don'ts",
    '',
    '- **Do** reference component tokens from component styles, not primitives or',
    '  semantics directly - it keeps a single point of change per component.',
    "- **Don't** hardcode a color, spacing, or other primitive value in component",
    '  code. If a value is missing, add it to the appropriate layer instead of',
    '  inlining it.',
    '- **Do** have semantic tokens reference primitives, not other semantic',
    '  tokens, to avoid indirection chains that are hard to trace.',
    "- **Don't** build CSS variable name strings by hand - use `helpers.*`,",
    '  `semantic.get()`/`semantic(...)`, or `component.get()`/`component(...)` so',
    '  the reference stays correct if the prefix or naming convention ever changes.',
    '',
  ];

  const componentExample = components ? firstEntry(components) : undefined;
  const componentLeaf = componentExample ? walkTokenTree(componentExample[1])[0] : undefined;

  if (componentExample && componentLeaf) {
    const [name] = componentExample;
    const path = [name, ...componentLeaf.path];
    const varName = cssVarName(prefix, ...path);
    lines.push(
      '**Example:**',
      '',
      '```ts',
      '// Do',
      `component.get(${path.map(p => `'${p}'`).join(', ')}); // -> 'var(${varName})'`,
      '',
      "// Don't",
      `\`var(${varName})\`; // hand-built - breaks silently if the prefix or path changes`,
      '```',
      ''
    );
  }

  return lines;
}

function renderAntiPatternsSection(): string[] {
  return [
    '## Anti-Patterns',
    '',
    '| Anti-Pattern | Problem | Instead |',
    '|--------------|---------|---------|',
    '| Hardcoding a hex/px value in a component | Breaks when the theme changes and skips dark-mode resolution | Add the value to `primitives`, then reference it through `semantics`/`components` |',
    '| Every component re-deriving its own version of a shared concept (e.g. a "danger" color) | Drifts out of sync across components over time | Define it once as a semantic token and reference that from every component |',
    "| Reading a resolved CSS variable's value in JS and computing a derived value from it | Duplicates logic the theme already encodes and can desync from it | Add a dedicated primitive/semantic/component token for the derived value instead |",
    "| Adding a new component's one-off values as new primitives | Pollutes the primitives layer with values only one consumer needs | Extend `components` via `.extendComponents()` instead |",
    '',
  ];
}

function renderFallbackSection(prefix: string): string[] {
  return [
    '## Fallback and Error Handling',
    '',
    'A CSS variable reference can supply a fallback for the rare case where a',
    'token has not been defined:',
    '',
    '```css',
    `color: var(--${prefix}-color-brand-500, var(--${prefix}-color-neutral-500));`,
    '```',
    '',
    '| Symptom | Likely Cause | Fix |',
    '|---------|--------------|-----|',
    '| A token resolves to the literal string `var(--...)` in the browser, with no value | The prefix passed to `createCssHelpers()`/`generateTheme()` does not match the theme the CSS was generated with | Make sure both use the same `prefix` |',
    "| TypeScript rejects a `semantic.get()`/`component.get()` call | The path does not exist on this theme's resolved shape | Check this document's Semantic/Component Tokens tables for the exact path, or add the token to the theme |",
    '| A whole primitive category is missing from this document | The theme never defined that category | Add it under `primitives` when calling `defineTokens()` |',
    '',
  ];
}

function renderBuildingComponentGuideSection(): string[] {
  return [
    '## Adding Tokens for a New Component',
    '',
    '1. Check whether an existing semantic token already covers the visual role',
    '   you need (see Semantic Tokens above) - if so, reference it directly and',
    '   you may not need new component tokens at all.',
    '2. If the component needs its own reusable values, extend `components`:',
    '',
    '```ts',
    'const myTokens = baseTokens.extendComponents((ref, base) => ({',
    '  ...base,',
    '  myComponent: {',
    "    bgColor: ref('color', 'brand', 500),",
    '  },',
    '}));',
    '```',
    '',
    "3. Reference the new tokens from the component's styles via",
    "   `component.get('myComponent', 'bgColor')` (or `component('myComponent',",
    "   'bgColor')` from `createCssHelpers()` in Lit).",
    '4. Regenerate this file and the DTCG JSON (both are generated output, not',
    '   hand-written) so downstream consumers and AI agents see the new tokens.',
    '5. Never hardcode a raw value as a stopgap - if the primitive you need',
    "   doesn't exist yet, add it to `primitives` rather than inlining it in the",
    '   component.',
    '',
  ];
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Generate Markdown documentation for a token definition.
 *
 * Dynamically introspects `definition.primitives`/`semantics`/`components` -
 * it makes no assumption about which semantic categories or component names
 * exist, so it stays accurate for any theme built on top of `defineTokens()`.
 */
export function generateTokensMarkdown<
  P extends PrimitiveTokens = PrimitiveTokens,
  S extends SemanticTokens = SemanticTokens,
  C extends ComponentTokens = ComponentTokens,
>(definition: TokenDefinition<P, S, C> | ResolvedTokenDefinition<P, S, C>, prefix: string): string {
  const semantics = resolveGroup<P, S>(definition.semantics, prefix);
  const components = resolveGroup<P, C>(definition.components, prefix);

  const lines: string[] = [
    ...renderDesignMdFrontmatter(definition.primitives, semantics, components, prefix),
    '# Design Tokens',
    '',
    'This document is generated from the theme definition - do not edit by hand.',
    '',
    '## Token Architecture',
    '',
    'Tokens are organized into three layers, each building on the last:',
    '',
    '1. **Primitives** - raw design values (colors, spacing, typography, etc.) with no semantic meaning.',
    '2. **Semantics** - named roles (`surface`, `text`, `action`, ...) that reference primitives, giving them meaning.',
    '3. **Components** - per-component token sets that reference semantics (or primitives directly), so each component has one place to look for its styling.',
    '',
    ...renderQuickReferenceSection(definition.primitives),
    ...renderPrimitivesSection(definition.primitives, prefix),
  ];

  if (semantics) {
    lines.push(
      ...renderTokenGroupSection(
        'Semantic Tokens',
        'Named roles that give primitives meaning. Referenced by components, and available directly via `semantic.get()`.',
        semantics,
        prefix
      )
    );
  }

  if (components) {
    lines.push(
      ...renderTokenGroupSection(
        'Component Tokens',
        'Per-component token sets. Referenced by component styles, and available directly via `component.get()`.',
        components,
        prefix
      )
    );
  }

  lines.push(...renderColorOnSchemeSection(definition.primitives, prefix));
  lines.push(...renderDarkModeSection());
  lines.push(...renderMachineReadableSection());
  lines.push(...renderApiReferenceSection(definition.primitives, semantics, components, prefix));
  lines.push(...renderDosAndDontsSection(components, prefix));
  lines.push(...renderAntiPatternsSection());
  lines.push(...renderFallbackSection(prefix));
  lines.push(...renderBuildingComponentGuideSection());

  return lines.join('\n');
}
