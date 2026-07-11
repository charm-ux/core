// src/generator/generateTheme.ts
import { generateReset } from './generateReset.js';
import { generateCss } from './generateCss.js';
import { generateUtilities } from './generateUtilities.js';
import { generateTokensMarkdown } from './generateTokensMarkdown.js';
import { generateTokensJson, generateTokensJsonForMode } from './generateTokensJson.js';
import { definitionHasLightDarkTokens } from './lightDark.js';
import { DEFAULT_CONFIG } from '../types/config.js';
import type { GeneratorConfig } from '../types/config.js';
import type {
  PrimitiveTokens,
  SemanticTokens,
  ComponentTokens,
  TokenDefinition,
  ResolvedTokenDefinition,
} from '../types/tokens.js';

// Lazy-loaded Node.js modules for file operations (browser-safe)
let fs: typeof import('node:fs') | null = null;
let path: typeof import('node:path') | null = null;

async function loadNodeModules() {
  if (!fs) {
    fs = await import('node:fs');
  }
  if (!path) {
    path = await import('node:path');
  }
  return { fs, path };
}

function loadNodeModulesSync() {
  if (!fs) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    fs = require('node:fs');
  }
  if (!path) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    path = require('node:path');
  }
  return { fs: fs!, path: path! };
}

/**
 * Result of theme generation.
 */
export type GenerateThemeResult = {
  /** Path to generated theme CSS file */
  themeFile?: string;
  /** Path to generated utilities CSS file */
  utilitiesFile?: string;
  /** Path to generated reset CSS file */
  resetFile?: string;
  /** Path to generated tokens directory (for JSON/Markdown) */
  tokensDir?: string;
  /** Path to generated tokens markdown documentation */
  tokensMarkdownFile?: string;
  /** Path to generated tokens JSON file (when no light/dark variations) */
  tokensJsonFile?: string;
  /** Path to generated tokens JSON file (light mode, when light/dark variations exist) */
  tokensLightJsonFile?: string;
  /** Path to generated tokens JSON file (dark mode, when light/dark variations exist) */
  tokensDarkJsonFile?: string;
  /** Generated CSS content (when not writing to file) */
  css?: string;
  /** Generated reset CSS content (when not writing to file) */
  cssReset?: string;
  /** Generated utilities CSS content (when not writing to file) */
  cssUtilities?: string;
  /** Generated tokens as JSON (when no light/dark variations, not writing to file) */
  tokensJson?: string;
  /** Generated tokens as JSON - light mode (when light/dark variations exist, not writing to file) */
  tokensLightJson?: string;
  /** Generated tokens as JSON - dark mode (when light/dark variations exist, not writing to file) */
  tokensDarkJson?: string;
  /** Whether the definition contains light/dark token variations */
  hasLightDarkTokens?: boolean;
  /** Generated tokens as markdown (when not writing to file) */
  tokensMarkdown?: string;
};

/**
 * Options for theme generation.
 */
export type GenerateThemeOptions = Partial<GeneratorConfig> & {
  /** Output directory (required for file generation, optional for in-memory) */
  outDir?: string;
  /** Return content without writing files */
  dryRun?: boolean;
};

/**
 * Token source - either a DefinedTokens result, a raw TokenDefinition, or a ResolvedTokenDefinition.
 */
type TokenSource<
  P extends PrimitiveTokens = PrimitiveTokens,
  S extends SemanticTokens = SemanticTokens,
  C extends ComponentTokens = ComponentTokens,
> =
  | { definition: TokenDefinition<P, S, C> | ResolvedTokenDefinition<P, S, C> }
  | TokenDefinition<P, S, C>
  | ResolvedTokenDefinition<P, S, C>;

/**
 * Extract the definition from a token source.
 */
function extractDefinition<
  P extends PrimitiveTokens = PrimitiveTokens,
  S extends SemanticTokens = SemanticTokens,
  C extends ComponentTokens = ComponentTokens,
>(tokens: TokenSource<P, S, C>): TokenDefinition<P, S, C> | ResolvedTokenDefinition<P, S, C> {
  if ('definition' in tokens) {
    return tokens.definition;
  }
  return tokens;
}

/**
 * Generate all theme artifacts from token definitions.
 *
 * This is the main orchestrator that combines all generators to produce:
 * - Theme CSS (custom properties)
 * - CSS Reset (references semantic tokens)
 * - Utility classes (Tailwind-like utilities)
 * - JSON tokens (for tooling/documentation)
 * - Markdown documentation
 *
 * @param tokens - Token definitions (from defineTokens or raw definition)
 * @param options - Generation options
 * @returns Object with paths to generated files or content strings
 *
 * @example
 * ```ts
 * // Generate files to disk
 * const result = await generateTheme(myTokens, {
 *   outDir: './dist',
 *   prefix: 'charm',
 * });
 *
 * // Generate in-memory (no file writes)
 * const result = await generateTheme(myTokens, { dryRun: true });
 * console.log(result.css); // CSS content
 * ```
 */
export async function generateTheme<
  P extends PrimitiveTokens = PrimitiveTokens,
  S extends SemanticTokens = SemanticTokens,
  C extends ComponentTokens = ComponentTokens,
>(tokens: TokenSource<P, S, C>, options: GenerateThemeOptions = {}): Promise<GenerateThemeResult> {
  const definition = extractDefinition(tokens);

  // Merge configuration with defaults
  const cfg = {
    ...DEFAULT_CONFIG,
    ...(definition.prefix ? { prefix: definition.prefix } : {}),
    ...options,
  };

  const prefix = cfg.prefix ?? 'charm';
  const result: GenerateThemeResult = {};

  // Check if definition has light/dark token variations
  const hasLightDark = definitionHasLightDarkTokens(definition);
  result.hasLightDarkTokens = hasLightDark;

  // Generate theme CSS
  const themeCss = generateCss(definition as TokenDefinition | ResolvedTokenDefinition, cfg);

  // Generate CSS reset
  const resetCss = cfg.skipReset
    ? undefined
    : `/* Generated by @charm-ux/theming - DO NOT EDIT */\n${generateReset({ prefix, useLayers: cfg.useLayers })}`;

  // Generate utilities
  const utilitiesCss = cfg.skipUtilities
    ? undefined
    : generateUtilities(definition.primitives, { prefix, useLayers: cfg.useLayers });

  // Generate tokens JSON - separate light/dark files only if there are variations
  let tokensJson: string | undefined;
  let tokensLightJson: string | undefined;
  let tokensDarkJson: string | undefined;

  if (!cfg.skipTokensJson) {
    if (hasLightDark) {
      tokensLightJson = generateTokensJsonForMode(definition, prefix, 'light');
      tokensDarkJson = generateTokensJsonForMode(definition, prefix, 'dark');
    } else {
      tokensJson = generateTokensJson(definition, prefix);
    }
  }

  // Generate tokens markdown
  const tokensMarkdown = cfg.skipTokensMarkdown ? undefined : generateTokensMarkdown(definition, prefix);

  // If dry run, return content without writing files
  if (options.dryRun || !options.outDir) {
    result.css = themeCss;
    result.cssReset = resetCss;
    result.cssUtilities = utilitiesCss;
    result.tokensJson = tokensJson;
    result.tokensLightJson = tokensLightJson;
    result.tokensDarkJson = tokensDarkJson;
    result.tokensMarkdown = tokensMarkdown;
    return result;
  }

  // Load Node.js modules for file operations
  const { fs: nodeFs, path: nodePath } = await loadNodeModules();

  // Ensure output directory exists
  if (!nodeFs.existsSync(options.outDir)) {
    nodeFs.mkdirSync(options.outDir, { recursive: true });
  }

  // Write theme CSS
  const themePath = nodePath.join(options.outDir, cfg.themeFileName);
  nodeFs.writeFileSync(themePath, themeCss, 'utf-8');
  result.themeFile = themePath;

  // Write CSS reset
  if (resetCss) {
    const resetPath = nodePath.join(options.outDir, cfg.resetFileName);
    nodeFs.writeFileSync(resetPath, resetCss, 'utf-8');
    result.resetFile = resetPath;
  }

  // Write utilities
  if (utilitiesCss) {
    const utilitiesPath = nodePath.join(options.outDir, cfg.utilitiesFileName);
    nodeFs.writeFileSync(utilitiesPath, utilitiesCss, 'utf-8');
    result.utilitiesFile = utilitiesPath;
  }

  // Write tokens JSON - either single file or separate light/dark files
  if (tokensJson) {
    const jsonPath = nodePath.join(options.outDir, cfg.tokensJsonFileName);
    nodeFs.writeFileSync(jsonPath, tokensJson, 'utf-8');
    result.tokensJsonFile = jsonPath;
  } else if (tokensLightJson && tokensDarkJson) {
    const tokensDir = nodePath.join(options.outDir, 'tokens');
    if (!nodeFs.existsSync(tokensDir)) {
      nodeFs.mkdirSync(tokensDir, { recursive: true });
    }
    const lightPath = nodePath.join(tokensDir, 'light.json');
    const darkPath = nodePath.join(tokensDir, 'dark.json');
    nodeFs.writeFileSync(lightPath, tokensLightJson, 'utf-8');
    nodeFs.writeFileSync(darkPath, tokensDarkJson, 'utf-8');
    result.tokensLightJsonFile = lightPath;
    result.tokensDarkJsonFile = darkPath;
    result.tokensDir = tokensDir;
  }

  // Write tokens markdown
  if (tokensMarkdown) {
    const mdPath = nodePath.join(options.outDir, cfg.tokensMarkdownFileName);
    nodeFs.writeFileSync(mdPath, tokensMarkdown, 'utf-8');
    result.tokensMarkdownFile = mdPath;
  }

  return result;
}

/**
 * Synchronous version of generateTheme for simpler use cases.
 */
export function generateThemeSync<
  P extends PrimitiveTokens = PrimitiveTokens,
  S extends SemanticTokens = SemanticTokens,
  C extends ComponentTokens = ComponentTokens,
>(tokens: TokenSource<P, S, C>, options: GenerateThemeOptions = {}): GenerateThemeResult {
  const definition = extractDefinition(tokens);

  const cfg = {
    ...DEFAULT_CONFIG,
    ...(definition.prefix ? { prefix: definition.prefix } : {}),
    ...options,
  };

  const prefix = cfg.prefix ?? 'charm';
  const result: GenerateThemeResult = {};

  // Check if definition has light/dark token variations
  const hasLightDark = definitionHasLightDarkTokens(definition);
  result.hasLightDarkTokens = hasLightDark;

  // Generate theme CSS
  const themeCss = generateCss(definition as TokenDefinition | ResolvedTokenDefinition, cfg);

  // Generate CSS reset
  const resetCss = cfg.skipReset
    ? undefined
    : `/* Generated by @charm-ux/theming - DO NOT EDIT */\n${generateReset({ prefix, useLayers: cfg.useLayers })}`;

  // Generate utilities
  const utilitiesCss = cfg.skipUtilities
    ? undefined
    : generateUtilities(definition.primitives, { prefix, useLayers: cfg.useLayers });

  // Generate tokens JSON - separate light/dark files only if there are variations
  let tokensJson: string | undefined;
  let tokensLightJson: string | undefined;
  let tokensDarkJson: string | undefined;

  if (!cfg.skipTokensJson) {
    if (hasLightDark) {
      tokensLightJson = generateTokensJsonForMode(definition, prefix, 'light');
      tokensDarkJson = generateTokensJsonForMode(definition, prefix, 'dark');
    } else {
      tokensJson = generateTokensJson(definition, prefix);
    }
  }

  // Generate tokens markdown
  const tokensMarkdown = cfg.skipTokensMarkdown ? undefined : generateTokensMarkdown(definition, prefix);

  // If dry run, return content without writing files
  if (options.dryRun || !options.outDir) {
    result.css = themeCss;
    result.cssReset = resetCss;
    result.cssUtilities = utilitiesCss;
    result.tokensJson = tokensJson;
    result.tokensLightJson = tokensLightJson;
    result.tokensDarkJson = tokensDarkJson;
    result.tokensMarkdown = tokensMarkdown;
    return result;
  }

  // Load Node.js modules for file operations
  const { fs: nodeFs, path: nodePath } = loadNodeModulesSync();

  // Ensure output directory exists
  if (!nodeFs.existsSync(options.outDir)) {
    nodeFs.mkdirSync(options.outDir, { recursive: true });
  }

  // Write theme CSS
  const themePath = nodePath.join(options.outDir, cfg.themeFileName);
  nodeFs.writeFileSync(themePath, themeCss, 'utf-8');
  result.themeFile = themePath;

  // Write CSS reset
  if (resetCss) {
    const resetPath = nodePath.join(options.outDir, cfg.resetFileName);
    nodeFs.writeFileSync(resetPath, resetCss, 'utf-8');
    result.resetFile = resetPath;
  }

  // Write utilities
  if (utilitiesCss) {
    const utilitiesPath = nodePath.join(options.outDir, cfg.utilitiesFileName);
    nodeFs.writeFileSync(utilitiesPath, utilitiesCss, 'utf-8');
    result.utilitiesFile = utilitiesPath;
  }

  // Write tokens JSON - either single file or separate light/dark files
  if (tokensJson) {
    const jsonPath = nodePath.join(options.outDir, cfg.tokensJsonFileName);
    nodeFs.writeFileSync(jsonPath, tokensJson, 'utf-8');
    result.tokensJsonFile = jsonPath;
  } else if (tokensLightJson && tokensDarkJson) {
    const tokensDir = nodePath.join(options.outDir, 'tokens');
    if (!nodeFs.existsSync(tokensDir)) {
      nodeFs.mkdirSync(tokensDir, { recursive: true });
    }
    const lightPath = nodePath.join(tokensDir, 'light.json');
    const darkPath = nodePath.join(tokensDir, 'dark.json');
    nodeFs.writeFileSync(lightPath, tokensLightJson, 'utf-8');
    nodeFs.writeFileSync(darkPath, tokensDarkJson, 'utf-8');
    result.tokensLightJsonFile = lightPath;
    result.tokensDarkJsonFile = darkPath;
    result.tokensDir = tokensDir;
  }

  // Write tokens markdown
  if (tokensMarkdown) {
    const mdPath = nodePath.join(options.outDir, cfg.tokensMarkdownFileName);
    nodeFs.writeFileSync(mdPath, tokensMarkdown, 'utf-8');
    result.tokensMarkdownFile = mdPath;
  }

  return result;
}
