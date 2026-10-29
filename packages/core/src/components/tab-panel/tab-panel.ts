import { html } from 'lit/static-html.js';
import { property, query } from 'lit/decorators.js';
import CharmElement from '../../base/charm-element/charm-element.js';
import styles from './tab-panel.styles.js';
import type { CoreTab } from '../tab/tab.js';
import type { PropertyValues } from 'lit';

/**
 * Tab panel is a sub element that is used within Tabs. Each tab panel has an associated tab element, that when activated, displays the panel.
 *
 * @tag ch-tab-panel
 * @since 1.0.0
 * @status beta
 *
 * @slot - The tab panel's content.
 *
 * @csspart tab-panel-base - The component's internal wrapper.
 *
 * @cssprop --charm-tab-panel-padding-x - The component's inline padding.
 * @cssprop --charm-tab-panel-padding-y - The component's block padding.
 * @cssprop --charm-tab-panel-transition - The transition when showing/hiding.
 * @cssprop --charm-tab-panel-border-color - The border color of the tab panel.
 * @cssprop --charm-tab-panel-border-width - The border width of the tab panel.
 * @cssprop --charm-tab-panel-border-style - The border style of the tab panel.
 * @cssprop --charm-tab-panel-border-radius - The border radius of the tab panel.
 * @cssprop --charm-tab-panel-min-height - The minimum height of the tab panel.
 * @cssprop --charm-tab-panel-shadow - The box shadow of the tab panel.
 * @cssprop --charm-tab-panel-bg-color - The background color of the tab panel.
 * @cssprop --charm-tab-panel-fg-color - The foreground color of the tab panel.
 *
 * @event tab-show - Emitted when the tab panel is shown.
 * @event tab-hide - Emitted when the tab panel is hidden.
 * @event tab-after-show - Emitted when the tab panel is shown and the transition is finished.
 * @event tab-after-hide - Emitted when the tab panel is hidden and the transition is finished.
 *
 **/
export class CoreTabPanel extends CharmElement {
  public static override styles = [...super.styles, styles];

  public static override baseName = 'tab-panel';

  /** @internal Used by Tabs to set the tab that is associated with this tab panel. */
  @property({ type: Object, attribute: false })
  public tab?: CoreTab;

  /** @internal Used by Tabs for show/hide transitions. */
  @property({ type: Boolean, reflect: true })
  public visible?: boolean;

  @query('slot')
  protected contentSlot!: HTMLSlotElement;

  protected transitionTimer?: ReturnType<typeof setTimeout>;
  /** Longest transition duration plus delay, used for the fallback timer. */
  protected transitionMaxTime = 0;
  /** Longest transition duration, excluding delay; `transitionend` reports `elapsedTime` without the delay. */
  protected transitionMaxDuration = 0;
  protected transitionWaitId = 0;
  protected pendingTransition = false;

  public override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'tabpanel');
    this.setAttribute('slot', 'tabpanel');
    this.addEventListener('transitionend', this.handleTransitionEnd);
    if (!this.hasUpdated && !this.visible) this.hidden = true;
  }

  public override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('transitionend', this.handleTransitionEnd);
    if (this.transitionTimer) clearTimeout(this.transitionTimer);
    this.transitionTimer = undefined;
  }

  /** Handles the `transitionend` event. */
  protected handleTransitionEnd(event: TransitionEvent) {
    // 1ms tolerance absorbs float rounding between the computed duration and elapsedTime.
    if (event.target !== this || event.pseudoElement || event.elapsedTime * 1000 < this.transitionMaxDuration - 1)
      return;
    this.finishTransition(this.transitionWaitId);
  }

  /** Emits event after the `transitionend` event. */
  protected hidePanel() {
    if (this.visible) {
      this.emit('tab-after-show');
    } else {
      // once animation is finished, hide the tab panel fully
      this.hidden = true;
      this.emit('tab-after-hide');
    }
  }

  /** Measures the longest transition, with and without its delay. */
  protected updateTransitionTimes() {
    const style = getComputedStyle(this);
    const durations = style.transitionDuration.split(',').map(value => this.parseCssTime(value));
    const delays = style.transitionDelay.split(',').map(value => this.parseCssTime(value));
    const count = Math.max(durations.length, delays.length);
    let maxTime = 0;
    let maxDuration = 0;
    for (let index = 0; index < count; index++) {
      const duration = durations[index % durations.length] ?? 0;
      maxDuration = Math.max(maxDuration, duration);
      maxTime = Math.max(maxTime, duration + (delays[index % delays.length] ?? 0));
    }
    this.transitionMaxTime = maxTime;
    this.transitionMaxDuration = maxDuration;
  }

  protected parseCssTime(value: string) {
    const amount = Number.parseFloat(value);
    if (!Number.isFinite(amount)) return 0;
    return value.trim().endsWith('ms') ? amount : amount * 1000;
  }

  /** Settles the visibility change identified by `waitId` once; stale or repeated calls are ignored. */
  protected finishTransition(waitId: number) {
    if (waitId !== this.transitionWaitId || !this.pendingTransition) return;
    this.pendingTransition = false;
    if (this.transitionTimer) clearTimeout(this.transitionTimer);
    this.transitionTimer = undefined;
    this.hidePanel();
  }

  protected handleContentSlotChange() {
    const focusableSelector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const nodes = this.contentSlot?.assignedElements({ flatten: true }) ?? [];
    const hasFocusableContent = nodes.some(
      node =>
        (node instanceof HTMLElement && node.matches(focusableSelector) && node.tabIndex >= 0) ||
        node.querySelector(focusableSelector) !== null
    );
    if (hasFocusableContent) this.removeAttribute('tabindex');
    else this.setAttribute('tabindex', '0');
  }

  protected override willUpdate(props: PropertyValues) {
    if (props.has('visible')) {
      if (this.transitionTimer) clearTimeout(this.transitionTimer);
      this.transitionTimer = undefined;
      if (this.visible) {
        this.hidden = false;
        this.inert = false;
        // when hiding, hidden will be set to true after transition
      } else {
        this.inert = true;
      }

      if (!this.hasUpdated) {
        return;
      }

      if (this.visible) {
        this.emit('tab-show');
      } else {
        this.emit('tab-hide');
      }

      this.updateTransitionTimes();
      const waitId = ++this.transitionWaitId;
      this.pendingTransition = true;
      void this.updateComplete.then(() => {
        if (!this.isConnected || waitId !== this.transitionWaitId) return;
        if (this.transitionMaxTime === 0) {
          this.finishTransition(waitId);
        } else {
          if (this.transitionTimer) clearTimeout(this.transitionTimer);
          this.transitionTimer = setTimeout(() => this.finishTransition(waitId), this.transitionMaxTime + 50);
        }
      });
    }
  }

  /** Generates the template for the tab panel */
  protected tabPanelTemplate() {
    return html`
      <div class="tab-panel-base" part="tab-panel-base">
        <slot @slotchange=${this.handleContentSlotChange}></slot>
      </div>
    `;
  }

  protected override render() {
    return this.tabPanelTemplate();
  }
}

export default CoreTabPanel;
