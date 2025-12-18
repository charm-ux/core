import { html } from 'lit/static-html.js';
import { property, query, state } from 'lit/decorators.js';
import { CorePopup } from '../popup/popup.js';
import { parseDuration } from '../../internal/animations.js';
import styles from './tooltip.styles.js';

/** Possible tooltip placements */

/**
 * Tooltips display informative text when users hover over, focus on, or tap an element.
 *
 * @tag ch-tooltip
 * @since 1.0.0
 * @status beta
 *
 * @dependency popup
 *
 * @slot content - The tooltip's content. You can also use the `content` attribute.
 *
 * @event ready - Emitted when the component has completed its initial render.
 * @event tooltip-show - Emitted when the tooltip begins to show.
 * @event tooltip-after-show - Emitted after the tooltip has shown and all animations are complete.
 * @event tooltip-hide - Emitted when the tooltip begins to hide.
 * @event tooltip-after-hide - Emitted after the tooltip has hidden and all animations are complete.
 *
 * @csspart popup-base - Use this to target the tooltip's popup container.
 * @csspart popup-arrow - Use this to target the tooltip's arrow.
 * @csspart body - The tooltip's body.
 *
 * @cssproperty --tooltip-arrow-border-color - The border color of the tooltip arrow
 * @cssproperty --tooltip-arrow-size - The size of the tooltip arrow
 * @cssproperty --tooltip-bg-color - The background color of the tooltip
 * @cssproperty --tooltip-border-color - The border color of the tooltip
 * @cssproperty --tooltip-border-radius - The border radius of the tooltip
 * @cssproperty --tooltip-border-style - The border style of the tooltip
 * @cssproperty --tooltip-border-width - The border width of the tooltip
 * @cssproperty --tooltip-box-shadow - The box shadow of the tooltip
 * @cssproperty --tooltip-fg-color - The foreground color of the tooltip
 * @cssproperty --tooltip-hide-delay - The amount of time to wait before hiding the tooltip when hovering.
 * @cssproperty --tooltip-max-width - The maximum width of the tooltip.
 * @cssproperty --tooltip-padding - The padding of the tooltip
 * @cssproperty --tooltip-show-delay - The amount of time to wait before showing the tooltip when hovering.
 * @cssproperty --tooltip-show-transition - The transition effect when opening the tooltip
 * @cssproperty --tooltip-show-transition - The transition effect when closing the tooltip
 */

export class CoreTooltip extends CorePopup {
  public static override styles = [...super.styles, styles];
  public static override baseName = 'tooltip';

  /** Controls how the tooltip is activated. Possible options include `click`, `hover`, `focus`, and `manual`. Multiple options can be passed by separating them with a space. When manual is used, the tooltip must be activated programmatically. */
  @property()
  public trigger = 'hover focus';

  /** The content to display inside the tooltip. You can use `content` slot instead if you need text formatting. */
  @property({ type: String })
  public content?: string;

  @query('slot[name="content"]')
  protected contentSlot?: HTMLSlotElement;

  @state()
  protected announceContent?: string;

  /** This is state is set after popup is open, used for applying transitions. */
  @state()
  protected visible: boolean = false;

  protected _disabled = false;
  protected _fixedPlacement = false;
  protected hoverTimeout?: number;

  public constructor() {
    super();
    this.flip = true;
    this.shift = true;
    this.placement = 'bottom';
  }

  /** Disables the tooltip so it won't show when triggered. */
  @property({ type: Boolean, reflect: true })
  public get disabled(): boolean {
    return this._disabled;
  }

  /** Enable this option to prevent the tooltip from being clipped when the component is placed inside a container with `overflow: auto|hidden|scroll`. */
  @property({ attribute: 'fixed-placement', type: Boolean, reflect: true })
  public get fixedPlacement(): boolean {
    return this._fixedPlacement;
  }

  /** Disables/enables the tooltip */
  public set disabled(val: boolean) {
    this._disabled = val;

    if (val && this.open) {
      this.hide();
    }
  }

  public set fixedPlacement(val: boolean) {
    this._fixedPlacement = val;
    this.strategy = val ? 'fixed' : 'absolute';
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.handleBlur = this.handleBlur.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);

    this.updateComplete.then(() => this.attachListeners());
  }

  public override firstUpdated() {
    super.firstUpdated();
    this.popup.hidden = !this.open;
  }

  public override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeListeners();
  }

  /** Adds event listeners for the anchor. */
  protected attachListeners() {
    if (this.anchorEl) {
      this.anchorEl.addEventListener('blur', this.handleBlur, true);
      this.anchorEl.addEventListener('focus', this.handleFocus, true);
      this.anchorEl.addEventListener('click', this.handleClick);
      this.anchorEl.addEventListener('mouseover', this.handleMouseOver);
      this.anchorEl.addEventListener('mouseout', this.handleMouseOut);
    }
    // Handle mouse entering/leaving the tooltip itself
    this.addEventListener('mouseover', this.handleMouseOver);
    this.addEventListener('mouseout', this.handleMouseOut);
  }

  /** Removes event listeners for the anchor. */
  protected removeListeners() {
    if (this.anchorEl) {
      this.anchorEl.removeEventListener('blur', this.handleBlur, true);
      this.anchorEl.removeEventListener('focus', this.handleFocus, true);
      this.anchorEl.removeEventListener('click', this.handleClick);
      this.anchorEl.removeEventListener('mouseover', this.handleMouseOver);
      this.anchorEl.removeEventListener('mouseout', this.handleMouseOut);
    }
    this.removeEventListener('mouseover', this.handleMouseOver);
    this.removeEventListener('mouseout', this.handleMouseOut);
  }

  /** Handles internal logic for when the open attribute changes */
  protected override onOpenChange(open: boolean) {
    if (!this.hasUpdated || (open && this.disabled)) return;

    if (open) {
      this.announceTooltip();
    } else {
      this.announceContent = '';
    }
    super.onOpenChange(open);
  }

  /** Announces the tooltip content to screen readers */
  protected announceTooltip() {
    if (this.contentSlot) {
      const nodes = this.contentSlot.assignedNodes({ flatten: true });
      this.announceContent =
        nodes
          .map(node => node.textContent)
          .join('')
          .trim() ||
        this.content ||
        '';
    }
  }

  /** Handles blur event on the popup */
  protected handleBlur() {
    if (this.hasTrigger('focus')) {
      this.hide();
    }
  }

  /** Handles click event on the popup */
  protected handleClick() {
    if (this.hasTrigger('click')) {
      if (this.open) {
        this.hide();
      } else {
        this.show();
      }
    }
  }

  /** Handles focus event on the popup */
  protected handleFocus() {
    if (this.hasTrigger('focus')) {
      this.show();
    }
  }

  /** Handles mouseover event on the popup */
  protected handleMouseOver() {
    if (this.hasTrigger('hover')) {
      const delay = parseDuration(getComputedStyle(this).getPropertyValue('--tooltip-show-delay'));
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = window.setTimeout(() => this.show(), delay);
    }
  }

  /** Handles mouseout event on the popup */
  protected handleMouseOut() {
    if (this.hasTrigger('hover')) {
      const delay = parseDuration(getComputedStyle(this).getPropertyValue('--tooltip-hide-delay'));
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = window.setTimeout(() => this.hide(), delay);
    }
  }

  /** Utility method to check if specified trigger is present */
  protected hasTrigger(triggerType: string) {
    const triggers = this.trigger.split(' ');
    return triggers.includes(triggerType);
  }

  /** Generates the template for the tooltip body and contents */
  protected override bodyTemplate() {
    return html` <slot name="content"><div class="body" part="body">${this.content}</div></slot> `;
  }

  protected liveRegionTemplate() {
    return html` <div aria-live="polite" aria-atomic="true" class="visually-hidden">${this.announceContent}</div> `;
  }

  protected override render() {
    return html`${this.popupTemplate()}${this.liveRegionTemplate()}`;
  }
}

export default CoreTooltip;
