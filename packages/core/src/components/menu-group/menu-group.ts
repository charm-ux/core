import { html } from 'lit/static-html.js';
import { property, queryAssignedElements, state } from 'lit/decorators.js';
import CharmElement from '../../base/charm-element/charm-element.js';
import CoreMenuItem from '../menu-item/menu-item.js';
import styles from './menu-group.styles.js';

export interface SelectedMenuItem {
  selectedItem: CoreMenuItem;
}

/**
 * MenuGroup component that allows grouping of menu items with optional selection behavior.
 *
 * @tag ch-menu-group
 * @since 1.0.0
 * @status beta
 *
 * @slot - Default slot for menu items.
 * @slot heading - Slot for the group heading.
 *
 * @event {SelectedMenuItem} menu-group-select - Emitted when a menu item is selected in a group.
 *
 * @cssproperty --menu-group-heading-padding-x - The x padding for the menu group header.
 * @cssproperty --menu-group-heading-padding-y - The y padding for the menu group header.
 * @cssproperty --menu-group-heading-weight - The font weight for the menu group header.
 * @cssproperty --menu-group-heading-size - The font size for the menu group header.
 * @cssproperty --menu-group-heading-line-height - The line height for the menu group header.
 * @cssproperty --menu-group-heading-margin - The margin for the menu group header.
 *
 * @csspart menu-group-base - The base wrapper for the menu group.
 * @csspart menu-group-heading - The heading element for the menu group.
 *
 * @dependency CoreMenuItem
 */
export class CoreMenuGroup extends CharmElement {
  public static override styles = [...super.styles, styles];
  public static override baseName = 'menu-group';

  /** The heading text for the menu group. */
  @property({ type: String })
  public heading?: string;

  /** Determines if the elements inside the group are selectable as "single" (only one selected at a time) or "multiple" (checkbox behavior). */
  @property({ type: String, reflect: true })
  public select?: 'single' | 'multiple';

  /** Stores all menu items in the group. */
  @queryAssignedElements({ flatten: true })
  protected menuItems!: HTMLElement[];

  /** Internal state that tracks the currently selected menu item in single selection mode. */
  @state()
  protected selectedItem: CoreMenuItem | null = null;

  /** Internal state that tracks the currently focused menu item. */
  @state()
  protected focusIndex = 0;

  public static override get dependencies(): (typeof CharmElement)[] {
    return [CoreMenuItem];
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('click', this.handleSelection);
    this.updateComplete.then(() => this.updateItemRoles());
  }

  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('click', this.handleSelection);
  }

  /** Handles selection behavior based on group type. */
  protected handleSelection(event: Event) {
    if (!this.select) return;

    const target = event.target as CoreMenuItem;
    if (!this.menuItems.includes(target)) return;

    if (this.select === 'single' && target.role === 'menuitemradio') {
      if (this.selectedItem && this.selectedItem !== target) {
        this.selectedItem.removeAttribute('checked');
      }
      this.selectedItem = target;
      this.selectedItem.setAttribute('checked', '');
    } else if (this.select === 'multiple' && target.role === 'menuitemcheckbox') {
      if (target.hasAttribute('checked')) {
        target.removeAttribute('checked');
      } else {
        target.setAttribute('checked', '');
      }
    }

    this.emit('menu-group-select', { detail: { selectedItem: target } });
  }

  /** Updates the role attribute of slotted menu items dynamically. */
  protected updateItemRoles() {
    if (!this.menuItems?.length) return;

    this.menuItems.forEach(item => {
      if (this.select === 'single') {
        item.setAttribute('role', 'menuitemradio');
      } else if (this.select === 'multiple') {
        item.setAttribute('role', 'menuitemcheckbox');
      } else {
        item.setAttribute('role', 'menuitem');
      }
    });
  }

  /* * Runs when the slot content changes, ensuring roles and aria attributes are applied. */
  protected handleSlotChange() {
    this.updateComplete.then(() => {
      this.updateItemRoles();
    });
  }

  /** Template for the menu group component. */
  protected menuGroupTemplate() {
    return html`
      <div class="base" part="menu-group-base">
        <div id="heading" part="menu-group-heading" class="heading">
          <slot name="heading">${this.heading}</slot>
        </div>
        <div role="group" aria-labelledby="heading">
          <slot @slotchange=${this.handleSlotChange}></slot>
        </div>
      </div>
    `;
  }

  protected override render() {
    return this.menuGroupTemplate();
  }
}

export default CoreMenuGroup;
