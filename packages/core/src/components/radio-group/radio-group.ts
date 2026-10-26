import { html } from 'lit/static-html.js';
import { classMap } from 'lit/directives/class-map.js';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { CharmElement, CharmFormControlElement } from '../../base/index.js';
import CoreRadio from '../radio/radio.js';
import { keys } from '../../utilities/key-map.js';
import { findNextEnabledIndex } from '../../utilities/helpers.js';
import { CoreIcon } from '../icon/icon.js';
import styles from './radio-group.styles.js';

/**
 * Radio Group manages a collection of radio buttons, enforcing single selection behavior and providing accessible keyboard navigation. It handles the selection state, validation, layout options, and proper focus management required for form controls that present mutually exclusive choices.
 *
 * @tag ch-radio-group
 * @since 1.0.0
 * @status beta
 *
 * @slot - The default slot where radio controls are placed.
 * @slot label - The radio group label. Required for proper accessibility. Alternatively, you can use the `label` attribute.
 * @slot help-text - Help text that describes how to use the input. Alternatively, you can use the `help-text` attribute.
 *
 * @event change - Emitted when the radio group's selected value changes.
 * @event input - Emitted when the radio group receives user input.
 * @event blur - Emitted when the radio group loses focus.
 * @event focus - Emitted when the radio group gains focus.
 *
 * @cssprop --charm-radio-group-radio-gap - The gap between radio buttons.
 *
 * @csspart form-control-error-text - The control's error text's wrapper.
 * @csspart radio-group-base - The component's internal wrapper.
 * @csspart radio-group-help-text - The help text's wrapper.
 * @csspart radio-group-label - The radio group's label.
 * @csspart radio-group-radios - Wrapper around the default slot.
 *
 * @omit placeholder
 *
 * @dependency CoreIcon
 **/
export class CoreRadioGroup extends CharmFormControlElement {
  public static override styles = [...super.styles, styles];
  public static override baseName = 'radio-group';
  public static override watchedSlots = ['help-text', 'label'];

  /** Radios are slotted, so focus must be explicitly forwarded to an item. */
  public static override shadowRootOptions = { ...super.shadowRootOptions, delegatesFocus: false };

  /** How the radio items are laid out in the group.*/
  @property({ reflect: true }) public layout?: 'horizontal' | 'vertical' | 'horizontal-stacked';

  protected radios: CoreRadio[] = [];
  protected validationInput?: HTMLInputElement;
  public constructor() {
    super();
    this.useBlurHandler = false;
    this.useFocusHandler = false;
  }

  public static override get dependencies(): (typeof CharmElement)[] {
    return [CoreIcon];
  }

  /** Gets the current validation message, if one exists. */
  public override get validationMessage() {
    return this.customErrorMessage || (this.validity.valid ? '' : this.getNativeErrorMessage());
  }

  public override get validity(): ValidityState {
    const hasMissingData = !((this.value && this.required) || !this.required);
    const hasCustomError = this.customErrorMessage !== '';

    return {
      badInput: false,
      customError: hasCustomError,
      patternMismatch: false,
      rangeOverflow: false,
      rangeUnderflow: false,
      stepMismatch: false,
      tooLong: false,
      tooShort: false,
      typeMismatch: false,
      valid: hasMissingData || hasCustomError ? false : true,
      valueMissing: hasMissingData,
    };
  }

  /** The first enabled radio, used to anchor the browser's constraint-validation message to the radio controls. */
  protected get validationTarget(): CoreRadio | undefined {
    return this.getAllRadios().find(radio => !radio.disabled && !radio.forceDisabled);
  }

  /** Checks for validity and shows the browser's validation message if the control is invalid. */
  public override reportValidity(): boolean {
    this.hadFocus = true;
    const validity = this.validity;

    this._errorMessage = this.customErrorMessage || (validity.valid ? '' : this.getNativeErrorMessage());
    this.invalid = !validity.valid;

    this.internals.setValidity(
      validity.valid ? {} : { valueMissing: validity.valueMissing, customError: validity.customError },
      this._errorMessage,
      this.validationTarget
    );

    return !this.invalid;
  }

  public override setCustomValidity(message = '') {
    this.hadFocus = true;
    this.customErrorMessage = message;
    const validity = this.validity;
    this._errorMessage = message || (validity.valid ? '' : this.getNativeErrorMessage());
    this.invalid = !validity.valid;
    this.internals.setValidity(
      validity.valid ? {} : { valueMissing: validity.valueMissing, customError: validity.customError },
      this._errorMessage,
      this.validationTarget
    );
  }

  public override connectedCallback() {
    super.connectedCallback();
    // The base class syncs the form value on every connect, which registers an empty string for a group with no
    // selection. Native radios submit nothing when none is checked, so re-apply the value-dependent form value here
    // (`firstUpdated` doesn't run again when the group is moved between forms).
    this.internals.setFormValue(this.value || null);
  }

  /** Focus the selected radio or the first enabled radio. */
  public override focus(options?: FocusOptions): void {
    const radios = this.radios.length ? this.radios : this.getAllRadios();
    const target =
      radios.find(radio => radio.checked && !radio.disabled && !radio.forceDisabled) ??
      radios.find(radio => !radio.disabled && !radio.forceDisabled);
    target?.focus(options);
  }

  /** Checks for validity but doesn't report a validation message when invalid. */
  public override checkValidity() {
    return this.validity?.valid;
  }

  protected override firstUpdated() {
    super.firstUpdated();
    this.internals.setFormValue(this.value || null);
    const validity = this.validity;
    this.internals.setValidity(
      validity.valid ? {} : { valueMissing: validity.valueMissing, customError: validity.customError },
      this.validationMessage,
      this.validationTarget
    );
    this.invalid = false;
  }

  protected override updateErrorMessage() {
    this.reportValidity();
  }

  protected override willUpdate(changedProperties: Map<string | number | symbol, unknown>) {
    super.willUpdate(changedProperties);
    if (changedProperties.has('value')) {
      this.handleValueChange();
    }
    if (changedProperties.has('disabled') || changedProperties.has('readonly')) {
      this.syncRadioElements();
    }
    if (changedProperties.has('autofocus')) {
      if (this.autofocus) {
        this.focusOnFirstFocusableElement();
      }
    }
  }

  protected handleValueChange() {
    if (!this.hasUpdated) return;
    this.syncRadioElements();
    this.internals.setFormValue(this.value || null);
    const validity = this.validity;
    this.internals.setValidity(
      validity.valid ? {} : { valueMissing: validity.valueMissing, customError: validity.customError },
      this.customErrorMessage || (validity.valid ? '' : this.getNativeErrorMessage()),
      this.validationTarget
    );
    if (this.hadFocus) this.reportValidity();
  }

  protected getNativeErrorMessage() {
    this.validationInput ??= document.createElement('input');
    this.validationInput.type = 'radio';
    this.validationInput.name = 'radio-group-validation';
    this.validationInput.required = this.required;
    this.validationInput.checked = !!this.value;
    return this.validationInput.validationMessage;
  }

  protected getAllRadios() {
    return [...this.children].filter((element): element is CoreRadio => element instanceof CoreRadio);
  }

  protected handleRadioSelected(event: Event) {
    const target = event.target as CoreRadio;

    // Make sure the radio isn't disabled and that the element is actually a radio
    if (
      !(target instanceof CoreRadio) ||
      !this.getAllRadios().includes(target) ||
      this.disabled ||
      this.readonly ||
      target.disabled ||
      target.forceDisabled
    ) {
      return;
    }

    const oldValue = this.value;
    if (oldValue === target.value) {
      return;
    }

    this.value = target.value || '';

    this.emitInput();
    this.emitChange();
  }

  protected handleKeyDown(event: KeyboardEvent) {
    if (this.readonly || this.disabled) return;
    // Ignore keys we're not interested in
    if (![keys.ArrowUp, keys.ArrowDown, keys.ArrowLeft, keys.ArrowRight, keys.Space].includes(event.key)) {
      return;
    }

    const enabledRadios = this.radios.filter(radio => !radio.disabled && !radio.forceDisabled);
    if (enabledRadios.length === 0) {
      return;
    }

    event.preventDefault();

    const checkedIndex = enabledRadios.findIndex(radio => radio.checked);

    let targetIndex: number;
    if (event.key === keys.Space) {
      targetIndex = checkedIndex === -1 ? 0 : checkedIndex;
    } else {
      const direction: 1 | -1 =
        event.key === keys.ArrowUp
          ? -1
          : event.key === keys.ArrowDown
            ? 1
            : this.resolvedDir === 'rtl'
              ? event.key === keys.ArrowRight
                ? -1
                : 1
              : event.key === keys.ArrowRight
                ? 1
                : -1;
      const startIndex = checkedIndex === -1 ? (direction === 1 ? -1 : 0) : checkedIndex;
      targetIndex = findNextEnabledIndex(enabledRadios, startIndex, direction, () => true);
    }

    if (targetIndex === -1) {
      return;
    }

    const targetRadio = enabledRadios[targetIndex];
    this.radios.forEach(radio => (radio.checked = false));
    targetRadio.checked = true;
    targetRadio.tabIndex = 0;
    targetRadio.focus();

    this.radios.forEach(radio => {
      if (radio !== targetRadio) {
        radio.tabIndex = -1;
      }
    });
  }

  protected handleSlotChange() {
    this.radios = this.getAllRadios();
    this.syncRadioElements();
  }

  protected handleBlurElement(event: FocusEvent) {
    if (event.relatedTarget instanceof Node && this.contains(event.relatedTarget)) return;
    this.hasFocus = false;
    this.hadFocus = true;
    this.reportValidity();
  }

  protected handleFocusElement() {
    this.hasFocus = true;
  }

  /**
   * Synchronizes the slotted radios with the group's state: force-disables them when the group is disabled (without
   * clobbering their own `disabled` state), syncs their `checked` state to the group's value, and applies the roving
   * tabindex. Waits for the radios to settle so the radios' own reactive tabindex handling can't clobber the group's.
   */
  protected async syncRadioElements() {
    const radios = this.getAllRadios();

    radios.forEach(radio => {
      radio.forceDisabled = this.disabled;
    });

    await Promise.all(radios.map(radio => radio.updateComplete));

    radios.forEach(radio => {
      radio.checked = radio.value === this.value;
      radio.readonly = this.readonly;
    });

    await Promise.all(radios.map(radio => radio.updateComplete));

    if (this.disabled) {
      radios.forEach(radio => (radio.tabIndex = -1));
      return;
    }

    const enabledRadios = radios.filter(radio => !radio.disabled && !radio.forceDisabled);
    const checkedRadio = enabledRadios.find(radio => radio.checked);

    enabledRadios.forEach(radio => {
      radio.tabIndex = checkedRadio ? (radio.checked ? 0 : -1) : radio === enabledRadios[0] ? 0 : -1;
    });

    radios
      .filter(radio => radio.disabled)
      .forEach(radio => {
        radio.tabIndex = -1;
      });
  }

  /** Focuses on the first focusable element. */
  protected focusOnFirstFocusableElement() {
    const radios = this.radios.length ? this.radios : this.getAllRadios();
    const firstFocusable =
      radios.find(radio => radio.checked && !radio.disabled && !radio.forceDisabled) ??
      radios.find(radio => !radio.disabled && !radio.forceDisabled);
    firstFocusable?.focus();
  }

  /** Generates the HTML template for the label. */
  protected radioGroupLabelTemplate() {
    return html`
      <legend
        part="radio-group-label"
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
  protected radioGroupHelpTextTemplate() {
    return html`<div
      part="radio-group-help-text"
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

  /** Generates the HTML template for the slot for radios. */
  protected radiosTemplate() {
    return html`
      <div part="radio-group-radios" class="form-control-input">
        <slot
          @keydown=${this.handleKeyDown}
          @slotchange=${this.handleSlotChange}
          @selected=${this.handleRadioSelected}
          @focusout=${this.handleBlurElement}
          @focusin=${this.handleFocusElement}
          role="presentation"
        ></slot>
      </div>
    `;
  }

  /** Generates the HTML template for the radio group. */
  protected radioGroupTemplate() {
    return html`
      <fieldset
        part="radio-group-base"
        role="radiogroup"
        aria-describedby=${ifDefined(this.describedBy)}
        aria-errormessage=${ifDefined(this.invalid ? 'error-text' : undefined)}
        aria-invalid="${this.invalid}"
        aria-orientation=${this.layout === 'horizontal' || this.layout === 'horizontal-stacked'
          ? 'horizontal'
          : 'vertical'}
        aria-readonly=${ifDefined(this.readonly ? 'true' : undefined)}
        aria-required="${this.required}"
        class=${classMap({
          'radio-group': true,
          'form-control': true,
          'form-control-group': true,
          'form-control-has-error': this.invalid,
          'form-control-has-interaction': this.hadFocus,
          'form-control-has-label': this.hasLabel,
          'form-control-has-help-text': this.hasHelpText,
        })}
      >
        ${this.radioGroupLabelTemplate()} ${this.radioGroupHelpTextTemplate()} ${this.radiosTemplate()}
        ${this.errorMessageTemplate()}
      </fieldset>
    `;
  }

  protected override render() {
    return this.radioGroupTemplate();
  }
}

export default CoreRadioGroup;
