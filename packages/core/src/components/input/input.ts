import { html } from 'lit/static-html.js';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { CharmElement, CharmFormControlElement } from '../../base/index.js';
import { endTemplate, startTemplate } from '../../templates/index.js';
import { keys } from '../../utilities/key-map.js';
import { CoreIcon } from '../icon/icon.js';
import styles from './input.styles.js';

export type InputTypes =
  | 'date'
  | 'datetime-local'
  | 'email'
  | 'number'
  | 'password'
  | 'search'
  | 'tel'
  | 'text'
  | 'time'
  | 'url'
  | 'range';

/**
 * Input allows the user to enter and edit text.
 *
 * @tag ch-input
 * @since 1.0.0
 * @status beta
 *
 * @slot - The options in the datalist.
 * @slot end - A presentational suffix icon or similar element.
 * @slot label - The input's label. Alternatively, you can use the label prop.
 * @slot start - A presentational prefix icon or similar element.
 *
 * @event change - Emitted when an alteration to the control's value is committed by the user.
 * @event input - Emitted when the value is being changed by the user.
 *
 * @csspart end - Container for end slot.
 * @csspart input - The native input element.
 * @csspart input-base - The component's base wrapper.
 * @csspart input-control - The wrapper for start, input, and end.
 * @csspart input-label - The label.
 * @csspart start - Container for start slot.
 *
 * @cssproperty --input-range-active-bg-color - The background color of the progress track and thumb when the input is active and the input type is `range`.
 * @cssproperty --input-range-active-fg-color - The foreground color of the progress track and thumb when the input is active and the input type is `range`.
 * @cssproperty --input-range-disabled-bg-color - The background color of the progress track and thumb when the input is disabled and the input type is `range`.
 * @cssproperty --input-range-disabled-fg-color - The foreground color of the progress track and thumb when the input is disabled and the input type is `range`.
 * @cssproperty --input-range-hover-bg-color - The background color of the progress track and thumb when the input is hovered and the input type is `range`.
 * @cssproperty --input-range-hover-fg-color - The foreground color of the progress track and thumb when the input is hovered and the input type is `range`.
 * @cssproperty --input-range-progress-color - The color of the slider's track that represents the selected range.
 * @cssproperty --input-range-thumb-color - The color of the slider's thumb.
 * @cssproperty --input-range-track-color - The color of the slider's track.
 *
 * @dependency icon
 **/
export class CoreInput extends CharmFormControlElement {
  public static override styles = [...super.styles, styles];

  public static override baseName = 'input';

  /** A pattern to validate input against. */
  @property()
  public pattern?: string;

  /** Controls whether and how text input is automatically capitalized as it is entered/edited by the user. */
  @property({ reflect: true })
  public override autocapitalize: 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters' = 'off';

  /**
   * Permission the user agent has to provide automated assistance in filling out form field values and the type of
   * information expected in the field.
   */
  @property()
  public autocomplete?: string;

  /**
   * Used to customize the label or icon of the Enter key on virtual keyboards.
   */
  @property({ reflect: true })
  public enterkeyhint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';

  /** Hints at the type of data that might be entered by the user while editing the element or its contents. */
  @property()
  public inputmode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';

  /** The input's max attribute. */
  @property({ reflect: true })
  public max?: number;

  /** The input's maxlength attribute. */
  @property({ reflect: true })
  public maxlength?: number;

  /** The input's min attribute. */
  @property({ reflect: true })
  public min?: number;

  /** The input's minlength attribute. */
  @property({ reflect: true })
  public minlength?: number;

  /** Enables spell checking on the input. */
  @property({ type: Boolean, reflect: true })
  public override spellcheck = false;

  /** The input's step attribute. */
  @property({ reflect: true })
  public step?: number;

  @property({ attribute: true, type: String })
  public type?: InputTypes;

  /** The input's placeholder text. */
  @property({ reflect: true })
  public placeholder?: string;

  //@ts-ignore
  @query('#input')
  protected override input?: HTMLInputElement;

  @state()
  protected options?: Array<HTMLOptionElement> = [];

  public static override get dependencies(): (typeof CharmElement)[] {
    return [CoreIcon];
  }

  public override get value() {
    return this._value;
  }

  /** Gets or sets the current value as a `Date` object. Only valid when `type` is `date`. */
  public get valueAsDate() {
    return this.input?.valueAsDate ?? null;
  }

  /** Gets or sets the current value as a number. */
  public get valueAsNumber() {
    return this.input?.valueAsNumber ?? parseFloat(this.value!.toString());
  }

  public override set value(val: string) {
    if (this.type !== 'number') {
      super.value = val;
      return;
    }
    // check the val is within the range of min and max if they are set
    const parsedValue = Number(val);
    if (this.min && parsedValue < this.min) {
      val = this.min?.toString();
    } else if (this.max && parsedValue > this.max) {
      val = this.max?.toString();
    }
    super.value = val;
  }

  public set valueAsDate(newValue: Date | null) {
    if (this.type !== 'date') return;
    // We use an in-memory input instead of the one in the template because the property can be set before render
    const input = document.createElement('input');
    input.type = 'date';
    input.valueAsDate = newValue;
    this.value = input.value;
  }

  public set valueAsNumber(newValue: number) {
    if (this.type !== 'number') return;
    // We use an in-memory input instead of the one in the template because the property can be set before render
    const input = document.createElement('input');
    input.type = 'number';
    input.valueAsNumber = newValue;
    this.value = input.value;
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    this.options = this.getOptions();
  }

  /** Gets all the options in the datalist from the input */
  protected getOptions() {
    return Array.from(this.querySelectorAll<HTMLOptionElement>('option'));
  }

  /** Handles the change in the default slot. */
  protected handleSlotChange() {
    this.options = this.getOptions();
  }

  /** Handles the change of the input. */
  protected handleChange() {
    this.value = this.input!.value;
    this.emitChange();
  }

  /** Handles input - renamed from handleInput due to collision with base class. */
  protected handleInput() {
    this.value = this.input!.value;
  }

  /** Handles the Enter key press event. */
  protected handleEnterKey(event: KeyboardEvent) {
    setTimeout(() => {
      const form = this.closest('form');
      if (event.defaultPrevented || !form) return;
      form.submit();
    });
  }

  /** Stops the slider default event when readonly. */
  protected handleSliderReadonly(event: KeyboardEvent) {
    if (this.type === 'range' && this.readonly) {
      event.preventDefault();
    }
  }

  /** Handles the `keydown` event. */
  protected handleKeyDown(event: KeyboardEvent) {
    const hasModifier = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

    // Pressing enter when focused on an input should submit the form like a native input, but we wait a tick before
    // submitting to allow users to cancel the keydown event if they need to
    if (event.key === keys.Enter && !hasModifier) {
      this.handleEnterKey(event);
    }

    this.handleSliderReadonly(event);
  }

  /**
   * Handles the `mousedown` event for slider.
   */
  protected handleMouseDown(event: KeyboardEvent) {
    this.handleSliderReadonly(event);
  }

  /**
   * Generates the template for the native input element.
   */
  protected inputElementTemplate() {
    return html`
      <input
        autocapitalize=${ifDefined(this.type === 'password' ? 'off' : this.autocapitalize)}
        autocomplete=${ifDefined(this.type === 'password' ? 'off' : this.autocomplete) as any}
        class="form-control-base-input"
        enterkeyhint=${ifDefined(this.enterkeyhint)}
        id="input"
        list="input-datalist"
        inputmode=${ifDefined(this.inputmode)}
        part="input"
        pattern=${ifDefined(this.pattern)}
        placeholder=${ifDefined(this.placeholder)}
        minlength=${ifDefined(this.minlength)}
        maxlength=${ifDefined(this.maxlength)}
        min=${ifDefined(this.min)}
        max=${ifDefined(this.max)}
        spellcheck=${ifDefined(this.spellcheck)}
        step=${ifDefined(this.step)}
        ?readonly=${this.readonly}
        ?autofocus=${this.autofocus}
        type=${this.type ?? 'text'}
        ?disabled=${this.disabled}
        ?required=${this.required}
        .value=${this._value}
        @change=${this.handleChange}
        @input=${this.handleInput}
        @keydown=${this.handleKeyDown}
        @mousedown=${(e: KeyboardEvent) => this.handleSliderReadonly(e)}
      />
    `;
  }

  /** Generate the options in the datalist. */
  protected optionsTemplate() {
    return this.options?.map(o => html`<option .value=${o.value}>${o.textContent}</option>`) || '';
  }

  /** Generates the template for the input's datalist.  */
  protected dataListTemplate() {
    return html` <datalist id="input-datalist" class="datalist">${this.optionsTemplate()}</datalist> `;
  }

  /*
   * Generates the template for the start slot.
   */
  protected inputStartTemplate() {
    return startTemplate();
  }

  /*
   * Generates the template for the end slot.
   */
  protected inputEndTemplate() {
    return endTemplate();
  }

  /** Generates the template for the input's control. */
  protected inputControlTemplate() {
    return html`<div part="input-control" class="form-control-input">
      ${this.inputStartTemplate()} ${this.inputElementTemplate()} ${this.dataListTemplate()}${this.inputEndTemplate()}
    </div>`;
  }

  /** Generates the template for the input component. */
  protected inputTemplate() {
    return html` <div
      part="input-base"
      class=${classMap({
        'form-control': true,
        'form-control-has-error': this.invalid,
        'form-control-has-interaction': this.hadFocus,
        'form-control-has-help-text': this.hasHelpText,
        'form-control-has-label': this.hasLabel,
      })}
    >
      <label
        aria-hidden=${this.label ? 'false' : 'true'}
        part="input-label"
        class=${classMap({
          'form-control-label': true,
          'visually-hidden': this.hideLabel,
        })}
        for="input"
      >
        ${this.labelContentTemplate()}
      </label>

      ${this.helpTextTemplate()} ${this.inputControlTemplate()}
      <slot hidden @slotchange=${this.handleSlotChange}></slot>

      ${this.errorMessageTemplate()}
    </div>`;
  }

  protected override render() {
    return this.inputTemplate();
  }
}

export default CoreInput;
