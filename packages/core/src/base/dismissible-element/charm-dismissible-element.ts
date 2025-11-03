import { property } from 'lit/decorators.js';
import CharmElement from '../charm-element/charm-element.js';

/**
 * Base class for components that can be shown or hidden. They have `show`, `hide`, and `toggle` methods, an `open`
 * and `{baseName}-show` and `{baseName}-hide` events.
 */
export class CharmDismissibleElement extends CharmElement {
  protected _open = false;
  protected transition = false;
  protected transitionProperty?: string;

  /**
   * Indicates whether or not the component is open. Can be used in lieu of show/hide methods.
   */
  @property({ type: Boolean, reflect: true })
  public get open(): boolean {
    return this._open;
  }

  public set open(val: boolean) {
    if (this.hasUpdated && this._open != val) this.onOpenChange(val);
    this._open = !!val; // ensure it's a boolean
  }

  /**
   * Shows/opens the component.
   */
  public show() {
    this.open = true;
  }

  /**
   * Hides/closes the component.
   */
  public hide() {
    this.open = false;
  }

  /**
   * Shows or hides the component depending on whether it is currently visible.
   */
  public toggle() {
    this.open ? this.hide() : this.show();
  }

  public override connectedCallback() {
    super.connectedCallback();
    const baseName = (<any>this.constructor).baseName;
    const transitionStyles =
      getComputedStyle(this).getPropertyValue(`--${baseName}-transition`) ||
      getComputedStyle(this).getPropertyValue(`--${baseName}-show-transition`) ||
      getComputedStyle(this).getPropertyValue(`--${baseName}-hide-transition`);
    this.transition = transitionStyles.length > 0 && transitionStyles !== 'none';
    // get the transition property that have the longest time of duration so that after-show and after-hide events only get emitted once
    if (this.transition) {
      const div = Object.assign(document.createElement('span'), {
        class: 'transition',
        style: `transition: ${transitionStyles}`,
      });
      this.appendChild(div);
      setTimeout(() => {
        const divStyle = getComputedStyle(div);
        const properties = divStyle.getPropertyValue('transition-property').split(', ');
        const durations = divStyle.getPropertyValue('transition-duration').split(', ');
        const maxDuration = Math.max(...durations.map(d => parseFloat(d)));
        const index = durations.indexOf(maxDuration.toString() + 's');
        this.transitionProperty = properties[index];
        this.removeChild(div);
      });
    }
  }

  protected override firstUpdated() {
    super.firstUpdated();
    if (this.open) this.onOpenChange(true);
  }

  /**
   * Additional functionality that happens when `open` changes. Will also run when first updated if `open` is true.
   * @param open - Whether or not the component is changing to open or closed.
   */
  protected onOpenChange(open: boolean) {
    this.emitScopedEvent(open ? 'show' : 'hide');
  }

  /**
   * Handles transitionend event to emit `{baseName}-after-show` and `{baseName}-after-hide` events after transitions are complete. Should be added to the element with the CSS transition.
   */
  protected handleTransitionEnd(e: TransitionEvent) {
    if (e.target !== e.currentTarget || e.propertyName !== this.transitionProperty) return;
    this.emitScopedEvent(this.open ? 'after-show' : 'after-hide');
  }

  /**
   * Emits cancelable `{baseName}-request-close` event that hides the popup if default is not prevented.
   * @param source - The source of the close request.
   */
  protected emitRequestClose(source: string) {
    const evt = this.emitScopedEvent('request-close', { cancelable: true, detail: { source } });

    if (!evt.defaultPrevented) {
      this.hide();
    }

    return evt;
  }

  /**
   * Emits event scoped to component `${this.baseName}-${name}`.
   * @param name - The name of the event to emit.
   * @param detail - The detail object to include with the event.
   */
  protected emitScopedEvent(name: string, detail?: any) {
    const baseName = (<any>this.constructor).baseName;
    return this.emit(`${baseName}-${name}`, detail);
  }
}

export default CharmDismissibleElement;
