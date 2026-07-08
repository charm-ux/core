/**
 * Configuration for theme generators.
 */
export type GeneratorConfig = {
  /** Output directory for generated files */
  outDir?: string;
  /** CSS variable prefix (default: from token definition or 'charm') */
  prefix?: string;
  /** CSS selector for token variables (default: ':root') */
  selector?: string;

  // File names
  themeFileName?: string;
  resetFileName?: string;
  typesFileName?: string;
  utilitiesFileName?: string;
  tokensJsonFileName?: string;
  tokensMarkdownFileName?: string;

  // Feature flags
  skipReset?: boolean;
  skipUtilities?: boolean;
  skipTypes?: boolean;
  skipTokensJson?: boolean;
  skipTokensMarkdown?: boolean;

  // CSS options
  /** Use [data-theme="light/dark"] selectors instead of classes */
  useDataAttributes?: boolean;
  /** Use CSS light-dark() function (default: true) */
  useLightDarkFunction?: boolean;
  /** Wrap generated CSS in @layer directives */
  useLayers?: boolean;
};

/**
 * Default generator configuration.
 */
export const DEFAULT_CONFIG: Required<
  Pick<
    GeneratorConfig,
    | 'selector'
    | 'themeFileName'
    | 'resetFileName'
    | 'typesFileName'
    | 'utilitiesFileName'
    | 'tokensJsonFileName'
    | 'tokensMarkdownFileName'
    | 'useLightDarkFunction'
    | 'useDataAttributes'
    | 'useLayers'
  >
> = {
  selector: ':root',
  themeFileName: 'theme.css',
  resetFileName: 'reset.css',
  typesFileName: 'tokens.d.ts',
  utilitiesFileName: 'utilities.css',
  tokensJsonFileName: 'tokens.json',
  tokensMarkdownFileName: 'TOKENS.md',
  useLightDarkFunction: true,
  useDataAttributes: false,
  useLayers: false,
};
