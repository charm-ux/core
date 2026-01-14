import { LitElement } from 'lit';
import { html } from 'lit/static-html.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
// import { FocusTrapController } from '../../controller/focus-trap.js';
import { HasSlotController } from '../../controller/slot.js';
import { CoreIcon } from '../icon/icon.js';
import { CharmDismissibleElement, CharmElement } from '../../base/index.js';
import styles from './dialog.styles.js';

export type DialogCloseSource = 'close-button' | 'keyboard' | 'overlay' | 'external';

export interface DialogRequestCloseEvent {
  source: DialogCloseSource;
}

/**
 * Dialog is a window overlaid on either the primary window or another dialog window. Windows under a modal dialog are inert. That is, users cannot interact with content outside an active dialog window. Inert content outside an active dialog is typically visually obscured or dimmed so it is difficult to discern, and in some implementations, attempts to interact with the inert content cause the dialog to close.
 *
 * @tag ch-dialog
 * @since 1.0.0
 * @status beta
 *
 * @dependency icon
 *
 * @slot - The dialog's body.
 * @slot actions - The dialog's header actions, usually a back button.
 * @slot footer - The dialog's footer, usually one or more buttons representing various options.
 * @slot heading - The dialog's heading.
 *
 * @event dialog-show - Emitted when the dialog opens.
 * @event dialog-after-show - Emitted after the dialog opens and all transitions are complete.
 * @event dialog-hide - Emitted when the dialog closes.
 * @event dialog-after-hide - Emitted after the dialog closes and all transitions are complete.
 * @event {DialogRequestCloseEvent} dialog-request-close - Emitted when the user attempts to close the dialog. If the event is canceled, the dialog will not close.
 *
 * @csspart dialog-actions - The component's actions slot.
 * @csspart dialog-base - The component's dialog element.
 * @csspart dialog-body - The component's body slot.
 * @csspart dialog-close-button - The component's close X button.
 * @csspart dialog-close-button-icon - The close button icon.
 * @csspart dialog-footer - The component's footer slot.
 * @csspart dialog-header - The component's header slot.
 * @csspart dialog-header-base - The component's header base.
 * @csspart dialog-toolbar - The component's toolbar which contains action slot and close button.
 * @csspart dialog-wrapper - The component's base wrapper.
 *
 * @cssproperty --dialog-backdrop-color - determines dialog's backdrop background.
 * @cssproperty --dialog-bg-color - determines dialog's background color.
 * @cssproperty --dialog-border-color - border color of the dialog element.
 * @cssproperty --dialog-border-radius - determines dialog's radius.
 * @cssproperty --dialog-border-width - border width of the dialog element.
 * @cssproperty --dialog-close-button-active-bg-color - determines close button active background color.
 * @cssproperty --dialog-close-button-active-border-color - determines close button active border color.
 * @cssproperty --dialog-close-button-active-fg-color - determines close button active foreground color.
 * @cssproperty --dialog-close-button-bg-color - determines close button background color.
 * @cssproperty --dialog-close-button-border-color - determines close button border color.
 * @cssproperty --dialog-close-button-border-radius - determines close button's border radius.
 * @cssproperty --dialog-close-button-border-width - determines close button border width.
 * @cssproperty --dialog-close-button-fg-color - determines close button foreground color.
 * @cssproperty --dialog-close-button-focus-bg-color - determines close button focus background color.
 * @cssproperty --dialog-close-button-focus-border-color - determines close button focus border color.
 * @cssproperty --dialog-close-button-focus-fg-color - determines close button focus foreground color.
 * @cssproperty --dialog-close-button-hover-bg-color - determines close button hover background color.
 * @cssproperty --dialog-close-button-hover-border-color - determines close button hover border color.
 * @cssproperty --dialog-close-button-hover-fg-color - determines close button hover foreground color.
 * @cssproperty --dialog-close-button-padding - determines close X button padding.
 * @cssproperty --dialog-fg-color - determines dialog's foreground color.
 * @cssproperty --dialog-footer-button-gap - determines gap between buttons in the footer slot.
 * @cssproperty --dialog-header-toolbar-gap - determines gap between dialog header items.
 * @cssproperty --dialog-margin-top - determines dialog's top margin when it has a header or footer.
 * @cssproperty --dialog-max-height - determines dialog's max height.
 * @cssproperty --dialog-max-width - determines dialog's max width.
 * @cssproperty --dialog-padding-x - determines dialog's inline padding.
 * @cssproperty --dialog-padding-y - determines dialog's block padding.
 * @cssproperty --dialog-shadow - determines dialog's shadow.
 * @cssproperty --dialog-size - determines dialog's size.
 * @cssproperty --dialog-toolbar-button-gap - determines gap between buttons in the actions slot.
 * @cssproperty --dialog-transition - determines dialog's transform.
 * @cssproperty --dialog-position-transition - determines dialog's transform when position is set.
 **/
export class CoreDialog extends CharmDismissibleElement {
  public static override styles = [...super.styles, styles];
  public static override shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };
  public static override baseName = 'dialog';

  /** The label for the close button. */
  @property({ attribute: 'close-button-label', reflect: true })
  public closeButtonLabel: string = 'close';

  /** The optional header of the dialog. */
  @property()
  public heading?: string;

  /** Position of the dialog. */
  @property({ reflect: true })
  public position?: 'start' | 'end' | 'top' | 'bottom' | 'center';

  /** Hides the close button when it is not focused. */
  @property({ type: Boolean, attribute: 'hide-close-button', reflect: true })
  public hideCloseButton?: boolean;

  /** Removes the header. This will also remove the default close button. If using prevent default on dialog-request-close please provide a way for the user to close the dialog. */
  @property({ attribute: 'no-header', type: Boolean, reflect: true })
  public noHeader?: boolean;

  /** Indicates whether the dialog can only be closed programmatically or by clicking the close button. */
  @property({ attribute: 'alert', type: Boolean })
  public alert?: boolean;

  @state()
  protected visible = false;

  @query('dialog')
  protected dialog?: HTMLDialogElement;

  protected readonly hasSlotController = new HasSlotController(this, 'actions', 'footer', 'heading');

  // protected readonly focusTrapController = new FocusTrapController(this);

  public static override get dependencies(): (typeof CharmElement)[] {
    return [CoreIcon];
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.addEventListener('keydown', this.handleKeydown);
    this.setAttribute('focusable', '');
    if (this.open) {
      this.dialog?.setAttribute('hidden', '');
      this.lockBodyScrolling();
    }
  }

  public override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this.handleKeydown);
  }

  public override hide() {
    // call request close with 'external' when triggered from outside
    this.requestClose('external');
  }

  public override toggle() {
    // call request close with 'external' when triggered from outside
    if (this.open) this.requestClose('external');
    else this.show();
  }

  protected override onOpenChange(open: boolean) {
    if (open) {
      // make sure the hidden attribute is fully removed before triggering transition
      this.dialog?.removeAttribute('hidden');

      this.dialog?.showModal();

      requestAnimationFrame(() => {
        this.visible = true;
      });
      this.lockBodyScrolling();
    } else {
      this.visible = false;
      this.unlockBodyScrolling();
      // the dialog will be closed in handleTransitionEnd if there is animation
      if (!this.transition) {
        this.dialog?.close();
      }
    }
    super.onOpenChange(open);
  }

  /** Lock body scrolling. */
  protected lockBodyScrolling() {
    document.body.style.overflow = 'hidden';
  }

  /** Unlock body scrolling. */
  protected unlockBodyScrolling() {
    document.body.style.removeProperty('overflow');
  }

  /**
   * Emits the dialog-request-close event.
   * @param {DialogCloseSource} source - The source of the close request.
   */
  protected requestClose(source: DialogCloseSource) {
    this.emitRequestClose(source);
  }

  /**
   * Emits the dialog-request-close event. If the event is not canceled, the dialog will close.
   */
  protected override emitRequestClose(source: string) {
    const evt = this.emitScopedEvent('request-close', { cancelable: true, detail: { source } });
    if (!evt.defaultPrevented && (!this.alert || source === 'close-button' || source === 'external')) {
      // the dialog will be closed in handleTransitionEnd if there is animation
      if (!this.transition) {
        this.dialog?.close();
      }
      // local hide is overridden, call super to prevent infinite recursion
      super.hide();
    }
    return evt;
  }

  /**
   * Handles the 'keydown' event, specifically for the 'Escape' key.
   * @param {KeyboardEvent} e - The 'keydown' event object.
   */
  protected handleKeydown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        e.stopPropagation();
        e.preventDefault();
        this.requestClose('keyboard');
        break;
    }
  };

  /**
   * Handles the 'transitionend' event for CSS transitions.
   * @param {TransitionEvent} e - The 'transitionend' event object.
   */
  protected override handleTransitionEnd(e: TransitionEvent) {
    super.handleTransitionEnd(e);
    if (e.target !== e.currentTarget) return;
    if (!this.open && e.propertyName === this.transitionProperty) {
      this.dialog?.close();
    }
  }

  /**
   * Dismisses the dialog when clicking outside of it.
   * @param {MouseEvent} e - The 'pointerup' event object.
   */
  protected lightDismiss(e: any) {
    const rect = this.dialog?.getBoundingClientRect();
    if (!rect) return;

    const clickedInDialog =
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width;

    if (!clickedInDialog) this.requestClose('overlay');
  }

  /** Generates the HTML template for the dialog header. */
  protected dialogHeaderTemplate() {
    return html`<div
      class=${classMap({
        'header-base': true,
        'header-base--no-actions': !this.hasSlotController.hasNamedSlot('actions'),
      })}
      part="dialog-header-base"
    >
      ${this.toolbarTemplate()} ${this.titleTemplate()}
    </div>`;
  }

  /** Generates the HTML template for the toolbar. */
  protected toolbarTemplate() {
    return html`
      <div class="toolbar" part="dialog-toolbar">
        <span class="dialog-actions" part="dialog-actions">
          <slot name="actions"></slot>
        </span>
        ${this.closeButtonTemplate()}
      </div>
    `;
  }

  /** Generates the HTML template for the dialog title. */
  protected titleTemplate() {
    return html`
      <h2 class="dialog-title" id="header" part="dialog-header">
        <slot name="heading"> ${this.heading} </slot>
      </h2>
    `;
  }

  /** Generate the close button in the header. */
  protected closeButtonTemplate() {
    const button = html`
      <button
        class="close-btn"
        part="dialog-close-button"
        aria-label=${this.closeButtonLabel}
        @click=${() => this.requestClose('close-button')}
      >
        <${this.scope.tag('icon')} name="dismiss" part="dialog-close-button-icon"></${this.scope.tag('icon')}>
      </button>
    `;

    return this.hideCloseButton || this.noHeader ? html`<div class="visually-hidden">${button}</div>` : button;
  }

  /** Generates the HTML template for the dialog body. */
  protected dialogBodyTemplate() {
    return html`
      <div
        class=${classMap({
          'dialog-body': true,
          'dialog-body--has-header': this.heading || this.hasSlotController.hasNamedSlot('heading'),
        })}
        part="dialog-body"
      >
        <slot></slot>
      </div>
    `;
  }

  /** Generates the HTML template for the dialog footer. */
  protected dialogFooterTemplate() {
    return html`
      <div
        class=${classMap({
          'dialog-footer': true,
          'dialog-footer--has-footer': this.hasSlotController.hasNamedSlot('footer'),
        })}
        part="dialog-footer"
      >
        <slot name="footer"></slot>
      </div>
    `;
  }

  /** Generates the HTML template for the dialog. */
  protected dialogTemplate() {
    return html`<dialog
      class=${classMap({
        base: true,
        'base--visible': this.visible,
      })}
      part="dialog-base"
      aria-labelledby="header"
      tabindex=${this.open ? 0 : -1}
      @pointerup=${this.lightDismiss}
      @transitionend=${this.handleTransitionEnd}
      role=${ifDefined(this.alert ? 'alertdialog' : undefined)}
    >
      <div class="dialog-wrapper" part="dialog-wrapper">
        ${this.noHeader ? this.closeButtonTemplate() : this.dialogHeaderTemplate()} ${this.dialogBodyTemplate()}
        ${this.dialogFooterTemplate()}
      </div>
    </dialog>`;
  }

  protected override render() {
    return this.dialogTemplate();
  }
}

export default CoreDialog;
