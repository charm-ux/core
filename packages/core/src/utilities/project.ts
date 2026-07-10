import {
  createCssHelpers,
  charmDefinition,
  generateThemeSync,
  type CssHelpers,
  type ResolvedTokenDefinition,
  type GenerateThemeResult,
} from '@charm-ux/theming';
import defaultIcons from '../components/icon/default-icons.js';
import { createScope, setProjectConfig } from './scope.js';

/**
 * Configuration options for the project theme.
 */
export interface ThemeConfiguration {
  /** Token definition - defaults to charmDefinition */
  definition?: ResolvedTokenDefinition;
  /** CSS variable prefix - defaults to 'charm' */
  tokenPrefix?: string;
}

/**
 * Configuration options for a Charm project.
 */
export interface ProjectConfiguration {
  /** Custom element tag prefix (e.g., 'ch' -> <ch-button>) */
  prefix?: string;
  /** Custom icon set to merge with defaults */
  icons?: Record<string, string>;
  /** Theme configuration for token helpers and CSS generation */
  theme?: ThemeConfiguration;
}

/**
 * Core project configuration class for Charm component libraries.
 * Manages component registration, icon sets, and theme configuration.
 */
export default class CharmProject {
  /** Component registration scope for custom element definitions */
  public scope = createScope();
  /** Icon set used by icon components */
  public iconSet = defaultIcons;

  protected configuration: ProjectConfiguration = {};

  // Theme state
  private _themePrefix = 'charm';
  private _themeDefinition: ResolvedTokenDefinition = charmDefinition;
  private _themeHelpers: CssHelpers;
  private _themeCache: GenerateThemeResult | null = null;

  constructor() {
    this._themeHelpers = createCssHelpers(this._themeDefinition, this._themePrefix);
  }

  /** Theme token helpers for component styles */
  get theme(): CssHelpers {
    return this._themeHelpers;
  }

  /** Current theme definition */
  get themeDefinition(): ResolvedTokenDefinition {
    return this._themeDefinition;
  }

  /** Current theme prefix */
  get themePrefix(): string {
    return this._themePrefix;
  }

  /**
   * Generate the theme CSS. Cached until theme is reconfigured.
   */
  generateTheme(): GenerateThemeResult {
    if (!this._themeCache) {
      this._themeCache = generateThemeSync(this._themeDefinition, { prefix: this._themePrefix });
    }
    return this._themeCache;
  }

  /** Get the theme CSS string */
  get css(): string {
    return this.generateTheme().css ?? '';
  }

  /** Get the CSS reset string */
  get cssReset(): string {
    return this.generateTheme().cssReset ?? '';
  }

  /** Get the CSS utilities string */
  get cssUtilities(): string {
    return this.generateTheme().cssUtilities ?? '';
  }

  /**
   * Update the project configuration.
   * @param configuration - The new project configuration
   */
  public updateProject(configuration: ProjectConfiguration) {
    this.validateTagPrefix(configuration.prefix);
    this.configuration = configuration;
    this.updateIcons();
    this.updateTheme();
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

  protected updateIcons() {
    this.iconSet = { ...this.iconSet, ...this.configuration?.icons };
  }

  protected updateTheme() {
    const themeConfig = this.configuration?.theme;
    if (themeConfig) {
      if (themeConfig.tokenPrefix !== undefined) {
        this._themePrefix = themeConfig.tokenPrefix;
      }
      if (themeConfig.definition !== undefined) {
        this._themeDefinition = themeConfig.definition;
      }
      this._themeHelpers = createCssHelpers(this._themeDefinition, this._themePrefix);
      this._themeCache = null;
    }
  }

  protected validateTagPrefix(prefix?: string) {
    if (prefix && !this.isValidTagPrefix(prefix)) {
      throw new Error(
        `Cannot create a Charm project with the "${prefix}" prefix. Prefixes must contain only lower-case letters and numbers.`
      );
    }
  }

  protected isValidTagPrefix = (prefix?: string) => /^([a-z0-9\-_]+)?/.test(prefix || '');
}

/** Default Charm project instance */
export const project = new CharmProject();
