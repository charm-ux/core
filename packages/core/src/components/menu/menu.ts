import { html } from 'lit/static-html.js';
import { property, state } from 'lit/decorators.js';
import { CharmDismissibleElement, CharmElement } from '../../base/index.js';
import { CorePopup, PopupPlacement } from '../popup/popup.js';
import { CoreMenuItem } from '../menu-item/menu-item.js';
import { CoreMenuGroup } from '../menu-group/menu-group.js';
import styles from './menu.styles.js';

export type MenuCloseSource = 'change' | 'trigger' | 'document' | 'keyboard';

export interface MenuRequestCloseEvent {
  source: MenuCloseSource;
}

// id for slotted trigger (will only be added if one doesn't exist)
let dropdownButtonId = 0;

/**
 * Menu is a component that allows showing content dropped down from a trigger element when it is clicked.
 * It directly manages menu items without requiring a wrapper element.
 *
 * @tag ch-menu
 * @since 1.0.0
 * @status beta
 *
 * @slot - The menu items.
 * @slot trigger - The element which should toggle the menu.
 *
 * @event ready - Emitted when the component has completed its initial render.
 * @event menu-show - Emitted when the menu content is shown.
 * @event menu-after-show - Emitted after the menu content is shown and transitions are complete.
 * @event menu-hide - Emitted when the menu content closes.
 * @event menu-after-hide - Emitted after the menu content closes and transitions are complete.
 * @event {MenuRequestCloseEvent} menu-request-close - Emitted when the user attempts to close the menu.
 *
 * @csspart menu-popup-base - The popup's internal container.
 * @csspart menu-popup - The popup's base wrapper.
 *
 * @cssproperty --menu-bg-color - The background color of the menu.
 * @cssproperty --menu-border-color - The border color of the menu.
 * @cssproperty --menu-border-radius - The border radius of the menu.
 * @cssproperty --menu-border-style - The border style of the menu.
 * @cssproperty --menu-border-width - The border width of the menu.
 * @cssproperty --menu-max-width - The maximum width of the menu.
 * @cssproperty --menu-min-width - The minimum width of the menu.
 * @cssproperty --menu-popup-padding - The padding to apply to the menu popup.
 * @cssproperty --menu-shadow - The shadow of the menu.
 * @cssproperty --menu-transition - The transition of the menu.
 * @cssproperty --menu-width - The width of the menu.
 * @cssproperty --menu-z-index - The z-index of the menu.
 *
 * @dependency CorePopup
 **/
export class CoreMenu extends CharmDismissibleElement {
  public static override styles = [...super.styles, styles];
  public static override baseName = 'menu';

  /** The placement of the menu. */
  @property({ reflect: true })
  public placement: PopupPlacement = 'bottom-start';

  /** Prevents the menu from being clipped when the component is placed inside a container with `overflow` of 'auto', 'hidden' , or 'scroll'. */
  @property({ type: Boolean, attribute: 'fixed-placement', reflect: true })
  public fixedPlacement = false;

  /** Popup element */
  @state()
  protected _popup?: CorePopup;

  /** Menu items */
  @state()
  protected items: Array<HTMLElement> = [];

  /** The index of the currently focused item */
  protected focusIndex = 0;

  /** The last focused item before a submenu was opened */
  protected lastFocusedItem?: HTMLElement | null = null;

  /** Query for the trigger element */
  protected trigger?: HTMLElement;

  public static override get dependencies(): (typeof CharmElement)[] {
    return [CorePopup];
  }

  /** @internal Gets the popup element */
  public get popup(): CorePopup | undefined {
    if (!this._popup) {
      this._popup = this.shadowRoot?.querySelector('.popup') as CorePopup;
    }
    return this._popup;
  }

  /** Checks if the trigger is disabled */
  protected get triggerIsDisabled(): boolean {
    if (!this.trigger) return true;
    return this.trigger.hasAttribute('disabled') || this.trigger.ariaDisabled === 'true';
  }

  public set popup(value: CorePopup | undefined) {
    this._popup = value;
    this.requestUpdate();
  }

  /** Gets the menu items. */
  public getItems(): Array<HTMLElement> {
    return this.items;
  }

  public override async connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this.handlePageClick);
    this.addEventListener('keydown', this.handleKeyDown);
    this.addEventListener('focusout', this.handleFocusOut);
    this.addEventListener('click', this.handleRadioMenuItemSelection);
    this.addEventListener('menu-item-change', this.handleMenuItemSelection);
    this.addEventListener('menu-group-select', this.handleMenuItemSelection);
  }

  public override disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this.handlePageClick);
    this.removeEventListener('keydown', this.handleKeyDown);
    this.removeEventListener('focusout', this.handleFocusOut);
    this.removeEventListener('click', this.handleRadioMenuItemSelection);
    this.removeEventListener('menu-item-change', this.handleMenuItemSelection);
    this.removeEventListener('menu-group-select', this.handleMenuItemSelection);

    // Clean up item event listeners
    this.items?.forEach(item => {
      item.removeEventListener('focus', this.handleItemFocus);
    });
  }

  protected override onOpenChange(open: boolean) {
    super.onOpenChange(open);
    this.setTriggerAttribute(this.trigger!, 'expanded', open.toString());
  }

  /** Sets associated attribute or aria attribute on specified trigger element */
  protected setTriggerAttribute(
    element: HTMLElement,
    attribute: 'expanded' | 'pressed' | 'label' | 'current' | 'haspopup' | 'controls',
    value: string
  ) {
    if (!element) return;

    // For 'focusable' elements: manages boolean attributes as present/absent instead of with string values
    if (element.hasAttribute('focusable') && (value === 'true' || value === 'false')) {
      element.toggleAttribute(attribute, value === 'true');
      return;
    }

    const attr = element.hasAttribute('focusable') ? attribute : `aria-${attribute}`;
    element.setAttribute(attr, value);
  }

  /** Emits a custom keyboard event to request the menu to close */
  protected handleKeyDown = async (e: KeyboardEvent) => {
    if (e.defaultPrevented || !this.items?.length) return;

    let keyHandled = false;
    const currentItem = this.items[this.focusIndex] as CoreMenuItem;
    const parentGroup = currentItem.closest('[menu-group]') as CoreMenuGroup | null;

    switch (e.key) {
      case 'ArrowDown':
        if (!this.open) {
          await this.show();
          this.setFocus(this.items.length + 1);
        } else if (parentGroup) {
          this.setFocus(this.focusIndex + 1, parentGroup);
        } else {
          this.setFocus(this.focusIndex + 1);
        }
        keyHandled = true;
        break;

      case 'ArrowUp':
        if (!this.open) {
          await this.show();
          this.setFocus(this.items.length - 1);
        } else if (parentGroup) {
          this.setFocus(this.focusIndex - 1, parentGroup);
        } else {
          this.setFocus(this.focusIndex - 1);
        }
        keyHandled = true;
        break;

      case 'Home':
        this.setFocus(0);
        keyHandled = true;
        break;

      case 'End':
        this.setFocus(this.items.length - 1);
        keyHandled = true;
        break;

      case 'Enter':
      case ' ':
        if (this.trigger?.matches(':focus') && !this.open) {
          e.preventDefault();
          await this.show();
          await this.updateComplete;
          this.setFocus(0);
          keyHandled = true;
          break;
        }

        if (currentItem) {
          if (parentGroup) {
            currentItem.click();
          } else if (this.open) {
            if (currentItem.hasSubmenu && !currentItem.expanded) {
              this.lastFocusedItem = currentItem;
              currentItem.expanded = true;
              await this.updateComplete;
            } else {
              currentItem.click();
              this.requestClose('change');
            }
          }
          keyHandled = true;
        }
        break;
      case 'Tab':
        this.open = false;
        this.items[this.focusIndex].setAttribute('tabindex', '-1');
        this.items[0].setAttribute('tabindex', '0');
        this.focusIndex = 0;
        break;
    }

    if (keyHandled) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  /** Handle page click to close the menu */
  protected handlePageClick = (e: Event) => {
    if (!this.open || e.composedPath().includes(this)) return;
    this.requestClose('document');
  };

  /** Handle slot change for trigger slot */
  protected handleTriggerSlotChange(e: Event) {
    const target = e.target as HTMLSlotElement;
    if (target.name !== 'trigger') return;

    const elements = target.assignedElements({ flatten: true }) as HTMLElement[];
    if (!elements.length) return;

    this.trigger?.removeEventListener('click', this.handleTriggerClick);
    this.trigger = elements[0];
    this.trigger?.addEventListener('click', this.handleTriggerClick);
    this.setAriaLabels();
  }

  /** Handle trigger click to show/hide the menu */
  protected handleTriggerClick = async (e: MouseEvent) => {
    if (e.defaultPrevented) return;

    if (this.open) {
      this.requestClose('trigger');
    } else {
      await this.show();
      requestAnimationFrame(() => {
        const allMenuItems = Array.from(this.querySelectorAll('[menu-item]')) as HTMLElement[];
        if (allMenuItems.length > 0) {
          allMenuItems[0].focus();
        }
      });
    }
  };

  /** Handle radio menu item selection */
  protected handleRadioMenuItemSelection(e: Event) {
    const targetItem = e.composedPath().find(el => (el as HTMLElement).getAttribute?.('role') === 'menuitemradio') as
      | HTMLElement
      | undefined;

    if (targetItem) {
      this.items.forEach(item => {
        if (item.getAttribute('role') === 'menuitemradio') {
          item.removeAttribute('checked');
        }
      });
      targetItem.setAttribute('checked', '');
      e.stopPropagation();
    }
  }

  /** Handle focus out event */
  protected handleFocusOut = (e: FocusEvent) => {
    // if focus-out is to the trigger button, update closed state
    if (e.relatedTarget && (e.relatedTarget as Element).hasAttribute('button')) {
      this.open = false;
    }
    if (!this.contains(e.relatedTarget as Element) && this.items?.length) {
      this.items[this.focusIndex].setAttribute('tabindex', '-1');
      this.items[0].setAttribute('tabindex', '0');
      this.focusIndex = 0;
    }
  };

  /** Handle selection of menu item */
  protected handleMenuItemSelection = (event: Event) => {
    const detail = (event as CustomEvent).detail;

    let selectedItem = detail?.selectedItem as HTMLElement;

    if (!selectedItem) {
      selectedItem = event.target as HTMLElement;
    }

    if (!selectedItem) return;

    this.requestClose('change');
  };

  /** Initialize menu items */
  protected initializeItems = () => {
    // First, remove any existing event listeners
    this.items?.forEach(item => {
      item.removeEventListener('focus', this.handleItemFocus);
    });

    const menuItems = Array.from(
      this.querySelectorAll(
        '[role="menuitem"]:not([hidden]):not(.hidden), [role="menuitemcheckbox"]:not([hidden]):not(.hidden), [role="menuitemradio"]:not([hidden]):not(.hidden), [menu-item]:not([hidden]):not(.hidden)'
      )
    ) as HTMLElement[];

    this.items = menuItems;

    if (!this.items?.length) return;

    this.focusIndex = 0;
    this.items.forEach((item, index) => {
      item.setAttribute('tabindex', index === 0 ? '0' : '-1');
      item.addEventListener('focus', this.handleItemFocus);
    });
  };

  /** Set focus on menu item */
  protected setFocus(targetIndex: number, parentGroup?: CoreMenuGroup) {
    let items = this.items;

    if (parentGroup) {
      // If navigating inside a group, get the group's items instead
      items = Array.from(parentGroup.querySelectorAll('ch-menu-item'));
    }

    if (!items?.length) return;

    this.items[this.focusIndex].setAttribute('tabindex', '-1');

    if (targetIndex < 0) {
      this.focusIndex = items.length - 1;
    } else if (targetIndex >= items.length) {
      this.focusIndex = 0;
    } else {
      this.focusIndex = targetIndex;
    }

    const newFocusedItem = items[this.focusIndex];
    newFocusedItem.setAttribute('tabindex', '0');
    newFocusedItem.focus();
  }

  /** Handle focus on menu item */
  protected handleItemFocus = (e: FocusEvent) => {
    const targetItem = e.target as HTMLElement;
    if (!this.items?.length || targetItem === this.items[this.focusIndex]) return;

    this.items[this.focusIndex].setAttribute('tabindex', '-1');
    this.focusIndex = this.items.indexOf(targetItem);
    targetItem.setAttribute('tabindex', '0');
  };

  /** Processes close request with associated source target and completes request */
  protected requestClose(source: MenuCloseSource) {
    const requestClose = this.emitRequestClose(source);

    if (requestClose.defaultPrevented) {
      return;
    }

    this.trigger?.focus();
  }

  /** Processes changes of a slot */
  protected handleDefaultSlotChange = async () => {
    await this.updateComplete;

    const slot = this.shadowRoot?.querySelector('slot:not([name])') as HTMLSlotElement;
    const slottedElements = slot?.assignedElements({ flatten: true }) as HTMLElement[];

    // Set role="menuitem" on all slotted elements if not already set
    slottedElements?.forEach(element => {
      if (!element.hasAttribute('role') && !element.hasAttribute('menu-group')) {
        element.setAttribute('role', 'menuitem');
      }
    });

    this.items = slottedElements;
    this.initializeItems();
  };

  /** Sets aria labels for trigger element */
  protected setAriaLabels() {
    if (!this.trigger) return;

    this.setTriggerAttribute(this.trigger, 'expanded', this.open.toString());
    this.setTriggerAttribute(this.trigger, 'haspopup', 'menu');

    if (!this.trigger.id) {
      this.trigger.id = `dropdown-button-${++dropdownButtonId}`;
    }
  }

  /** Template for the trigger slot */
  protected triggerSlotTemplate() {
    return html` <slot id="anchor" name="trigger" @slotchange=${this.handleTriggerSlotChange}></slot> `;
  }

  /** Template for the popup element */
  protected popupTemplate() {
    return html`
    <${this.scope.tag('popup')}
    anchor="anchor"
    auto-size="both"
    class="popup"
    exportparts="
      base:popup-base
      "
    flip
    part="menu-popup"
    placement=${this.placement}
    shift
    shift-padding="4"
    fixed-placement=${this.fixedPlacement}
    ?open=${this.open}
    @transitionend=${this.handleTransitionEnd}
    @focusout=${this.handleFocusOut}
  >
  <div role="menu" class="popup-base" part="menu-popup-base" ?hidden=${!this.open}>
    <slot @slotchange=${this.handleDefaultSlotChange}></slot>
  </div>
  </${this.scope.tag('popup')}>
    `;
  }

  /** Template for the menu component */
  protected menuTemplate() {
    return html` ${this.triggerSlotTemplate()} ${this.popupTemplate()} `;
  }

  protected override render() {
    return this.menuTemplate();
  }
}

export default CoreMenu;
