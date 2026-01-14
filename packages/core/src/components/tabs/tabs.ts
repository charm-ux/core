import { html } from 'lit/static-html.js';
import { property, queryAssignedElements, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import CharmElement from '../../base/charm-element/charm-element.js';
import { keys } from '../../utilities/key-map.js';
import { asyncTimeout } from '../../utilities/helpers.js';
import styles from './tabs.styles.js';
import type { CoreTab } from '../tab/tab.js';
import type { CoreTabPanel } from '../tab-panel/tab-panel.js';

export interface TabsChangeEvent {
  activeTab: CoreTab;
}

let charmTabsId = 0;

/**
 * Tabs provides single selection from tabs. When a tab is selected, the application displays content associated with the selected tab and hides other content.
 *
 * @tag ch-tabs
 * @since 1.0.0
 * @status beta
 *
 * @slot - where the tab list is displayed.
 * @slot tabpanel - where the content that belongs to a individual Tab is displayed.
 *
 * @csspart tabs-tablist - The tab list container.
 *
 * @cssproperty --tabs-align - The alignment of the tabs ('start', 'center', or 'end').
 * @cssproperty --tabs-bg-color - The background color of the tabs container.
 * @cssproperty --tabs-border-color - The border color of the tabs container.
 * @cssproperty --tabs-border-radius - The border radius of the tabs container.
 * @cssproperty --tabs-border-style - The border style of the tabs container.
 * @cssproperty --tabs-border-width - The border width of the tabs container.
 * @cssproperty --tabs-gap - The gap between each tab.
 * @cssproperty --tabs-padding-x - The horizontal padding of the tabs container.
 * @cssproperty --tabs-padding-y - The vertical padding of the tabs container.
 * @cssproperty --tabs-tablist-spacing - The spacing between the tablist and tab panels.
 * @cssproperty --tabs-vertical-min-width - The minimum width for tabs in vertical layout.
 *
 * @event {TabsChangeEvent} tabs-change - Emitted when the active tab changes.
 *
 **/
export class CoreTabs extends CharmElement {
  public static override styles = [...super.styles, styles];

  public static override baseName = 'tabs';

  /**
   * Whether to render the tabs in a column or row fashion. The default value is a `horizontal` layout.
   */
  @property({ type: String, reflect: true })
  public layout?: 'horizontal' | 'vertical';

  /**
   * Set this if you do not want to navigate to a new tab with arrow keys, users will need to push "space" or "enter" to navigate.
   */
  @property({ attribute: 'manual-activation', type: Boolean, reflect: true })
  public manualActivation?: boolean;

  /**
   * Selects the tab elements that are provided by the user.
   */
  @queryAssignedElements({ selector: '[role="tab"]', flatten: true })
  protected tabs!: Array<CoreTab>;

  /**
   * Selects the tab panels elements that are provided by the user and attaches them to a tab.
   */
  @queryAssignedElements({ slot: 'tabpanel', selector: '[role="tabpanel"]', flatten: true })
  protected tabPanels!: Array<CoreTabPanel>;

  @state() protected selectedTab?: CoreTab;

  protected focusedIndex: number = -1;
  protected prevSelectedIndex: number = -1;
  protected _activeId: string | undefined;

  public constructor() {
    super();
    charmTabsId++;
  }

  /** Controls which tab is selected. (You can also set `selected` on a single tab.) */
  @property({ attribute: 'active-id' })
  public get activeId() {
    return this._activeId || this.selectedTab?.id;
  }

  /** Refers to the currently active tab. */
  public set activeId(value: string | undefined) {
    this._activeId = value || this.selectedTab?.id;
    this.handleActiveIdChange(value);
  }

  public override firstUpdated() {
    super.firstUpdated();
    this.handleActiveIdChange(this.activeId);
  }

  protected handleActiveIdChange(value: string | undefined) {
    const tab = this.tabs.find(tab => tab.id === value);
    if (tab) {
      this.updateSelection(tab);
    }
  }

  /** Handles the click event on a tab. */
  protected handleTabClick(e: MouseEvent) {
    const tab = (e.target as HTMLElement).closest('[role="tab"]') as CoreTab | null;
    if (!tab) return;

    this.selectTab(tab);
  }

  /** Checks if the given key is invalid for the current layout. Don't handle horizontal keys if we're vertical and vice versa */
  protected isInvalidKeyForLayout(key: string) {
    return (
      (this.layout == 'horizontal' && ['ArrowUp', 'ArrowDown'].includes(key)) ||
      ((this.layout == 'vertical' || undefined) && ['ArrowRight', 'ArrowLeft'].includes(key))
    );
  }

  /** Handles the keydown event on a tab. */
  protected handleTabKeyDown(e: KeyboardEvent) {
    // don't handle keys we don't care about
    if (!['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Home', 'End', ' ', 'Enter'].includes(e.key)) {
      return;
    }

    if (this.isInvalidKeyForLayout(e.key)) return;

    e.preventDefault();

    let nextIndex = -1;

    switch (e.key) {
      case keys.ArrowRight:
      case keys.ArrowDown: {
        nextIndex = this.focusedIndex === this.tabs.length - 1 ? 0 : this.focusedIndex + 1;
        break;
      }

      case keys.ArrowLeft:
      case keys.ArrowUp: {
        nextIndex = this.focusedIndex === 0 ? this.tabs.length - 1 : this.focusedIndex - 1;
        break;
      }

      case keys.Home: {
        nextIndex = 0;
        break;
      }

      case keys.End: {
        nextIndex = this.tabs.length - 1;
        break;
      }

      case keys.Space:
      case keys.Enter: {
        this.selectTab(e.target as CoreTab);
        return;
      }
    }

    this.setFocus(this.focusedIndex, nextIndex);

    if (!this.manualActivation) {
      this.updateSelection(this.tabs[nextIndex]);
      this.emitChange({ activeTab: this.tabs[nextIndex] });
    }
  }

  /** Selects the given tab. */
  protected selectTab(tab: CoreTab) {
    if (!tab || tab.disabled) {
      return;
    }

    const nextIndex = this.tabs.indexOf(tab);
    if (nextIndex === -1) {
      return;
    }

    const prevIndex = this.selectedTab ? this.tabs.indexOf(this.selectedTab) : -1;
    if (prevIndex === nextIndex) {
      return;
    }

    this.setFocus(prevIndex, this.tabs.indexOf(tab));
    this.updateSelection(tab);
    this.emitChange({ activeTab: this.selectedTab! });
  }

  /** Sets the focus on the specified tab indices. */
  protected setFocus(prevIndex: number, newIndex: number) {
    this.focusedIndex = newIndex;
    this.prevSelectedIndex = prevIndex;
    this.tabs[this.prevSelectedIndex]?.setAttribute('tabindex', '-1');
    this.tabs[this.focusedIndex]?.setAttribute('tabindex', '0');
    this.tabs[this.focusedIndex]?.focus();
  }

  /** Updates the selection to the specified tab.
   * @param next - The next tab to select.
   * @param nextIndex - The index of the next tab to select. This is only needed for the initial selection.
   */
  protected updateSelection(next: CoreTab, nextIndex?: number) {
    if (!next || next.disabled) {
      return;
    }

    if (nextIndex !== undefined) {
      this.prevSelectedIndex = nextIndex;
      this.focusedIndex = nextIndex;
    }

    // Unselect the previously selected tab and hide the tab panel
    if (this.selectedTab) {
      this.selectedTab.selected = false;
    }

    this.selectedTab = next;
    this.selectedTab.selected = true;
    this._activeId = this.selectedTab?.id;
    next.setAttribute('tabindex', '0');
  }

  /** Emits the tabs-change event with the provided detail. */
  protected emitChange(detail: TabsChangeEvent) {
    this.emit('tabs-change', { detail });
  }

  /** Handles the change in the tab panels slot. */
  protected async handleTabsSlotChange() {
    await asyncTimeout(); // Wait for the DOM to update
    let firstSelectableTab: CoreTab | undefined;
    let firstSelectableTabIndex: number | undefined;

    this.tabs.forEach((tab, i) => {
      tab.setAttribute('tabindex', '-1');
      tab.setAttribute('aria-selected', tab.selected ? 'true' : 'false');

      // Set ID if needed
      tab.id ||= `tab-${charmTabsId}-${i}`;

      // Link tab to panel if available
      if (this.tabPanels[i]) {
        const panelId = this.tabPanels[i]?.id || `tab-panel-${charmTabsId}-${i}`;
        tab.setAttribute('aria-controls', panelId);
      }

      // Mark disabled state
      tab.disabled && tab.setAttribute('aria-disabled', 'true');

      // Track first selectable tab
      if (!tab.disabled && !firstSelectableTab) {
        firstSelectableTab = tab;
        firstSelectableTabIndex = i;
      }

      // Handle selected tab
      if (tab.selected && !tab.disabled) {
        this.updateSelection(tab, i);
      }

      if (tab.id === this.activeId && !tab.disabled) {
        this.updateSelection(tab, i);
      }
    });

    // Select first tab if none is selected
    if (!this.selectedTab && firstSelectableTab && firstSelectableTabIndex !== undefined) {
      this.updateSelection(firstSelectableTab, firstSelectableTabIndex);
    } else if (!this.selectedTab) {
      this.focusedIndex = 0;
      this.prevSelectedIndex = -1;
      this.tabs[this.focusedIndex]?.setAttribute('tabindex', '0');
    }
  }

  protected async handlePanelSlotChange() {
    await asyncTimeout(); // Wait for the DOM to update
    this.tabPanels.forEach((panel, i) => {
      this.tabs[i].tabPanel = panel;
      panel.tab = this.tabs[i];
      panel.id ||= `tab-panel-${charmTabsId}-${i}`;
      panel.setAttribute('aria-labelledby', this.tabs[i]?.id || `tab-${charmTabsId}-${i}`);
    });
  }

  /** Generates the template for the tab list. */
  protected tabListTemplate() {
    return html`
      <div class="tablist" part="tabs-tablist" role="tablist" aria-orientation=${ifDefined(this.layout)}>
        <slot
          @slotchange=${this.handleTabsSlotChange}
          @click=${this.handleTabClick}
          @keydown=${this.handleTabKeyDown}
        ></slot>
      </div>
    `;
  }

  /** Generates the template for the tab panel. */
  protected tabPanelTemplate() {
    return html`
      <div class="tabpanel">
        <slot name="tabpanel" @slotchange=${this.handlePanelSlotChange}></slot>
      </div>
    `;
  }

  /** Generates the template for the tabs component. */
  protected tabsTemplate() {
    return html` ${this.tabListTemplate()} ${this.tabPanelTemplate()} `;
  }

  protected override render() {
    return this.tabsTemplate();
  }
}

export default CoreTabs;
