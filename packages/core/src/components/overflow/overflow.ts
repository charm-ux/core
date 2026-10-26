import { property, query, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import CharmElement from '../../base/charm-element/charm-element.js';
import { endTemplate, startTemplate } from '../../templates/index.js';
import Button from '../button/button.js';
import Icon from '../icon/icon.js';
import Menu from '../menu/menu.js';
import MenuItem from '../menu-item/menu-item.js';
import styles from './overflow.styles.js';

export interface OverflowMenuItem {
  hostElement?: HTMLElement;
  tagName: string;
  text: string;
  icons: { name: string; slot: string | null }[];
  disabled: boolean;
  checked?: boolean;
  subMenuItems: OverflowMenuItem[];
  id: string;
}

/**
 * The Overflow component enables users to create overflow experiences with any component. Overflow will detect and hide overflowing elements in DOM and manage the overflow state.
 *
 * @tag ch-overflow
 * @since 1.0.0
 * @status beta
 *
 * @slot - Default slot that should contain multiple elements. These elements will be hidden or shown during resize.
 * @slot end - End slot that can be used for static content.
 * @slot start - Start slot that can be used for static content.
 * @slot menu - Slot that can be used to provide a custom menu for overflowed items.
 *
 * @cssprop --charm-overflow-item-gap - Sets the gap between items in the overflow container.
 * @cssprop --charm-overflow-collapsing-container-display - Sets the display property of the collapsing container.
 *
 * @csspart overflow-base - The component's base wrapper.
 * @csspart overflow-content - The container for the default slot.
 * @csspart overflow-end - The end slot.
 * @csspart overflow-start - The start slot.
 * @csspart overflow-menu - The menu for overflowed items.
 * @csspart overflow-trigger - The trigger button for the overflow menu.
 * @csspart overflow-menu - The menu for overflowed items.
 * @csspart overflow-menu-item - The menu item for overflowed items.
 *
 * @event overflow - Emitted when an resize causes items to overflow or to no longer overflow.
 *
 * @dependency CoreButton
 * @dependency CoreIcon
 * @dependency CoreMenu
 * @dependency CoreMenuItem
 *
 **/
export class CoreOverflow extends CharmElement {
  public static override styles = [...super.styles, styles];
  public static override baseName = 'overflow';

  /**
   * Minimum number of values to always display, even if they overflow the container.
   */
  @property({ type: Number, reflect: true })
  public min: number = 0;

  /**
   * Label for the icon button in the overflow menu.
   */
  @property()
  public label = 'More options';

  /**
   * Location of overflow menu. Default is end.
   */
  @property({ attribute: 'menu-position', reflect: true })
  public menuPosition: 'start' | 'end' | 'none' = 'end';

  /**
   * Side to start hiding/adding elements when collapsing/expanding.
   */
  @property({ attribute: 'overflow-direction', reflect: true })
  public overflowDirection?: 'start' | 'end';

  /** Enable this option to prevent the overflow menu from being clipped when the component is placed inside a container with `overflow: auto|hidden|scroll`. */
  @property({ type: Boolean, attribute: 'fixed-placement', reflect: true })
  public fixedPlacement = false;

  /** Whether or not there are overflowing elements. */
  @property({ type: Boolean, reflect: true })
  public overflowing = false;

  /**
   * Overflowed items that are in the menu list.
   */
  @state()
  protected overflowMenuItems: OverflowMenuItem[] = [];

  /**
   * parent container for all slots.
   */
  @query('.collapsing-container')
  protected collapsingContainer!: HTMLElement;

  /**
   * parent container for the collapsible content.
   */
  @query('.collapsing-content')
  protected collapsingElements!: HTMLElement;

  /**
   * Tracks slotted elements that this component has hidden in the overflow menu.
   */
  protected overflowSet = new Set<HTMLElement>();

  protected resizeObserver = new ResizeObserver(() => {
    // Guard against callbacks firing after disconnect
    if (this.isConnected) {
      this.handleResize();
    }
  });

  public static override get dependencies(): (typeof CharmElement)[] {
    return [Button, Icon, Menu, MenuItem];
  }

  /**
   * Elements in the default slot.
   */
  protected get slottedElements(): HTMLElement[] {
    const slot = this.shadowRoot?.querySelector('slot:not([name])') as HTMLSlotElement;
    return slot ? (Array.from(slot.assignedElements({ flatten: true })) as HTMLElement[]) : [];
  }

  /**
   * This method can be used to determine whether content is currently overflowing.
   */
  public isOverflowing() {
    if (!this.collapsingElements || !this.collapsingContainer) {
      this.overflowing = false;
      return false;
    }
    return this.collapsingElements.clientWidth > this.collapsingContainer.clientWidth;
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.resizeObserver.observe(this);
  }

  public override disconnectedCallback() {
    // Disconnect observer first to prevent queued callbacks
    this.resizeObserver.disconnect();
    this.overflowSet.forEach(item => (item.hidden = false));
    this.overflowSet.clear();
    this.overflowing = false;
    super.disconnectedCallback();
  }

  protected override updated(changedProperties: Map<string, unknown>) {
    super.updated(changedProperties);
    if (['min', 'overflowDirection', 'menuPosition'].some(property => changedProperties.has(property))) {
      this.handleResize();
    }
  }

  /**
   * Handles setting the internal slottedElements array.
   */
  protected handleSlotChange() {
    const slotted = new Set(this.slottedElements);
    this.overflowSet.forEach(item => {
      if (!slotted.has(item)) {
        item.hidden = false;
        this.overflowSet.delete(item);
      }
    });
    if (!slotted.size) {
      this.overflowing = false;
      this.overflowMenuItems = [];
      this.emitOverflow();
      return;
    }
    this.handleResize();
  }

  /**
   * Handles the hiding/showing of overflowing elements, and emits the overflow event.
   */
  protected handleResize() {
    const slottedElements = this.slottedElements;
    if (!slottedElements.length) {
      this.overflowing = false;
      return;
    }

    const overFlowing = this.isOverflowing();
    const previousOverflowSize = this.overflowSet.size;
    const activeElement = this.deepActiveElement();
    const focusedItem = activeElement
      ? slottedElements.find(item => this.containsComposed(item, activeElement))
      : undefined;

    if (overFlowing && slottedElements.length - this.overflowSet.size > this.min) {
      // Hide items from right to left until we are no longer overflowing.
      if (this.overflowDirection === 'start') {
        this.hideElements(slottedElements);
      } else {
        this.hideElements([...slottedElements].reverse());
      }
    } else if (!overFlowing) {
      // Unhide hidden items from left to right until end or overflowing
      if (this.overflowDirection === 'start') {
        this.showElements([...slottedElements].reverse());
      } else {
        this.showElements(slottedElements);
      }
    }

    this.overflowing = this.overflowSet.size > 0;

    if (focusedItem && this.overflowSet.has(focusedItem)) {
      this.updateComplete.then(() => {
        if (this.isConnected) this.shadowRoot?.querySelector<HTMLElement>('.overflow-trigger')?.focus();
      });
    }

    if (this.overflowSet.size !== previousOverflowSize) {
      this.emitOverflow();
    }
  }

  protected deepActiveElement(): Element | null {
    let active: Element | null = document.activeElement;
    while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
    return active;
  }

  protected containsComposed(container: Node, target: Node): boolean {
    let node: Node | null = target;
    while (node) {
      if (node === container) return true;
      const root = node.getRootNode();
      node = root instanceof ShadowRoot ? root.host : node.parentNode;
    }
    return false;
  }

  /**
   * Will hide elements in order until no longer overflowing, or until the min visible is reached.
   * Can be overridden for custom hide logic.
   */
  protected hideElements(slottedElements: HTMLElement[]) {
    slottedElements.find(item => {
      this.hideItem(item);
      return this.slottedElements.length - this.overflowSet.size <= this.min || !this.isOverflowing();
    });
  }

  /**
   * Shows elements in order until one additional shown element would result in overflow.
   * Can be overridden for custom show logic.
   */
  protected showElements(slottedElements: HTMLElement[]) {
    const result = slottedElements.find(item => {
      this.showItem(item);
      return this.isOverflowing();
    });

    // If we overflowed, re-hide the item
    if (result) {
      this.hideItem(result);
    }
  }

  /**
   * Hides an individual element and adds it to the overflow set.
   */
  protected hideItem(item: HTMLElement) {
    if (!item.hidden) {
      item.hidden = true;
      this.overflowSet.add(item);
    }
  }

  /**
   * Shows an individual element and removes it from the overflow set.
   */
  protected showItem(item: HTMLElement) {
    if (this.overflowSet.has(item)) {
      item.hidden = false;
      this.overflowSet.delete(item);
    }
  }

  /**
   * Emits a custom overflow event with a detail payload that includes all overflowedElements.
   */
  protected emitOverflow() {
    const elements: HTMLElement[] = [];
    this.overflowSet.forEach(item => {
      if (item.hidden) {
        elements.push(item);
      }
    });
    this.emit('overflow', {
      detail: {
        overflowedElements: elements,
      },
    });
  }

  protected parseSlottedIcons(element: HTMLElement, ignoreEndSlot?: boolean) {
    const iconElements = [...element.querySelectorAll('[icon]')] as Icon[];
    const result = [];

    for (let i = 0; i < iconElements.length; i++) {
      const { name, slot } = iconElements[i];

      if (name && !(ignoreEndSlot && slot === 'end')) {
        result.push({ name, slot });
      }

      if (element.hasAttribute('menu')) {
        break;
      }
    }

    return result;
  }

  protected parseOverflowMenuItem(element: HTMLElement, ignoreEndSlot?: boolean) {
    return {
      hostElement: element,
      tagName: element.tagName,
      text:
        element.getAttribute('aria-label') ||
        element.querySelector('[aria-label]')?.getAttribute('aria-label') ||
        element.querySelector('[label]')?.getAttribute('label') ||
        element.textContent ||
        element.innerText,
      icons: this.parseSlottedIcons(element, ignoreEndSlot),
      subMenuItems: [] as OverflowMenuItem[],
      disabled: element.hasAttribute('disabled'),
      checked: element instanceof Button && element.toggle ? !!element.pressed : undefined,
    };
  }

  protected parseMenu(menu: Menu) {
    const result = this.parseOverflowMenuItem(menu, true);
    const children = [...menu.children];

    // Get the text from the trigger slot element
    children.forEach(child => {
      if (child.slot === 'trigger') {
        result.text = child.textContent || menu.innerText;
      }
    });

    const menuItems: HTMLElement[] = menu?.getItems() || [];
    menuItems.forEach((menuItem: HTMLElement, index: number) => {
      result.subMenuItems.push({ ...this.parseOverflowMenuItem(menuItem), id: `subitem-${index}` });
    });

    return result;
  }

  protected generateOverflowMenu() {
    const results: OverflowMenuItem[] = [];
    let index = 0;

    this.overflowSet.forEach((element: HTMLElement) => {
      if (element.hasAttribute('menu')) {
        results.push({ ...this.parseMenu(element as Menu), id: `menu-${index}` });
      } else {
        results.push({ ...this.parseOverflowMenuItem(element), id: `item-${index}` });
      }
      index++;
    });

    this.overflowMenuItems = [...results.reverse()];
  }

  /**
   * Generates the start template html.
   */
  protected startTemplate() {
    return startTemplate('overflow-start');
  }

  /**
   * Generates the end template html.
   */
  protected endTemplate() {
    return endTemplate('overflow-end');
  }

  /**
   * Generates the button template that triggers the overflow menu.
   */
  protected overflowMenuTriggerTemplate() {
    return this.html`
      <scoped-button
        slot="trigger"
        part="overflow-trigger"
        class="overflow-trigger"
        icon-only
      >
        <scoped-icon name="more" label=${this.label}></scoped-icon>
      </scoped-button>
    `;
  }

  /**
   * Generates the menu template that contains overflowed items.
   */
  protected overflowMenuItemListTemplate(overflowMenuItems: OverflowMenuItem[]): ReturnType<typeof this.html> {
    return this.html`
      ${repeat(
        overflowMenuItems,
        overflowItem => overflowItem.id,
        overFlowItem => this.overflowMenuItemTemplate(overFlowItem)
      )}
    `;
  }

  /**
   * Generates the menu item template.
   */
  protected overflowMenuItemTemplate(overFlowItem: OverflowMenuItem): ReturnType<typeof this.html> {
    return this.html`
      <scoped-menu-item
        part="overflow-menu-item"
        class="overflow-menu-item"
        role=${ifDefined(overFlowItem.checked === undefined ? undefined : 'menuitemcheckbox')}
        .checked=${overFlowItem.checked}
        @click=${(event: MouseEvent) => this.handleOverflowItemClick(event, overFlowItem)}
        ?disabled=${overFlowItem.disabled ? 'disabled' : ''}
      >
        ${repeat(
          overFlowItem.icons,
          icon => this.html` <scoped-icon slot="${icon.slot || 'start'}" name=${icon.name}></scoped-icon> `
        )}
        ${overFlowItem.text}
        ${overFlowItem.subMenuItems.length > 0 ? this.overflowMenuItemListTemplate(overFlowItem.subMenuItems) : ''}
      </scoped-menu-item>
    `;
  }

  protected handleOverflowItemClick(event: MouseEvent, item: OverflowMenuItem) {
    const path = event.composedPath();
    const nearestProxy = path.find(
      node => node instanceof HTMLElement && node.classList.contains('overflow-menu-item')
    );
    if (nearestProxy !== event.currentTarget) return;
    item.hostElement?.click();
    if (item.hostElement instanceof Button && item.hostElement.toggle) {
      item.checked = !!item.hostElement.pressed;
      this.overflowMenuItems = this.overflowMenuItems.map(menuItem =>
        menuItem === item ? { ...menuItem, checked: item.checked } : menuItem
      );
    }
  }

  /**
   * Generates the menu template that contains the overflow menu list.
   */
  protected overflowMenuTemplate() {
    return this.html`
      <slot name="menu">
        <scoped-menu
          ?fixed-placement=${this.fixedPlacement}
          part="overflow-menu"
          class="overflow-menu"
          @menu-show=${this.generateOverflowMenu}
        >
          ${this.overflowMenuTriggerTemplate()}
          ${this.overflowMenuItemListTemplate(this.overflowMenuItems)}
        </scoped-menu>
      </slot>
    `;
  }

  /**
   * Generates the overflow template.
   */
  protected overflowTemplate() {
    return this.html`<span class="collapsing-container" part="overflow-base">
      <span class="collapsing-content" part="overflow-content" role="group" aria-label=${this.label}>
        ${this.startTemplate()} ${this.menuPosition === 'start' && this.overflowing ? this.overflowMenuTemplate() : ''}
        <slot @slotchange=${this.handleSlotChange}></slot>
        ${this.menuPosition === 'end' && this.overflowing ? this.overflowMenuTemplate() : ''} ${this.endTemplate()}
      </span>
    </span>`;
  }

  protected override render() {
    return this.overflowTemplate();
  }
}

export default CoreOverflow;
