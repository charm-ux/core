import defaultIcons from '../components/icon/default-icons.js';
import { createScope, setProjectConfig } from './scope.js';

export interface ProjectConfiguration {
  prefix?: string;
  icons?: Record<string, string>;
}

export default class CharmProject {
  public scope = createScope();
  public iconSet = defaultIcons;

  protected configuration: ProjectConfiguration = {};

  public updateProject(configuration: ProjectConfiguration) {
    this.validateTagPrefix(configuration.prefix);
    this.configuration = configuration;
    this.updateIcons();
    setProjectConfig(configuration);
    this.scope.updateOptions();
  }

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

export const project = new CharmProject();
