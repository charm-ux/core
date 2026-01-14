import { StaticValue, unsafeStatic } from 'lit/static-html.js';
import type CharmElement from '../base/charm-element/charm-element.js';
import type { ProjectConfiguration } from './project.js';

declare global {
  interface Window {
    CharmComponents: {
      suffixes?: string[];
      scope?: CharmGlobalScope;
    };
  }
}

let projectConfig = {} as ProjectConfiguration;

export type CharmGlobalScope = {
  /** This map identifies a component by its base name (to allow easier importing in the docs) */
  baseNameMap: Map<string, typeof CharmElement>;
  /** This map identifies the appropriate scope from a tag name */
  tagMap: Map<string, CharmScope>;
};

if (!window.CharmComponents) {
  window.CharmComponents = {};
}

// We use a global object to track scope collisions since users may be using different origins and versions
window.CharmComponents.scope ??= {
  baseNameMap: new Map<string, typeof CharmElement>(),
  tagMap: new Map<string, CharmScope>(),
};

const { baseNameMap, tagMap } = window.CharmComponents.scope;

export interface ScopeOptions {
  basePath?: string;
  suffix?: string;
  components?: Array<typeof CharmElement>;
  rootElement?: Element;
}

/**
 * Creates a custom Charm Enabler scope, optionally applying themes and registering components. Once a scope is
 * created, it cannot be destroyed without a page reload because custom elements cannot be unregistered.
 *
 * @example
 * import { theme } from '@my-theme/tokens';
 * import { button } from '@charm-ux/core/src/';
 *
 * const scope = createScope({
 *  rootElement: <my-app-element>,
 *  suffix: 'support',
 *  components: [button],
 * });
 */
export function createScope(options?: ScopeOptions) {
  return new CharmScope(options);
}

/**
 * Set custom project configuration
 * @param config project configuration
 */
export function setProjectConfig(config: ProjectConfiguration) {
  projectConfig = config;
}

/**
 * Returns a custom element's scope using an element instance or its tag name.
 *
 * @example
 * const scope = getScope(el);
 * const tagName = scope.tagName('button'); // outputs "ch-button" or "ch-button_suffix"
 */
export function getScope(elementOrTagName: Element | string): any {
  const tagName = typeof elementOrTagName === 'string' ? elementOrTagName : elementOrTagName.tagName.toLowerCase();
  return tagMap.get(tagName);
}

export class CharmScope implements ScopeOptions {
  private static instance: CharmScope | null = null;

  public components?: (typeof CharmElement)[] | [];
  public basePath?: string = '';
  public prefix: string = '';
  public suffix: string = '';
  public rootElement?: Element = document.documentElement;

  protected suffixes = (window.CharmComponents.suffixes ||= []);
  protected registeredComponents = new Set<typeof CharmElement>();

  public constructor(options?: ScopeOptions) {
    if (!CharmScope.instance) {
      CharmScope.instance = this;
    }
    this.updateOptions(options);
    return CharmScope.instance;
  }

  public updateOptions(options: ScopeOptions = {}) {
    this.initProperties(options);
    this.setSuffix(options.suffix);
    this.components?.map(component => this.registerComponent(component));
  }

  public getComponent(baseName: string) {
    return baseNameMap.get(baseName);
  }

  public getBaseName(elementOrTagName: Element | string) {
    const tagName = elementOrTagName instanceof Element ? elementOrTagName.tagName.toLowerCase() : elementOrTagName;

    return tagName
      .replace(`${this.prefix}-`, '') // remove prefix
      .replace(/_.*/, ''); // remove suffix
  }

  public makePath(path?: string) {
    const basePath = this.basePath?.replace(/\/$/, '');
    return path ? `${basePath}/${path}` : basePath;
  }

  public registerComponent(...components: Array<typeof CharmElement>) {
    components.forEach(component => {
      const baseName = component.baseName;
      const tagName = `${this.prefix}-${baseName}${this.suffix ? `_${this.suffix}` : ''}`;

      // Keep track of components that were attempted to register - if the scope options are updated later the components will be re-registered
      this.registeredComponents.add(component);

      if (tagMap.has(tagName)) {
        return;
      }

      if (!baseName) {
        console.error(`No basename set for: ${tagName}.
            The component does not have: static override baseName = '<name>' in its class definition.`);
        return;
      }

      tagMap.set(tagName, this);
      baseNameMap.set(baseName, component);
      if (!customElements.get(tagName)) {
        customElements.define(tagName, class extends component {});
      }
    });
  }

  public setBasePath(path?: string) {
    this.basePath = path ? path.replace(/\/$/, '') : '';
  }

  public tag(baseName: string) {
    return unsafeStatic(this.tagName(baseName)) as StaticValue;
  }

  public tagName(baseName: string): string {
    if (baseName === null) throw Error('No base name given');

    if (baseName.startsWith(this.prefix)) {
      console.error(
        `Invalid base name: "${baseName}". Avoid using the "${this.prefix}" prefix when calling scope.tag() or scope.tagName().`
      );
      baseName = baseName.replace(this.prefix, '');
    }

    return `${this.prefix}-${baseName}${this.suffix ? `_${this.suffix}` : ''}`;
  }

  protected initProperties(options: ScopeOptions) {
    this.prefix = projectConfig.prefix ?? 'ch';
    this.basePath = options?.basePath ?? this.basePath;
    this.components = options?.components ?? [];
    this.rootElement = options.rootElement ?? document.documentElement;
    if (options?.suffix) {
      this.rootElement?.setAttribute(`scope-${options?.suffix}`, '');
    }
  }

  protected setSuffix(suffix?: string) {
    if (!suffix || this.suffix === suffix) {
      return;
    }

    if (!this.isValidTagSuffix(suffix)) {
      throw new Error(
        `Cannot create a Charm Enabler scope with the "${suffix}" suffix. Suffixes must contain only lower-case letters and numbers.`
      );
    }

    this.suffix = suffix;
    this.suffixes.push(suffix);

    // Attempt to re-register any previously registered components - to handle the settings possibly having been changed
    this.registerComponent(...this.registeredComponents);
  }

  protected isValidTagSuffix = (suffix: string) => suffix.length === 0 || /^([a-z0-9_-]+)$/.test(suffix);
}
