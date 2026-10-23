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

const globalWindow = typeof window === 'undefined' ? undefined : window;

if (globalWindow && !globalWindow.CharmComponents) {
  globalWindow.CharmComponents = {};
}

// We use a global object to track scope collisions since users may be using different origins and versions
globalWindow?.CharmComponents &&
  (globalWindow.CharmComponents.scope ??= {
    baseNameMap: new Map<string, typeof CharmElement>(),
    tagMap: new Map<string, CharmScope>(),
  });

const baseNameMap = globalWindow?.CharmComponents.scope?.baseNameMap ?? new Map<string, typeof CharmElement>();
const tagMap = globalWindow?.CharmComponents.scope?.tagMap ?? new Map<string, CharmScope>();

export interface ScopeOptions {
  basePath?: string;
  /** Tag suffix; also marks `rootElement` with `scope-${suffix}` as a consumer CSS hook. */
  suffix?: string;
  components?: Array<typeof CharmElement>;
  rootElement?: Element;
}

/**
 * Creates a custom Charm Enabler scope, optionally applying themes and registering components. Once a scope is
 * created, it cannot be destroyed without a page reload because custom elements cannot be unregistered.
 *
 * @example
 * import { button } from '@charm-ux/core/components/button/button.js';
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
export function getScope(elementOrTagName: Element | string): CharmScope | undefined {
  const tagName = typeof elementOrTagName === 'string' ? elementOrTagName : elementOrTagName.tagName.toLowerCase();
  return tagMap.get(tagName);
}

export class CharmScope implements ScopeOptions {
  public components?: (typeof CharmElement)[] | [];
  public basePath?: string = '';
  public prefix: string = '';
  public suffix: string = '';
  public rootElement?: Element = typeof document === 'undefined' ? undefined : document.documentElement;

  protected suffixes = globalWindow ? (globalWindow.CharmComponents.suffixes ||= []) : [];
  protected registeredComponents = new Set<typeof CharmElement>();

  public constructor(options?: ScopeOptions) {
    this.updateOptions(options);
  }

  public updateOptions(options: ScopeOptions = {}) {
    this.assertPrefixChangeAllowed(projectConfig.prefix ?? 'ch');
    this.initProperties(options);
    this.setSuffix(options.suffix);
    this.components?.map(component => this.registerComponent(component));
  }

  /** @internal Guards prefix changes that would invalidate already-registered custom element tags. */
  public assertPrefixChangeAllowed(prefix: string) {
    if (prefix !== this.prefix && this.registeredComponents.size > 0) {
      throw new Error('Cannot change the custom-element prefix after components have been registered.');
    }
  }

  public getComponent(baseName: string) {
    return baseNameMap.get(baseName);
  }

  public getBaseName(elementOrTagName: Element | string) {
    const tagName = typeof elementOrTagName === 'string' ? elementOrTagName : elementOrTagName.tagName.toLowerCase();

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
      if (!baseName) {
        console.error(`No basename set for a component: ${component.name}. Set static override baseName = '<name>'.`);
        return;
      }
      const tagName = `${this.prefix}-${baseName}${this.suffix ? `_${this.suffix}` : ''}`;
      if (tagMap.has(tagName)) {
        return;
      }
      if (typeof customElements === 'undefined')
        throw new Error('Charm components can only be registered in a browser.');
      if (customElements.get(tagName))
        throw new Error(`The custom element "${tagName}" is already defined outside this scope.`);
      const previousBaseComponent = baseNameMap.get(baseName);
      tagMap.set(tagName, this);
      baseNameMap.set(baseName, component);
      try {
        customElements.define(tagName, class extends component {});
      } catch (error) {
        if (tagMap.get(tagName) === this) tagMap.delete(tagName);
        if (baseNameMap.get(baseName) === component) {
          if (previousBaseComponent) baseNameMap.set(baseName, previousBaseComponent);
          else baseNameMap.delete(baseName);
        }
        throw error;
      }
      this.registeredComponents.add(component);
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

    if (baseName.startsWith(`${this.prefix}-`)) {
      console.error(
        `Invalid base name: "${baseName}". Avoid using the "${this.prefix}" prefix when calling scope.tag() or scope.tagName().`
      );
      baseName = baseName.slice(this.prefix.length + 1);
    }

    return `${this.prefix}-${baseName}${this.suffix ? `_${this.suffix}` : ''}`;
  }

  protected initProperties(options: ScopeOptions) {
    this.prefix = projectConfig.prefix ?? 'ch';
    this.basePath = options?.basePath ?? this.basePath;
    this.components = options?.components ?? [];
    this.rootElement =
      options.rootElement ??
      this.rootElement ??
      (typeof document === 'undefined' ? undefined : document.documentElement);
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
