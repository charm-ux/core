import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { CharmFormControlElement } from '../../base/index.js';
import CoreCheckbox from '../checkbox/checkbox.js';
import styles from './checkbox-group.styles.js';

/**
 * Checkbox Group manages a collection of checkboxes, allowing multiple options to be selected while providing shared
 * form validation, value management, and accessible group labeling.
 *
 * @tag ch-checkbox-group
 * @since 1.0.0
 * @status beta
 *
 * @slot - The default slot where checkboxes are placed.
 * @slot label - The checkbox group label. Required for proper accessibility. Alternatively, use the `label` property.
 * @slot help-text - Help text that describes how to use the group. Alternatively, use the `help-text` property.
 *
 * @event change - Emitted when the group's selected values change.
 * @event input - Emitted when the group receives user input.
 * @event blur - Emitted when the group loses focus.
 * @event focus - Emitted when the group gains focus.
 *
 * @cssprop --charm-checkbox-group-checkbox-gap - The gap between checkboxes.
 *
 * @csspart checkbox-group-base - The component's internal fieldset.
 * @csspart checkbox-group-checkboxes - Wrapper around the default slot.
 * @csspart checkbox-group-help-text - The help text's wrapper.
 * @csspart checkbox-group-label - The checkbox group's label.
 *
 * @omit placeholder
 * @omit value
 */
export class CoreCheckboxGroup extends CharmFormControlElement {
  public static override styles = [...super.styles, styles];
  public static override baseName = 'checkbox-group';
  public static override watchedSlots = ['help-text', 'label'];
  public static override shadowRootOptions = { ...super.shadowRootOptions, delegatesFocus: false };

  /** How the checkboxes are laid out in the group. */
  @property({ reflect: true })
  public layout?: 'horizontal' | 'vertical' | 'horizontal-stacked';

  /** The checkbox group's selected values. Set this property to control or initialize the selection. */
  @property({ attribute: false })
  public selectedValues: string[] = [];

  protected checkboxes: CoreCheckbox[] = [];
  protected initialSelectedValues: string[] = [];

  public constructor() {
    super();
    this.useBlurHandler = false;
    this.useFocusHandler = false;
  }

  /** Gets the current validation message, if one exists. */
  public override get validationMessage() {
    return this.customErrorMessage || (this.validity.valid ? '' : this.getNativeErrorMessage());
  }

  /** Gets group validity, where a required group must have at least one selected checkbox. */
  public override get validity(): ValidityState {
    const valueMissing = this.required && this.selectedValues.length === 0 && !this.disabled;
    const customError = this.customErrorMessage !== '';

    return {
      badInput: false,
      customError,
      patternMismatch: false,
      rangeOverflow: false,
      rangeUnderflow: false,
      stepMismatch: false,
      tooLong: false,
      tooShort: false,
      typeMismatch: false,
      valid: !valueMissing && !customError,
      valueMissing,
    };
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.internals.setFormValue(this.getFormValue());
    this.addEventListener('focus', this.handleHostFocus);
    this.addEventListener('blur', this.handleHostBlur);
  }

  public override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('focus', this.handleHostFocus);
    this.removeEventListener('blur', this.handleHostBlur);
  }

  /** Checks for validity but doesn't report a validation message when invalid. */
  public override checkValidity(): boolean {
    return this.validity.valid;
  }

  /** Checks for validity and sets the browser's validation message when the group is invalid. */
  public override reportValidity(): boolean {
    this.hadFocus = true;
    this.updateGroupValidity();
    return !this.invalid;
  }

  public override setCustomValidity(message = '') {
    super.setCustomValidity(message);
    this.updateGroupValidity();
  }

  protected override syncInitialFormValue() {
    this.initialSelectedValues = [...this.selectedValues];
  }

  protected override restoreInitialFormValue() {
    this.selectedValues = [...this.initialSelectedValues];
  }

  protected override formStateRestoreCallback(state: string | File | FormData | null) {
    if (state instanceof FormData && this.name) {
      this.selectedValues = state.getAll(this.name).map(value => String(value));
      return;
    }

    if (typeof state === 'string') {
      try {
        const value: unknown = JSON.parse(state);
        if (Array.isArray(value) && value.every(item => typeof item === 'string')) {
          this.selectedValues = value;
        }
      } catch {
        this.selectedValues = [state];
      }
    }
  }

  protected getFormValue(): FormData | null {
    if (!this.name || this.disabled) return null;

    const formValue = new FormData();
    const enabledValues = this.getAllCheckboxes()
      .filter(checkbox => !checkbox.disabled && !checkbox.forceDisabled)
      .map(checkbox => this.getCheckboxValue(checkbox))
      .filter(value => this.selectedValues.includes(value));

    enabledValues.forEach(value => formValue.append(this.name!, value));
    return enabledValues.length ? formValue : null;
  }

  protected override willUpdate(changedProperties: Map<string | number | symbol, unknown>) {
    super.willUpdate(changedProperties);

    if (changedProperties.has('selectedValues')) {
      void this.syncCheckboxElements();
      this.internals.setFormValue(this.getFormValue());
      if (this.hasUpdated) this.updateGroupValidity();
    }
    if (changedProperties.has('disabled') || changedProperties.has('readonly')) {
      void this.syncCheckboxElements();
      this.internals.setFormValue(this.getFormValue());
    }
    if (changedProperties.has('name')) {
      this.internals.setFormValue(this.getFormValue());
    }
    if (changedProperties.has('required') && this.hasUpdated) {
      this.updateGroupValidity();
    }
    if (changedProperties.has('autofocus') && this.autofocus) {
      this.focusOnFirstFocusableElement();
    }
  }

  protected override firstUpdated() {
    super.firstUpdated();
    this.internals.setFormValue(this.getFormValue());
    this.updateGroupValidity();
    void this.syncCheckboxElements();
  }

  protected override updateValidity() {
    this.updateGroupValidity();
    this.internals.setFormValue(this.getFormValue());
  }

  protected updateGroupValidity() {
    const validity = this.validity;
    this._errorMessage = this.customErrorMessage || (validity.valid ? '' : this.getNativeErrorMessage());
    this.invalid = !validity.valid;
    this.internals.setValidity(
      validity.valid ? {} : { valueMissing: validity.valueMissing, customError: validity.customError },
      this._errorMessage
    );
  }

  protected getNativeErrorMessage() {
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.required = this.required;
    input.checked = this.selectedValues.length > 0;
    return input.validationMessage;
  }

  protected getAllCheckboxes(): CoreCheckbox[] {
    return [...this.children].filter(child => child instanceof CoreCheckbox) as CoreCheckbox[];
  }

  protected getCheckboxValue(checkbox: CoreCheckbox): string {
    return checkbox.value || 'on';
  }

  protected handleCheckboxChange(event: Event) {
    const checkbox = event.target as CoreCheckbox;
    if (!this.getAllCheckboxes().includes(checkbox)) return;

    event.stopPropagation();
    if (this.disabled || this.readonly || checkbox.disabled || checkbox.forceDisabled || checkbox.readonly) return;

    const checkboxValue = this.getCheckboxValue(checkbox);
    const nextValue = checkbox.checked
      ? [...this.selectedValues, checkboxValue]
      : this.selectedValues.filter(value => value !== checkboxValue);

    if (
      nextValue.length === this.selectedValues.length &&
      nextValue.every((value, index) => value === this.selectedValues[index])
    )
      return;

    this.selectedValues = nextValue;
    this.emitInput();
    this.emitChange();
  }

  protected handleSlotChange() {
    this.checkboxes = this.getAllCheckboxes();
    void this.syncCheckboxElements().then(() => this.internals.setFormValue(this.getFormValue()));
  }

  protected handleFocusElement() {
    this.hasFocus = true;
  }

  protected handleBlurElement() {
    this.hasFocus = false;
    this.hadFocus = true;
    this.reportValidity();
  }

  protected handleHostFocus = () => {
    this.focusOnFirstFocusableElement();
  };

  protected handleHostBlur = () => {
    this.hasFocus = false;
  };

  /** Syncs the slotted checkboxes with group state without overwriting their individual disabled or readonly values. */
  protected async syncCheckboxElements() {
    const checkboxes = this.getAllCheckboxes();

    checkboxes.forEach(checkbox => {
      checkbox.forceDisabled = this.disabled;
      checkbox.forceReadonly = this.readonly;
    });
    await Promise.all(checkboxes.map(checkbox => checkbox.updateComplete));

    checkboxes.forEach(checkbox => {
      checkbox.checked = this.selectedValues.includes(this.getCheckboxValue(checkbox));
    });
    await Promise.all(checkboxes.map(checkbox => checkbox.updateComplete));
  }

  /** Focuses the first enabled checkbox. */
  protected focusOnFirstFocusableElement() {
    const checkboxes = this.checkboxes.length ? this.checkboxes : this.getAllCheckboxes();
    checkboxes.find(checkbox => !checkbox.disabled && !checkbox.forceDisabled)?.focus();
  }

  /** Generates the HTML template for the label. */
  protected checkboxGroupLabelTemplate() {
    return this.html`
      <legend
        part="checkbox-group-label"
        class=${classMap({
          'form-control-label': true,
          'visually-hidden': this.hideLabel,
        })}
        @click=${this.focusOnFirstFocusableElement}
      >
        ${this.labelContentTemplate()}
      </legend>
    `;
  }

  /** Generates the HTML template for the help text. */
  protected checkboxGroupHelpTextTemplate() {
    return this.html`<div
      part="checkbox-group-help-text"
      id="help-text"
      class=${classMap({
        'form-control-help-text': true,
        'visually-hidden': this.hideLabel,
      })}
      ?hidden=${!this.hasHelpText}
      @click=${this.focusOnFirstFocusableElement}
    >
      <slot name="help-text">${this.helpText}</slot>
    </div>`;
  }

  /** Generates the HTML template for the checkbox slot. */
  protected checkboxesTemplate() {
    return this.html`<div part="checkbox-group-checkboxes" class="form-control-input">
      <slot
        @slotchange=${this.handleSlotChange}
        @change=${this.handleCheckboxChange}
        @focusin=${this.handleFocusElement}
        @focusout=${this.handleBlurElement}
        role="presentation"
      ></slot>
    </div>`;
  }

  /** Generates the HTML template for the checkbox group. */
  protected checkboxGroupTemplate() {
    return this.html`<fieldset
      part="checkbox-group-base"
      aria-describedby=${ifDefined(this.describedBy)}
      aria-errormessage=${ifDefined(this.invalid ? 'error-text' : undefined)}
      aria-invalid=${this.invalid}
      aria-required=${this.required}
      class=${classMap({
        'checkbox-group': true,
        'form-control': true,
        'form-control-group': true,
        'form-control-has-error': this.invalid,
        'form-control-has-interaction': this.hadFocus,
        'form-control-has-label': this.hasLabel,
        'form-control-has-help-text': this.hasHelpText,
      })}
    >
      ${this.checkboxGroupLabelTemplate()} ${this.checkboxGroupHelpTextTemplate()} ${this.checkboxesTemplate()}
      ${this.errorMessageTemplate()}
    </fieldset>`;
  }

  protected override render() {
    return this.checkboxGroupTemplate();
  }
}

export default CoreCheckboxGroup;
