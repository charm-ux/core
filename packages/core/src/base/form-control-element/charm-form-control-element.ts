import { property, state } from 'lit/decorators.js';
import { html } from 'lit/static-html.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import CharmFocusableElement from '../focusable-element/charm-focusable-element.js';
import styles from './form-control.styles.js';

/**
 * Base class for input components.
 *
 * @cssproperty --default-border - Determines the border of the control.
 * @cssproperty --form-control-bg-color - Determines the background color for the control.
 * @cssproperty --form-control-border-radius - Determines the border radius of the control.
 * @cssproperty --form-control-disabled-bg-color - Determines the disabled input background color.
 * @cssproperty --form-control-disabled-border-color - Determines the disabled input border color.
 * @cssproperty --form-control-disabled-fg-color - Determines the disabled input foreground color.
 * @cssproperty --form-control-disabled-opacity - Determines the disabled input opacity.
 * @cssproperty --form-control-fg-color - Determines the control text color.
 * @cssproperty --form-control-focus-border-color - Determines the focused control border color.
 * @cssproperty --form-control-font-size - Determines the font size.
 * @cssproperty --form-control-help-text-fg-color - Determines the help text color.
 * @cssproperty --form-control-help-text-font-size - Determines the help text font size.
 * @cssproperty --form-control-help-text-font-weight - Determines the help text font weight.
 * @cssproperty --form-control-help-text-gap - Determines the margin after help text.
 * @cssproperty --form-control-icon-gap - Determines the margin between start/end icons and the input.
 * @cssproperty --form-control-input-height - Determines the input height.
 * @cssproperty --form-control-invalid-border-color - Determines the error border color.
 * @cssproperty --form-control-invalid-message-fg-color - Determines the error text color.
 * @cssproperty --form-control-invalid-message-font-size - Determines the error message font size.
 * @cssproperty --form-control-label-fg-color - Determines the label color.
 * @cssproperty --form-control-label-font-size - Determines the label font size.
 * @cssproperty --form-control-label-font-weight - Determines the label font weight.
 * @cssproperty --form-control-label-gap - Determines the margin between label and the control.
 * @cssproperty --form-control-label-required-indicator-gap - Determines the margin between the required indicator and the label.
 * @cssproperty --form-control-padding-x - Determines the inline padding within the input element.
 * @cssproperty --form-control-padding-y - Determines the input block padding within the input element.
 * @cssproperty --form-control-placeholder-color - Determines the placeholder text color.
 * @cssproperty --form-control-range-thumb-size - Determines thumb size when the input type is range.
 * @cssproperty --form-control-range-track-margin-top - Determines the margin-top of the track when the input type is range.
 * @cssproperty --form-control-range-track-size - Determines track size when the input type is range.
 *
 * @csspart form-control-error-text - The error message container.
 * @csspart form-control-error-text-icon - The error message icon.
 * @csspart form-control-error-text-message - The error message text.
 * @csspart form-control-help-text - The help text container.
 *
 * @event input - fires when the value of the element has been changed as a direct result of a user action
 * @event change - fired when the user modifies the element's value
 */
export class CharmFormControlElement extends CharmFocusableElement {
  public static override styles = [...super.styles, styles];
  protected static formAssociated = true;

  /** Focus on the input on page load. */
  @property({ type: Boolean, reflect: true })
  public override autofocus = false;

  /** The input's help text. Alternatively, you can use the help-text slot. */
  @property({ attribute: 'help-text' })
  public helpText?: string;

  /** Hides the input label and help text. */
  @property({ type: Boolean, attribute: 'hide-label', reflect: true })
  public hideLabel = false;

  /** This will be true when the control is in an invalid state. Validity is determined by the `required` prop. */
  @property({ type: Boolean, reflect: true })
  public invalid = false;

  /** The input's label. If you need to display HTML, you can use the `label` slot instead. */
  @property({ reflect: true })
  public label?: string;

  /** The position of the label */
  @property({ attribute: 'label-position', reflect: true })
  public labelPosition?: 'end' | 'start' | 'top';

  /** The input's name attribute. */
  @property({ reflect: true })
  public name?: string;

  /** Makes the input a required field. */
  @property({ type: Boolean, reflect: true })
  public required = false;

  @state() protected autofocusinvalid?: boolean;
  @state() protected customErrorMessage: string = '';
  @state() protected hasLabel = false;
  @state() protected hasHelpText = false;

  protected input?: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
  protected internals: ElementInternals;
  protected initialValue: string = '';
  protected _errorMessage = '';
  protected _value: string = '';
  protected _disabled: boolean = false;
  protected _readonly: boolean = false;

  public constructor() {
    super();
    this.internals = this.attachInternals();
  }

  public get value(): string {
    return this._value;
  }

  public get disabled(): boolean {
    return this._disabled;
  }

  public get readonly(): boolean {
    return this._readonly;
  }

  public get errorMessage(): string {
    return this.customErrorMessage || this._errorMessage;
  }

  /** Gets the validity of the input. */
  public get validity(): ValidityState {
    return this.internals.validity;
  }

  /** Gets the current validation message, if one exists. */
  public get validationMessage() {
    return this.internals.validationMessage;
  }

  /** The input's error message. */
  @property({ attribute: 'error-message' })
  public set errorMessage(message: string) {
    this.setCustomValidity(message);
  }

  /** The input's value attribute. */
  @property({ reflect: true })
  public set value(val: string) {
    this._value = val;
    this.requestUpdate('value');
  }

  /** Disables the input. */
  @property({ type: Boolean, reflect: true })
  public set disabled(val: boolean) {
    this._disabled = val;
    this.requestUpdate('disabled');
    this.updateValidity();
  }

  /** Makes the input readonly. */
  @property({ type: Boolean, reflect: true })
  public set readonly(val: boolean) {
    this._readonly = val;
    this.requestUpdate('readonly');
    this.updateValidity();
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.initialValue = this.value;
    this.internals.setFormValue(this.value);
  }

  /** Checks for validity but doesn't report a validation message when invalid. */
  public checkValidity(): boolean | undefined {
    return this.errorMessage.length ? false : this.internals.checkValidity();
  }

  /** Checks for validity and shows the browser's validation message if the control is invalid. */
  public reportValidity(): boolean | undefined {
    this.hadFocus = true;
    if (!this.customErrorMessage) {
      this.invalid = !this.input?.reportValidity();
      if (this.input?.validationMessage) {
        this._errorMessage = this.input?.validationMessage;
      }
    }
    return !this.invalid;
  }

  /** Sets a custom validation message. */
  public setCustomValidity(message = '') {
    this.hadFocus = true;
    this.customErrorMessage = message;
    this.invalid = message !== '';
    this.input?.setCustomValidity(message);
  }

  protected formResetCallback() {
    this.value = this.initialValue;
  }

  /** Updates the `invalid` property after the property changes. `disabled` and `readonly` inputs are always valid. */
  protected updateValidity() {
    this.updateComplete.then(() => {
      this.internals.setValidity(this.input?.validity, this.input?.validationMessage, this.input);
      this.invalid = this.disabled || this.readonly ? false : !this.checkValidity();
      if (this.hadFocus || this.hasFocus) {
        this.reportValidity();
      }
    });

    if (this.value) {
      this.internals.setFormValue(this.value);
    }
  }

  protected emitInput(options?: CustomEventInit) {
    this.emit('input', options);
  }

  protected emitChange(options?: CustomEventInit) {
    this.emit('change', options);
  }

  /** Generates the template for the required asterisk */
  protected requiredTemplate() {
    return html`<span class="required-indicator" aria-hidden="true">*</span>`;
  }

  /** Generates the template for form control labels */
  protected labelContentTemplate(labelSlot = true) {
    return html`
      ${this.label || html`<slot name="${ifDefined(labelSlot ? 'label' : undefined)}"></slot>`}
      ${this.required ? this.requiredTemplate() : ''}
    `;
  }

  /** Generates the template for form control help text */
  protected helpTextTemplate() {
    return html`<div
      part="form-control-help-text"
      id="help-text"
      class=${classMap({
        'form-control-help-text': true,
        'visually-hidden': this.hideLabel,
      })}
      aria-hidden=${this.hasHelpText ? 'true' : 'false'}
    >
      <slot name="help-text">${this.helpText}</slot>
    </div>`;
  }

  /** Generates the template for form control error message */
  protected errorMessageTemplate() {
    const errorText = this.customErrorMessage || this.errorMessage;
    return html`
      <div
        part="form-control-error-text"
        id="error-text"
        class="form-control-error-text"
        aria-live="assertive"
        role="alert"
      >
       <${this.scope.tag('icon')}
          part="form-control-error-text-icon"
          class="form-control-error-text-icon"
          name="error-circle"
        ></${this.scope.tag('icon')}>
        <span part="form-control-error-text-message" class="form-control-error-text-message">${errorText}</span>
      </div>
    `;
  }

  protected override willUpdate(_changedProperties: Map<string | number | symbol, unknown>): void {
    this.hasLabel = !!(this.label || this.querySelector('slot[name="label"]')?.hasChildNodes());
    this.hasHelpText = !!(this.helpText || this.querySelector('slot[name="help-text"]')?.hasChildNodes());
  }

  protected override firstUpdated(): void {
    super.firstUpdated();
    this.internals.setValidity(this.input?.validity, this.input?.validationMessage, this.input);
    this.input?.addEventListener('input', () => this.updateValidity());
  }
}

export default CharmFormControlElement;
