import { html, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import CharmElement from '../../base/charm-element/charm-element.js';
import { startContentEndTemplate } from '../../templates/index.js';
import styles from './tab.styles.js';
import type { CoreTabPanel } from '../tab-panel/tab-panel.js';

/**
 * Tab is a sub element that is used within Tabs which represents the clickable options that a end user may choose from.
 *
 * @tag ch-tab
 * @since 1.0.0
 * @status beta
 *
 * @slot - Tab's content.
 * @slot end - Content to show after the tab's content.
 * @slot start - Content to show before the tab's content.
 *
 * @csspart tab-base - The component's internal wrapper.
 *
 * @cssproperty --tab-active-bg-color - The background color of the tab when active.
 * @cssproperty --tab-active-border-color - The border color of the tab when active.
 * @cssproperty --tab-active-fg-color - The foreground color of the tab when active.
 * @cssproperty --tab-active-font-weight - The font weight of the tab when active.
 * @cssproperty --tab-bg-color - The background color of the tab.
 * @cssproperty --tab-border-color - The border color of the tab.
 * @cssproperty --tab-border-radius - The border radius of the tab.
 * @cssproperty --tab-border-width - The width of the tab's border.
 * @cssproperty --tab-border-style - The style of the tab's border.
 * @cssproperty --tab-disabled-bg-color - The background color of the tab when disabled.
 * @cssproperty --tab-disabled-border-color - The border color of the tab when disabled.
 * @cssproperty --tab-disabled-fg-color - The foreground color of the tab when disabled.
 * @cssproperty --tab-disabled-opacity - The opacity of the tab when disabled.
 * @cssproperty --tab-fg-color - The foreground color of the tab.
 * @cssproperty --tab-focus-bg-color - The background color of the tab when focused.
 * @cssproperty --tab-focus-border-color - The border color of the tab when focused.
 * @cssproperty --tab-focus-fg-color - The foreground color of the tab when focused.
 * @cssproperty --tab-font-size - The font size of the tab.
 * @cssproperty --tab-font-weight - The font weight of the tab.
 * @cssproperty --tab-gap - The gap between elements inside the tab.
 * @cssproperty --tab-hover-bg-color - The background color of the tab when hovered.
 * @cssproperty --tab-hover-border-color - The border color of the tab when hovered.
 * @cssproperty --tab-hover-fg-color - The foreground color of the tab when hovered.
 * @cssproperty --tab-icon-gap - The gap between an icon and text in the tab.
 * @cssproperty --tab-icon-size - The size of icons in the tab.
 * @cssproperty --tab-padding-x - The component's inline padding.
 * @cssproperty --tab-padding-y - The component's block padding.
 * @cssproperty --tab-transition - The transition effect for tab state changes.
 **/
export class CoreTab extends CharmElement {
  public static override styles = [...super.styles, styles];

  public static override baseName = 'tab';

  /** Disables the component on page load. */
  @property({ type: Boolean, reflect: true })
  public disabled?: boolean;

  /** Enables a selected tab. */
  @property({ type: Boolean, reflect: true })
  public selected?: boolean;

  /** @internal Used by Tabs to set the tab panel that is associated with this tab. */
  @property({ type: Object, attribute: false })
  public tabPanel?: CoreTabPanel;

  public override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'tab');
  }

  protected override willUpdate(props: PropertyValues) {
    if (props.has('selected')) {
      this.setAttribute('aria-selected', (this.selected ?? false).toString());
      if (this.tabPanel) this.tabPanel.visible = this.selected ?? false;
    }

    if (props.has('disabled')) {
      if (this.disabled) {
        this.selected = false;
        this.setAttribute('aria-selected', 'false');
        this.setAttribute('aria-disabled', 'true');
        if (this.tabPanel) {
          this.tabPanel.visible = false;
        }
      }
    }

    if (props.has('tabPanel')) {
      if (this.tabPanel) {
        this.tabPanel.visible = this.selected ?? false;
      } else {
        this.removeAttribute('aria-controls');
      }
    }
  }

  /** Generates the template for the tab component. */
  protected tabTemplate() {
    return html`<span class="tab-base" part="tab-base">${startContentEndTemplate()}</span>`;
  }

  protected override render() {
    return this.tabTemplate();
  }
}

export default CoreTab;
