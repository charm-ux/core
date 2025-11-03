import {
  arrow,
  autoUpdate,
  computePosition,
  ComputePositionReturn,
  ElementRects,
  flip,
  limitShift,
  Middleware,
  offset,
  type Placement,
  platform,
  shift,
  size,
} from '@floating-ui/dom';

// Why is this here? Glad you asked.
// TLDR: `offsetParent` does not work in shadow dom.
// https://github.com/floating-ui/floating-ui/pull/2160
// https://github.com/floating-ui/floating-ui/releases/tag/%40floating-ui%2Fdom%401.0.2
// https://github.com/shoelace-style/shoelace/issues/1135
import { offsetParent } from 'composed-offset-position';
import { html } from 'lit/static-html.js';
import { property, query } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { CharmDismissibleElement } from '../../base/index.js';
import styles from './popup.styles.js';

export type PopupPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'start'
  | 'start-top'
  | 'start-bottom'
  | 'end'
  | 'end-top'
  | 'end-bottom';

export interface PopupRepositionEvent {
  placement: PopupPlacement;
}

/**
 *
 * Popup is a utility that lets you declaratively anchor "popup" containers to another element.
 *
 * @tag ch-popup
 * @since 1.0.0
 * @status beta
 *
 * @slot - The popup's content.
 * @slot anchor - The element the popup will be anchored to.
 *
 * @event popup-after-hide - Emitted after the popup closes and all transitions are complete.
 * @event popup-after-show - Emitted after the popup opens and all transitions are complete.
 * @event popup-hide - Emitted when the popup closes.
 * @event popup-reposition - PopupRepositionEvent. Emitted when the popup is repositioned. This event can fire a lot, so avoid putting expensive operations in your listener or consider debouncing it.
 * @event popup-show - Emitted when the popup opens.
 *
 * @csspart popup-base - The popup's container. Useful for setting a background color, box shadow, etc.
 * @csspart popup-arrow - The arrow's container. Avoid setting `top|bottom|left|right` properties, as these values are assigned dynamically as the popup moves. This is most useful for applying a background color to match the popup, and maybe a border or box shadow.
 *
 * @cssproperty --popup-arrow-color - The color of the arrow.
 * @cssproperty --popup-arrow-size - The size of the arrow. Note that an arrow won't be shown unless the `arrow` attribute is used.
 * @cssproperty --popup-auto-size-available-height - A read-only custom property that determines the amount of height the popup can be before overflowing. Useful for positioning child elements that need to overflow. This property is only available when using `auto-size`.
 * @cssproperty --popup-auto-size-available-width - A read-only custom property that determines the amount of width the popup can be before overflowing. Useful for positioning child elements that need to overflow. This property is only available when using `auto-size`.
 * @cssproperty --popup-drop-shadow - The shadow of the popup, using CSS filter drop-shadow approach, enabling shadowing on non-rectangular shapes.
 * @cssproperty --popup-hide-transition - animation when the overlay is hidden.
 * @cssproperty --popup-show-transition - animation when the overlay is shown.
 * @cssproperty --popup-z-index - controls the CSS z-index value for the overlay content.
 */
export class CorePopup extends CharmDismissibleElement {
  public static override styles = [...super.styles, styles];
  public static override baseName = 'popup';

  /**
   * The element the popup will be anchored to. If the anchor lives outside of the popup, you can provide its `id` or a reference to it here. If the anchor lives inside the popup, use the `anchor` slot instead.
   */
  @property()
  public anchor?: Element | string;

  /**
   * The preferred placement of the popup. Note that the actual placement will vary as configured to keep the panel inside of the viewport.
   */
  @property({ reflect: true })
  public placement?: PopupPlacement = 'top';

  /**
   * Determines how the popup is positioned. The `absolute` strategy works well in most cases, but if overflow is clipped, using a `fixed` position strategy can often workaround it.
   */
  @property({ reflect: true })
  public strategy?: 'absolute' | 'fixed';

  /**
   * The `aria-label` of the popup for assistive technologies.
   */
  @property({ reflect: true })
  public label?: string = 'popup';

  /** The distance in pixels from which to offset the panel away from its anchor. */
  @property({ type: Number })
  public distance: number = 0;

  /** The distance in pixels from which to offset the panel along its anchor. */
  @property({ type: Number })
  public skidding: number = 0;

  /**
   * Attaches an arrow to the popup. The arrow's size and color can be customized using the `--popup-arrow-size` and `--popup-arrow-color` custom properties. For additional customizations, you can also target the arrow using `::part(arrow)` in your stylesheet.
   */
  @property({ type: Boolean, reflect: true })
  public arrow = false;

  /**
   * The placement of the arrow.
   */
  @property({ attribute: 'arrow-placement' })
  public arrowPlacement?: 'start' | 'end' | 'center' | 'anchor';

  /**
   * Sets the role of the overlay content.
   */
  @property({ attribute: 'content-role' })
  public contentRole? = 'dialog';

  /**
   * The amount of padding between the arrow and the edges of the popup. If the popup has a border-radius, for example, this will prevent it from overflowing the corners.
   */
  @property({ attribute: 'arrow-padding', type: Number })
  public arrowPadding = 10;

  /**
   * When set, placement of the popup will flip to the opposite site to keep it in view. You can use `flipFallbackPlacements` to further configure how the fallback placement is determined.
   */
  @property({ type: Boolean, reflect: true })
  public flip = false;

  /**
   * If the preferred placement doesn't fit, popup will be tested in these fallback placements until one fits. Must be a string of any number of placements separated by a space, e.g. "top bottom left". If no placement fits, the flip fallback strategy will be used instead.
   */
  @property({
    attribute: 'flip-fallback-placements',
    converter: {
      fromAttribute: (value: string) => {
        return value
          .split(' ')
          .map(p => p.trim())
          .filter(p => p !== '');
      },
      toAttribute: (value: []) => {
        return value.join(' ');
      },
    },
  })
  public flipFallbackPlacements = '';

  /**
   * When neither the preferred placement nor the fallback placements fit, this value will be used to determine whether the popup should be positioned as it was initially preferred or using the best available fit based on available space.
   */
  @property({ attribute: 'flip-fallback-strategy' })
  public flipFallbackStrategy?: 'best-fit' | 'initial';

  /**
   * The flip boundary describes clipping element(s) that overflow will be checked relative to when flipping. By default, the boundary includes overflow ancestors that will cause the element to be clipped. If needed, you can change the boundary by passing a reference to one or more elements to this property.
   */
  @property({ type: Object })
  public flipBoundary?: Element | Element[];

  /** The amount of padding, in pixels, to exceed before the flip behavior will occur. */
  @property({ attribute: 'flip-padding', type: Number })
  public flipPadding?: number;

  /** Moves the popup along the axis to keep it in view when clipped. */
  @property({ type: Boolean, reflect: true })
  public shift = false;

  /**
   * The shift boundary describes clipping element(s) that overflow will be checked relative to when shifting. By default, the boundary includes overflow ancestors that will cause the element to be clipped. If needed, you can change the boundary by passing a reference to one or more elements to this property.
   */
  @property({ type: Object })
  public shiftBoundary?: Element | Element[];

  /** The amount of padding, in pixels, to exceed before the shift behavior will occur. */
  @property({ attribute: 'shift-padding', type: Number })
  public shiftPadding?: number;

  /** When set, this will cause the popup to automatically resize itself to prevent it from overflowing. */
  @property({ attribute: 'auto-size' })
  public autoSize?: 'horizontal' | 'vertical' | 'both';

  /** Syncs the popup's width or height to that of the anchor element. */
  @property()
  public sync?: 'width' | 'height' | 'both';

  /**
   * The auto-size boundary describes clipping element(s) that overflow will be checked relative to when resizing. By default, the boundary includes overflow ancestors that will cause the element to be clipped. If needed, you can change the boundary by passing a reference to one or more elements to this property.
   */
  @property({ type: Object, attribute: false })
  public autoSizeBoundary?: Element | Element[];

  /** The amount of padding, in pixels, to exceed before the auto-size behavior will occur. */
  @property({ attribute: 'auto-size-padding', type: Number })
  public autoSizePadding?: number;

  /** Provides keyboard focus trapping within the overlay content. */
  @property({ attribute: 'focus-trap', type: Boolean })
  public focusTrap? = false;

  /** A reference to the internal popup container. Useful for animating and styling the popup with JavaScript. */
  @query('.popup')
  protected popup!: HTMLElement;

  /** A reference to the internal arrow element. Useful for animating and styling the popup with JavaScript. */
  @query('.arrow')
  protected arrowEl!: HTMLElement;

  protected anchorEl?: HTMLElement | null;
  protected cleanup: ReturnType<typeof autoUpdate> | undefined;

  public override connectedCallback() {
    super.connectedCallback();
    this.setAnchorElement();
    this.addEventListener('keydown', this.handleKeydown);
  }

  public override disconnectedCallback() {
    this.stop();
    super.disconnectedCallback();
    this.removeEventListener('keydown', this.handleKeydown);
  }

  /** Recalculate and repositions the popup. */
  public async reposition() {
    // Nothing to do if the popup is inactive or the anchor doesn't exist
    if (!this.anchorEl || !this.popup) {
      return;
    }

    let floatingUiPlatform = platform;

    // Our polyfill for "offsetParent" only works for absolute positioning.
    if (this.strategy === 'absolute') {
      floatingUiPlatform = {
        ...platform,
        getOffsetParent: element =>
          (element as HTMLElement).offsetParent || offsetParent(element as HTMLElement) || window,
      };
    }

    await this.updateComplete;
    const middleware = this.configureMiddleware();
    const position = await computePosition(this.anchorEl, this.popup, {
      placement: this.floatingUIPlacement(this.placement),
      middleware,
      strategy: this.strategy,
      platform: floatingUiPlatform,
    });

    this.setAttribute('data-current-placement', position.placement);
    this.setPopupPosition(position.x, position.y);
    this.setArrowPosition(position);
    if (this.distance) {
      requestAnimationFrame(() => this.updateHoverBridge());
    }
    this.emit('popup-reposition', { detail: { placement: position.placement } });
  }

  /**
   * Converts PopupPlacement to Floating UI Placement.
   * Floating UI doesn't have "start" or "end" as its first position (before the -) only "left" and "right", so convert
   * tooltips's start/end at the first position into left/right according to language direction.
   * To avoid confusion, tooltip uses "top" and "bottom" as the second position when the first is "start" or "end", so
   * change those to start/end for popup.
   */
  protected floatingUIPlacement(position?: PopupPlacement): Placement | undefined {
    if (!position) return;

    const splitPosition = position.split('-');
    const dir = this.dir;

    const replaceObj = {
      start: dir === 'ltr' ? 'left' : 'right',
      end: dir === 'ltr' ? 'right' : 'left',
    };
    const re = new RegExp(Object.keys(replaceObj).join('|'), 'gi');

    const firstPlacement = splitPosition[0].replace(re, matched => replaceObj[matched as keyof typeof replaceObj]);
    const secondPlacement = splitPosition[1]?.replace('top', 'start').replace('bottom', 'end');

    const placement = firstPlacement + (secondPlacement ? `-${secondPlacement}` : '');

    return placement as Placement;
  }

  /** Updates the visual of the hover bridge. */
  protected updateHoverBridge() {
    if (this.distance && this.anchorEl) {
      const anchorRect = this.anchorEl.getBoundingClientRect();
      const popupRect = this.popup.getBoundingClientRect();
      const isVertical = !this.placement || this.placement.includes('top') || this.placement.includes('bottom');
      let topLeftX = 0;
      let topLeftY = 0;
      let topRightX = 0;
      let topRightY = 0;
      let bottomLeftX = 0;
      let bottomLeftY = 0;
      let bottomRightX = 0;
      let bottomRightY = 0;

      if (isVertical) {
        if (anchorRect.top < popupRect.top) {
          // Anchor is above
          topLeftX = anchorRect.left;
          topLeftY = anchorRect.bottom;
          topRightX = anchorRect.right;
          topRightY = anchorRect.bottom;

          bottomLeftX = popupRect.left;
          bottomLeftY = popupRect.top;
          bottomRightX = popupRect.right;
          bottomRightY = popupRect.top;
        } else {
          // Anchor is below
          topLeftX = popupRect.left;
          topLeftY = popupRect.bottom;
          topRightX = popupRect.right;
          topRightY = popupRect.bottom;

          bottomLeftX = anchorRect.left;
          bottomLeftY = anchorRect.top;
          bottomRightX = anchorRect.right;
          bottomRightY = anchorRect.top;
        }
      } else {
        if (anchorRect.left < popupRect.left) {
          // Anchor is on the left
          topLeftX = anchorRect.right;
          topLeftY = anchorRect.top;
          topRightX = popupRect.left;
          topRightY = popupRect.top;

          bottomLeftX = anchorRect.right;
          bottomLeftY = anchorRect.bottom;
          bottomRightX = popupRect.left;
          bottomRightY = popupRect.bottom;
        } else {
          // Anchor is on the right
          topLeftX = popupRect.right;
          topLeftY = popupRect.top;
          topRightX = anchorRect.left;
          topRightY = anchorRect.top;

          bottomLeftX = popupRect.right;
          bottomLeftY = popupRect.bottom;
          bottomRightX = anchorRect.left;
          bottomRightY = anchorRect.bottom;
        }
      }

      this.style.setProperty('--hover-bridge-top-left-x', `${topLeftX}px`);
      this.style.setProperty('--hover-bridge-top-left-y', `${topLeftY}px`);
      this.style.setProperty('--hover-bridge-top-right-x', `${topRightX}px`);
      this.style.setProperty('--hover-bridge-top-right-y', `${topRightY}px`);
      this.style.setProperty('--hover-bridge-bottom-left-x', `${bottomLeftX}px`);
      this.style.setProperty('--hover-bridge-bottom-left-y', `${bottomLeftY}px`);
      this.style.setProperty('--hover-bridge-bottom-right-x', `${bottomRightX}px`);
      this.style.setProperty('--hover-bridge-bottom-right-y', `${bottomRightY}px`);
    }
  }

  /** Handles key down events to check for dismiss. */
  protected handleKeydown(e: KeyboardEvent) {
    if (!this.open) {
      return;
    }

    if (e.key === 'Escape') {
      this.emitRequestClose('escape');
      this.anchorEl?.focus();
      e.stopPropagation();
      return;
    }

    if (!this.focusTrap) {
      return;
    }

    const currentFocusableElement = document.activeElement;

    const focusableChildren = this.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [focusable]'
    );

    if (focusableChildren.length === 0) {
      return;
    }
    const lastFocusableElement = focusableChildren[focusableChildren.length - 1];
    const firstFocusableElement = focusableChildren[0];

    const requestCloseWithTab = () => {
      this.emitRequestClose('tab');
      this.anchorEl?.focus();
      e.preventDefault();
    };

    if (
      e.key === 'Tab' &&
      !e.shiftKey &&
      (lastFocusableElement === currentFocusableElement || this === currentFocusableElement)
    ) {
      requestCloseWithTab();
      return;
    }
    if (
      e.key === 'Tab' &&
      e.shiftKey &&
      (firstFocusableElement === currentFocusableElement || this === currentFocusableElement)
    ) {
      requestCloseWithTab();
    }
  }

  protected override async updated(changedProps: Map<string, unknown>) {
    super.updated(changedProps);

    // Update the anchor when anchor changes
    if (changedProps.has('anchor')) {
      this.handleAnchorChange();
    }

    // All other properties will trigger a reposition when active
    await this.reposition();
  }

  protected override firstUpdated() {
    super.firstUpdated();
    this.start();
  }

  protected override onOpenChange(open: boolean): void {
    super.onOpenChange(open);
    if (open) {
      this.popup.hidden = false;
      this.start();
    } else {
      this.stop();
    }
    if (!this.transition) {
      this.popup.hidden = !open;
    }
  }

  /**
   * Handles the 'transitionend' event for CSS transitions.
   * @param {TransitionEvent} e - The 'transitionend' event object.
   */
  protected override handleTransitionEnd(e: TransitionEvent) {
    super.handleTransitionEnd(e);

    if (!this.open) {
      this.popup.hidden = true;
    }
  }

  protected override render() {
    return this.popupTemplate();
  }

  /** Generates the popup template */
  protected popupTemplate() {
    return html`
      ${this.anchorTemplate()} ${this.distance ? this.hoverBridgeTemplate() : ``} ${this.popupControlTemplate()}
    `;
  }

  /** Generates the template for the hover bridge. */
  protected hoverBridgeTemplate() {
    return html` <span part="popup-hover-bridge" class="popup-hover-bridge"></span> `;
  }

  /** Generates the anchor template */
  protected anchorTemplate() {
    return html` <slot name="anchor" @slotchange=${this.handleAnchorChange}></slot> `;
  }

  /** Generates the popup control template */
  protected popupControlTemplate() {
    return html`
      <dialog
        open
        class="popup"
        part="popup-base"
        role=${ifDefined(this.contentRole)}
        aria-labelledby="popup-label"
        @transitionend=${this.handleTransitionEnd}
      >
        <span id="popup-label" class="visually-hidden">${this.label}</span>
        <slot></slot>
        ${this.arrowTemplate()}
      </dialog>
    `;
  }

  /** Generates the arrow template */
  protected arrowTemplate() {
    return html` ${this.arrow ? html`<div part="popup-arrow" class="arrow" role="presentation"></div>` : ''} `;
  }

  protected async handleAnchorChange() {
    await this.stop();
    this.setAnchorElement();
    this.start();
  }

  protected setAnchorElement() {
    if (this.anchor && typeof this.anchor === 'string') {
      // Locate the anchor by id
      this.anchorEl = this.findRootNode(this).getElementById(this.anchor);
    } else if (this.anchor instanceof HTMLElement) {
      // Use the anchor's reference
      this.anchorEl = this.anchor;
    } else {
      // Look for a slotted anchor
      this.anchorEl = this.querySelector<HTMLElement>('[slot="anchor"]');
    }

    // If the anchor is a <slot>, we'll use the first assigned element as the target since slots use `display: contents` and positioning can't be calculated on them
    if (this.anchorEl instanceof HTMLSlotElement) {
      this.anchorEl = this.anchorEl.assignedElements({ flatten: true })[0] as HTMLElement;
    }
  }

  protected start() {
    // We can't start the positioner without an anchor
    if (!this.anchorEl || !this.popup) {
      return;
    }

    this.cleanup = autoUpdate(this.anchorEl, this.popup, async () => {
      await this.reposition();
    });

    window.addEventListener('scroll', this.handleScrollDismiss, { passive: true });
  }

  protected handleScrollDismiss() {
    this.open = false;
  }

  protected async stop(): Promise<void> {
    return new Promise(resolve => {
      if (this.cleanup) {
        this.cleanup();
        this.cleanup = undefined;
        this.removeAttribute('data-current-placement');
        this.style.removeProperty('--popup-auto-size-available-width');
        this.style.removeProperty('--popup-auto-size-available-height');
        window.removeEventListener('scroll', this.handleScrollDismiss);
        requestAnimationFrame(() => resolve());
      } else {
        resolve();
      }
    });
  }

  protected configureMiddleware(): Middleware[] {
    //
    // NOTE: Floating UI middleware is order dependent: https://floating-ui.com/docs/middleware
    //
    const middleware = [
      // The offset middleware goes first
      offset({ mainAxis: Number(this.distance), crossAxis: Number(this.skidding) }),
    ];

    this.configureSyncSize(middleware);
    this.configureFlip(middleware);
    this.configureShift(middleware);
    this.configureAutoSize(middleware);
    this.configureArrow(middleware);

    return middleware;
  }

  protected configureSyncSize(middleware: Middleware[]) {
    if (this.sync) {
      middleware.push(
        size({
          apply: ({ rects }: { rects: ElementRects }) => {
            if (!this.popup) return;
            const syncWidth = this.sync === 'width' || this.sync === 'both';
            const syncHeight = this.sync === 'height' || this.sync === 'both';
            this.popup.style.width = syncWidth ? `${rects.reference.width}px` : '';
            this.popup.style.height = syncHeight ? `${rects.reference.height}px` : '';
          },
        })
      );
    } else if (this.popup) {
      // Cleanup styles if we're not matching width/height
      this.popup.style.width = '';
      this.popup.style.height = '';
    }
  }

  protected configureFlip(middleware: Middleware[]) {
    if (!this.flip) {
      return;
    }

    middleware.push(
      flip({
        boundary: this.flipBoundary,
        // @ts-expect-error - We're converting a string attribute to an array here
        fallbackPlacements: this.flipFallbackPlacements,
        fallbackStrategy: this.flipFallbackStrategy === 'best-fit' ? 'bestFit' : 'initialPlacement',
        padding: this.flipPadding,
      })
    );
  }

  protected configureShift(middleware: Middleware[]) {
    if (!this.shift) {
      return;
    }

    middleware.push(
      shift({
        boundary: this.shiftBoundary,
        padding: this.shiftPadding,
        limiter: limitShift({
          offset: this.arrow ? this.arrowPadding * 2 : 0,
        }),
      })
    );
  }

  protected configureAutoSize(middleware: Middleware[]) {
    if (this.autoSize) {
      middleware.push(
        size({
          boundary: this.autoSizeBoundary,
          padding: this.autoSizePadding,
          apply: ({ availableWidth, availableHeight }: { availableWidth: number; availableHeight: number }) => {
            if (this.autoSize === 'vertical' || this.autoSize === 'both') {
              this.style.setProperty('--popup-auto-size-available-height', `${availableHeight}px`);
            } else {
              this.style.removeProperty('--popup-auto-size-available-height');
            }

            if (this.autoSize === 'horizontal' || this.autoSize === 'both') {
              this.style.setProperty('--popup-auto-size-available-width', `${availableWidth}px`);
            } else {
              this.style.removeProperty('--popup-auto-size-available-width');
            }
          },
        })
      );
    } else {
      // Cleanup styles if we're no longer using auto-size
      this.style.removeProperty('--popup-auto-size-available-width');
      this.style.removeProperty('--popup-auto-size-available-height');
    }
  }

  protected configureArrow(middleware: Middleware[]) {
    if (!this.arrow || !this.arrowEl) {
      return;
    }

    middleware.push(
      arrow({
        element: this.arrowEl,
        padding: this.arrowPadding,
      })
    );
  }

  protected setPopupPosition(x: number, y: number) {
    if (!this.popup) return;
    Object.assign(this.popup.style, {
      left: `${x}px`,
      top: `${y}px`,
    });
    if (!this.open) {
      this.popup.hidden = true;
    }
  }

  protected setArrowPosition(position: ComputePositionReturn) {
    if (!this.arrow || !this.arrowEl) {
      return;
    }

    const staticSide = { top: 'bottom', right: 'left', bottom: 'top', left: 'right' }[
      position.placement.split('-')[0]
    ]!;

    const isRtl = this.dir === 'rtl';
    const arrowX = position.middlewareData.arrow!.x;
    const arrowY = position.middlewareData.arrow!.y;
    const shiftOffsetX = position.middlewareData.shift?.x || 0;
    const shiftOffsetY = position.middlewareData.shift?.y || 0;

    // values to use for 'start' and 'end' placements
    const rightLeftValue =
      typeof arrowX === 'number'
        ? `calc(${this.arrowPadding - shiftOffsetX}px - var(--popup-arrow-padding-offset))`
        : '';
    const topBottomValue =
      typeof arrowY === 'number'
        ? `calc(${this.arrowPadding - shiftOffsetY}px - var(--popup-arrow-padding-offset))`
        : '';

    let top = '';
    let right = '';
    let bottom = '';
    let left = '';

    if (this.arrowPlacement === 'start') {
      // Start
      top = topBottomValue;
      right = isRtl ? rightLeftValue : '';
      left = isRtl ? '' : rightLeftValue;
    } else if (this.arrowPlacement === 'end') {
      // End
      right = isRtl ? '' : rightLeftValue;
      left = isRtl ? rightLeftValue : '';
      bottom = topBottomValue;
    } else if (this.arrowPlacement === 'center') {
      // Center
      left = typeof arrowX === 'number' ? `calc(50% - var(--popup-arrow-size-diagonal))` : '';
      top = typeof arrowY === 'number' ? `calc(50% - var(--popup-arrow-size-diagonal))` : '';
    } else {
      // Anchor (default)
      left = typeof arrowX === 'number' ? `${arrowX}px` : '';
      top = typeof arrowY === 'number' ? `${arrowY}px` : '';
    }

    Object.assign(this.arrowEl.style, {
      top,
      right,
      bottom,
      left,
      [staticSide]: 'calc(var(--popup-arrow-size-diagonal) * -1)',
    });
  }
}

export default CorePopup;
