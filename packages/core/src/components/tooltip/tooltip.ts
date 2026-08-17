import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { property, query, state } from 'lit/decorators.js';
import { CharmDismissibleElement, CharmElement } from '../../base/index.js';
import { CorePopup, type PopupPlacement } from '../popup/popup.js';
import { parseDuration } from '../../internal/animations.js';
import { keys } from '../../utilities/key-map.js';
import styles from './tooltip.styles.js';

/** Possible tooltip placements */

/**
 * Tooltips display informative text when users hover over, focus on, or tap an element.
 *
 * @tag ch-tooltip
 * @since 1.0.0
 * @status beta
 *
 * @dependency CorePopup
 *
 * @slot - The element to anchor the tooltip to.
 * @slot content - The tooltip's content. You can also use the `content` attribute.
 *
 * @event ready - Emitted when the component has completed its initial render.
 * @event tooltip-show - Emitted when the tooltip begins to show.
 * @event tooltip-after-show - Emitted after the tooltip has shown and all animations are complete.
 * @event tooltip-hide - Emitted when the tooltip begins to hide.
 * @event tooltip-after-hide - Emitted after the tooltip has hidden and all animations are complete.
 *
 * @csspart tooltip-base - The component's base wrapper, a `<ch-popup>` element.
 * @csspart popup-base - The popup's `popup` part. Use this to target the tooltip's popup container.
 * @csspart popup-arrow - The popup's `arrow` part. Use this to target the tooltip's arrow.
 * @csspart body - The tooltip's body.
 *
 * @cssprop --charm-tooltip-arrow-border-color - The border color of the tooltip arrow
 * @cssprop --charm-tooltip-arrow-size - The size of the tooltip arrow
 * @cssprop --charm-tooltip-bg-color - The background color of the tooltip
 * @cssprop --charm-tooltip-border-color - The border color of the tooltip
 * @cssprop --charm-tooltip-border-radius - The border radius of the tooltip
 * @cssprop --charm-tooltip-border-style - The border style of the tooltip
 * @cssprop --charm-tooltip-border-width - The border width of the tooltip
 * @cssprop --charm-tooltip-shadow - The box shadow of the tooltip
 * @cssprop --charm-tooltip-fg-color - The foreground color of the tooltip
 * @cssprop --charm-tooltip-hide-delay - The amount of time to wait before hiding the tooltip when hovering.
 * @cssprop --charm-tooltip-max-width - The maximum width of the tooltip.
 * @cssprop --charm-tooltip-padding - The padding of the tooltip
 * @cssprop --charm-tooltip-show-delay - The amount of time to wait before showing the tooltip when hovering.
 * @cssprop --charm-tooltip-show-transition - The transition effect when opening the tooltip
 * @cssprop --charm-tooltip-show-transition - The transition effect when closing the tooltip
 */

export class CoreTooltip extends CharmDismissibleElement {
  public static override styles = [...super.styles, styles];
  public static override baseName = 'tooltip';

  /** Attaches an arrow pointing to the tooltip. */
  @property({ type: Boolean, reflect: true })
  public arrow?: boolean;

  /** Controls how the tooltip is activated. Possible options include `click`, `hover`, `focus`, and `manual`. Multiple options can be passed by separating them with a space. When manual is used, the tooltip must be activated programmatically. */
  @property()
  public trigger = 'hover focus';

  @query('.body')
  protected body!: HTMLElement;

  @query('.tooltip')
  protected popup!: CorePopup;

  @state()
  protected announceContent?: string;

  /** This is state is set after popup is open, used for applying transitions. */
  @state()
  protected visible: boolean = false;

  protected _anchor?: string | Element | undefined;
  protected _content?: string | undefined;
  protected _disabled = false;
  protected _distance?: number | undefined;
  protected _fixedPlacement = false;
  protected _placement?: PopupPlacement | undefined;
  protected _skidding?: number | undefined;
  protected anchorEl?: HTMLElement | undefined;
  protected hoverTimeout?: number;

  // Set when the anchor is pressed to light dismiss the tooltip. While true, hover and focus won't reopen it. Cleared
  // when the pointer fully leaves the anchor and tooltip or when the anchor blurs.
  protected dismissedByPress = false;

  public static override get dependencies(): (typeof CharmElement)[] {
    return [CorePopup];
  }

  /** The preferred placement of the tooltip. Note that the actual placement may vary as needed to keep the tooltip inside of the viewport. */
  @property()
  public get placement(): PopupPlacement | undefined {
    return this._placement;
  }

  /** The distance in pixels from which to offset the tooltip away from its target. */
  @property({ type: Number })
  public get distance(): number | undefined {
    return this._distance;
  }

  /** The distance in pixels from which to offset the tooltip along its target. */
  @property({ type: Number })
  public get skidding(): number | undefined {
    return this._skidding;
  }

  /** The content to display inside the tooltip. You can use `content` slot instead if you need text formatting. */
  @property()
  public get content(): string | undefined {
    return this._content;
  }

  /** When the anchor element is separate from the popup, provide its ID or a reference to the anchor element. */
  @property()
  public get anchor(): string | Element | undefined {
    return this._anchor;
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

  public set anchor(val: string | Element | undefined) {
    this._anchor = val;

    if (!this.isConnected) return;

    let target: HTMLElement | null = null;

    if (this.anchor instanceof HTMLElement) {
      // Anchor was passed as a reference
      target = this.anchor;
    } else if (typeof this.anchor === 'string' && this.anchor.length > 0) {
      // Anchor was passed as an id
      target = this.getScopedElementById(this.anchor) as HTMLElement | null;
    }

    if (!target) {
      throw new Error('Invalid tooltip target: no anchor element was found.');
    }

    // A new anchor must not inherit press dismissal state from the old one.
    this.dismissedByPress = false;
    this.removeListeners();
    this.anchorEl = target;
    this.attachListeners();
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
    this.handleOptionsChange();
  }

  public set content(val: string | undefined) {
    this._content = val;
    this.handleOptionsChange();
  }

  public set distance(val: number | undefined) {
    this._distance = val;
    this.handleOptionsChange();
  }

  public set placement(val: PopupPlacement | undefined) {
    this._placement = val;
    this.handleOptionsChange();
  }

  public set skidding(val: number | undefined) {
    this._skidding = val;
    this.handleOptionsChange();
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.handleBlur = this.handleBlur.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);

    // Re-arm the tooltip after a light dismiss in case the re-arm events were missed while disconnected.
    this.dismissedByPress = false;

    this.updateComplete.then(() => this.attachListeners());
  }

  public override firstUpdated() {
    super.firstUpdated();

    // Ensure the anchor is set after the component is updated
    this.updateAnchorElement();

    this.body.hidden = !this.open;

    if (this.open) {
      this.popup.open = true;
      this.popup.reposition();
    }
  }

  public override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeListeners();
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = undefined;
    }
  }

  /** Updates the trigger of the tooltip if the anchor is provided as a string. */
  protected updateAnchorElement() {
    if (typeof this.anchor === 'string' && this.anchor.length > 0) {
      this.anchorEl = (this.getScopedElementById(this.anchor) as HTMLElement) || undefined;
    }
  }

  /** Adds event listeners for the anchor. */
  protected attachListeners() {
    if (this.anchorEl) {
      this.anchorEl.addEventListener('blur', this.handleBlur, true);
      this.anchorEl.addEventListener('focus', this.handleFocus, true);
      this.anchorEl.addEventListener('click', this.handleClick);
      this.anchorEl.addEventListener('keydown', this.handleKeyDown);
      this.anchorEl.addEventListener('mousedown', this.handleMouseDown);
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
      this.anchorEl.removeEventListener('keydown', this.handleKeyDown);
      this.anchorEl.removeEventListener('mousedown', this.handleMouseDown);
      this.anchorEl.removeEventListener('mouseover', this.handleMouseOver);
      this.anchorEl.removeEventListener('mouseout', this.handleMouseOut);
    }
    this.removeEventListener('mouseover', this.handleMouseOver);
    this.removeEventListener('mouseout', this.handleMouseOut);
  }

  /** Handles internal logic for when the open attribute changes */
  protected override onOpenChange(open: boolean) {
    if (open && this.disabled) return;

    if (open) {
      // Make the popup content accessible immediately, then activate the visible
      // class on the next render so the initial open transition can reliably
      // animate from the closed state instead of snapping in.
      if (this.body) this.body.hidden = false;
      if (this.popup) this.popup.open = true;
      this.visible = false;
      requestAnimationFrame(() => {
        if (this.open) {
          this.visible = true;
        }
      });
      this.announceTooltip();
    } else {
      // trigger transition; hide side effects are applied when transition settles
      this.visible = false;
      this.announceContent = '';
      // fixed placement tooltips sometimes have sticky inner popups or FOUC issues if not closed immediately
      if (this.popup && this.fixedPlacement) {
        this.popup.open = false;
      }
    }
    super.onOpenChange(open);
  }

  /** Announces the tooltip content to screen readers */
  protected announceTooltip() {
    if (this.body) {
      this.announceContent = this.body.textContent || '';
    }
  }

  protected override settleTransition(waitId: number) {
    if (waitId !== this.transitionWaitId || !this.pendingAfterEvent) return;

    if (this.pendingAfterEvent === 'after-hide') {
      this.body.hidden = true;
      this.popup.open = false;
    }

    super.settleTransition(waitId);
  }

  /** Handles popup options changing */
  protected handleOptionsChange() {
    if (this.hasUpdated) {
      this.popup.reposition();
    }
  }

  /** Handles blur event on the popup */
  protected handleBlur() {
    // Moving focus away re-arms the tooltip after a light dismiss. On touch devices no mouseout fires, so this is
    // the reset path.
    this.dismissedByPress = false;

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
      return;
    }

    if (this.hasTrigger('manual')) {
      return;
    }

    // Light dismiss for activations that don't fire mousedown, like Enter or Space on a button.
    this.lightDismiss();
  }

  /** Handles mousedown event on the popup */
  protected handleMouseDown() {
    if (this.hasTrigger('click') || this.hasTrigger('manual')) {
      return;
    }

    // Light dismiss before focus fires so the tooltip doesn't flash visible during the click.
    this.lightDismiss();
  }

  /** Hides the tooltip, or cancels a pending show, and keeps it hidden until re-armed. */
  protected lightDismiss() {
    clearTimeout(this.hoverTimeout);
    this.dismissedByPress = true;
    this.hide();
  }

  /** Handles focus event on the popup */
  protected handleFocus() {
    if (this.hasTrigger('focus')) {
      this.show();
    }
  }

  /** Handles keydown event on the popup */
  protected handleKeyDown(event: KeyboardEvent) {
    // Pressing escape when the target element has focus should dismiss the tooltip
    if (this.open && event.key === keys.Escape) {
      event.stopPropagation();
      this.hide();
    }
  }

  /** Handles mouseover event on the popup */
  protected handleMouseOver() {
    if (this.dismissedByPress) {
      return;
    }

    if (this.hasTrigger('hover')) {
      const delay = parseDuration(getComputedStyle(this).getPropertyValue('--tooltip-show-delay'));
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = window.setTimeout(() => this.show(), delay);
    }
  }

  /** Handles mouseout event on the popup */
  protected handleMouseOut(event: MouseEvent) {
    const relatedTarget = event.relatedTarget as Node | null;

    // Don't hide when the pointer moves between the anchor and the tooltip. Relying on `:hover` matching here is
    // unreliable when the pointer moves onto a slotted child of the tooltip, since the host's `:hover` state can
    // briefly report false during that transition.
    const movedIntoAnchor = Boolean(relatedTarget && this.anchorEl?.contains(relatedTarget));
    const movedIntoTooltip = Boolean(relatedTarget && this.contains(relatedTarget));

    if (movedIntoAnchor || movedIntoTooltip) {
      return;
    }

    // The pointer has fully left, so hovering can show the tooltip again after a light dismiss.
    this.dismissedByPress = false;

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

  /** Handles the change of the default slot which contains the anchor of the tooltip. */
  protected handleSlotChange(e: Event) {
    // Don't reset the anchor element if it was already set by the `anchor` property.
    if (this.anchor) return;

    const slot = e.target as HTMLSlotElement | null;
    if (!slot) return;

    // Use the first assigned element as the anchor (slots use display:contents so the slot itself can't be positioned)
    const assigned = slot.assignedElements({ flatten: true })[0] as HTMLElement | undefined;
    this.anchorEl = assigned;
  }

  /** Generates the template for the tooltip */
  protected tooltipTemplate() {
    return this.html`
      <scoped-popup
        part="tooltip-base"
        exportparts="
          tooltip-base:tooltip-base,
          popup-base:popup-base,
          popup-arrow:popup-arrow
        "
        class=${classMap({
          tooltip: true,
          'tooltip--open': this.open ?? false,
          'tooltip--visible': this.visible,
        })}
        content-role="tooltip"
        .anchor=${ifDefined(this.anchorEl)}
        ?arrow=${this.arrow}
        distance=${this.distance ?? 0}
        flip
        placement=${this.placement ?? 'bottom'}
        shift
        skidding=${this.skidding ?? 0}
        strategy=${this.fixedPlacement ? 'fixed' : 'absolute'}
      >
        <slot slot="anchor" @slotchange=${this.handleSlotChange}></slot>
        ${this.tooltipBodyTemplate()}
      </scoped-popup>
      ${this.liveRegionTemplate()}
    `;
  }

  /** Generates the template for the tooltip body and contents */
  protected tooltipBodyTemplate() {
    return this.html` <div class="body" id="tooltip" part="body" @transitionend=${this.handleTransitionEnd}>
      <slot name="content">${this.content}</slot>
    </div>`;
  }

  protected liveRegionTemplate() {
    return this
      .html` <div aria-live="polite" aria-atomic="true" class="visually-hidden">${this.announceContent}</div> `;
  }

  protected override render() {
    return this.tooltipTemplate();
  }
}

export default CoreTooltip;
