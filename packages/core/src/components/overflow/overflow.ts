import { property, query, state } from 'lit/decorators.js';
import { html } from 'lit/static-html.js';
import { repeat } from 'lit/directives/repeat.js';
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
 * @cssproperty --overflow-item-gap - Sets the gap between items in the overflow container.
 * @cssproperty --overflow-collapsing-container-display - Sets the display property of the collapsing container.
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
 * @dependency Button
 * @dependency Icon
 * @dependency Menu
 * @dependency MenuItem
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

  /**
   * Internal state tracking whether or not there are overflowing elements.
   */
  @state()
  protected hasOverflow: boolean = false;

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
   * Holds a map of all overflowed slottedElements that are hidden from view.
   */
  protected overflowSet = new Map();

  protected resizeObserver = new ResizeObserver(() => this.handleResize());

  /**
   * Used to determine resize direction.
   */
  protected lastWidth = 0;

  protected dropdownOpen = false;

  public static override get dependencies(): (typeof CharmElement)[] {
    return [Button, Icon, Menu, MenuItem];
  }

  /**
   * Whether or not there are overflowing elements. Readonly.
   */
  @property({ type: Boolean, reflect: true })
  public get overflowing() {
    return this.hasOverflow;
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
      this.hasOverflow = false;
      return false;
    }
    this.hasOverflow = this.overflowSet.size > 0;
    return this.collapsingElements.clientWidth > this.collapsingContainer.clientWidth;
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.resizeObserver.observe(this);
  }

  public override disconnectedCallback() {
    this.lastWidth = 0;
    this.resizeObserver.unobserve(this);
    this.resizeObserver.disconnect();
    super.disconnectedCallback();
  }

  /**
   * Handles setting the internal slottedElements array.
   */
  protected handleSlotChange() {
    this.handleResize();
  }

  /**
   * Handles the hiding/showing of overflowing elements, and emits the overflow event.
   */
  protected handleResize() {
    if (!this.slottedElements) return;

    const overFlowing = this.isOverflowing();
    const previousOverflowSize = this.overflowSet.size;
    const containerWidth = this.collapsingContainer.clientWidth;
    const direction = containerWidth > this.lastWidth ? 'larger' : 'smaller';

    if (overFlowing && this.slottedElements.length - this.overflowSet.size > this.min) {
      // Hide items from right to left until we are no longer overflowing.
      if (this.overflowDirection === 'start') {
        this.hideElements([...this.slottedElements]);
      } else {
        this.hideElements([...this.slottedElements].reverse());
      }
    } else if (!overFlowing && direction === 'larger') {
      // Unhide hidden items from left to right until end or overflowing
      if (this.overflowDirection === 'start') {
        this.showElements([...this.slottedElements].reverse());
      } else {
        this.showElements([...this.slottedElements]);
      }
    }

    if (this.lastWidth !== containerWidth) {
      this.lastWidth = containerWidth;
    }

    if (this.overflowSet.size !== previousOverflowSize) {
      this.emitOverflow();
    }
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
    // set the lastWidth to the current width here to avoid an infinite back-and-forth in case the trigger is wider than what was just hidden
    this.lastWidth = this.collapsingContainer.clientWidth;
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
      this.overflowSet.set(item, item);
    }
  }

  /**
   * Shows an individual element and removes it from the overflow set.
   */
  protected showItem(item: HTMLElement) {
    if (item.hidden) {
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
      text: element.textContent || element.innerText,
      icons: this.parseSlottedIcons(element, ignoreEndSlot),
      subMenuItems: [] as OverflowMenuItem[],
      disabled: element.hasAttribute('disabled'),
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
    this.dropdownOpen = !this.dropdownOpen;
    if (!this.dropdownOpen) return;

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
    return html`
      <${this.scope.tag('button')}
        slot="trigger"
        part="overflow-trigger"
        class="overflow-trigger"
        icon-only
        @click=${this.generateOverflowMenu}
      >
        <${this.scope.tag('icon')} name="more" label=${this.label}></${this.scope.tag('icon')}>
      </${this.scope.tag('button')}>
    `;
  }

  /**
   * Generates the menu template that contains overflowed items.
   */
  protected overflowMenuItemListTemplate(overflowMenuItems: OverflowMenuItem[]) {
    return html`
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
  protected overflowMenuItemTemplate(overFlowItem: OverflowMenuItem): ReturnType<typeof html> {
    return html`
      <${this.scope.tag('menu-item')}
        part="overflow-menu-item"
        class="overflow-menu-item"
        ?fixed-placement=${this.fixedPlacement}
        @click=${() => overFlowItem.hostElement?.click()}
        ?disabled=${overFlowItem.disabled ? 'disabled' : ''}
      >
        ${repeat(
          overFlowItem.icons,
          icon =>
            html` <${this.scope.tag('icon')} slot="${icon.slot || 'start'}" name=${icon.name}></${this.scope.tag(
              'icon'
            )}> `
        )}
        ${overFlowItem.text}
        ${overFlowItem.subMenuItems.length > 0 ? this.overflowMenuItemListTemplate(overFlowItem.subMenuItems) : ''}
      </${this.scope.tag('menu-item')}>
    `;
  }

  /**
   * Generates the menu template that contains the overflow menu list.
   */
  protected overflowMenuTemplate() {
    return html`
      <slot name="menu">
        <${this.scope.tag('menu')}
          fixed-placement
          part="overflow-menu"
          class="overflow-menu"
        >
          ${this.overflowMenuTriggerTemplate()}
          ${this.overflowMenuItemListTemplate(this.overflowMenuItems)}
        </${this.scope.tag('menu')}>
      </slot>
    `;
  }

  /**
   * Generates the overflow template.
   */
  protected overflowTemplate() {
    return html`<span class="collapsing-container" part="overflow-base">
      <span class="collapsing-content" part="overflow-content" role="group">
        ${this.startTemplate()} ${this.menuPosition === 'start' && this.hasOverflow ? this.overflowMenuTemplate() : ''}
        <slot @slotchange=${this.handleSlotChange}></slot>
        ${this.menuPosition === 'end' && this.hasOverflow ? this.overflowMenuTemplate() : ''} ${this.endTemplate()}
      </span>
    </span>`;
  }

  protected override render() {
    return this.overflowTemplate();
  }
}

export default CoreOverflow;
