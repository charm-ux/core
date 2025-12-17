import { LitElement } from 'lit';
import { html } from 'lit/static-html.js';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { CharmDismissibleElement, CharmElement } from '../../base/index.js';
import { CoreIcon } from '../icon/icon.js';
import { HasSlotController } from '../../controller/index.js';
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
 * @dependency icon
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
 * @cssproperty --push-pane-bg-color - The background color of the push pane.
 * @cssproperty --push-pane-body-margin-top - sets margin top for pane body.
 * @cssproperty --push-pane-body-margin-bottom - sets margin bottom for pane body.
 * @cssproperty --push-pane-body-margin-inline - sets margin inline for pane body.
 * @cssproperty --push-pane-body-padding-x - sets block padding for pane body.
 * @cssproperty --push-pane-body-padding-y - sets inline padding for pane body.
 * @cssproperty --push-pane-close-button-active-bg-color - sets close button active background color.
 * @cssproperty --push-pane-close-button-active-border-color - sets close button active border color.
 * @cssproperty --push-pane-close-button-active-fg-color -  sets close button active foreground (text) color.
 * @cssproperty --push-pane-close-button-bg-color - sets close button background color.
 * @cssproperty --push-pane-close-button-border-color - sets close button border color.
 * @cssproperty --push-pane-close-button-border-radius - sets close button border radius.
 * @cssproperty --push-pane-close-button-border-width - sets close button border width.
 * @cssproperty --push-pane-close-button-fg-color - sets close button foreground (text) color.
 * @cssproperty --push-pane-close-button-focus-bg-color - sets close button focus background color.
 * @cssproperty --push-pane-close-button-focus-fg-color - sets close button focus foreground (text) color.
 * @cssproperty --push-pane-close-button-focus-border-color - sets close button focus border color.
 * @cssproperty --push-pane-close-button-hover-bg-color - sets close button hover background color.
 * @cssproperty --push-pane-close-button-hover-border-color - sets close button hover border color.
 * @cssproperty --push-pane-close-button-hover-fg-color -  sets close button hover foreground (text) color.
 * @cssproperty --push-pane-close-button-padding - sets close button padding.
 * @cssproperty --push-pane-divider-color - sets the color of the divider.
 * @cssproperty --push-pane-fg-color - The foreground color of the push pane.
 * @cssproperty --push-pane-footer-button-gap - The gap between buttons in the footer.
 * @cssproperty --push-pane-footer-padding-x - sets block padding for pane footer.
 * @cssproperty --push-pane-footer-padding-y - sets inline padding for pane footer.
 * @cssproperty --push-pane-header-padding-x - sets block padding for pane header.
 * @cssproperty --push-pane-header-padding-y - sets inline padding for pane header.
 * @cssproperty --push-pane-padding-x - sets block padding for pane component.
 * @cssproperty --push-pane-padding-y - sets inline padding for pane component.
 * @cssproperty --push-pane-size - sets the width of the pane.
 * @cssproperty --push-pane-toolbar-button-gap - The gap between buttons in the toolbar.
 * @cssproperty --push-pane-transition - sets transition for pane.
 *
 **/
export class CorePushPane extends CharmDismissibleElement {
  public static override styles = [...super.styles, styles];
  public static override shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };
  public static override baseName = 'push-pane';

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

  /** Removes the header. This will also remove the default close button. If using prevent default on he-fly-in-request-close please provide a way for the user to close the fly-in-panel. */
  @property({ attribute: 'no-header', type: Boolean, reflect: true })
  public noHeader?: boolean;

  protected readonly hasSlotController = new HasSlotController(this, '[actions], [footer]');

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
    super.onOpenChange(open);
  }

  /** Emits the push-pane-request-close event. */
  protected requestClose(source: PushPaneCloseSource) {
    this.emitRequestClose(source);
  }

  /**
   * Handles the 'keydown' event, specifically for the 'Escape' key.
   */
  protected handleKeydown(e: KeyboardEvent) {
    switch (e.key) {
      case 'Escape':
        e.stopPropagation();
        e.preventDefault();
        this.requestClose('keyboard');
        break;
    }
  }

  /**
   * Handles close click, closes push pane
   */
  protected handleCloseClick() {
    this.open = false;
  }

  /** Generates the template for the footer. */
  protected footerTemplate() {
    return html`<footer part="push-pane-footer" class="footer">
      <slot name="footer"></slot>
    </footer>`;
  }

  /** Generates the template for the close button within the header. */
  protected closeButtonTemplate() {
    const button = html`
      <button
        class="close-button"
        part="push-pane-close-button"
        aria-label=${ifDefined(this.closeButtonLabel || 'close-button')}
        @click=${() => this.requestClose('close-button')}
        tabindex=${this.open ? 0 : -1}
      >
        <${this.scope.tag('icon')} name="dismiss" label="close-icon"></${this.scope.tag('icon')}>
      </button>
  `;

    return this.hideCloseButton || this.noHeader ? html`<div class="visually-hidden">${button}</div>` : button;
  }

  /** Generates the templates for the body content. */
  protected bodyTemplate() {
    return html`
      <div
        class=${classMap({
          body: true,
          'body--has-actions': this.hasSlotController.hasNamedSlot('actions'),
          'body--has-footer': this.hasSlotController.hasNamedSlot('footer'),
        })}
      >
        <slot aria-live=${this.open ? 'polite' : 'off'}></slot>
      </div>
    `;
  }

  /** Generates the template for the toolbar that contains the actions slot and the close button. */
  protected toolbarTemplate() {
    return html`
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
    return html`
      <h2>
        <slot name="heading" part="push-pane-heading" class="heading" id="push-pane-heading">${this.heading}</slot>
      </h2>
    `;
  }

  /** Generates the template for the push pane header. */
  protected pushPaneHeaderTemplate() {
    return html` <header
      class=${classMap({
        'header-base': true,
        'header-base--no-actions': !this.hasSlotController.hasNamedSlot('actions'),
      })}
      part="push-pane-header"
    >
      ${this.toolbarTemplate()} ${this.titleTemplate()}
    </header>`;
  }

  /** Generates the template for the push pane itself. */
  protected paneTemplate() {
    return html`<aside
      aria-hidden=${this.open ? 'false' : 'true'}
      part="push-pane-base"
      class="base"
      aria-labelledby="push-pane-heading"
      @transitionend=${this.handleTransitionEnd}
    >
      ${this.noHeader ? this.closeButtonTemplate() : this.pushPaneHeaderTemplate()} ${this.bodyTemplate()}
      ${this.footerTemplate()}
    </aside>`;
  }

  protected override render() {
    return this.paneTemplate();
  }
}

export default CorePushPane;
