import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import CoreIcon from '../../components/icon/icon.js';
import CharmFocusableElement from '../focusable-element/charm-focusable-element.js';
import styles from './form-control.styles.js';
import type CharmElement from '../charm-element/charm-element.js';

/**
 * Base class for input components.
 *
 * @cssprop --charm-form-control-bg-color - Determines the background color for the control.
 * @cssprop --charm-form-control-border-radius - Determines the border radius of the control.
 * @cssprop --charm-form-control-disabled-bg-color - Determines the disabled input background color.
 * @cssprop --charm-form-control-disabled-border-color - Determines the disabled input border color.
 * @cssprop --charm-form-control-disabled-fg-color - Determines the disabled input foreground color.
 * @cssprop --charm-form-control-disabled-opacity - Determines the disabled input opacity.
 * @cssprop --charm-form-control-fg-color - Determines the control text color.
 * @cssprop --charm-form-control-focus-border-color - Determines the focused control border color.
 * @cssprop --charm-form-control-font-size - Determines the font size.
 * @cssprop --charm-form-control-help-text-color - Determines the help text color.
 * @cssprop --charm-form-control-help-text-font-size - Determines the help text font size.
 * @cssprop --charm-form-control-help-text-font-weight - Determines the help text font weight.
 * @cssprop --charm-form-control-help-text-gap - Determines the margin after help text.
 * @cssprop --charm-form-control-icon-gap - Determines the margin between start/end icons and the input.
 * @cssprop --charm-form-control-input-height - Determines the input height.
 * @cssprop --charm-form-control-invalid-border-color - Determines the error border color.
 * @cssprop --charm-form-control-invalid-message-color - Determines the error text color.
 * @cssprop --charm-form-control-invalid-message-font-size - Determines the error message font size.
 * @cssprop --charm-form-control-label-color - Determines the label color.
 * @cssprop --charm-form-control-label-font-size - Determines the label font size.
 * @cssprop --charm-form-control-label-font-weight - Determines the label font weight.
 * @cssprop --charm-form-control-label-gap - Determines the margin between label and the control.
 * @cssprop --charm-form-control-label-required-indicator-gap - Determines the margin between the required indicator and the label.
 * @cssprop --charm-form-control-padding-x - Determines the inline padding within the input element.
 * @cssprop --charm-form-control-padding-y - Determines the input block padding within the input element.
 * @cssprop --charm-form-control-placeholder-color - Determines the placeholder text color.
 * @cssprop --charm-form-control-range-thumb-size - Determines thumb size when the input type is range.
 * @cssprop --charm-form-control-range-track-margin-top - Determines the margin-top of the track when the input type is range.
 * @cssprop --charm-form-control-range-track-size - Determines track size when the input type is range.
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
  public static override watchedSlots = ['label', 'help-text'];
  public static override styles = [...super.styles, styles];
  protected static formAssociated = true;
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

  @state() protected _errorMessage = '';
  @state() protected customErrorMessage: string = '';
  @state() protected hasLabel = false;
  @state() protected hasHelpText = false;
  @state() protected formDisabled = false;

  protected input?: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
  protected internals: ElementInternals;
  protected describedBy?: string;
  protected initialValue: string = '';
  protected defaultValue: string | null = null;
  protected _value: string = '';
  protected _disabled: boolean = false;
  protected _readonly: boolean = false;
  protected validityUpdatePending = false;
  protected hasCapturedInitialValue = false;

  public constructor() {
    super();
    this.internals = this.attachInternals();
  }

  public static override get dependencies(): (typeof CharmElement)[] {
    return [CoreIcon];
  }

  public get value(): string {
    return this._value;
  }

  public get disabled(): boolean {
    return this._disabled || this.formDisabled;
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
    if (this._value === val) return;
    this._value = val;
    this.requestUpdate('value');
  }

  /** Disables the input. */
  @property({ type: Boolean })
  public set disabled(val: boolean) {
    if (this._disabled === val) return;
    this._disabled = val;
    this.toggleAttribute('disabled', val);
    this.requestUpdate('disabled');
    this.updateValidity();
  }

  /** Makes the input readonly. */
  @property({ type: Boolean, reflect: true })
  public set readonly(val: boolean) {
    if (this._readonly === val) return;
    this._readonly = val;
    this.requestUpdate('readonly');
    this.updateValidity();
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
      this.updateErrorMessage();
    }
    return !this.invalid;
  }

  /** Sets a custom validation message. */
  public setCustomValidity(message = '') {
    this.hadFocus = true;
    this.customErrorMessage = message;
    this.input?.setCustomValidity(message);
    if (this.input) {
      this.internals.setValidity(this.input.validity, message || this.input.validationMessage, this.input);
      this.updateErrorMessage();
      this.invalid = this.disabled || this.readonly ? false : !this.internals.validity.valid;
    } else {
      this.invalid = message !== '' && !this.disabled && !this.readonly;
    }
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.syncInitialFormValue();
    this.internals.setFormValue(this.getFormAssociatedValue());
  }

  /** Form-associated value; checkbox-like subclasses override for checked-dependent submission. */
  protected getFormAssociatedValue(): string | File | FormData | null {
    return this.value || null;
  }

  /** Updates the displayed validation message without showing the browser's validation UI. */
  protected updateErrorMessage() {
    if (this.customErrorMessage) return;
    this._errorMessage = this.input?.validationMessage ?? '';
  }

  /** Gets the control's initial form value for reset behavior. Subclasses can override for checked-backed values. */
  protected getInitialFormValue(): string {
    return this.defaultValue ?? this.value ?? '';
  }

  /** Saves the current form value as the initial reset state. */
  protected syncInitialFormValue() {
    if (this.hasCapturedInitialValue) return;
    this.defaultValue = this.getAttribute('value') ?? null;
    this.initialValue = this.getInitialFormValue();
    this.hasCapturedInitialValue = true;
  }

  /** Restores the control's initial form value. Subclasses can override for checked-backed values. */
  protected restoreInitialFormValue() {
    this.value = this.defaultValue ?? this.initialValue;
  }

  protected formResetCallback() {
    this.restoreInitialFormValue();
  }

  /** Restores the control's value when the browser restores form state (bfcache navigation or autofill). */
  protected formStateRestoreCallback(state: string | File | FormData | null) {
    if (typeof state !== 'string') return;
    this.value = state;
  }

  /** Reflects the disabled state when the control is disabled via a parent `<fieldset>`. */
  protected formDisabledCallback(disabled: boolean) {
    this.formDisabled = disabled;
    this.toggleAttribute('form-disabled', disabled);
    this.updateValidity();
  }

  protected override handleBlur() {
    super.handleBlur();
    this.updateValidity();
  }

  /** Updates the `invalid` property after the property changes. `disabled` and `readonly` inputs are always valid. */
  protected updateValidity() {
    if (!this.validityUpdatePending) {
      this.validityUpdatePending = true;
      this.updateComplete.then(() => {
        this.validityUpdatePending = false;
        if (!this.isConnected) return;

        this.input?.setCustomValidity(this.customErrorMessage);
        this.internals.setValidity(this.input?.validity, this.input?.validationMessage, this.input);
        if (this.hadFocus || this.hasFocus) {
          this.updateErrorMessage();
        }
        this.invalid = this.disabled || this.readonly ? false : !this.internals.validity.valid;
      });
    }

    this.internals.setFormValue(this.getFormAssociatedValue());
  }

  protected emitInput(options?: CustomEventInit) {
    this.emit('input', options);
  }

  protected emitChange(options?: CustomEventInit) {
    this.emit('change', options);
  }

  /** Generates the template for the required asterisk */
  protected requiredTemplate() {
    return this.html`<span class="required-indicator" aria-hidden="true">*</span>`;
  }

  /** Generates the template for form control labels */
  protected labelContentTemplate(labelSlot = true) {
    return this.html`
      ${this.label || this.html`<slot name="${ifDefined(labelSlot ? 'label' : undefined)}"></slot>`}
      ${this.required ? this.requiredTemplate() : ''}
    `;
  }

  /** Generates the template for form control help text */
  protected helpTextTemplate() {
    return this.html`<div
      part="form-control-help-text"
      id="help-text"
      class=${classMap({
        'form-control-help-text': true,
        'visually-hidden': this.hideLabel,
      })}
      aria-hidden=${!this.hasHelpText}
    >
      <slot name="help-text">${this.helpText}</slot>
    </div>`;
  }

  /** Generates the template for form control error message */
  protected errorMessageTemplate() {
    const errorText = this.errorMessage;
    return this.html`
      <div
        part="form-control-error-text"
        id="error-text"
        class=${classMap({
          'form-control-error-text': true,
          'visually-hidden': !(this.invalid && this.hadFocus),
        })}
        aria-live="polite"
        role=${ifDefined(this.getAttribute('role') === 'listbox' ? 'group' : undefined)}
      >
        ${
          this.invalid && this.hadFocus
            ? this.html`<scoped-icon
              part="form-control-error-text-icon"
              class="form-control-error-text-icon"
              name="error-circle"
            ></scoped-icon>`
            : ''
        }
        <span part="form-control-error-text-message" class="form-control-error-text-message">${errorText}</span>
      </div>
    `;
  }

  protected override willUpdate(changedProperties: Map<string | number | symbol, unknown>): void {
    super.willUpdate(changedProperties);
    this.hasLabel = !!(this.label || this.hasNamedSlot('label'));
    this.hasHelpText = !!(this.helpText || this.hasNamedSlot('help-text'));
    const ids = [this.hasHelpText ? 'help-text' : '', this.invalid ? 'error-text' : ''].filter(Boolean);
    this.describedBy = ids.length ? ids.join(' ') : undefined;
  }

  protected override updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);
    if (
      ['value', 'required', 'disabled', 'readonly', 'customErrorMessage'].some(property =>
        changedProperties.has(property)
      )
    ) {
      this.updateValidity();
    }
  }

  protected override firstUpdated(): void {
    super.firstUpdated();
    this.input?.setCustomValidity(this.customErrorMessage);
    this.internals.setValidity(this.input?.validity, this.input?.validationMessage, this.input);
    this.invalid = this.disabled || this.readonly ? false : !this.internals.validity.valid;
    this.input?.addEventListener('input', () => this.updateValidity());
  }
}

export default CharmFormControlElement;
