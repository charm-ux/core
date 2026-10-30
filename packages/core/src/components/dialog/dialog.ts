import { LitElement } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import { property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { RenderedWatcher } from '../../internal/rendered-watcher.js';
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
 * @dependency CoreIcon
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
 * @cssprop --charm-dialog-backdrop-color - determines dialog's backdrop background.
 * @cssprop --charm-dialog-bg-color - determines dialog's background color.
 * @cssprop --charm-dialog-border-color - border color of the dialog element.
 * @cssprop --charm-dialog-border-radius - determines dialog's radius.
 * @cssprop --charm-dialog-border-width - border width of the dialog element.
 * @cssprop --charm-dialog-close-button-active-bg-color - determines close button active background color.
 * @cssprop --charm-dialog-close-button-active-border-color - determines close button active border color.
 * @cssprop --charm-dialog-close-button-active-fg-color - determines close button active foreground color.
 * @cssprop --charm-dialog-close-button-bg-color - determines close button background color.
 * @cssprop --charm-dialog-close-button-border-color - determines close button border color.
 * @cssprop --charm-dialog-close-button-border-radius - determines close button's border radius.
 * @cssprop --charm-dialog-close-button-border-width - determines close button border width.
 * @cssprop --charm-dialog-close-button-fg-color - determines close button foreground color.
 * @cssprop --charm-dialog-close-button-focus-bg-color - determines close button focus background color.
 * @cssprop --charm-dialog-close-button-focus-border-color - determines close button focus border color.
 * @cssprop --charm-dialog-close-button-focus-fg-color - determines close button focus foreground color.
 * @cssprop --charm-dialog-close-button-hover-bg-color - determines close button hover background color.
 * @cssprop --charm-dialog-close-button-hover-border-color - determines close button hover border color.
 * @cssprop --charm-dialog-close-button-hover-fg-color - determines close button hover foreground color.
 * @cssprop --charm-dialog-close-button-padding - determines close X button padding.
 * @cssprop --charm-dialog-fg-color - determines dialog's foreground color.
 * @cssprop --charm-dialog-footer-button-gap - determines gap between buttons in the footer slot.
 * @cssprop --charm-dialog-header-toolbar-gap - determines gap between dialog header items.
 * @cssprop --charm-dialog-margin-top - determines dialog's top margin when it has a header or footer.
 * @cssprop --charm-dialog-max-height - determines dialog's max height.
 * @cssprop --charm-dialog-max-width - determines dialog's max width.
 * @cssprop --charm-dialog-min-width - determines dialog's minimum width.
 * @cssprop --charm-dialog-padding-x - determines dialog's inline padding.
 * @cssprop --charm-dialog-padding-y - determines dialog's block padding.
 * @cssprop --charm-dialog-shadow - determines dialog's shadow.
 * @cssprop --charm-dialog-size - determines dialog's size.
 * @cssprop --charm-dialog-toolbar-button-gap - determines gap between buttons in the actions slot.
 * @cssprop --charm-dialog-transition - determines dialog's transform.
 * @cssprop --charm-dialog-position-transition - determines dialog's transform when position is set.
 **/
export class CoreDialog extends CharmDismissibleElement {
  public static override styles = [...super.styles, styles];
  public static override shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };
  public static override baseName = 'dialog';
  public static override watchedSlots = ['actions', 'footer', 'heading'];

  /** Reference-counts body scroll locks so nested dialogs and open-on-connect dialogs don't unlock each other's lock. */
  protected static bodyScrollLockCount = 0;
  protected static previousBodyOverflow = '';
  protected static previousBodyPaddingInlineEnd = '';

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

  /** Hides the visible header; the heading and close button remain available to assistive technology. */
  @property({ attribute: 'no-header', type: Boolean, reflect: true })
  public noHeader?: boolean;

  /** Indicates whether the dialog can only be closed programmatically or by clicking the close button. */
  @property({ attribute: 'alert', type: Boolean, reflect: true })
  public alert?: boolean;

  @query('dialog')
  protected dialog?: HTMLDialogElement;

  protected pointerStartedOutside = false;

  /** Keeps the closed initial render to the native dialog shell until first open. */
  protected hasOpened = false;

  /** Watches whether the dialog is actually rendered while open, so third-party CSS can't leave the page inert. */
  private renderedWatcher?: RenderedWatcher;

  /** Whether this instance currently contributes one reference-counted body scroll lock. */
  private bodyScrollLocked = false;

  public static override get dependencies(): (typeof CharmElement)[] {
    return [CoreIcon];
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('focusable', '');
    if (this.open) {
      this.lockBodyScrolling();
      this.updateComplete.then(() => {
        if (this.isConnected && this.open) this.activateDialog();
      });
    }
  }

  public override disconnectedCallback() {
    super.disconnectedCallback();
    this.stopRenderedWatcher();
    if (this.open) {
      this.unlockBodyScrolling();
    }
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
      const wasOpened = this.hasOpened;
      this.hasOpened = true;
      this.requestUpdate();
      if (wasOpened && this.dialog) {
        this.activateDialog();
      }
    } else {
      this.stopRenderedWatcher();
      this.unlockBodyScrolling();
    }
    super.onOpenChange(open);
  }

  protected override updated(changedProps: Map<string, unknown>) {
    super.updated(changedProps);
    if (this.open && this.hasOpened && this.dialog && (!this.dialog.open || !this.dialog.matches(':modal'))) {
      this.activateDialog();
    }
  }

  /** Opens the native dialog after the first-open render has produced its content. */
  protected activateDialog() {
    if (!this.dialog || !this.open) return;

    // Make sure the hidden attribute is fully removed before triggering transition.
    this.dialog.removeAttribute('hidden');

    if (this.dialog.open && !this.dialog.matches(':modal')) this.dialog.close();
    if (!this.dialog.open) this.dialog.showModal();

    this.lockBodyScrolling();
    this.startRenderedWatcher();
  }

  /** Starts watching the dialog's render state, tearing down any previous watcher first. */
  protected startRenderedWatcher() {
    if (!this.dialog) return;

    // Starting is idempotent: dispose any previous watcher before re-arming (COMP-010).
    if (this.renderedWatcher) {
      this.renderedWatcher.stop();
    }

    this.renderedWatcher = new RenderedWatcher(this, isRendered => this.handleRenderedChange(isRendered));
    this.renderedWatcher.start(this.dialog);
  }

  /** Stops watching the dialog's render state. */
  protected stopRenderedWatcher() {
    this.renderedWatcher?.stop();
    this.renderedWatcher = undefined;
  }

  /** Lock body scrolling. */
  protected lockBodyScrolling() {
    if (this.bodyScrollLocked) return;

    this.bodyScrollLocked = true;
    if (CoreDialog.bodyScrollLockCount === 0) {
      CoreDialog.previousBodyOverflow = document.body.style.overflow;
      CoreDialog.previousBodyPaddingInlineEnd = document.body.style.paddingInlineEnd;
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      const currentPadding = Number.parseFloat(getComputedStyle(document.body).paddingInlineEnd) || 0;
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) document.body.style.paddingInlineEnd = `${currentPadding + scrollbarWidth}px`;
    }
    CoreDialog.bodyScrollLockCount += 1;
  }

  /** Unlock body scrolling. */
  protected unlockBodyScrolling() {
    if (!this.bodyScrollLocked) return;

    this.bodyScrollLocked = false;
    CoreDialog.bodyScrollLockCount = Math.max(0, CoreDialog.bodyScrollLockCount - 1);
    if (CoreDialog.bodyScrollLockCount === 0) {
      document.body.style.overflow = CoreDialog.previousBodyOverflow;
      document.body.style.paddingInlineEnd = CoreDialog.previousBodyPaddingInlineEnd;
    }
  }

  protected override settleTransition(waitId: number) {
    if (!this.open) {
      this.dialog?.close();
    }
    super.settleTransition(waitId);
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
      // local hide is overridden, call super to prevent infinite recursion
      super.hide();
    }
    return evt;
  }

  /**
   * Handles the native 'cancel' event, which the browser fires when the user presses Escape.
   * The browser natively targets the event at the correct dialog in the top layer: the topmost
   * modal dialog on Firefox and WebKit, and each nested dialog in sequence on Chromium. preventDefault()
   * always so the native dialog never closes itself outside Charm's transition flow.
   * @param {Event} event - The 'cancel' event object.
   */
  protected handleDialogCancel = (event: Event) => {
    event.preventDefault();

    if (!this.open) return;

    this.requestClose('keyboard');
  };

  /**
   * Suspends the modal when third-party CSS (e.g. cookie banner blockers) hides an open dialog, so
   * the page isn't left scroll locked and inert. "open" stays true so the modal resumes if the
   * dialog is rendered again.
   * @param {boolean} isRendered - Whether the host still generates layout boxes.
   */
  protected handleRenderedChange(isRendered: boolean) {
    if (!this.isConnected || !this.open) {
      this.stopRenderedWatcher();
      return;
    }

    if (!isRendered && this.dialog?.open) {
      // Suspend the modal while hidden so the page stays scrollable and interactive
      this.dialog.close();
      this.unlockBodyScrolling();
    } else if (isRendered && this.dialog && !this.dialog.open) {
      // Resume the modal now that the dialog is rendered again
      this.dialog.showModal();
      this.lockBodyScrolling();
    }
  }

  /** Records whether a pointer gesture began outside the dialog. */
  protected handlePointerDown = (event: PointerEvent) => {
    const rect = this.dialog?.getBoundingClientRect();
    if (!rect) return;
    this.pointerStartedOutside =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;
  };

  /** Dismisses on pointer-up only when the gesture began and ended outside the dialog. */
  protected lightDismiss(e: PointerEvent) {
    if (!this.pointerStartedOutside) return;
    this.pointerStartedOutside = false;
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
    return this.html`<div
      class=${classMap({
        'header-base': true,
        'header-base--no-actions': !this.hasNamedSlot('actions'),
      })}
      part="dialog-header-base"
    >
      ${this.toolbarTemplate()} ${this.titleTemplate()}
    </div>`;
  }

  /** Generates the HTML template for the toolbar. */
  protected toolbarTemplate() {
    return this.html`
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
    return this.html`
      <h2
        class=${classMap({ 'dialog-title': true, 'visually-hidden': !!this.noHeader })}
        id="header"
        part="dialog-header"
      >
        <slot name="heading"> ${this.heading} </slot>
      </h2>
    `;
  }

  /** Generate the close button in the header. */
  protected closeButtonTemplate() {
    const button = this.html`
      <button
        class="close-btn"
        part="dialog-close-button"
        @click=${() => this.requestClose('close-button')}
      >
        <scoped-icon name="dismiss" part="dialog-close-button-icon"></scoped-icon>
        <span class="visually-hidden">${this.closeButtonLabel}</span>
      </button>
    `;

    return this.hideCloseButton || this.noHeader ? this.html`<div class="visually-hidden">${button}</div>` : button;
  }

  /** Generates the HTML template for the dialog body. */
  protected dialogBodyTemplate() {
    return this.html`
      <div
        class=${classMap({
          'dialog-body': true,
          'dialog-body--has-header': !this.noHeader && (this.heading || this.hasNamedSlot('heading')),
        })}
        part="dialog-body"
      >
        <slot></slot>
      </div>
    `;
  }

  /** Generates the HTML template for the dialog footer. */
  protected dialogFooterTemplate() {
    return this.html`
      <div
        class=${classMap({
          'dialog-footer': true,
          'dialog-footer--has-footer': this.hasNamedSlot('footer'),
        })}
        part="dialog-footer"
      >
        <slot name="footer"></slot>
      </div>
    `;
  }

  /** Generates the HTML template for the dialog. */
  protected dialogTemplate() {
    if (!this.hasOpened && !this.open) {
      return this.html`<dialog
        part="dialog-base"
        tabindex="-1"
        role=${ifDefined(this.alert ? 'alertdialog' : undefined)}
        @cancel=${this.handleDialogCancel}
        @pointerdown=${this.handlePointerDown}
        @pointerup=${this.lightDismiss}
        @transitionend=${this.handleTransitionEnd}
      ></dialog>`;
    }

    return this.html`<dialog
      class=${classMap({
        base: true,
      })}
      part="dialog-base"
      aria-labelledby=${ifDefined(this.heading || this.hasNamedSlot('heading') ? 'header' : undefined)}
      tabindex="-1"
      @cancel=${this.handleDialogCancel}
      @pointerdown=${this.handlePointerDown}
      @pointerup=${this.lightDismiss}
      @transitionend=${this.handleTransitionEnd}
      role=${ifDefined(this.alert ? 'alertdialog' : undefined)}
    >
      <div class="dialog-wrapper" part="dialog-wrapper">
        ${
          this.noHeader ? this.html`${this.closeButtonTemplate()} ${this.titleTemplate()}` : this.dialogHeaderTemplate()
        } ${this.dialogBodyTemplate()}
        ${this.dialogFooterTemplate()}
      </div>
    </dialog>`;
  }

  protected override render() {
    return this.dialogTemplate();
  }
}

export default CoreDialog;
