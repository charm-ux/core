import defaultIcons from '../components/icon/default-icons.js';
import { createScope, setProjectConfig } from './scope.js';

/**
 * Configuration options for a Charm project.
 */
export interface ProjectConfiguration {
  /** Custom element tag prefix (e.g., 'ch' -> <ch-button>) */
  prefix?: string;
  /** Custom icon set to merge with defaults */
  icons?: Record<string, string>;
}

/**
 * Core project configuration class for Charm component libraries.
 * Manages component registration and icon sets.
 */
export default class CharmProject {
  /** Component registration scope for custom element definitions */
  public scope = createScope();
  /** Icon set used by icon components */
  public iconSet = defaultIcons;

  protected configuration: ProjectConfiguration = {};

  public constructor() {
    // No theme setup — theme is managed by the standalone theme module
  }

  /**
   * Update the project configuration.
   * @param configuration - The new project configuration
   */
  public updateProject(configuration: ProjectConfiguration) {
    this.validateTagPrefix(configuration.prefix);
    this.configuration = configuration;
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

  protected isValidTagPrefix = (prefix?: string) => /^([a-z0-9\-_]+)?/.test(prefix || '');
}

/** Default Charm project instance */
export const project = new CharmProject();
