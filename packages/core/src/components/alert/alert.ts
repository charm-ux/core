import { html } from 'lit/static-html.js';
import { property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { HasSlotController } from '../../controller/slot.js';
import { CharmDismissibleElement, CharmElement } from '../../base/index.js';
import CoreIcon from '../icon/icon.js';
import styles from './alert.styles.js';

const politenessLevels = ['off', 'polite', 'assertive'] as const;
type PolitenessType = (typeof politenessLevels)[number];

/**
 * Communicates important information about the state of the entire application or surface. For example, the status of a page, panel, dialog or card. The information shouldn't require someone to take immediate action, but should persist until the user performs one of the required actions.
 *
 * @tag ch-alert
 * @since 1.0.0
 * @status beta
 *
 * @slot - The message content of the alert.
 * @slot action - Optional action button to display for the alert.
 * @slot heading - Optional heading for the alert.
 * @slot icon - Optional icon.
 *
 * @dependency icon
 *
 * @event alert-show - Emitted when the alert is opened.
 * @event alert-after-show - Emitted after the alert is opened and the transitions are complete.
 * @event alert-hide - Emitted when the alert is closed.
 * @event alert-after-hide - Emitted after the alert is closed and the transitions are complete.
 *
 * @csspart alert-actions - The container for the action slot.
 * @csspart alert-base - The component's base wrapper.
 * @csspart alert-content - The content container of the alert.
 * @csspart alert-dismiss-button - The dismiss button.
 * @csspart alert-icon - The icon of the alert.
 * @csspart alert-message - The base of the message portion of the alert.
 *
 * @cssproperty --alert-actions-gap - The gap between the actions buttons.
 * @cssproperty --alert-bg-color - The background color of the alert container.
 * @cssproperty --alert-border - The border of the alert container.
 * @cssproperty --alert-button-bg-color - The background color of the dismiss button.
 * @cssproperty --alert-button-border - The border of the dismiss button.
 * @cssproperty --alert-button-font-size - The font size of the dismiss button.
 * @cssproperty --alert-button-padding - The padding of the dismiss button.
 * @cssproperty --alert-fg-color - The foreground color of the alert container.
 * @cssproperty --alert-font-size - The font size of the alert.
 * @cssproperty --alert-font-weight - The font weight of the alert.
 * @cssproperty --alert-heading-font-size - The font size of the heading.
 * @cssproperty --alert-heading-font-weight - The font weight of the heading.
 * @cssproperty --alert-icon-fg-color - The foreground color of the icon.
 * @cssproperty --alert-icon-margin - The margin of the icon.
 * @cssproperty --alert-icon-size - The size of the icon.
 * @cssproperty --alert-message-margin - The margin of the alert's message container.
 * @cssproperty --alert-padding - The padding of the alert container.
 * @cssproperty --alert-transition - The transition of the alert.
 **/
export class CoreAlert extends CharmDismissibleElement {
  public static override styles = [...super.styles, styles];
  public static override baseName = 'alert';

  /** Shows the close button. */
  @property({ type: Boolean, reflect: true }) public dismissible: boolean = false;

  /** The label for the close button. */
  @property() public closeLabel = 'Close';

  /** The heading of the alert. */
  @property() public heading?: string;

  @query('.alert') protected base?: HTMLElement;
  @query('.alert-message-container') protected messageContainer?: HTMLElement;
  @query('.alert-message-inner-container') protected messageContent?: HTMLElement;

  protected hasSlotController = new HasSlotController(this, '[default]', 'action', 'icon');
  protected originalTrigger?: HTMLElement | null;
  protected _politeness: PolitenessType = 'polite';

  public static override get dependencies(): (typeof CharmElement)[] {
    return [CoreIcon];
  }

  /** If set, it will add the `aria-live` attribute with the value on the element where `role="alert"` is set. */
  @property()
  public get politeness(): PolitenessType {
    return this._politeness;
  }

  public set politeness(value: PolitenessType) {
    this._politeness = politenessLevels.includes(value) ? value : 'polite';
  }

  public override show() {
    this.originalTrigger = this.findRootNode(this)?.activeElement as HTMLElement | null;
    super.show();
    this.messageContent?.focus();
  }

  public override hide() {
    if (!this.open) {
      return;
    }

    if (this.originalTrigger && typeof this.originalTrigger.focus === 'function') {
      this.originalTrigger.focus();
    }

    return super.hide();
  }

  protected override onOpenChange(open: boolean): void {
    super.onOpenChange(open);
    if (open) {
      this.hidden = false;
    }
    if (this.dismissible && !this.transition) {
      this.hidden = !open;
    }
  }

  /**
   * Handles the 'transitionend' event for CSS transitions. This function run after transition animation is complete.
   * @param {TransitionEvent} e - The 'transitionend' event object.
   */
  protected override handleTransitionEnd(e: TransitionEvent) {
    super.handleTransitionEnd(e);
    if (e.target !== e.currentTarget || e.propertyName !== this.transitionProperty) return;
    if (!this.open) {
      this.hidden = true;
    }
  }

  /** Generates the template for the icon. */
  protected iconTemplate() {
    return html` <div part="alert-icon" class="alert-icon" ?hidden=${!this.hasSlotController.hasNamedSlot('icon')}>
      <slot name="icon"></slot>
    </div>`;
  }

  /** Generates the template for the text in the content. */
  protected textTemplate() {
    return html` <div part="alert-message" class="alert-message-container">
      <div class="alert-message-inner-container" tabindex="-1">
        <h3 class="alert-heading" ?hidden=${!(this.hasSlotController.hasNamedSlot('heading') || this.heading)}>
          <slot name="heading">${this.heading}</slot>
        </h3>
        <slot></slot>
      </div>
    </div>`;
  }

  /** Generates the template for the close button. */
  protected dismissibleButtonTemplate() {
    return html` ${this.dismissible
      ? html`
        <button
        class="dismiss-button"
          part="alert-dismiss-button"
          @click=${this.hide}
        >
          <${this.scope.tag('icon')} name="dismiss" label=${this.closeLabel}>
          </${this.scope.tag('icon')}>
        </button>
      `
      : ''}`;
  }

  /** Generates the template for the action slot. */
  protected actionTemplate() {
    return html`<div class="alert-actions" part="alert-actions"><slot name="action"></slot></div>`;
  }

  /** Generates the template for the content. */
  protected contentTemplate() {
    return html` <div part="alert-content" class="alert-content">
      ${this.iconTemplate()} ${this.textTemplate()} ${this.actionTemplate()} ${this.dismissibleButtonTemplate()}
    </div>`;
  }

  /** Generates the template for the alert. */
  protected alertTemplate() {
    return html`
      <div class="alert-wrapper" @transitionend=${this.handleTransitionEnd}>
        <div
          part="alert-base"
          class=${classMap({
            alert: true,
            'has-actions': this.hasSlotController.test('action'),
          })}
          role="alert"
          aria-live=${this.politeness}
        >
          ${this.contentTemplate()}
        </div>
      </div>
    `;
  }

  protected override render() {
    return this.alertTemplate();
  }
}

export default CoreAlert;
