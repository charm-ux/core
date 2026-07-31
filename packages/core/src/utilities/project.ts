import defaultIcons from '../components/icon/default-icons.js';
import { createScope, setProjectConfig } from './scope.js';
import { setThemePrefix } from './theme.js';

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

  protected updateTheme() {
    const { tokenPrefix, prefix } = this.configuration;
    const resolvedPrefix = tokenPrefix ?? prefix;
    if (resolvedPrefix) {
      setThemePrefix(resolvedPrefix);
    }
  }

  protected updateIcons() {
    this.iconSet = { ...this.iconSet, ...this.configuration?.icons };
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

/** Default Charm project instance */
export const project = new CharmProject();
