import defaultIcons from '../components/icon/default-icons.js';
import { createScope, setProjectConfig } from './scope.js';
import { DEFAULT_THEME_PREFIX, getThemePrefix, setThemePrefix } from './theme.js';

/**
 * Configuration options for a Charm project.
 */
export interface ProjectConfiguration {
  /** Custom element tag prefix (e.g., 'ch' -> <ch-button>) */
  prefix?: string;
  /** CSS variable prefix for theme tokens (defaults to tag prefix) */
  tokenPrefix?: string;
  /** Custom icon set to merge with defaults */
  icons?: Record<string, string>;
}

/**
 * Core project configuration class for Charm component libraries.
 * Manages component registration, icon sets, and theme prefix.
 */
export default class CharmProject {
  /** Component registration scope for custom element definitions */
  public scope = createScope();
  /** Icon set used by icon components */
  public iconSet = defaultIcons;

  protected configuration: ProjectConfiguration = {};

  public constructor(configuration?: ProjectConfiguration) {
    if (configuration) {
      this.updateProject(configuration);
    }
  }

  /**
   * Update the project configuration.
   * @param configuration - The new project configuration
   */
  public updateProject(configuration: ProjectConfiguration) {
    this.validateTagPrefix(configuration.prefix);
    this.configuration = configuration;
    this.updateTheme();
    this.updateIcons();
    setProjectConfig(configuration);
    this.scope.updateOptions();
  }

  /**
   * Get the current project configuration.
   * @returns The current project configuration
   */
  public getProject() {
    return this.configuration;
  }

  protected updateTheme() {
    const { tokenPrefix, prefix } = this.configuration;
    const resolvedPrefix = tokenPrefix ?? prefix;
    if (resolvedPrefix) {
      setThemePrefix(resolvedPrefix);
    }
  }

  protected updateIcons() {
    this.iconSet = { ...this.iconSet, ...this.configuration?.icons };
    updateIconProperties(this.iconSet, this.configuration.tokenPrefix ?? this.configuration.prefix ?? getThemePrefix());
  }

  protected validateTagPrefix(prefix?: string) {
    if (prefix && !this.isValidTagPrefix(prefix)) {
      throw new Error(
        `Cannot create a Charm project with the "${prefix}" prefix. Prefixes must contain only lower-case letters and numbers.`
      );
    }
  }

  protected isValidTagPrefix = (prefix?: string) => /^[a-z][a-z0-9]*$/.test(prefix || '');
}

const iconStyleSheet = typeof CSSStyleSheet !== 'undefined' ? new CSSStyleSheet() : undefined;

function iconPropertyName(prefix: string, name: string): string {
  const sanitized = name.replace(/[^a-zA-Z0-9_-]/g, '-').replace(/^[0-9]/, '-$&');
  if (sanitized !== name && typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
    console.warn(`[charm-ux] Icon name "${name}" was sanitized to "${sanitized}" for its CSS custom property.`);
  }
  return `--${prefix}-icon-${sanitized || 'icon'}`;
}

function updateIconProperties(icons: Record<string, string>, prefix: string) {
  if (!iconStyleSheet || typeof document === 'undefined' || !('adoptedStyleSheets' in document)) return;

  const declarations = Object.entries(icons)
    .map(
      ([name, svg]) =>
        `${iconPropertyName(prefix || DEFAULT_THEME_PREFIX, name)}: url("data:image/svg+xml,${encodeURIComponent(svg)}");`
    )
    .join('');
  iconStyleSheet.replaceSync(`:root { ${declarations} }`);

  if (!document.adoptedStyleSheets.includes(iconStyleSheet)) {
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, iconStyleSheet];
  }
}

/** Default Charm project instance */
export const project = new CharmProject();
updateIconProperties(defaultIcons, DEFAULT_THEME_PREFIX);
