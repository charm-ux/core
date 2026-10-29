import { html } from 'lit/static-html.js';
import { property, queryAssignedElements } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { keys } from '../../utilities/key-map.js';
import { findNextEnabledIndex } from '../../utilities/helpers.js';
import CharmElement from '../../base/charm-element/charm-element.js';
import CoreButton from '../button/button.js';
import CoreTooltip from '../tooltip/tooltip.js';

import styles from './button-group.styles.js';

const BUTTON_CHILDREN = ['button'];

/**
 * Button Group organizes related buttons into a cohesive visual unit, providing logical grouping for actions that are functionally related. It supports vertical/horizontal layouts, split styling, and single/multiple selection modes.
 *
 * @tag ch-button-group
 * @since 1.0.0
 * @status beta
 *
 * @event change - Listens for change events from child buttons when their state changes.
 *
 * @slot - One or more Button or Menu elements to display in the button group.
 * @slot label - Accessible label text for the group or toolbar.
 *
 * @csspart button-group-base - The component's base wrapper.
 *
 * @cssprop --charm-button-group-divider-color - Sets the divider color when the button is in a button group, defaults to --charm-button-fg-color.
 * @cssprop --charm-button-group-divider-height - Sets the divider height when the button is in a button group, defaults to 100% for horizontal button groups, 1px for vertical groups.
 * @cssprop --charm-button-group-divider-width - Sets the divider width when the button is in a button group, defaults to 100% for vertical button groups, 1px for horizontal groups.
 * @cssprop --charm-button-group-gap - Sets the gap between each button.
 * @cssprop --charm-button-pressed-bg-color - Sets the pressed background color of each button.
 * @cssprop --charm-button-pressed-border-color - Sets the pressed border color of each button.
 * @cssprop --charm-button-bg-color - Sets the background color of the button group when split.
 * @cssprop --charm-button-border-color - Sets the border color of the button group when split.
 * @cssprop --charm-button-border-radius - Sets border radius for the button group when split.
 * @cssprop --charm-button-border-width - Sets the border width of the button group when split.
 * @cssprop --charm-button-border-style - Sets the border style of the button group when split.
 * @cssprop --charm-button-focus-border-color - Sets the border color when focused and split.
 * @cssprop --charm-button-hover-border-color - Sets the border color when hovered and split.
 * @cssprop --charm-button-disabled-border-color - Sets the border color when disabled and split.
 **/
export class CoreButtonGroup extends CharmElement {
  public static override styles = [...super.styles, styles];

  public static override baseName = 'button-group';
  public static override watchedSlots = ['label'];

  /** Plain-text accessible name rendered in the group's visually hidden label slot. */
  @property() public label?: string;

  /**
   * Vertically stacks the buttons in the group
   */
  @property({ type: Boolean, reflect: true })
  public vertical?: boolean;

  /**
   * Splits the buttons in the group by removing gap and border radius
   */
  @property({ type: Boolean, reflect: true })
  public split?: boolean;

  /**
   * When set to 'single', only one button in the group can be selected at a time, multiple buttons can be selected when set to 'multiple'
   */
  @property({ reflect: true })
  public select?: 'single' | 'multiple' | null;

  /**
   * When set, the button group will behave like a toolbar with a roving tab index, arrow keyboard interaction, and a role of toolbar
   */
  @property({ type: Boolean, reflect: true })
  public toolbar?: boolean;

  @queryAssignedElements({ flatten: true })
  protected slottedElements!: Array<HTMLElement>;

  protected focusedIndex: number = 0;
  protected managedAttributes = new Map<HTMLElement, Map<string, string | null>>();

  /** all child button elements, including nested button group children */
  protected get buttons(): CoreButton[] {
    const buttonChildren = BUTTON_CHILDREN.map(tag => this.scope.tagName(tag));
    const buttonSelector = buttonChildren.join(',');
    return this.slottedElements.reduce((btns, el) => {
      if (buttonChildren.includes(el.tagName.toLowerCase())) {
        return btns.concat(el as CoreButton);
      }
      // child button groups manage their own buttons
      if (el instanceof CoreButtonGroup) {
        return btns;
      }
      // Otherwise (overflow container, etc.), find all buttons within
      const nestedButtons = Array.from(el.querySelectorAll<CoreButton>(buttonSelector));
      return btns.concat(nestedButtons);
    }, [] as CoreButton[]);
  }

  /**
   * Focusable actions owned by this toolbar, flattened through wrappers and nested groups. A menu
   * contributes its slotted trigger, since that is the element that takes focus and opens the menu.
   */
  protected get toolbarItems(): HTMLElement[] {
    const items: HTMLElement[] = [];
    const buttonTag = this.scope.tagName('button').toLowerCase();
    const menuTag = this.scope.tagName('menu').toLowerCase();
    const groupTag = this.scope.tagName('button-group').toLowerCase();
    const excludedTags = [this.scope.tagName('tooltip').toLowerCase(), this.scope.tagName('divider').toLowerCase()];
    const visit = (element: HTMLElement) => {
      if (element.hidden || element.hasAttribute('inert') || element.getAttribute('aria-hidden') === 'true') return;
      if (excludedTags.includes(element.localName)) return;
      if (element.localName === groupTag && element instanceof CoreButtonGroup) {
        element.slottedElements.forEach(visit);
        return;
      }
      if (element.localName === menuTag) {
        items.push(element.querySelector<HTMLElement>(':scope > [slot="trigger"]') ?? element);
        return;
      }
      if (element.localName === buttonTag) {
        items.push(element);
        return;
      }
      Array.from(element.children).forEach(child => visit(child as HTMLElement));
    };
    this.slottedElements.forEach(visit);
    return items;
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.syncListeners();
    void this.updateComplete.then(() => {
      if (this.isConnected) this.initializeSlottedElements();
    });
  }

  public override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('change', this.handleToggleChange);
    this.removeEventListener('keydown', this.handleKeyDown);
    this.removeEventListener('focusin', this.handleFocusIn);
    this.resetAttributes();
  }

  public override attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    super.attributeChangedCallback(name, oldValue, newValue);
    if (name === 'toolbar' || name === 'select') this.syncListeners();
    // Roving state (tabindex) and the child attributes propagated by setAttributes must follow
    // runtime changes to these attributes, not just slot changes.
    if (name === 'toolbar' || name === 'vertical' || name === 'split' || name === 'select') {
      if (this.isConnected && this.hasUpdated) {
        this.initializeSlottedElements();
      }
    }
  }

  protected syncListeners() {
    this.removeEventListener('change', this.handleToggleChange);
    this.removeEventListener('keydown', this.handleKeyDown);
    this.removeEventListener('focusin', this.handleFocusIn);
    if (!this.isConnected) return;
    if (this.select) this.addEventListener('change', this.handleToggleChange);
    if (this.toolbar) {
      this.addEventListener('keydown', this.handleKeyDown);
      this.addEventListener('focusin', this.handleFocusIn);
    }
  }

  /**
   * Handles the 'change' event from a button for toggling of buttons
   * @param {Event} e - The 'change' event object.
   */
  protected handleToggleChange = (e: Event) => {
    if (this.select === 'single') {
      // Reset pressed on every other button, but never the source of the change — the source
      // button has already toggled its own pressed state via its click handler.
      const target = e.target as HTMLElement;
      this.buttons.forEach(button => {
        if (button !== target && button.pressed) button.pressed = false;
      });
    }
  };

  /** Finds the index of the next non-disabled slotted element, wrapping around the group. */
  protected findNextFocusableIndex(items: HTMLElement[], startIndex: number, direction: 1 | -1): number {
    return findNextEnabledIndex(items, startIndex, direction, el => {
      const isDisabled = el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true';
      return !isDisabled;
    });
  }

  /**
   * Handles the 'keydown' event on button-group
   * @param {KeyboardEvent} e - The 'keyboard' event object.
   */
  protected handleKeyDown = (e: KeyboardEvent) => {
    if (![keys.ArrowRight, keys.ArrowLeft, keys.ArrowUp, keys.ArrowDown, keys.Home, keys.End].includes(e.key)) return;
    const items = this.toolbarItems;
    const focusedItem = e
      .composedPath()
      .find((node): node is HTMLElement => node instanceof HTMLElement && items.includes(node));
    if (!focusedItem) return;
    this.focusedIndex = items.indexOf(focusedItem);

    e.preventDefault();
    e.stopPropagation();

    let nextIndex = -1;

    switch (e.key) {
      case keys.ArrowRight:
      case keys.ArrowDown: {
        const direction = e.key === keys.ArrowRight && this.resolvedDir === 'rtl' ? -1 : 1;
        nextIndex = this.findNextFocusableIndex(items, this.focusedIndex, direction);
        break;
      }

      case keys.ArrowLeft:
      case keys.ArrowUp: {
        const direction = e.key === keys.ArrowLeft && this.resolvedDir === 'rtl' ? 1 : -1;
        nextIndex = this.findNextFocusableIndex(items, this.focusedIndex, direction);
        break;
      }

      case keys.Home: {
        nextIndex = this.findNextFocusableIndex(items, -1, 1);
        break;
      }

      case keys.End: {
        nextIndex = this.findNextFocusableIndex(items, items.length, -1);
        break;
      }
    }

    if (nextIndex === -1) return;

    this.setFocus(items, this.focusedIndex, nextIndex);
  };

  /**
   * Keeps the roving focusedIndex in sync when focus moves to a slotted item by
   * any means other than the arrow keys (click, tab, programmatic focus). Without
   * this, arrow navigation after a mouse click would jump from a stale index.
   */
  protected handleFocusIn = (e: FocusEvent) => {
    const items = this.toolbarItems;
    const target = e
      .composedPath()
      .find((node): node is HTMLElement => node instanceof HTMLElement && items.includes(node));
    if (!target) return;
    const index = items.indexOf(target);
    if (
      index === -1 ||
      target.hasAttribute('disabled') ||
      target.getAttribute('aria-disabled') === 'true' ||
      index === this.focusedIndex
    )
      return;
    this.setManagedAttribute(items[this.focusedIndex], 'tabindex', '-1', true);
    this.focusedIndex = index;
    this.setManagedAttribute(target, 'tabindex', '0', true);
  };

  protected initializeSlottedElements() {
    const items = this.toolbarItems;
    this.restoreRemovedAttributes(items);
    this.setAttributes(items);
    this.setTooltipPosition();
  }

  protected restoreRemovedAttributes(items: HTMLElement[] = this.toolbarItems) {
    const activeElements = new Set<HTMLElement>([...this.buttons, ...items]);
    this.managedAttributes.forEach((attributes, element) => {
      if (activeElements.has(element)) return;
      attributes.forEach((value, name) => {
        if (value === null) element.removeAttribute(name);
        else element.setAttribute(name, value);
      });
      this.managedAttributes.delete(element);
    });
  }

  protected setAttributes(items: HTMLElement[] = this.toolbarItems) {
    // Propagate styling/selection state to child buttons, keeping them in sync when
    // the corresponding attributes change at runtime (and clearing stale ones).
    const buttons = this.buttons;
    buttons.forEach((button, idx) => {
      if (idx === 0) {
        this.setManagedAttribute(button, 'button-group-button-position', 'first', true);
      } else if (idx < buttons.length - 1) {
        this.setManagedAttribute(button, 'button-group-button-position', 'inner', true);
      } else {
        this.setManagedAttribute(button, 'button-group-button-position', 'last', true);
      }
      this.setManagedAttribute(button, 'vertical', this.vertical ? '' : null);
      this.setManagedAttribute(button, 'split', this.split ? '' : null);
      this.setManagedAttribute(button, 'toggle', this.select ? '' : null);
    });

    if (this.toolbar) {
      // The roving tabindex lives on the slotted elements — the same index space navigation uses —
      // so the initial tab stop and arrow-key movement can't drift apart. The first enabled item
      // becomes the tab stop; the rest are reachable only via the arrow keys.
      const firstEnabled = this.findNextFocusableIndex(items, -1, 1);
      items.forEach((el, index) => {
        const enabled = !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true';
        this.setManagedAttribute(el, 'tabindex', enabled && index === firstEnabled ? '0' : '-1', true);
      });
      this.focusedIndex = firstEnabled;
    } else {
      this.restoreManagedAttribute('tabindex');
    }
  }

  /** Clears the attributes this element propagated to its children, restoring default tab behavior. */
  protected resetAttributes() {
    this.managedAttributes.forEach((attributes, element) => {
      attributes.forEach((value, name) => {
        if (value === null) element.removeAttribute(name);
        else element.setAttribute(name, value);
      });
    });
    this.managedAttributes.clear();
  }

  protected setManagedAttribute(element: HTMLElement, name: string, value: string | null, force = false) {
    let attributes = this.managedAttributes.get(element);
    if (value === null) {
      if (!attributes?.has(name)) return;
      const original = attributes.get(name) ?? null;
      if (original === null) element.removeAttribute(name);
      else element.setAttribute(name, original);
      attributes.delete(name);
      if (!attributes.size) this.managedAttributes.delete(element);
      return;
    }
    if (!attributes) {
      attributes = new Map();
      this.managedAttributes.set(element, attributes);
    }
    if (!attributes.has(name)) {
      if (!force && element.hasAttribute(name)) return;
      attributes.set(name, element.getAttribute(name));
    }
    element.setAttribute(name, value);
  }

  protected restoreManagedAttribute(name: string) {
    this.managedAttributes.forEach((attributes, element) => {
      if (!attributes.has(name)) return;
      const value = attributes.get(name) ?? null;
      if (value === null) element.removeAttribute(name);
      else element.setAttribute(name, value);
      attributes.delete(name);
      if (!attributes.size) this.managedAttributes.delete(element);
    });
  }

  protected setTooltipPosition() {
    for (const el of this.slottedElements) {
      if (el.tagName.toLowerCase() === this.scope.tagName(CoreTooltip.baseName)) {
        const tooltip = el as CoreTooltip;
        if (tooltip.distance === undefined) {
          tooltip.distance = 12;
        }
      }
    }
  }

  /** Sets the focus on the specified tab indices. */
  protected setFocus(items: HTMLElement[], prevIndex: number, newIndex: number) {
    this.focusedIndex = newIndex;
    if (items[prevIndex]) this.setManagedAttribute(items[prevIndex], 'tabindex', '-1', true);
    if (items[this.focusedIndex]) this.setManagedAttribute(items[this.focusedIndex], 'tabindex', '0', true);
    items[this.focusedIndex]?.focus();
  }

  protected override render() {
    return this.buttonGroupTemplate();
  }

  /** Generates the template for the button group. */
  protected buttonGroupTemplate() {
    return html`
      <div
        part="button-group-base"
        class="button-group"
        role=${this.toolbar ? 'toolbar' : 'group'}
        aria-labelledby=${ifDefined(this.label || this.hasNamedSlot('label') ? 'label' : undefined)}
        aria-orientation=${ifDefined(this.toolbar ? (this.vertical ? 'vertical' : 'horizontal') : undefined)}
      >
        <slot @slotchange=${this.initializeSlottedElements}></slot>
        <slot id="label" class="visually-hidden" name="label">${this.label}</slot>
      </div>
    `;
  }
}

export default CoreButtonGroup;
