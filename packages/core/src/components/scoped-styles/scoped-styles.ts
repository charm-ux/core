import { html } from 'lit/static-html.js';
import { property, queryAssignedElements } from 'lit/decorators.js';
import CharmElement from '../../base/charm-element/charm-element.js';
import { minifyCssString } from '../../utilities/helpers.js';

/**
 * The scoped-styles component scopes CSS styles to itself and its children.
 *
 * @tag ch-scoped-styles
 * @since 1.0.0
 * @status beta
 *
 * @slot - The default slot.
 * @slot stylesheets - The slot for disabled `<link>` elements with stylesheets to scope to this element. Alternatively
 *   you can use the `css` property.
 *
 * @event ready - Emitted when the component has completed its initial render.
 * @event styles-loaded - Emitted when the styles are loaded.
 *
 **/
export class CoreScopedStyles extends CharmElement {
  public static override styles = [...super.styles];
  public static override baseName = 'scoped-styles';

  @queryAssignedElements({ slot: 'stylesheets', selector: 'link', flatten: true })
  protected slottedLinks!: HTMLLinkElement[];

  /** Styles loaded via the `css` prop. */
  protected loadedCss: string[] = [];

  /** A unique identifier for the styles. */
  protected name: string = this.generateRandomString(5);

  private _css: string | string[] = [];
  private _loadedStylesheets: string[] = [];

  /** CSS styles to scope to this element. Alternatively you can slot `<link>` tags in the `stylesheets` slot. */
  @property()
  public get css(): string | string[] {
    return this._css;
  }

  /** The number of stylesheets that have been loaded via `css` prop. */
  protected get cssLength(): number {
    return this.css ? this.arrayable(this.css).length : 0;
  }

  /** Styles loaded via the `stylesheets` slot. */
  protected get loadedStylesheets(): string[] {
    return this._loadedStylesheets;
  }

  public set css(value) {
    this._css = value || '';
    this.loadedCss = this.css ? this.arrayable(this.css) : [];
    this.writeStyle();
  }

  protected set loadedStylesheets(value) {
    this._loadedStylesheets = value;
    this.writeStyle();
  }

  public override connectedCallback() {
    super.connectedCallback();

    if (this.css) {
      this.writeStyle();
    }
  }

  /** Setup link element stylesheets. */
  protected applyStylesheets(stylesheets: HTMLLinkElement[]) {
    this.loadedStylesheets = [];

    stylesheets.forEach(stylesheet => {
      stylesheet.onload = () => this.handleStylesheetLoad(stylesheet);
      stylesheet.disabled = false;
    });
  }

  /** Remove previous styles and create new <style> if all stylesheets are loaded. */
  protected writeStyle() {
    if (this.loadedStylesheets.length === this.slottedLinks.length && this.loadedCss.length === this.cssLength) {
      this.querySelectorAll('style').forEach(style => style.remove());

      if (this.loadedCss.length > 0 || this.loadedStylesheets.length > 0) {
        const styleElement = document.createElement('style');
        styleElement.textContent = this.scopeStyles([...this.loadedCss, ...this.loadedStylesheets]);
        this.appendChild(styleElement);
        this.emit('styles-loaded');
      }
    }
  }

  /** Generates a scoped CSS string. */
  protected scopeStyles(styles: string[]): string {
    const scope = `${this.tagName.toLowerCase()}[name="${this.name}"]`;
    this.setAttribute('name', this.name);
    const minifiedStyles = minifyCssString(styles.map(style => style.replace(':root', '&')).join('\n'));
    return `${scope} {${minifiedStyles}}`;
  }

  /** When stylesheet is loaded, saves the styles and disables the stylesheet. */
  protected handleStylesheetLoad(stylesheet: HTMLLinkElement) {
    if (stylesheet.sheet) {
      const styles = [...stylesheet.sheet.cssRules].map(rule => `${rule.cssText}`).join('');
      this.loadedStylesheets = [...this.loadedStylesheets, styles];
    }
    stylesheet.disabled = true;
  }

  /** Handle changes to the `stylesheets` slot. */
  protected handleStylesheetSlotChange() {
    this.applyStylesheets(this.slottedLinks);
  }

  /** Generate a random string to use as a scope identifier. */
  protected generateRandomString(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  /** Take a string or array and return array. */
  protected arrayable(value: string | string[]) {
    return Array.isArray(value) ? value : [value];
  }

  /** Generate the template for the slots. */
  protected stylesTemplate() {
    return html`<slot></slot><slot hidden name="stylesheets" @slotchange=${this.handleStylesheetSlotChange}></slot>`;
  }

  protected override render() {
    return this.stylesTemplate();
  }
}

export default CoreScopedStyles;
