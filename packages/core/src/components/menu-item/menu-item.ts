import { nothing, PropertyValues } from 'lit';
import { html, literal } from 'lit/static-html.js';
import { property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { HasSlotController } from '../../controller/index.js';
import { startContentEndTemplate } from '../../templates/index.js';
import CharmElement from '../../base/charm-element/charm-element.js';
import { CorePopup } from '../popup/popup.js';
import CoreIcon from '../icon/icon.js';
import CoreMenu from '../menu/menu.js';
import styles from './menu-item.styles.js';

/**
 * Menu items are used to compose menus and are intended to be used with the menu component.
 *
 * @tag ch-menu-item
 * @since 1.0.0
 * @status beta
 *
 * @slot - The menu item's content.
 * @slot start - A presentational prefix icon or similar element.
 * @slot end - A presentational suffix icon or similar element.
 * @slot checkbox-indicator - The checkbox indicator icon.
 * @slot radio-indicator - The radio indicator icon.
 * @slot anchor - The anchor element when the menu item has a submenu.
 * @slot trigger - The trigger element when the menu item has a submenu.
 *
 * @event menu-item-change - Emitted when the menu item is change.
 * @event expanded-change - Emitted when the item's expanded state changes.
 *
 * @csspart menu-item-base - The control's base.
 * @csspart menu-item-submenu-item-icon - The control's submenu icon.
 * @csspart menu-item-checkbox-container - The control's checkbox container.
 * @csspart menu-item-checkbox - The control's checkbox.
 * @csspart menu-item-checkbox-icon - The control's checkbox icon.
 * @csspart menu-item-radio-container - The control's radio container.
 * @csspart menu-item-radio - The control's radio.
 * @csspart menu-item-radio-indicator - The control's radio indicator.
 * @csspart menu-item-submenu-item-icon-expanded - The control's submenu icon when expanded.
 *
 * @cssproperty --menu-item-border-radius - Determines the border radius of the menu item.
 * @cssproperty --menu-item-padding-x - Determines list item's inline padding.
 * @cssproperty --menu-item-padding-y - Determines list item's block padding.
 * @cssproperty --menu-item-submenu-item-icon-size - Determines the size of the submenu icon.
 * @cssproperty --menu-item-submenu-item-icon-rotation - Determines the rotation of the submenu icon on expanded.
 * @cssproperty --menu-item-margin-x - Determines the inline margin of the menu item.
 * @cssproperty --menu-item-input-container-width - Determines the width of the input container.
 * @cssproperty --menu-item-radio-bg-color - Determines the background color of the radio indicator.
 * @cssproperty --menu-item-radio-border-color - Determines the border color of the radio indicator.
 * @cssproperty --menu-item-radio-hover-bg-color - Determines the background color of the radio indicator when hovered.
 * @cssproperty --menu-item-radio-hover-border-color - Determines the border color of the radio indicator when hovered.
 * @cssproperty --menu-item-radio-active - Determines the background color of the radio indicator when active.
 * @cssproperty --menu-item-radio-active-border-color - Determines the border color of the radio indicator when active.
 * @cssproperty --menu-item-bg-color - Determines the background color.
 * @cssproperty --menu-item-border-color -Determines the border color.
 * @cssproperty --menu-item-fg-color - Determines the foreground color.
 * @cssproperty --menu-item-hover-bg-color - Determines the background color when hovered.
 * @cssproperty --menu-item-hover-border-color - Determines the border color when hovered.
 * @cssproperty --menu-item-hover-fg-color - Determines the foreground color when hovered.
 * @cssproperty --menu-item-active-bg-color - Determines the background color when active.
 * @cssproperty --menu-item-active-border-color - Determines the border color when active.
 * @cssproperty --menu-item-active-fg-color - Determines the foreground color when active.
 * @cssproperty --menu-item-disabled-bg-color - Determines the background color when disabled.
 * @cssproperty --menu-item-disabled-border-color - Determines the border color when disabled.
 * @cssproperty --menu-item-disabled-fg-color - Determines the foreground color when disabled.
 * @cssproperty --menu-item-focus-outline-color - Determines the outline color when focused.
 * @cssproperty --menu-item-focus-outline-offset - Determines the outline offset when focused.
 * @cssproperty --menu-item-checkbox-icon-size - Determines the size of the checkbox icon.
 * @cssproperty --menu-item-input-size - Determines the size of the input (checkbox or radio).
 * @cssproperty --menu-item-input-hover-bg-color - Determines the background color of the input container when hovered.
 *
 * @dependency CoreIcon
 * @dependency CoreMenu
 * @dependency CorePopup
 **/
export class CoreMenuItem extends CharmElement {
  public static override styles = [...super.styles, styles];
  public static override baseName = 'menu-item';

  /** Indicates whether the menu item contains a submenu. */
  @state()
  public hasSubmenu: boolean = false;

  /** Sets `aria-current` on the internal link. */
  @property({ reflect: true })
  public current?: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false' | null;

  /** Disables the emitted click event. */
  @property({ type: Boolean, reflect: true })
  public disabled?: boolean;

  /** Expands the menu item to reveal a submenu. */
  @property({ type: Boolean, reflect: true })
  public expanded?: boolean;

  /** When set, the underlying menu item will be rendered as an `<a>` with this `href` instead of a `<span>`. */
  @property()
  public href?: string;

  /** The role of the menu item. */
  @property({ reflect: true })
  public override role: string | null = null;

  /** Controls the placement of the submenu popup. */
  @property({ attribute: 'sub-menu-placement' })
  public subMenuPlacement: string = 'right-start';

  /** Indicates whether the menu item is checked. */
  @property({ type: Boolean, reflect: true })
  public checked?: boolean;

  /** Tells the browser where to open the link. Only used when `href` is set. */
  @property()
  public target?: '_blank' | '_parent' | '_self' | '_top' | (string & {});

  @state()
  protected focusIndex = 0;

  /** A reference to the submenu items. */
  protected submenuItems: HTMLElement[] = [];

  /** Reference to the parent menu element, if available. */
  protected parentMenu?: CoreMenu | null;

  protected readonly hasSlotController = new HasSlotController(this, 'radio-indicator');

  public static override get dependencies(): (typeof CharmElement)[] {
    return [CoreIcon, CoreMenu, CorePopup];
  }

  /** @internal Inherits submenu placement strategy from the parent menu. */
  public get submenuFixedPlacement(): boolean {
    return this.parentMenu?.fixedPlacement ?? false;
  }

  /** Initializes component and sets up event listeners. */
  public override connectedCallback(): void {
    super.connectedCallback();

    this.addEventListener('click', this.handleClick);
    this.addEventListener('keydown', this.handleMenuItemKeyDown);

    this.parentMenu = this.closest<CoreMenu>('[menu]');

    if (this.parentMenu) {
      this.parentMenu.addEventListener('menu-hide', this.handleParentMenuHide);
    }

    this.updateSubmenuState();

    if (this.hasSubmenu) {
      this.addEventListener('mouseenter', this.handleMouseEnter);
      this.addEventListener('mouseleave', this.handleMouseLeave);
    }
  }

  /** Removes event listeners. */
  public override disconnectedCallback(): void {
    super.disconnectedCallback();

    this.removeEventListener('click', this.handleClick);
    this.removeEventListener('keydown', this.handleMenuItemKeyDown);

    const parentMenu = this.closest('[menu]');
    if (parentMenu) {
      parentMenu.removeEventListener('menu-hide', this.handleParentMenuHide);
    }

    if (this.hasSubmenu) {
      this.removeEventListener('mouseenter', this.handleMouseEnter);
      this.removeEventListener('mouseleave', this.handleMouseLeave);
    }
  }

  public override updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has('expanded')) {
      this.toggleSubmenuItems();
    }

    if (this.parentMenu && changedProperties.has('parentMenu')) {
      this.requestUpdate();
    }

    if (changedProperties.has('checked') && this.role?.startsWith('menuitem')) {
      this.setAttribute('aria-checked', String(this.checked));
    }
  }

  /** Overrides the default click action for the menu item. */
  public override async click() {
    if (!!this.href && !this.disabled) {
      const anchor = this.shadowRoot?.querySelector('a');
      anchor?.click();
    } else {
      super.click();
    }
  }

  /** Handles when the parent menu is closed */
  protected handleParentMenuHide = () => {
    if (this.expanded) {
      this.expanded = false;
    }
  };

  /** Handles click events on the menu item. */
  protected handleClick(event: MouseEvent) {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    this.emit('menu-item-change');

    if (this.hasSubmenu) {
      this.toggleSubmenuItems();
    }
  }

  /** Toggles the visibility of the submenu items.*/
  protected toggleSubmenuItems() {
    if (!this.shadowRoot) return;

    const submenuContainer = this.shadowRoot?.querySelector('.submenu');

    this.submenuItems.forEach(item => {
      if (this.expanded) {
        submenuContainer?.appendChild(item);
        item.hidden = false;
        item.setAttribute('role', 'menuitem');
      } else {
        this.appendChild(item);
        item.hidden = true;
      }
    });

    this.emit('expanded-change');
  }

  /** Updates the submenu state based on the presence of submenu items. */
  protected updateSubmenuState() {
    const submenuItems = Array.from(this.querySelectorAll(`:scope > ${this.tagName.toLowerCase()}`)) as HTMLElement[];

    const hasSubmenu = submenuItems.length > 0;
    this.hasSubmenu = hasSubmenu;

    this.toggleAttribute('has-submenu', hasSubmenu);
    this.toggleAttribute('aria-haspopup', hasSubmenu);

    if (this.hasSubmenu) {
      submenuItems.forEach(item => item.setAttribute('hidden', ''));
    }

    this.submenuItems = submenuItems;
  }

  /** Handles keydown events on the menu item. */
  protected handleMenuItemKeyDown = async (e: KeyboardEvent) => {
    if (e.defaultPrevented || !this.submenuItems?.length) return;

    let keyHandled = false;

    switch (e.key) {
      case 'Enter':
      case ' ':
        if (!this.disabled) {
          this.click();
          keyHandled = true;
        }
        break;

      case 'ArrowRight':
        if (this.hasSubmenu && !this.expanded) {
          this.expanded = true;
          await this.updateComplete;
          this.setFocus(0);
          keyHandled = true;
        }
        break;

      case 'ArrowLeft':
        if (this.hasSubmenu && this.expanded) {
          this.expanded = false;
          requestAnimationFrame(() => {
            this.tabIndex = 0;
            this.focus();
          });
          keyHandled = true;
        }
        break;
    }

    if (keyHandled) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  protected setFocus(targetIndex: number) {
    if (!this.submenuItems?.length) return;

    this.submenuItems[this.focusIndex].setAttribute('tabindex', '-1');

    if (targetIndex < 0) {
      this.focusIndex = this.submenuItems.length - 1;
    } else if (targetIndex >= this.submenuItems.length) {
      this.focusIndex = 0;
    } else {
      this.focusIndex = targetIndex;
    }

    this.submenuItems[this.focusIndex].setAttribute('tabindex', '0');
    this.submenuItems[this.focusIndex].focus();
  }

  /** Handles mouseenter events on the sub menu item. */
  protected handleMouseEnter = () => {
    if (this.hasSubmenu && !this.disabled) {
      this.expanded = true;
    }
  };

  /** Handles mouseleave events on the sub menu item. */
  protected handleMouseLeave = () => {
    if (this.hasSubmenu && !this.disabled) {
      this.expanded = false;
    }
  };

  /** Generates and returns a template for rendering the checkbox indicator within a menu item, conditional on the menu item's role being 'menuitemcheckbox'. */
  protected checkboxIndicatorTemplate() {
    return this.role === 'menuitemcheckbox'
      ? html`
          <span class="input-container" part="menu-item-checkbox-container">
            <span class="checkbox" part="menu-item-checkbox">
              ${this.checked
                ? html`
                    <slot name="checkbox-indicator">
                      <${this.scope.tag('icon')}
                          name="checkmark"
                          class="checkbox-icon"
                          part="menu-item-checkbox-icon"
                      ></${this.scope.tag('icon')}></slot>`
                : nothing}
            </span>
          </span>
        `
      : nothing;
  }

  /** Generates and returns a template for rendering the radio indicator within a menu item, conditional on the menu item's role being 'menuitemradio'. */
  protected radioIndicatorTemplate() {
    const hasRadioIndicator = this.hasSlotController.hasNamedSlot('radio-indicator');

    return this.role === 'menuitemradio'
      ? html`
          <span class="input-container" part="menu-item-radio-container">
            ${!hasRadioIndicator
              ? html` <span class="radio" part="menu-item-radio">
                  <span class="radio-indicator" part="menu-item-radio-indicator"></span>
                </span>`
              : nothing}
            <slot name="radio-indicator"></slot>
          </span>
        `
      : nothing;
  }

  /** Generates a template for the submenu icon. */
  protected submenuIconTemplate() {
    return this.hasSubmenu
      ? this.expanded
        ? html` 
        <${this.scope.tag('icon')}
          class="submenu-item-icon-expanded"
          part="menu-item-submenu-item-icon-expanded"
          name="chevron-down"
        ></${this.scope.tag('icon')}>
        `
        : html`
        <${this.scope.tag('icon')}
          class='submenu-item-icon'
          part="menu-item-submenu-item-icon"
          name="chevron-down"
          ></${this.scope.tag('icon')}>
        `
      : nothing;
  }

  /** Generates a template for a menu item. */
  protected menuItemTemplate() {
    const isLink = !!this.href;
    const tag = isLink ? literal`a` : literal`span`;

    return html`
      <${tag}
        slot=${ifDefined(this.hasSubmenu ? 'anchor' : undefined)}
        class="base"
        part="menu-item-base"
        aria-current=${ifDefined(isLink && this.current ? 'page' : undefined)}
        aria-disabled=${this.disabled}
        href=${ifDefined(isLink && !this.disabled ? this.href : undefined)}
        target=${ifDefined(isLink && !this.disabled ? this.target : undefined)}
        tabindex=${ifDefined(isLink ? '-1' : undefined)}
      >
        ${this.checkboxIndicatorTemplate()}
        ${this.radioIndicatorTemplate()}
        ${startContentEndTemplate()}
        ${this.submenuIconTemplate()}
      </${tag}>
    `;
  }

  /** Generates a template for a popup menu item. */
  protected popupSubmenuItemTemplate() {
    return html`
          <${this.scope.tag('menu')}
            class="submenu"
            placement=${this.subMenuPlacement}
            strategy=${this.submenuFixedPlacement ? 'fixed' : 'absolute'}
            ?open=${this.expanded}
          >
          <div slot="trigger">
            ${this.menuItemTemplate()}
          </div>
          </${this.scope.tag('menu')}>
        `;
  }

  /** Renders the component based on the presence of a submenu */
  protected renderMenuItemTemplate() {
    return this.hasSubmenu ? this.popupSubmenuItemTemplate() : this.menuItemTemplate();
  }

  /** Renders the component based on the presence of a submenu. */
  protected override render() {
    return this.renderMenuItemTemplate();
  }
}

export default CoreMenuItem;
