import { property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { CharmDismissibleElement, CharmElement } from '../../base/index.js';
import { keys } from '../../utilities/key-map.js';
import { CorePopup, PopupPlacement } from '../popup/popup.js';
import { CoreMenuItem } from '../menu-item/menu-item.js';
import { findNextEnabledIndex } from '../../utilities/helpers.js';
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
 * @csspart menu-popup - The popup element that positions the menu.
 * @csspart menu-popup-base - The menu panel: background, border and shadow.
 * @csspart menu-popup-dialog - The popup's own positioned container.
 *
 * @cssprop --charm-menu-bg-color - The background color of the menu.
 * @cssprop --charm-menu-border-color - The border color of the menu.
 * @cssprop --charm-menu-border-radius - The border radius of the menu.
 * @cssprop --charm-menu-border-style - The border style of the menu.
 * @cssprop --charm-menu-border-width - The border width of the menu.
 * @cssprop --charm-menu-max-width - The maximum width of the menu.
 * @cssprop --charm-menu-min-width - The minimum width of the menu.
 * @cssprop --charm-menu-popup-padding - The padding to apply to the menu popup.
 * @cssprop --charm-menu-shadow - The shadow of the menu.
 * @cssprop --charm-menu-transition - The transition of the menu.
 * @cssprop --charm-menu-width - The width of the menu.
 * @cssprop --charm-menu-z-index - The z-index of the menu.
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

  /** Query for the trigger element */
  protected trigger?: HTMLElement;

  /** The characters accumulated for type-ahead search. */
  protected userTypedQuery = '';

  /** Handle for the timer that resets the type-ahead query after a pause in typing. */
  protected userTypedTimeout?: ReturnType<typeof setTimeout>;

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

  public set popup(value: CorePopup | undefined) {
    this._popup = value;
    this.requestUpdate();
  }

  /** Gets the menu items. */
  public getItems(): Array<HTMLElement> {
    return this.items;
  }

  /** @internal Refreshes menu items after nested menu composition changes. */
  public refreshItems() {
    this.initializeItems();
  }

  public override connectedCallback() {
    super.connectedCallback();
    if (this.open) document.addEventListener('click', this.handlePageClick);
    this.addEventListener('keydown', this.handleKeyDown);
    this.addEventListener('focusout', this.handleFocusOut);
    this.addEventListener('menu-item-change', this.handleMenuItemSelection);
    // Keep the menu's open state in sync when the popup closes itself (e.g. Escape inside the popup,
    // which stops propagation before reaching the menu's own keydown handler).
    this.addEventListener('popup-request-close', this.handlePopupRequestClose);
    this.updateComplete.then(() => {
      if (!this.isConnected) return;
      const triggerSlot = this.shadowRoot?.querySelector('slot[name="trigger"]');
      if (triggerSlot) this.handleTriggerSlotChange({ target: triggerSlot } as unknown as Event);
      void this.handleDefaultSlotChange();
    });
  }

  public override disconnectedCallback() {
    super.disconnectedCallback();
    clearTimeout(this.userTypedTimeout);
    document.removeEventListener('click', this.handlePageClick);
    this.removeEventListener('keydown', this.handleKeyDown);
    this.removeEventListener('focusout', this.handleFocusOut);
    this.removeEventListener('menu-item-change', this.handleMenuItemSelection);
    this.removeEventListener('popup-request-close', this.handlePopupRequestClose);
    this.trigger?.removeEventListener('click', this.handleTriggerClick);

    // Clean up item event listeners
    this.items?.forEach(item => {
      item.removeEventListener('focus', this.handleItemFocus);
    });
  }

  /** Syncs the menu's open state when the popup requests to close itself (e.g. Escape or Tab-trap close). */
  protected handlePopupRequestClose = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    if (this.open) {
      this.requestClose('keyboard');
    }
  };

  protected override onOpenChange(open: boolean) {
    super.onOpenChange(open);
    if (open) document.addEventListener('click', this.handlePageClick);
    else document.removeEventListener('click', this.handlePageClick);
    if (this.trigger) this.setTriggerAttribute(this.trigger, 'expanded', open.toString());
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

  /** Handles keyboard navigation and close requests. */
  protected handleKeyDown = async (e: KeyboardEvent) => {
    if (e.defaultPrevented) return;
    const openingFromTrigger =
      this.trigger?.matches(':focus') && !this.open && (e.key === keys.ArrowDown || e.key === keys.ArrowUp);
    if (!this.items?.length && !openingFromTrigger) return;

    let keyHandled = false;
    const currentItem = this.items[this.focusIndex] as CoreMenuItem;
    switch (e.key) {
      case keys.ArrowDown:
        if (!this.open) {
          await this.show();
          await this.waitForItems();
          this.setFocus(0, 1);
        } else {
          this.setFocus(this.focusIndex + 1);
        }
        keyHandled = true;
        break;

      case keys.ArrowUp:
        if (!this.open) {
          await this.show();
          await this.waitForItems();
          this.setFocus(this.items.length - 1, -1);
        } else {
          this.setFocus(this.focusIndex - 1);
        }
        keyHandled = true;
        break;

      case keys.Home:
        this.setFocus(0, 1);
        keyHandled = true;
        break;

      case keys.End:
        this.setFocus(this.items.length - 1, -1);
        keyHandled = true;
        break;

      case keys.Enter:
      case keys.Space:
        if (this.trigger?.matches(':focus') && !this.open) {
          e.preventDefault();
          await this.show();
          await this.waitForItems();
          this.setFocus(0);
          keyHandled = true;
          break;
        }

        if (currentItem) {
          if (this.open) {
            if (currentItem.hasSubmenu && !currentItem.expanded) {
              currentItem.expanded = true;
              await this.updateComplete;
            } else {
              currentItem.click();
            }
          }
          keyHandled = true;
        }
        break;
      case keys.Tab:
        this.requestClose('keyboard', false);
        this.resetRovingTabindex();
        break;

      case keys.Escape:
        if (this.open) {
          this.requestClose('keyboard');
          keyHandled = true;
        }
        break;
    }

    // Type-ahead search: jump to the first item whose label starts with the typed characters
    // (APG menu pattern). Only single printable characters while open and unmodified count; a
    // Space is ignored when it would start a new query so Space still activates a focused item.
    if (
      this.open &&
      e.key.length === 1 &&
      !(e.metaKey || e.ctrlKey || e.altKey) &&
      !(e.key === keys.Space && this.userTypedQuery === '')
    ) {
      clearTimeout(this.userTypedTimeout);
      this.userTypedTimeout = setTimeout(() => {
        this.userTypedQuery = '';
      }, 1000);

      this.userTypedQuery += e.key.toLowerCase();

      const itemToSelect = this.items.find(
        item =>
          !item.hasAttribute('disabled') &&
          (item.textContent ?? '').trim().toLowerCase().startsWith(this.userTypedQuery)
      );

      if (itemToSelect) {
        this.setFocus(this.items.indexOf(itemToSelect));
        keyHandled = true;
      }
    }

    if (keyHandled) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  /** Handle page click to close the menu */
  protected handlePageClick = (e: Event) => {
    if (!this.open || e.composedPath().includes(this)) return;
    this.requestClose('document', false);
  };

  /** Handle slot change for trigger slot */
  protected handleTriggerSlotChange(e: Event) {
    const target = e.target as HTMLSlotElement;
    if (target.name !== 'trigger') return;

    const elements = target.assignedElements({ flatten: true }) as HTMLElement[];
    this.trigger?.removeEventListener('click', this.handleTriggerClick);
    this.trigger = elements[0];
    if (!this.trigger) return;
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

  /** Handle focus out event */
  protected handleFocusOut = (e: FocusEvent) => {
    const relatedTarget = e.relatedTarget;
    if (relatedTarget instanceof Node && this.contains(relatedTarget)) return;
    if (this.open) this.requestClose('keyboard', false);
    if (this.items?.length) {
      this.resetRovingTabindex();
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
    const previousItems = this.items;
    const previouslyFocusedItem = previousItems[this.focusIndex];
    // First, remove any existing event listeners
    previousItems.forEach(item => {
      item.removeEventListener('focus', this.handleItemFocus);
    });

    const menuItems: HTMLElement[] = [];
    const collect = (element: HTMLElement) => {
      if (element.hidden || element.classList.contains('hidden')) return;
      if (element.matches('[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"], [menu-item]')) {
        menuItems.push(element);
        if (element.hasAttribute('has-submenu')) return;
      }
      Array.from(element.children).forEach(child => {
        if (child instanceof HTMLElement) collect(child);
      });
    };
    const slot = this.shadowRoot?.querySelector('slot:not([name])') as HTMLSlotElement | null;
    slot?.assignedElements({ flatten: true }).forEach(element => {
      if (element instanceof HTMLElement) collect(element);
    });

    this.items = menuItems;
    previousItems.forEach(item => {
      if (!menuItems.includes(item) && item instanceof CoreMenuItem) item.setParentMenu(null);
    });
    this.items.forEach(item => {
      if (item instanceof CoreMenuItem) item.setParentMenu(this);
    });

    if (!this.items.length) {
      this.focusIndex = -1;
      return;
    }

    const previousFocusIndex = previouslyFocusedItem ? this.items.indexOf(previouslyFocusedItem) : -1;
    this.focusIndex =
      previousFocusIndex >= 0 && this.isEnabledItem(this.items[previousFocusIndex])
        ? previousFocusIndex
        : this.items.findIndex(item => this.isEnabledItem(item));
    this.items.forEach((item, index) => {
      item.setAttribute('tabindex', index === this.focusIndex ? '0' : '-1');
      item.addEventListener('focus', this.handleItemFocus);
    });
  };

  /** Set focus on menu item */
  protected setFocus(targetIndex: number, direction = targetIndex < this.focusIndex ? -1 : 1) {
    if (!this.items?.length) return;

    const normalizedTarget = ((targetIndex % this.items.length) + this.items.length) % this.items.length;
    const newIndex = findNextEnabledIndex(this.items, normalizedTarget - direction, direction as 1 | -1, item =>
      this.isEnabledItem(item)
    );
    if (newIndex < 0) return;

    this.items[this.focusIndex]?.setAttribute('tabindex', '-1');
    this.focusIndex = newIndex;
    const newFocusedItem = this.items[newIndex];
    newFocusedItem.setAttribute('tabindex', '0');
    newFocusedItem.focus();
  }

  protected isEnabledItem(item: HTMLElement) {
    return (
      !item.hasAttribute('disabled') && item.getAttribute('aria-disabled') !== 'true' && !item.hasAttribute('hidden')
    );
  }

  protected resetRovingTabindex() {
    this.focusIndex = this.items.findIndex(item => this.isEnabledItem(item));
    this.items.forEach((item, index) => item.setAttribute('tabindex', index === this.focusIndex ? '0' : '-1'));
  }

  /** Handle focus on menu item */
  protected handleItemFocus = (e: FocusEvent) => {
    const targetItem = e.target as HTMLElement;
    const targetIndex = this.items.indexOf(targetItem);
    if (targetIndex < 0 || targetItem === this.items[this.focusIndex]) return;

    this.items[this.focusIndex]?.setAttribute('tabindex', '-1');
    this.focusIndex = targetIndex;
    targetItem.setAttribute('tabindex', '0');
  };

  /** Processes close request with associated source target and completes request */
  protected requestClose(source: MenuCloseSource, restoreFocus = source !== 'document') {
    const requestClose = this.emitRequestClose(source);

    if (requestClose.defaultPrevented) {
      return;
    }

    if (restoreFocus) this.trigger?.focus();
  }

  /** Processes changes of a slot */
  protected handleDefaultSlotChange = async () => {
    await this.updateComplete;
    if (!this.isConnected) return;

    const slot = this.shadowRoot?.querySelector('slot:not([name])') as HTMLSlotElement;
    const slottedElements = slot?.assignedElements({ flatten: true }) as HTMLElement[];

    // Set role="menuitem" on all slotted elements if not already set
    slottedElements?.forEach(element => {
      if (!element.hasAttribute('role') && !element.hasAttribute('menu-group')) {
        element.setAttribute('role', 'menuitem');
      }
    });

    this.initializeItems();
  };

  protected async waitForItems() {
    await this.updateComplete;
    if (this.items.length) return;
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    await this.handleDefaultSlotChange();
  }

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
    return this.html` <slot id="anchor" name="trigger" @slotchange=${this.handleTriggerSlotChange}></slot> `;
  }

  /**
   * Template for the popup element.
   *
   * The menu panel deliberately carries no hidden binding. It used to, and
   * because open reflects synchronously the panel - which is what holds the
   * background, border and shadow - vanished before popup had a chance to fade
   * it, so every menu close was a snap. popup hides its own dialog once the exit
   * transition settles, and from first render when it starts closed, so the menu
   * items stay out of the accessibility tree either way.
   *
   * The exportparts entry forwards popup's popup-base part as
   * menu-popup-dialog. It used to read base:popup-base, which forwarded nothing
   * at all - popup has no part named base, and the two parts consumers actually
   * reach (menu-popup, menu-popup-base) come from menu's own part attributes
   * below, not from forwarding. popup-arrow is deliberately not forwarded: menu
   * never sets the arrow attribute, so no such part exists to forward.
   */
  protected popupTemplate() {
    return this.html`
    <scoped-popup
    anchor="anchor"
    auto-size="both"
    class="popup"
    content-role="none"
    exportparts="popup-base:menu-popup-dialog"
    flip
    part="menu-popup"
    placement=${this.placement}
    shift
    shift-padding="4"
    strategy=${ifDefined(this.fixedPlacement ? 'fixed' : undefined)}
    ?open=${this.open}
    @transitionend=${this.handleTransitionEnd}
  >
  <div role="menu" class="popup-base" part="menu-popup-base">
    <slot @slotchange=${this.handleDefaultSlotChange}></slot>
  </div>
  </scoped-popup>
    `;
  }

  /** Template for the menu component */
  protected menuTemplate() {
    return this.html` ${this.triggerSlotTemplate()} ${this.popupTemplate()} `;
  }

  protected override render() {
    return this.menuTemplate();
  }
}

export default CoreMenu;
