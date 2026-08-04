import { type CSSResultOrNative, LitElement, html as litHtml, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { DEFAULT_THEME_PREFIX, getScope, getThemePrefix } from '../../utilities/index.js';
import styles from './charm-element.styles.js';

/** Matches an opening or closing `<scoped-*>` tag, capturing the slash and the component base name. */
const SCOPED_TAG = /<(\/?)scoped-([a-z][a-z0-9-]*)/g;

/** Reads the raw CSS text out of a Lit `CSSResult` or an already-constructed native `CSSStyleSheet`. */
function cssTextOf(style: CSSResultOrNative): string {
  return 'cssText' in style ? style.cssText : Array.from(style.cssRules, rule => rule.cssText).join('\n');
}

/**
 * Rewrites the `--charm-*` custom-property names that `css` templates baked in at module load to
 * the currently configured theme prefix. `split`/`join` rather than `replaceAll` so that `$`
 * characters in the prefix aren't treated as replacement patterns.
 */
function rewriteThemePrefix(cssText: string, prefix: string): string {
  return cssText.split(`--${DEFAULT_THEME_PREFIX}-`).join(`--${prefix}-`);
}

/**
 * A base class for all Charm components.
 *
 * @event ready - Emitted when the component is ready.
 */
export class CharmElement extends LitElement {
  public static override styles = [styles];
  public static baseName: string;

  /**
   * @internal Prefix-transformed stylesheets, keyed by component class and then by target prefix.
   * Transforming is O(css length), so each (class, prefix) pair is built once and shared by every
   * instance. Keyed weakly so classes from a torn-down scope don't pin their stylesheets in memory.
   */
  private static _prefixedStyleSheets = new WeakMap<typeof CharmElement, Map<string, CSSStyleSheet[]>>();

  /**
   * @internal Scope-transformed template strings, keyed by the original `TemplateStringsArray` and
   * then by scope key. Lit caches its compiled `Template` against the strings array's identity, so
   * a given call site must always hand Lit the *same* array for a given scope — hence the cache is
   * required for correctness, not just speed.
   */
  private static _scopedTemplateStrings = new WeakMap<TemplateStringsArray, Map<string, TemplateStringsArray>>();

  protected scope: any;

  private _dir?: 'ltr' | 'rtl' | 'auto';

  public constructor() {
    super();
    this.scope = getScope(this);
    if (!this.scope) {
      throw new Error(
        `"${this.tagName}" is not registered with a Charm scope. ` +
          'Register the component with project.scope.registerComponent() (import it from its index.ts barrel) ' +
          'instead of using @customElement() / customElements.define().'
      );
    }
    // @ts-ignore
    this.constructor.dependencies?.forEach(component => this.scope.registerComponent(component));
  }

  /** @internal An array of components used within this component that will need to match the host scoping */
  public static get dependencies(): (typeof CharmElement)[] {
    return [];
  }

  /** The dir global attribute is an enumerated attribute that indicates the directionality of the element's text. */
  @property()
  public override get dir(): 'ltr' | 'rtl' | 'auto' {
    // getComputedStyle will always return ltr or rtl - if dir is "auto" it will return the user agent defined direction
    return this._dir && this._dir !== 'auto' ? this._dir : (getComputedStyle(this).direction as 'ltr' | 'rtl');
  }

  public override set dir(val: 'ltr' | 'rtl' | 'auto') {
    this._dir = val;
    this.requestUpdate('dir');
  }

  /** @internal Gets scoped tag name */
  // eslint-disable-next-line @typescript-eslint/member-ordering
  public get customTag() {
    return `${this.scope.prefix}-${CharmElement.baseName}${this.scope.suffix ? `_${this.scope.suffix}` : ''}`;
  }

  public override connectedCallback() {
    super.connectedCallback();
    if (this.scope) {
      this.setAttribute(this.scope.getBaseName(this), '');
    }
  }

  /**
   * @internal Re-prefixes this component's styles at render time.
   *
   * Lit `css` templates evaluate at module load, which bakes `--charm-*` custom-property names in
   * before a consumer has any chance to call `setThemePrefix()`. Rewriting here — after
   * `super.createRenderRoot()` has adopted the original sheets — lets the prefix be configured at
   * app bootstrap instead of at import time.
   */
  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    const root = super.createRenderRoot();
    const prefix = getThemePrefix();

    // Styles already carry the default prefix, so there is nothing to rewrite.
    if (prefix === DEFAULT_THEME_PREFIX) return root;

    if (!('adoptedStyleSheets' in root)) {
      // Lit falls back to `<style>` elements where constructable stylesheets are unavailable.
      root.querySelectorAll('style').forEach(el => {
        el.textContent = rewriteThemePrefix(el.textContent ?? '', prefix);
      });
      return root;
    }

    const ctor = this.constructor as typeof CharmElement;
    let byPrefix = CharmElement._prefixedStyleSheets.get(ctor);
    if (!byPrefix) {
      byPrefix = new Map<string, CSSStyleSheet[]>();
      CharmElement._prefixedStyleSheets.set(ctor, byPrefix);
    }

    let sheets = byPrefix.get(prefix);
    if (!sheets) {
      sheets = (ctor as unknown as typeof LitElement).elementStyles.map(style => {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(rewriteThemePrefix(cssTextOf(style), prefix));
        return sheet;
      });
      byPrefix.set(prefix, sheets);
    }

    (root as ShadowRoot).adoptedStyleSheets = sheets;
    return root;
  }

  protected override firstUpdated() {
    this.emit('ready', { bubbles: false, composed: false });
  }

  /**
   * Scoped HTML template tag. Rewrites `<scoped-*>` tags to this element's registered scope, so
   * templates don't have to interpolate `${this.scope.tag('…')}` for every nested Charm component.
   *
   * The rewrite goes through `scope.tagName()`, so it carries the scope's suffix as well as its
   * prefix — `<scoped-icon>` becomes `ch-icon` in the default scope and `ch-icon_support` in a
   * scope created with `suffix: 'support'`.
   *
   * Nested components must still be declared in `static dependencies` so they get registered in the
   * host's scope. For polymorphic tags (`<a>` vs `<button>`), keep using `static-html` + `literal`
   * per COMP-003 — this tag builds plain `html` templates and can't take `StaticValue`s.
   *
   * @example
   * ```ts
   * protected override render() {
   *   return this.html`
   *     <scoped-icon name="more"></scoped-icon>
   *     <scoped-button variant="primary">Click</scoped-button>
   *   `;
   * }
   * ```
   */
  protected html(strings: TemplateStringsArray, ...values: unknown[]): TemplateResult {
    const scopeKey = `${this.scope.prefix}|${this.scope.suffix}`;

    let byScope = CharmElement._scopedTemplateStrings.get(strings);
    if (!byScope) {
      byScope = new Map<string, TemplateStringsArray>();
      CharmElement._scopedTemplateStrings.set(strings, byScope);
    }

    let scoped = byScope.get(scopeKey);
    if (!scoped) {
      const rewrite = (s: string) =>
        s.replace(SCOPED_TAG, (_match, slash: string, baseName: string) => `<${slash}${this.scope.tagName(baseName)}`);

      scoped = strings.map(rewrite) as unknown as TemplateStringsArray;
      // Lit asserts the strings array carries its own `raw` field, and uses the cooked values for
      // HTML generation. Rewrite both so the two stay consistent.
      Object.defineProperty(scoped, 'raw', { value: Array.from(strings.raw, rewrite) });
      byScope.set(scopeKey, scoped);
    }

    return litHtml(scoped, ...values);
  }

  /** @internal Emits a custom event with more convenient defaults. */
  protected emit(name: string, options?: CustomEventInit) {
    const event = new CustomEvent(name, {
      bubbles: true,
      cancelable: false,
      composed: true,
      detail: {},
      ...options,
    });

    this.dispatchEvent(event);

    return event;
  }

  /**
   * @internal Used to identify the root node of an element (either the parent `ShadowRoot` or the `document`).
   * This also includes a fallback to the `document` if the `getRootNode` API is not defined (as it is in some test frameworks).
   */
  protected findRootNode(element: HTMLElement): Document | ShadowRoot {
    return (element.getRootNode() || document) as Document | ShadowRoot;
  }

  /**
   * Get an element by ID from the nearest scoped root (ShadowRoot or Document).
   * Uses getElementById on Document for efficiency, falls back to querySelector on ShadowRoot.
   */
  protected getScopedElementById(id: string): Element | null {
    const rootNode = (this.getRootNode && this.getRootNode()) || document;
    if ((rootNode as Document).getElementById) {
      return (rootNode as Document).getElementById(id);
    }

    // For ShadowRoot, use querySelector with an ID selector. Escape id if CSS.escape is available.
    const escaped = typeof (CSS as any)?.escape === 'function' ? (CSS as any).escape(id) : id;
    return (rootNode as ShadowRoot).querySelector(`#${escaped}`);
  }
}

export default CharmElement;
