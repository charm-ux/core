import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { getScope } from '../../utilities/index.js';
import styles from './charm-element.styles.js';

/**
 * A base class for all Charm components.
 *
 * @event ready - Emitted when the component is ready.
 */
export class CharmElement extends LitElement {
  public static override styles = [styles];
  public static baseName: string;
  protected scope: any;

  private _dir?: 'ltr' | 'rtl' | 'auto';

  public constructor() {
    super();
    this.scope = getScope(this);
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

  protected override firstUpdated() {
    this.emit('ready', { bubbles: false, composed: false });
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
}

export default CharmElement;
