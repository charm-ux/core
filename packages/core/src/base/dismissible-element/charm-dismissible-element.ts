import { property } from 'lit/decorators.js';
import CharmElement from '../charm-element/charm-element.js';

/**
 * Base class for components that can be shown or hidden. They have `show`, `hide`, and `toggle` methods, an `open`
 * and `{baseName}-show` and `{baseName}-hide` events.
 */
export class CharmDismissibleElement extends CharmElement {
  protected _open = false;
  protected transition = false;
  protected transitionMaxTime = 0;
  protected pendingAfterEvent?: 'after-show' | 'after-hide';
  protected transitionSettleTimer?: ReturnType<typeof setTimeout>;
  protected transitionWaitId = 0;

  /**
   * Indicates whether or not the component is open. Can be used in lieu of show/hide methods.
   */
  @property({ type: Boolean, reflect: true })
  public get open(): boolean {
    return this._open;
  }

  public set open(val: boolean) {
    const oldVal = this._open;
    const newVal = !!val;
    if (oldVal === newVal) return;

    this._open = newVal;
    this.toggleAttribute('open', newVal);
    this.requestUpdate('open', oldVal);

    if (this.hasUpdated) this.onOpenChange(newVal);
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
    this.updateTransitionState();
  }

  public override disconnectedCallback() {
    if (this.transitionSettleTimer) {
      clearTimeout(this.transitionSettleTimer);
      this.transitionSettleTimer = undefined;
    }
    super.disconnectedCallback();
  }

  protected getTransitionStyles() {
    const baseName = (<any>this.constructor).baseName;
    const escapedBaseName = baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const transitionPropertyNamePattern = new RegExp(
      `^--(?:[a-z0-9-]+-)?${escapedBaseName}(?:-(?:show|hide|position))?-transition$`,
      'i'
    );
    const style = getComputedStyle(this);
    const transitions: string[] = [];

    for (let i = 0; i < style.length; i++) {
      const property = style.item(i);
      if (!transitionPropertyNamePattern.test(property)) continue;

      const value = style.getPropertyValue(property).trim();
      if (!value || value === 'none') continue;
      transitions.push(value);
    }

    // Fallback: some browsers don't enumerate custom properties via item()
    // (e.g. older Safari). Try a direct lookup on unprefixed candidates.
    if (transitions.length === 0) {
      const candidates = [
        `--${baseName}-transition`,
        `--${baseName}-show-transition`,
        `--${baseName}-hide-transition`,
        `--${baseName}-position-transition`,
      ];
      for (const candidate of candidates) {
        const value = style.getPropertyValue(candidate).trim();
        if (value && value !== 'none') transitions.push(value);
      }
    }

    return transitions;
  }

  protected updateTransitionState() {
    const transitionStyles = this.getTransitionStyles();
    this.transition = transitionStyles.length > 0;
    this.transitionMaxTime = this.getMaxTransitionTime(transitionStyles);
  }

  protected parseTimeToMilliseconds(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return 0;
    if (trimmed.endsWith('ms')) return parseFloat(trimmed);
    if (trimmed.endsWith('s')) return parseFloat(trimmed) * 1000;
    return parseFloat(trimmed) * 1000;
  }

  protected getMaxTransitionTime(transitionStyles: string[]) {
    if (!transitionStyles.length) return 0;

    const div = Object.assign(document.createElement('span'), {
      class: 'transition',
      style: `transition: ${transitionStyles.join(', ')}`,
    });
    this.appendChild(div);

    const divStyle = getComputedStyle(div);
    const durations = divStyle
      .getPropertyValue('transition-duration')
      .split(',')
      .map(value => value.trim());
    const delays = divStyle
      .getPropertyValue('transition-delay')
      .split(',')
      .map(value => value.trim());

    this.removeChild(div);

    return durations.reduce((max, duration, index) => {
      const delay = delays[index] ?? delays[0] ?? '0s';
      const total = this.parseTimeToMilliseconds(duration) + this.parseTimeToMilliseconds(delay);
      return Math.max(max, total);
    }, 0);
  }

  /**
   * Additional functionality that happens when `open` changes. Will also run when first updated if `open` is true.
   * @param open - Whether or not the component is changing to open or closed.
   */
  protected onOpenChange(open: boolean) {
    this.emitScopedEvent(open ? 'show' : 'hide');

    this.updateTransitionState();
    this.pendingAfterEvent = open ? 'after-show' : 'after-hide';
    this.transitionWaitId += 1;
    const waitId = this.transitionWaitId;

    if (this.transitionSettleTimer) {
      clearTimeout(this.transitionSettleTimer);
      this.transitionSettleTimer = undefined;
    }

    if (!this.transition) {
      this.settleTransition(waitId);
      return;
    }

    this.transitionSettleTimer = setTimeout(() => this.settleTransition(waitId), this.transitionMaxTime + 50);
  }

  protected override firstUpdated() {
    super.firstUpdated();
    if (this.open) this.onOpenChange(true);
  }

  /**
   * Handles transitionend event to emit `{baseName}-after-show` and `{baseName}-after-hide` events after transitions are complete. Should be added to the element with the CSS transition.
   */
  protected handleTransitionEnd(e: TransitionEvent) {
    if (e.target !== e.currentTarget) return;
    this.settleTransition(this.transitionWaitId);
  }

  protected settleTransition(waitId: number) {
    if (waitId !== this.transitionWaitId || !this.pendingAfterEvent) return;

    if (this.transitionSettleTimer) {
      clearTimeout(this.transitionSettleTimer);
      this.transitionSettleTimer = undefined;
    }

    const afterEvent = this.pendingAfterEvent;
    this.pendingAfterEvent = undefined;
    this.emitScopedEvent(afterEvent);
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
