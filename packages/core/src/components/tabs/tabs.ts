import { html } from 'lit/static-html.js';
import { property, queryAssignedElements } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import CharmElement from '../../base/charm-element/charm-element.js';
import { keys } from '../../utilities/key-map.js';
import { findNextEnabledIndex } from '../../utilities/helpers.js';
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
 * @attr {string} label - Accessible name for the tab list.
 *
 * @cssprop --charm-tabs-align - The alignment of the tabs ('start' or 'flex-start', 'center', or 'end').
 * @cssprop --charm-tabs-bg-color - The background color of the tabs container.
 * @cssprop --charm-tabs-border-color - The border color of the tabs container.
 * @cssprop --charm-tabs-border-radius - The border radius of the tabs container.
 * @cssprop --charm-tabs-border-style - The border style of the tabs container.
 * @cssprop --charm-tabs-border-width - The border width of the tabs container.
 * @cssprop --charm-tabs-gap - The gap between each tab.
 * @cssprop --charm-tabs-padding-x - The horizontal padding of the tabs container.
 * @cssprop --charm-tabs-padding-y - The vertical padding of the tabs container.
 * @cssprop --charm-tabs-tablist-gap - The spacing between the tablist and tab panels.
 * @cssprop --charm-tabs-vertical-min-width - The minimum width for tabs in vertical layout.
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

  /** Required localized accessible name for the tab list. */
  @property()
  public label!: string;

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

  protected selectedTab?: CoreTab;

  protected focusedIndex: number = -1;
  protected _activeId: string | undefined;
  protected readonly instanceId: number;
  protected generatedTabId = 0;
  protected generatedPanelId = 0;
  protected previousTabs: CoreTab[] = [];
  protected previousPanels: CoreTabPanel[] = [];
  protected observer?: MutationObserver;

  public constructor() {
    super();
    this.instanceId = ++charmTabsId;
  }

  /** Controls which tab is selected. (You can also set `selected` on a single tab.) */
  @property({ attribute: 'active-id' })
  public get activeId() {
    return this._activeId || this.selectedTab?.id;
  }

  /** Refers to the currently active tab. */
  public set activeId(value: string | undefined) {
    const nextValue = value || undefined;
    if (nextValue === this._activeId) return;
    const oldValue = this._activeId;
    this._activeId = nextValue;
    this.requestUpdate('activeId', oldValue);
    this.handleActiveIdChange(nextValue);
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.observer = new MutationObserver(records => {
      if (records.some(record => record.type === 'childList' || this.tabs.includes(record.target as CoreTab))) {
        const selectedTab = records.find(
          record => record.attributeName === 'selected' && (record.target as CoreTab).selected
        )?.target as CoreTab | undefined;
        this.syncTabsAndPanels(selectedTab);
      }
    });
    this.observer.observe(this, {
      attributes: true,
      attributeFilter: ['selected', 'disabled', 'id'],
      childList: true,
      subtree: true,
    });
  }

  public override disconnectedCallback() {
    super.disconnectedCallback();
    this.observer?.disconnect();
    this.observer = undefined;
  }

  public override firstUpdated() {
    super.firstUpdated();
    this.handleActiveIdChange(this.activeId);
  }

  protected handleActiveIdChange(value: string | undefined) {
    const tab = this.tabs?.find(tab => tab.id === value);
    if (tab && !tab.disabled) {
      this.updateSelection(tab);
    } else if (value && this.hasUpdated) {
      this._activeId = this.selectedTab?.id;
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
    const layout = this.layout ?? 'horizontal';
    return (
      (layout === 'horizontal' && [keys.ArrowUp, keys.ArrowDown].includes(key)) ||
      (layout === 'vertical' && [keys.ArrowRight, keys.ArrowLeft].includes(key))
    );
  }

  /** Finds the index of the next non-disabled tab, wrapping around the tab list. */
  protected findNextTabIndex(startIndex: number, direction: 1 | -1): number {
    return findNextEnabledIndex(this.tabs, startIndex, direction, tab => !tab.disabled);
  }

  /** Handles the keydown event on a tab. */
  protected handleTabKeyDown(e: KeyboardEvent) {
    // don't handle keys we don't care about
    if (
      ![
        keys.ArrowRight,
        keys.ArrowLeft,
        keys.ArrowUp,
        keys.ArrowDown,
        keys.Home,
        keys.End,
        keys.Space,
        keys.Enter,
      ].includes(e.key)
    ) {
      return;
    }

    if (this.isInvalidKeyForLayout(e.key)) return;

    e.preventDefault();

    let nextIndex = -1;

    switch (e.key) {
      case keys.ArrowRight:
      case keys.ArrowDown: {
        // Horizontal arrows flip in RTL, where "next" is to the left.
        nextIndex = this.findNextTabIndex(
          this.focusedIndex,
          e.key === keys.ArrowRight && this.resolvedDir === 'rtl' ? -1 : 1
        );
        break;
      }

      case keys.ArrowLeft:
      case keys.ArrowUp: {
        nextIndex = this.findNextTabIndex(
          this.focusedIndex,
          e.key === keys.ArrowLeft && this.resolvedDir === 'rtl' ? 1 : -1
        );
        break;
      }

      case keys.Home: {
        nextIndex = this.findNextTabIndex(-1, 1);
        break;
      }

      case keys.End: {
        nextIndex = this.findNextTabIndex(this.tabs.length, -1);
        break;
      }

      case keys.Space:
      case keys.Enter: {
        this.selectTab(e.target as CoreTab);
        return;
      }
    }

    if (nextIndex === -1) {
      return;
    }

    this.setFocus(this.focusedIndex, nextIndex);

    if (!this.manualActivation) {
      if (this.selectedTab === this.tabs[nextIndex]) return;
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
      this.setFocus(this.focusedIndex, nextIndex);
      return;
    }

    this.setFocus(this.focusedIndex, nextIndex);
    this.updateSelection(tab);
    this.emitChange({ activeTab: this.selectedTab! });
  }

  /** Sets the focus on the specified tab indices. */
  protected setFocus(prevIndex: number, newIndex: number) {
    this.focusedIndex = newIndex;
    this.tabs[prevIndex]?.setAttribute('tabindex', '-1');
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

    if (this.selectedTab === next) {
      this._activeId = next.id;
      this.focusedIndex = this.tabs.indexOf(next);
      next.setAttribute('tabindex', '0');
      return;
    }

    if (nextIndex !== undefined) {
      this.focusedIndex = nextIndex;
    }

    const resolvedNextIndex = this.tabs.indexOf(next);
    if (this.focusedIndex >= 0 && this.tabs[this.focusedIndex] !== next) {
      this.tabs[this.focusedIndex]?.setAttribute('tabindex', '-1');
    }

    // Unselect the previously selected tab and hide the tab panel
    if (this.selectedTab) {
      this.selectedTab.setAttribute('tabindex', '-1');
      this.selectedTab.selected = false;
    }

    this.selectedTab = next;
    this.selectedTab.selected = true;
    this._activeId = this.selectedTab?.id;
    if (resolvedNextIndex >= 0) this.focusedIndex = resolvedNextIndex;
    next.setAttribute('tabindex', '0');
  }

  /** Emits the tabs-change event with the provided detail. */
  protected emitChange(detail: TabsChangeEvent) {
    this.emit('tabs-change', { detail });
  }

  /** Handles the change in the tab panels slot. */
  protected handleTabsSlotChange() {
    this.syncTabsAndPanels();
  }

  protected handlePanelSlotChange() {
    this.syncTabsAndPanels();
  }

  protected syncTabsAndPanels(preferredSelected?: CoreTab) {
    const tabs = this.tabs;
    const panels = this.tabPanels;
    const previousSelected = this.selectedTab;
    // focusedIndex points into the tab list from the previous sync.
    const previousFocused = this.previousTabs[this.focusedIndex];

    for (const tab of this.previousTabs) {
      if (!tabs.includes(tab)) {
        tab.tabPanel = undefined;
        tab.removeAttribute('aria-controls');
      }
    }
    for (const panel of this.previousPanels) {
      if (!panels.includes(panel)) panel.tab = undefined;
    }
    this.previousTabs = [...tabs];
    this.previousPanels = [...panels];
    panels.forEach((panel, index) => {
      const associatedTab = tabs[index];
      if (panel.tab !== associatedTab) panel.tab = associatedTab;
    });

    let firstSelectableTab: CoreTab | undefined;
    let selectedByAttribute: CoreTab | undefined;
    let activeById: CoreTab | undefined;

    tabs.forEach((tab, i) => {
      tab.setAttribute('tabindex', '-1');

      // Set ID if needed
      tab.id ||= `tab-${this.instanceId}-${++this.generatedTabId}`;

      // Link tab to panel if available
      const panel = panels[i];
      if (panel) {
        panel.id ||= `tab-panel-${this.instanceId}-${++this.generatedPanelId}`;
        if (tab.tabPanel !== panel) tab.tabPanel = panel;
        panel.setAttribute('aria-labelledby', tab.id);
        tab.setAttribute('aria-controls', panel.id);
      } else {
        if (tab.tabPanel) tab.tabPanel = undefined;
        tab.removeAttribute('aria-controls');
      }

      // Track first selectable tab
      if (!tab.disabled && !firstSelectableTab) {
        firstSelectableTab = tab;
      }

      if (tab.selected && !tab.disabled && !selectedByAttribute) selectedByAttribute = tab;
      if (tab.id === this._activeId && !tab.disabled) activeById = tab;
    });

    if (this.selectedTab && (!tabs.includes(this.selectedTab) || this.selectedTab.disabled)) {
      this.selectedTab.selected = false;
      this.selectedTab = undefined;
    }
    const retainedSelection =
      this.selectedTab ??
      (previousSelected && tabs.includes(previousSelected) && !previousSelected.disabled
        ? previousSelected
        : undefined);
    const next =
      (preferredSelected && tabs.includes(preferredSelected) && !preferredSelected.disabled
        ? preferredSelected
        : undefined) ??
      activeById ??
      selectedByAttribute ??
      retainedSelection ??
      firstSelectableTab;
    if (next) this.updateSelection(next, tabs.indexOf(next));
    // Keep an independently focused tab (manual activation) as the tab stop when selection is unchanged.
    const focused =
      previousFocused &&
      this.selectedTab === previousSelected &&
      tabs.includes(previousFocused) &&
      !previousFocused.disabled
        ? previousFocused
        : this.selectedTab;
    if (focused && tabs.includes(focused)) {
      if (focused !== this.selectedTab) this.selectedTab?.setAttribute('tabindex', '-1');
      focused.setAttribute('tabindex', '0');
      this.focusedIndex = tabs.indexOf(focused);
    } else {
      this.focusedIndex = -1;
    }
  }

  /** Generates the template for the tab list. */
  protected tabListTemplate() {
    return html`
      <div
        class="tablist"
        part="tabs-tablist"
        role="tablist"
        aria-label=${ifDefined(this.label)}
        aria-orientation=${this.layout ?? 'horizontal'}
      >
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
