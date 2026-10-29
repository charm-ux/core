import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { keys } from '../../utilities/key-map.js';
import { composedContains } from '../../internal/composed-contains.js';
import { CharmDismissibleElement, CharmElement } from '../../base/index.js';
import { CoreIcon } from '../icon/icon.js';
import styles from './push-pane.styles.js';

export type PushPaneCloseSource = 'close-button' | 'keyboard';

export interface PushPaneRequestCloseEvent {
  source: PushPaneCloseSource;
}

/**
 * @summary Pane for additional options, information, or context to main content. Pushes content over as pane, overlaps as panel when needed.
 *
 * @tag ch-push-pane
 * @since 1.0.0
 * @status beta
 *
 * @dependency CoreIcon
 *
 * @slot - The default push pane content.
 * @slot heading - The push pane's title.
 * @slot footer - The push pane's footer content.
 * @slot actions - The actions to be displayed in the header of the push pane.
 *
 * @event push-pane-show - Emitted when the pane opens.
 * @event push-pane-after-show - Emitted after the pane opens.
 * @event push-pane-hide - Emitted when the pane closes.
 * @event push-pane-after-hide - Emitted after the pane closes.
 * @event {PushPaneRequestCloseEvent} push-pane-request-close - Emitted when the pane is requested to close.
 *
 * @csspart push-pane-container - The push pane wrapper.
 * @csspart push-pane-base - The base container of the push pane.
 * @csspart push-pane-header - The header of the push pane.
 * @csspart push-pane-footer - The footer of the push pane.
 * @csspart push-pane-close-button - The close button in header.
 * @csspart push-pane-toolbar - The toolbar of the push pane.
 * @csspart push-pane-actions - The actions container in the footer.
 * @csspart push-pane-heading - The heading of the push pane.
 *
 * @cssprop --charm-push-pane-bg-color - The background color of the push pane.
 * @cssprop --charm-push-pane-body-margin-top - sets margin top for pane body.
 * @cssprop --charm-push-pane-body-margin-bottom - sets margin bottom for pane body.
 * @cssprop --charm-push-pane-body-margin-inline - sets margin inline for pane body.
 * @cssprop --charm-push-pane-body-padding-x - sets block padding for pane body.
 * @cssprop --charm-push-pane-body-padding-y - sets inline padding for pane body.
 * @cssprop --charm-push-pane-close-button-active-bg-color - sets close button active background color.
 * @cssprop --charm-push-pane-close-button-active-border-color - sets close button active border color.
 * @cssprop --charm-push-pane-close-button-active-border-width - sets close button active border width.
 * @cssprop --charm-push-pane-close-button-bg-color - sets close button background color.
 * @cssprop --charm-push-pane-close-button-border-color - sets close button border color.
 * @cssprop --charm-push-pane-close-button-border-radius - sets close button border radius.
 * @cssprop --charm-push-pane-close-button-border-width - sets close button border width.
 * @cssprop --charm-push-pane-close-button-fg-color - sets close button foreground (text) color.
 * @cssprop --charm-push-pane-close-button-focus-bg-color - sets close button focus background color.
 * @cssprop --charm-push-pane-close-button-focus-border-color - sets close button focus border color.
 * @cssprop --charm-push-pane-close-button-focus-border-width - sets close button focus border width.
 * @cssprop --charm-push-pane-close-button-hover-bg-color - sets close button hover background color.
 * @cssprop --charm-push-pane-close-button-hover-border-color - sets close button hover border color.
 * @cssprop --charm-push-pane-close-button-hover-border-width - sets close button hover border width.
 * @cssprop --charm-push-pane-close-button-padding - sets close button padding.
 * @cssprop --charm-push-pane-divider-color - sets the color of the divider.
 * @cssprop --charm-push-pane-fg-color - The foreground color of the push pane.
 * @cssprop --charm-push-pane-footer-button-gap - The gap between buttons in the footer.
 * @cssprop --charm-push-pane-footer-padding-x - sets block padding for pane footer.
 * @cssprop --charm-push-pane-footer-padding-y - sets inline padding for pane footer.
 * @cssprop --charm-push-pane-header-padding-x - sets block padding for pane header.
 * @cssprop --charm-push-pane-header-padding-y - sets inline padding for pane header.
 * @cssprop --charm-push-pane-padding-x - sets block padding for pane component.
 * @cssprop --charm-push-pane-padding-y - sets inline padding for pane component.
 * @cssprop --charm-push-pane-size - sets the width of the pane.
 * @cssprop --charm-push-pane-toolbar-button-gap - The gap between buttons in the toolbar.
 * @cssprop --charm-push-pane-transition - sets transition for pane.
 *
 **/
export class CorePushPane extends CharmDismissibleElement {
  public static override styles = [...super.styles, styles];
  public static override shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };
  public static override baseName = 'push-pane';
  public static override watchedSlots = ['actions', 'footer', 'heading'];

  /** The label for the close button. */
  @property({ attribute: 'close-button-label', reflect: true })
  public closeButtonLabel?: string;

  /** The layout edge from which the pane opens. */
  @property({ reflect: true })
  public position?: 'end' | 'start' | 'bottom';

  /** The heading to display at the top of the pane opposite the close button. */
  @property({ reflect: true })
  public heading?: string;

  /** Hides the close button when it is not focused. */
  @property({ type: Boolean, attribute: 'hide-close-button', reflect: true })
  public hideCloseButton?: boolean;

  /** Hides the visible header; the heading and close button remain available to assistive technology. */
  @property({ attribute: 'no-header', type: Boolean, reflect: true })
  public noHeader?: boolean;

  protected opener?: HTMLElement | null;

  public static override get dependencies(): (typeof CharmElement)[] {
    return [CoreIcon];
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.addEventListener('keydown', this.handleKeydown);
  }

  public override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this.handleKeydown);
  }

  /** Handles internal logic for when open state changes */
  protected override onOpenChange(open: boolean) {
    if (open) {
      const active = this.deepActiveElement();
      this.opener = active instanceof HTMLElement && !this.isWithinPane(active) ? active : null;
    } else if (this.isWithinPane(this.deepActiveElement())) {
      this.opener?.focus();
    }
    super.onOpenChange(open);
  }

  protected deepActiveElement(): Element | null {
    let active: Element | null = document.activeElement;
    while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
    return active;
  }

  protected isWithinPane(element: Element | null): boolean {
    return composedContains(this, element);
  }

  /** Emits the push-pane-request-close event. */
  protected requestClose(source: PushPaneCloseSource) {
    this.emitRequestClose(source);
  }

  /**
   * Handles the 'keydown' event, specifically for the 'Escape' key.
   */
  protected handleKeydown(e: KeyboardEvent) {
    if (!this.open) return;
    switch (e.key) {
      case keys.Escape:
        e.stopPropagation();
        e.preventDefault();
        this.requestClose('keyboard');
        break;
    }
  }

  /** Generates the template for the footer. */
  protected footerTemplate() {
    return this.html`<footer part="push-pane-footer" class="footer">
      <slot name="footer"></slot>
    </footer>`;
  }

  /** Generates the template for the close button within the header. */
  protected closeButtonTemplate() {
    const button = this.html`
      <button
        class="close-button"
        part="push-pane-close-button"
        @click=${() => this.requestClose('close-button')}
        tabindex=${this.open ? 0 : -1}
      >
        <scoped-icon name="dismiss"></scoped-icon>
        <span class="visually-hidden">${this.closeButtonLabel || 'Close'}</span>
      </button>
  `;

    return this.hideCloseButton || this.noHeader ? this.html`<div class="visually-hidden">${button}</div>` : button;
  }

  /** Generates the templates for the body content. */
  protected bodyTemplate() {
    return this.html`
      <div
        class=${classMap({
          body: true,
          'body--has-actions': this.hasNamedSlot('actions'),
          'body--has-footer': this.hasNamedSlot('footer'),
        })}
      >
        <slot aria-live=${this.open ? 'polite' : 'off'}></slot>
      </div>
    `;
  }

  /** Generates the template for the toolbar that contains the actions slot and the close button. */
  protected toolbarTemplate() {
    return this.html`
      <div class="toolbar" part="push-pane-toolbar">
        <span class="push-pane-actions" part="push-pane-actions">
          <slot name="actions"></slot>
        </span>
        ${this.closeButtonTemplate()}
      </div>
    `;
  }

  /** Generates the template for the push pane title. */
  protected titleTemplate() {
    return this.html`
      <h2 id="push-pane-heading" class=${classMap({ 'visually-hidden': !!this.noHeader })}>
        <slot name="heading" part="push-pane-heading" class="heading">${this.heading}</slot>
      </h2>
    `;
  }

  /** Generates the template for the push pane header. */
  protected pushPaneHeaderTemplate() {
    return this.html` <header
      class=${classMap({
        'header-base': true,
        'header-base--no-actions': !this.hasNamedSlot('actions'),
      })}
      part="push-pane-header"
    >
      ${this.toolbarTemplate()} ${this.titleTemplate()}
    </header>`;
  }

  /** Generates the template for the push pane itself. */
  protected paneTemplate() {
    return this.html`<aside
      part="push-pane-base"
      class="base"
      aria-labelledby=${ifDefined(this.heading || this.hasNamedSlot('heading') ? 'push-pane-heading' : undefined)}
      ?inert=${!this.open}
      @transitionend=${this.handleTransitionEnd}
    >
      ${
        this.noHeader ? this.html`${this.closeButtonTemplate()} ${this.titleTemplate()}` : this.pushPaneHeaderTemplate()
      } ${this.bodyTemplate()}
      ${this.footerTemplate()}
    </aside>`;
  }

  protected override render() {
    return this.paneTemplate();
  }
}

export default CorePushPane;
