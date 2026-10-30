import { property } from 'lit/decorators.js';
import CharmElement from '../charm-element/charm-element.js';
import { parseDuration } from '../../internal/animations.js';
import { DEFAULT_THEME_PREFIX, getThemePrefix } from '../../utilities/theme.js';

const TRANSITION_TIME = /[-+]?(?:\d+\.?\d*|\.\d+)(?:ms|s)\b/gi;

/** Detail payload for a dismissible component's cancelable `request-close` event. */
export interface RequestCloseEventDetail {
  source: string;
}

function splitTransitionList(value: string): string[] {
  const entries: string[] = [];
  let start = 0;
  let depth = 0;

  for (let index = 0; index < value.length; index += 1) {
    if (value[index] === '(') depth += 1;
    if (value[index] === ')') depth -= 1;
    if (value[index] === ',' && depth === 0) {
      entries.push(value.slice(start, index).trim());
      start = index + 1;
    }
  }

  entries.push(value.slice(start).trim());
  return entries;
}

/**
 * Base class for components that can be shown or hidden. They have `show`, `hide`, and `toggle` methods, an `open`
 * and `{baseName}-show` and `{baseName}-hide` events.
 */
export class CharmDismissibleElement extends CharmElement {
  protected _open = false;
  protected transition = false;
  protected transitionMaxTime = 0;
  /** Longest transition duration, excluding delay; `transitionend` reports `elapsedTime` without the delay. */
  protected transitionMaxDuration = 0;
  protected pendingAfterEvent?: 'after-show' | 'after-hide';
  protected resumeAfterEvent?: 'after-show' | 'after-hide';
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
    const afterEvent = this.resumeAfterEvent;
    this.resumeAfterEvent = undefined;
    if (afterEvent && this.open === (afterEvent === 'after-show')) {
      this.startTransitionWait(afterEvent);
    }
  }

  public override disconnectedCallback() {
    if (this.transitionSettleTimer) {
      clearTimeout(this.transitionSettleTimer);
      this.transitionSettleTimer = undefined;
    }
    this.resumeAfterEvent = this.pendingAfterEvent;
    this.pendingAfterEvent = undefined;
    this.transitionWaitId += 1;
    super.disconnectedCallback();
  }

  protected getTransitionStyles() {
    const baseName = (this.constructor as typeof CharmElement).baseName;
    const style = getComputedStyle(this);
    const transitions: string[] = [];

    const names = ['transition', 'show-transition', 'hide-transition', 'position-transition'];
    const prefixes = new Set(['', getThemePrefix(), DEFAULT_THEME_PREFIX]);
    for (const prefix of prefixes) {
      for (const name of names) {
        const candidate = `--${prefix ? `${prefix}-` : ''}${baseName}-${name}`;
        const value = style.getPropertyValue(candidate).trim();
        if (value && value !== 'none') transitions.push(value);
      }
    }

    return transitions;
  }

  protected updateTransitionState() {
    const transitionStyles = this.getTransitionStyles();
    this.transition = transitionStyles.length > 0;
    // Base styles collapse every transition to 0.01ms under reduced motion, so the tokens no longer apply.
    const reducedMotion = this.transition && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.transitionMaxTime = reducedMotion ? 0 : this.getMaxTransitionTime(transitionStyles);
    this.transitionMaxDuration = reducedMotion ? 0 : this.getMaxTransitionTime(transitionStyles, false);
  }

  /**
   * Returns the longest transition in milliseconds.
   * @param includeDelay - Whether to add each transition's delay to its duration.
   */
  protected getMaxTransitionTime(transitionStyles: string[], includeDelay = true) {
    let max = 0;
    for (const transition of transitionStyles) {
      for (const entry of splitTransitionList(transition)) {
        const times = entry.match(TRANSITION_TIME) ?? [];
        if (!times.length) continue;
        const duration = parseDuration(times[0] ?? '0ms');
        const delay = includeDelay ? parseDuration(times[1] ?? '0ms') : 0;
        max = Math.max(max, duration + delay);
      }
    }
    return max;
  }

  /**
   * Additional functionality that happens when `open` changes. Will also run when first updated if `open` is true.
   * @param open - Whether or not the component is changing to open or closed.
   */
  protected onOpenChange(open: boolean) {
    this.emitScopedEvent(open ? 'show' : 'hide');
    if (open !== this.open) return;

    this.startTransitionWait(open ? 'after-show' : 'after-hide');
  }

  protected startTransitionWait(afterEvent: 'after-show' | 'after-hide') {
    this.updateTransitionState();
    this.pendingAfterEvent = afterEvent;
    this.transitionWaitId += 1;
    const waitId = this.transitionWaitId;

    if (this.transitionSettleTimer) {
      clearTimeout(this.transitionSettleTimer);
      this.transitionSettleTimer = undefined;
    }

    if (!this.transition) {
      this.updateComplete.then(() => this.settleTransition(waitId));
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
    // 1ms tolerance absorbs float rounding between the parsed duration and elapsedTime.
    if (e.target !== e.currentTarget || e.pseudoElement || e.elapsedTime * 1000 < this.transitionMaxDuration - 1)
      return;
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
    const evt = this.emitScopedEvent<RequestCloseEventDetail>('request-close', {
      cancelable: true,
      detail: { source },
    });

    if (!evt.defaultPrevented) {
      this.hide();
    }

    return evt;
  }

  /**
   * Emits event scoped to component `${this.baseName}-${name}`.
   * @param name - The name of the event to emit.
   * @param options - Custom event initialization, including detail and cancelability.
   */
  protected emitScopedEvent<T = unknown>(name: string, options?: CustomEventInit<T>): CustomEvent<T> {
    const baseName = (this.constructor as typeof CharmElement).baseName;
    return this.emit(`${baseName}-${name}`, options) as CustomEvent<T>;
  }
}

export default CharmDismissibleElement;
