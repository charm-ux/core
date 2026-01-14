import { html } from 'lit/static-html.js';
import { PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import CharmElement from '../../base/charm-element/charm-element.js';
import styles from './tab-panel.styles.js';
import type { CoreTab } from '../tab/tab.js';

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
 * @cssproperty --tab-panel-padding-x - The component's inline padding.
 * @cssproperty --tab-panel-padding-y - The component's block padding.
 * @cssproperty --tab-panel-transition - The transition when showing/hiding.
 * @cssproperty --tab-panel-border-color - The border color of the tab panel.
 * @cssproperty --tab-panel-border-width - The border width of the tab panel.
 * @cssproperty --tab-panel-border-style - The border style of the tab panel.
 * @cssproperty --tab-panel-border-radius - The border radius of the tab panel.
 * @cssproperty --tab-panel-min-height - The minimum height of the tab panel.
 * @cssproperty --tab-panel-box-shadow - The box shadow of the tab panel.
 * @cssproperty --tab-panel-bg-color - The background color of the tab panel.
 * @cssproperty --tab-panel-fg-color - The foreground color of the tab panel.
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

  public override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'tabpanel');
    this.setAttribute('slot', 'tabpanel');
    this.addEventListener('transitionend', (e: TransitionEvent) => this.handleTransitionEnd(e));
    this.hidden = true; // initially hidden
  }

  /** Handles the `transitionend` event. */
  protected handleTransitionEnd(event: TransitionEvent) {
    if (event.target !== this) return;
    this.hidePanel();
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

  protected override willUpdate(props: PropertyValues) {
    if (props.has('visible')) {
      if (this.visible) {
        this.hidden = false;
        // when hiding, hidden will be set to true after transition
      }

      if (!this.hasUpdated) {
        return;
      }

      if (this.visible) {
        this.emit('tab-show');
      } else {
        this.emit('tab-hide');
      }

      // if there is no transitionend event, emit the after-show and after-hide events right away
      const transition = getComputedStyle(this).transition;
      if (transition.startsWith('none')) {
        this.hidePanel();
      }
    }
  }

  /** Generates the template for the tab panel */
  protected tabPanelTemplate() {
    return html`
      <div class="tab-panel-base" part="tab-panel-base">
        <slot></slot>
      </div>
    `;
  }

  protected override render() {
    return this.tabPanelTemplate();
  }
}

export default CoreTabPanel;
