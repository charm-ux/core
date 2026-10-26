import { html } from 'lit/static-html.js';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
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
 * @slot clear-label - Accessible label for the clear button.
 * @slot show-password-label - Accessible label for the password visibility button when hidden.
 * @slot hide-password-label - Accessible label for the password visibility button when visible.
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
 * @cssprop --charm-input-range-active-bg-color - The background color of the progress track and thumb when the input is active and the input type is `range`.
 * @cssprop --charm-input-range-active-fg-color - The foreground color of the progress track and thumb when the input is active and the input type is `range`.
 * @cssprop --charm-input-range-disabled-bg-color - The background color of the progress track and thumb when the input is disabled and the input type is `range`.
 * @cssprop --charm-input-range-disabled-fg-color - The foreground color of the progress track and thumb when the input is disabled and the input type is `range`.
 * @cssprop --charm-input-range-hover-bg-color - The background color of the progress track and thumb when the input is hovered and the input type is `range`.
 * @cssprop --charm-input-range-hover-fg-color - The foreground color of the progress track and thumb when the input is hovered and the input type is `range`.
 * @cssprop --charm-input-range-progress-color - The color of the slider's track that represents the selected range.
 * @cssprop --charm-input-range-thumb-color - The color of the slider's thumb.
 * @cssprop --charm-input-range-track-color - The color of the slider's track.
 *
 * @dependency CoreIcon
 **/
export class CoreInput extends CharmFormControlElement {
  public static override styles = [...super.styles, styles];

  public static override baseName = 'input';

  /** A pattern to validate input against. */
  @property()
  public pattern?: string;

  /** Controls whether and how text input is automatically capitalized as it is entered/edited by the user. */
  @property()
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

  @property({ attribute: true, type: String, reflect: true })
  public type?: InputTypes;

  /** The input's placeholder text. */
  @property({ reflect: true })
  public placeholder?: string;

  /** Adds a clear button when the input is not empty. */
  @property({ attribute: 'with-clear', type: Boolean })
  public withClear = false;

  /** Adds a button to toggle the password's visibility. Only applies to password types. */
  @property({ attribute: 'password-toggle', type: Boolean })
  public passwordToggle = false;

  /** Determines whether the password is currently visible. Only applies to password types. */
  @property({ attribute: 'password-visible', type: Boolean })
  public passwordVisible = false;

  @query('#input')
  protected override input?: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

  @state()
  protected options?: Array<HTMLOptionElement> = [];

  protected enterKeyTimer?: number;
  protected isComposing = false;
  protected optionObserver?: MutationObserver;

  public static override get dependencies(): (typeof CharmElement)[] {
    return [CoreIcon];
  }

  public override get value() {
    return this._value;
  }

  /** Gets or sets the current value as a `Date` object. Only valid when `type` is `date`. */
  public get valueAsDate() {
    return this.nativeInput?.valueAsDate ?? null;
  }

  /** Gets or sets the current value as a number. */
  public get valueAsNumber() {
    return this.nativeInput?.valueAsNumber ?? parseFloat(this.value.toString());
  }

  protected get nativeInput(): HTMLInputElement | undefined {
    return this.input as HTMLInputElement | undefined;
  }

  public override set value(val: string) {
    if (this._value === val) return;
    this._value = val;
    this.requestUpdate('value');
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

  /** Shows the browser picker for supported input types. */
  public showPicker() {
    if ('showPicker' in HTMLInputElement.prototype && this.nativeInput) {
      this.nativeInput.showPicker();
    }
  }

  /** Selects all input text. */
  public select() {
    this.nativeInput?.select();
  }

  /** Sets the start and end positions of the selection. */
  public setSelectionRange(
    selectionStart: number,
    selectionEnd: number,
    selectionDirection: 'forward' | 'backward' | 'none' = 'none'
  ) {
    this.nativeInput?.setSelectionRange(selectionStart, selectionEnd, selectionDirection);
  }

  /** Replaces a range of text in the input. */
  public setRangeText(
    replacement: string,
    start?: number,
    end?: number,
    selectMode: 'select' | 'start' | 'end' | 'preserve' = 'preserve'
  ) {
    this.nativeInput?.setRangeText(
      replacement,
      start ?? this.nativeInput?.selectionStart ?? 0,
      end ?? this.nativeInput?.selectionEnd ?? 0,
      selectMode
    );
    if (this.input && this.value !== this.input.value) {
      this.value = this.input.value;
    }
  }

  /** Increments the value of a numeric input type by the value of the step attribute. */
  public stepUp() {
    this.nativeInput?.stepUp();
    if (this.input && this.value !== this.input.value) {
      this.value = this.input.value;
    }
  }

  /** Decrements the value of a numeric input type by the value of the step attribute. */
  public stepDown() {
    this.nativeInput?.stepDown();
    if (this.input && this.value !== this.input.value) {
      this.value = this.input.value;
    }
  }

  public override disconnectedCallback(): void {
    if (this.enterKeyTimer !== undefined) {
      clearTimeout(this.enterKeyTimer);
      this.enterKeyTimer = undefined;
    }
    this.optionObserver?.disconnect();
    this.optionObserver = undefined;
    super.disconnectedCallback();
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    this.options = this.getOptions();
    this.optionObserver = new MutationObserver(records => {
      if (!this.isConnected) return;
      const optionsChanged = records.some(record => {
        const target = record.target instanceof Element ? record.target : record.target.parentElement;
        const insideOption =
          target instanceof HTMLOptionElement || target?.closest('option') instanceof HTMLOptionElement;
        const addedOption = [...record.addedNodes, ...record.removedNodes].some(
          node => node instanceof HTMLOptionElement || (node instanceof Element && !!node.querySelector('option'))
        );
        return insideOption || addedOption || (record.type === 'childList' && record.target === this);
      });
      if (optionsChanged) this.handleSlotChange();
    });
    this.optionObserver.observe(this, {
      attributes: true,
      attributeFilter: ['disabled', 'label', 'value'],
      characterData: true,
      childList: true,
      subtree: true,
    });
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
    if (this.type === 'range' && this.readonly) {
      if (this.input) this.input.value = this.value;
      return;
    }
    this.value = this.input!.value;
    this.emitChange();
  }

  /** Handles input - renamed from handleInput due to collision with base class. */
  protected handleInput() {
    if (this.type === 'range' && this.readonly) {
      if (this.input) this.input.value = this.value;
      return;
    }
    this.value = this.input!.value;
  }

  /** Handles the Enter key press event. */
  protected handleEnterKey(event: KeyboardEvent) {
    if (this.enterKeyTimer !== undefined) window.clearTimeout(this.enterKeyTimer);
    this.enterKeyTimer = window.setTimeout(() => {
      this.enterKeyTimer = undefined;
      const form = this.internals.form;
      if (event.defaultPrevented || this.isComposing || !form) return;

      const elements = Array.from(form.elements);
      const submitButtons = elements.filter(element => {
        if (element instanceof HTMLButtonElement) return element.type === 'submit';
        if (element instanceof HTMLInputElement) return element.type === 'submit' || element.type === 'image';
        return (
          element.localName === this.scope.tagName('button') &&
          (element as HTMLElement & { type?: string }).type === 'submit'
        );
      });
      if (submitButtons.length) {
        const defaultSubmitter = submitButtons[0] as HTMLElement & { disabled?: boolean; click(): void };
        if (!defaultSubmitter.disabled && !defaultSubmitter.hasAttribute('form-disabled')) defaultSubmitter.click();
        return;
      }

      const blockingFields = elements.filter(element => {
        if (element instanceof HTMLInputElement) {
          return (
            !element.disabled &&
            [
              'text',
              'search',
              'url',
              'tel',
              'email',
              'password',
              'date',
              'month',
              'week',
              'time',
              'datetime-local',
              'number',
            ].includes(element.type)
          );
        }
        if (element.localName === this.scope.tagName('input')) {
          const input = element as HTMLElement & { disabled?: boolean; type?: string };
          return (
            !input.disabled &&
            ['text', 'search', 'url', 'tel', 'email', 'password', 'date', 'datetime-local', 'time', 'number'].includes(
              input.type ?? ''
            )
          );
        }
        return element instanceof HTMLTextAreaElement && !element.disabled;
      });
      if (blockingFields.length === 1) form.requestSubmit();
    });
  }

  /** Stops the slider default event when readonly. */
  protected handleSliderReadonly(event: KeyboardEvent) {
    if (
      this.type === 'range' &&
      this.readonly &&
      [
        keys.ArrowDown,
        keys.ArrowLeft,
        keys.ArrowRight,
        keys.ArrowUp,
        keys.Home,
        keys.End,
        keys.PageDown,
        keys.PageUp,
      ].includes(event.key)
    ) {
      event.preventDefault();
    }
  }

  /** Handles the `keydown` event. */
  protected handleKeyDown(event: KeyboardEvent) {
    const hasModifier = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

    // Pressing enter when focused on an input should submit the form like a native input, but we wait a tick before
    // submitting to allow users to cancel the keydown event if they need to
    if (event.key === keys.Enter && !hasModifier && !event.isComposing && !this.isComposing) {
      this.handleEnterKey(event);
    }

    this.handleSliderReadonly(event);
  }

  /** Handles the clear button click event. */
  protected handleClearClick(event: MouseEvent) {
    event.preventDefault();
    if (this.value !== '') {
      this.value = '';
      this.input?.focus();
      this.emitInput();
      this.emitChange();
    }
  }

  /** Handles the password toggle click event. */
  protected handlePasswordToggle() {
    if (this.type !== 'password' || this.disabled || this.readonly) return;
    this.passwordVisible = !this.passwordVisible;
  }

  /**
   * Generates the template for the native input element.
   */
  protected inputElementTemplate() {
    const isPasswordVisible = this.type === 'password' && this.passwordVisible;
    return html`
      <input
        autocapitalize=${ifDefined(this.type === 'password' ? 'off' : this.autocapitalize)}
        autocomplete=${ifDefined(this.autocomplete) as any}
        aria-describedby=${ifDefined(this.describedBy)}
        aria-errormessage=${ifDefined(this.invalid ? 'error-text' : undefined)}
        aria-invalid=${this.invalid}
        class="form-control-base-input"
        enterkeyhint=${ifDefined(this.enterkeyhint)}
        id="input"
        list=${ifDefined(this.options?.length ? 'input-datalist' : undefined)}
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
        type=${isPasswordVisible ? 'text' : (this.type ?? 'text')}
        ?disabled=${this.disabled}
        ?required=${this.required}
        .value=${live(this.value ?? '')}
        @change=${this.handleChange}
        @input=${this.handleInput}
        @compositionstart=${() => (this.isComposing = true)}
        @compositionend=${() => (this.isComposing = false)}
        @keydown=${this.handleKeyDown}
      />
    `;
  }

  /** Generate the options in the datalist. */
  protected optionsTemplate() {
    return (
      this.options?.map(
        o =>
          html`<option .value=${o.value} ?disabled=${o.disabled} label=${ifDefined(o.label || undefined)}>
            ${o.label || o.textContent}
          </option>`
      ) || ''
    );
  }

  /** Generates the template for the input's datalist.  */
  protected dataListTemplate() {
    if (!this.options?.length) return '';
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
    const hasClearButton = this.withClear && !this.disabled && !this.readonly && !!this.value;
    const hasPasswordToggle = this.passwordToggle && !this.disabled && !this.readonly && this.type === 'password';

    return html`<div part="input-control" class="form-control-input">
      ${this.inputStartTemplate()} ${this.inputElementTemplate()} ${this.dataListTemplate()}
      ${hasClearButton
        ? this.html`<button
            type="button"
            class="form-control-clear"
            @click=${this.handleClearClick}
          >
            <span class="visually-hidden"><slot name="clear-label">Clear input</slot></span>
            <scoped-icon name="dismiss"></scoped-icon>
          </button>`
        : ''}
      ${hasPasswordToggle
        ? this.html`<button
            type="button"
            class="form-control-password-toggle"
            @click=${this.handlePasswordToggle}
            aria-pressed=${this.passwordVisible}
          >
            <span class="visually-hidden">
              <slot name=${this.passwordVisible ? 'hide-password-label' : 'show-password-label'}>
                ${this.passwordVisible ? 'Hide password' : 'Show password'}
              </slot>
            </span>
            <scoped-icon name=${this.passwordVisible ? 'eye-slash' : 'eye'}></scoped-icon>
          </button>`
        : ''}
      ${this.inputEndTemplate()}
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
        aria-hidden=${!this.hasLabel}
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
