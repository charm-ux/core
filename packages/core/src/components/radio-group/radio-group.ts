import { html } from 'lit/static-html.js';
import { classMap } from 'lit/directives/class-map.js';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { CharmElement, CharmFormControlElement } from '../../base/index.js';
import { HasSlotController } from '../../controller/slot.js';
import CoreRadio from '../radio/radio.js';
import { keys } from '../../utilities/key-map.js';
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
 * @event blur - Emitted when the radio group loses focus.
 * @event focus - Emitted when the radio group gains focus.
 *
 * @cssproperty --radio-group-radio-gap - The gap between radio buttons.
 *
 * @csspart form-control-error-text - The control's error text's wrapper.
 * @csspart radio-group-base - The component's internal wrapper.
 * @csspart radio-group-help-text - The help text's wrapper.
 * @csspart radio-group-label - The radio group's label.
 * @csspart radio-group-radios - Wrapper around the default slot.
 *
 * @omit placeholder
 *
 * @dependency icon
 **/
export class CoreRadioGroup extends CharmFormControlElement {
  public static override styles = [...super.styles, styles];
  public static override baseName = 'radio-group';

  /** How the radio items are laid out in the group.*/
  @property({ reflect: true }) public layout?: 'horizontal' | 'vertical' | 'horizontal-stacked';

  protected radios: CoreRadio[] = [];
  protected readonly hasSlotController = new HasSlotController(this, 'help-text', 'label');
  private previouslyDisabledRadios: Set<CoreRadio> = new Set();

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
      valueMissing: !hasMissingData,
    };
  }

  /** Checks for validity and shows the browser's validation message if the control is invalid. */
  public override reportValidity(): boolean {
    this.hadFocus = true;
    const validity = this.validity;

    this._errorMessage = this.customErrorMessage || (validity.valid ? '' : this.getNativeErrorMessage());
    this.invalid = !validity.valid;

    return !this.invalid;
  }

  public override async connectedCallback() {
    super.connectedCallback();
    this.setAttribute('tabindex', '0');
    this.addEventListener('focus', this.handleHostFocus);
    this.addEventListener('blur', this.handleHostBlur);
    this.updateComplete.then(() => {
      this.handleLayoutChange();
    });
  }

  /** Checks for validity but doesn't report a validation message when invalid. */
  public override checkValidity() {
    return this.validity?.valid;
  }

  protected override firstUpdated() {
    super.firstUpdated();
    this.invalid = !this.checkValidity();
  }

  protected override willUpdate(changedProperties: Map<string | number | symbol, unknown>) {
    super.willUpdate(changedProperties);
    if (changedProperties.has('value')) {
      this.handleValueChange();
    }
    if (changedProperties.has('layout')) {
      this.handleLayoutChange();
    }
    if (changedProperties.has('readonly')) {
      this.radios.forEach(radio => (radio.readonly = this.readonly));
    }
    if (changedProperties.has('disabled')) {
      if (this.disabled) {
        // Store which radios were already disabled before we disable the group
        this.previouslyDisabledRadios.clear();
        this.getAllRadios().forEach(radio => {
          if (radio.disabled) {
            this.previouslyDisabledRadios.add(radio);
          } else {
            radio.disabled = true;
          }
        });
      } else {
        // Re-enable only the radios that weren't already disabled
        this.getAllRadios().forEach(radio => {
          if (!this.previouslyDisabledRadios.has(radio)) {
            radio.disabled = false;
          }
        });
        this.previouslyDisabledRadios.clear();
      }
    }
    if (changedProperties.has('autofocus')) {
      if (this.autofocus) {
        this.focusOnFirstFocusableElement();
      }
    }
  }

  protected handleLayoutChange() {
    this.radios.forEach(radio => {
      if (this.layout === 'horizontal-stacked') {
        radio.vertical = true;
      } else {
        radio.vertical = false;
      }
    });
  }

  protected handleValueChange() {
    if (!this.hasUpdated) return;
    this.updateCheckedRadio();
    this.reportValidity();
  }

  protected getNativeErrorMessage() {
    const input = document.createElement('input');
    input.required = this.required;
    input.value = this.value ? this.value.toString() : '';
    return input.validationMessage;
  }

  protected getAllRadios() {
    return [...this.children].filter(x => x.tagName.toLowerCase().includes('radio')) as CoreRadio[];
  }

  protected handleRadioSelected(event: Event) {
    const target = event.target as CoreRadio;

    // Make sure the radio isn't disabled and that the element is actually a radio
    if (target.getAttribute('role') !== 'radio' || target.disabled) {
      return;
    }

    const oldValue = this.value;
    this.value = target.value || '';
    const radios = this.getAllRadios();
    radios.forEach(radio => {
      radio.checked = radio === target;
      radio.tabIndex = radio.checked ? 0 : -1;
    });

    // Emit change event only if the selection has changed
    if (oldValue !== this.value) {
      this.emitChange();
    }
  }

  protected handleKeyDown(event: KeyboardEvent) {
    // Ignore keys we're not interested in
    if (![keys.ArrowUp, keys.ArrowDown, keys.ArrowLeft, keys.ArrowRight, keys.Space].includes(event.key)) {
      return;
    }

    const radios = this.radios.filter(radio => !radio.disabled);
    const checkedRadio = radios.find(radio => radio.checked) ?? radios[0];
    const incr = event.key === ' ' ? 0 : ['ArrowUp', 'ArrowLeft'].includes(event.key) ? -1 : 1;
    let index = radios.indexOf(checkedRadio) + incr;
    if (index < 0) {
      index = radios.length - 1;
    } else if (index > radios.length - 1) {
      index = 0;
    }

    this.radios.forEach(radio => {
      radio.checked = false;
      radio.tabIndex = -1;
    });

    radios[index].checked = true;

    radios[index].tabIndex = 0;
    radios[index].focus();

    event.preventDefault();
  }

  protected handleSlotChange() {
    this.radios = this.getAllRadios();
    this.radios.forEach(radio => {
      radio.checked = radio.value === this.value;
      radio.setAttribute('tabindex', radio.checked ? '0' : '-1');
    });
    if (this.radios.length && !this.radios.some(radio => radio.checked)) {
      this.radios[0].setAttribute('tabindex', '0');
    }
  }

  protected handleBlurElement() {
    this.hasFocus = false;
    this.hadFocus = true;
    this.reportValidity();
  }

  protected handleFocusElement() {
    this.hasFocus = true;
  }

  protected handleHostFocus = () => {
    this.setAttribute('tabindex', '-1');
    this.radios.find(radio => radio.checked)?.focus();
  };

  protected handleHostBlur = () => {
    this.setAttribute('tabindex', '0');
  };

  protected updateCheckedRadio() {
    this.radios.forEach(radio => (radio.checked = radio.value === this.value));
  }

  /** Focuses on the first focusable element. */
  protected focusOnFirstFocusableElement() {
    const focusableElements = this.shadowRoot?.querySelectorAll('input[tabindex="0"]');
    if (focusableElements && focusableElements.length > 0) {
      const firstFocusableElement = focusableElements[0] as HTMLElement;
      firstFocusableElement.focus();
    }
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
        aria-describedby="help-text"
        aria-errormessage="${ifDefined(this.invalid ? 'error-message' : undefined)}"
        aria-invalid="${this.invalid}"
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
