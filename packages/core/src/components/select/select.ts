import { ifDefined } from 'lit/directives/if-defined.js';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { CharmElement, CharmFormControlElement } from '../../base/index.js';
import { endTemplate, startTemplate } from '../../templates/index.js';
import { CoreIcon } from '../icon/icon.js';
import styles from './select.styles.js';

type SelectChildElement = HTMLOptionElement | HTMLOptGroupElement;

/**
 * A select lets people choose one or more options from a list. Selects use browser native styling for the listed options and support form submission. Classified as a form control.
 *
 * @tag ch-select
 * @since 1.0.0
 * @status beta
 *
 * @slot - A hidden slot for the options provided to the control.
 * @slot label - A placeholder for the select's label.
 * @slot start - A slot for content to be placed at the start of the select.
 * @slot end - A slot for content to be placed at the end of the select.
 *
 * @event change - Custom event that indicates a new selection has been made through e.target.value.
 * @event input - Custom event that indicates a new selection has been made through e.target.value.
 *
 * @csspart select-label - The component's label.
 * @csspart select-base - The component's base wrapper.
 * @csspart select-control-wrapper - The component's select control wrapper.
 * @csspart select-control - The component's select control.
 * @csspart select-icon - The component's select icon.
 * @csspart start - Container for the start slot content.
 * @csspart end - Container for the end slot content.
 *
 * @cssprop --charm-select-icon-size - Determines the chevron size.
 * @cssprop --charm-select-option-bg-color - Determines the background color of the options.
 * @cssprop --charm-select-option-fg-color - Determines the foreground color of the options.
 *
 * @dependency CoreIcon
 **/
export class CoreSelect extends CharmFormControlElement {
  public static override styles = [...super.styles, styles];
  public static override baseName = 'select';

  /** This Boolean attribute indicates that multiple options can be selected in the list. **/
  @property({ type: Boolean, reflect: true })
  public multiple = false;

  /** This attribute represents the number of rows in the list that should be visible at one time **/
  @property({ type: Number, reflect: true })
  public size?: number;

  /** Permission the user agent has to provide automated assistance in filling out the select's value. */
  @property()
  public autocomplete?: string;

  @query('#input')
  protected override input?: HTMLInputElement | HTMLSelectElement | undefined;

  @state()
  protected options?: Array<HTMLOptionElement> = [];

  @state()
  protected optionNodes?: Array<SelectChildElement> = [];

  @state()
  protected selectedValues: string[] = [];

  protected hasUserSelection = false;
  protected pendingNativeValue?: string;

  protected optionsObserver?: MutationObserver;

  public static override get dependencies(): (typeof CharmElement)[] {
    return [CoreIcon];
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.optionsObserver = new MutationObserver(() => {
      if (this.isConnected) this.handleSlotChange();
    });
    this.optionsObserver.observe(this, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['disabled', 'hidden', 'label', 'selected', 'value'],
    });
  }

  public override disconnectedCallback() {
    this.optionsObserver?.disconnect();
    this.optionsObserver = undefined;
    super.disconnectedCallback();
  }

  /** Gets all the options for the select. */
  protected getOptions() {
    return Array.from(this.querySelectorAll<HTMLOptionElement>('option'));
  }

  /** Gets the direct option and optgroup children for the select. */
  protected getOptionNodes() {
    return Array.from(this.children).filter(
      (child): child is SelectChildElement => child instanceof HTMLOptionElement || child instanceof HTMLOptGroupElement
    );
  }

  /** Handles the change of the select. */
  protected handleChange(e: Event) {
    e.stopPropagation();
    this.syncSelectedValues(e.target as HTMLSelectElement);
    this.emitChange();
  }

  protected handleInput(e: Event) {
    e.stopPropagation();
    this.syncSelectedValues(e.target as HTMLSelectElement);
    this.emitInput();
  }

  protected syncSelectedValues(select: HTMLSelectElement) {
    this.hasUserSelection = true;
    this.selectedValues = Array.from(select.selectedOptions, option => option.value);
    this.setValueFromSelection(this.selectedValues[0] ?? '');
    this.updateValidity();
  }

  protected setValueFromSelection(value: string) {
    this.pendingNativeValue = value;
    this.value = value;
  }

  protected override getFormAssociatedValue(): string | File | FormData | null {
    if (!this.multiple) return super.getFormAssociatedValue();
    const formData = new FormData();
    if (!this.disabled && this.name) {
      this.selectedValues.forEach(value => {
        const option = this.options?.find(candidate => candidate.value === value);
        if (option && !option.disabled && !option.closest('optgroup')?.disabled) formData.append(this.name!, value);
      });
    }
    return formData;
  }

  /** Handles the change of the options in the default slot */
  protected handleSlotChange() {
    const previouslySelectedOptions =
      this.hasUserSelection && this.input instanceof HTMLSelectElement
        ? Array.from(this.input.selectedOptions, option => this.options?.[option.index]).filter(
            (option): option is HTMLOptionElement => !!option
          )
        : [];
    this.optionNodes = this.getOptionNodes();
    this.options = this.getOptions();
    if (this.multiple) {
      this.selectedValues = this.hasUserSelection
        ? previouslySelectedOptions.filter(option => this.options?.includes(option)).map(option => option.value)
        : this.options.filter(option => option.selected).map(option => option.value);
      if (!this.selectedValues.length && this.value) {
        const selected = this.options.find(option => option.value === this.value || option.textContent === this.value);
        if (selected) this.selectedValues = [selected.value];
      }
      this.setValueFromSelection(this.selectedValues[0] ?? '');
    } else if (this.value) {
      this.options.forEach(o => {
        if (o.value === this.value || o.textContent === this.value) {
          if (!o.hasAttribute('selected')) o.setAttribute('selected', '');
        } else {
          o.removeAttribute('selected');
        }
      });
      const selected = this.options.find(option => option.value === this.value || option.textContent === this.value);
      this.selectedValues = selected ? [selected.value] : [];
    } else {
      const lastSelectedValue = this.options.find(o => o.selected)?.value;
      this.setValueFromSelection(lastSelectedValue ?? this.options?.[0]?.value ?? this.options?.[0]?.textContent ?? '');
      this.selectedValues = this.value ? [this.value] : [];
    }
    this.updateValidity();
  }

  protected override updated(changedProperties: Map<string, unknown>) {
    super.updated(changedProperties);
    if (changedProperties.has('value')) {
      const isNativeSelection = this.pendingNativeValue === this.value;
      this.pendingNativeValue = undefined;
      if (!isNativeSelection) {
        const selected = this.value
          ? this.options?.find(option => option.value === this.value || option.textContent === this.value)
          : undefined;
        const nextSelection = selected ? [selected.value] : [];
        if (nextSelection.length !== this.selectedValues.length || nextSelection[0] !== this.selectedValues[0]) {
          this.selectedValues = nextSelection;
        }
      }
    }
    if (changedProperties.has('multiple') || changedProperties.has('value')) this.updateValidity();
  }

  protected override formResetCallback() {
    this.hasUserSelection = false;
    if (this.multiple) {
      this.selectedValues = this.options?.filter(option => option.defaultSelected).map(option => option.value) ?? [];
      this.setValueFromSelection(this.selectedValues[0] ?? '');
    } else {
      super.formResetCallback();
    }
    this.updateValidity();
  }

  protected override formStateRestoreCallback(state: string | File | FormData | null) {
    if (!this.multiple || !(state instanceof FormData)) {
      super.formStateRestoreCallback(state);
      return;
    }
    this.hasUserSelection = true;
    this.selectedValues = state.getAll(this.name ?? '').filter((value): value is string => typeof value === 'string');
    this.setValueFromSelection(this.selectedValues[0] ?? '');
    this.updateValidity();
  }

  /** Generates the template for the select component */
  protected selectTemplate() {
    return this.html` <div
      class=${classMap({
        'form-control': true,
        'form-control-has-error': this.invalid,
        'form-control-has-interaction': this.hadFocus,
        'form-control-has-help-text': this.hasHelpText,
        'form-control-has-label': this.hasLabel,
      })}
      part="select-base"
    >
      ${this.labelTemplate()} ${this.helpTextTemplate()} ${this.controlTemplate()} ${this.errorMessageTemplate()}
    </div>`;
  }

  /** Generates the template for the select label. The `for` attribute must match the id of the textarea control for appropriate accessibility */
  protected labelTemplate() {
    return this.html`
      <label
        aria-hidden=${!this.hasLabel}
        class=${classMap({
          'form-control-label': true,
          'visually-hidden': this.hideLabel,
        })}
        for="input"
        part="select-label"
      >
        ${this.labelContentTemplate()}
      </label>
    `;
  }

  /** Generates the template for the select control. Ensure that the id present matches the `for` attribute of the label  */
  protected controlTemplate() {
    return this.html`
      <div class="form-control-input" part="select-control-wrapper">
        ${this.startTemplate()}
        <select
          aria-describedby=${ifDefined(this.describedBy)}
          aria-errormessage=${ifDefined(this.invalid ? 'error-text' : undefined)}
          aria-invalid=${this.invalid}
          autocomplete=${ifDefined(this.autocomplete)}
          class="input-control form-control-base-input"
          id="input"
          name=${ifDefined(this.name)}
          part="select-control"
          size=${ifDefined(this.size)}
          ?autofocus=${this.autofocus}
          ?disabled=${this.disabled}
          ?multiple=${this.multiple}
          ?required=${this.required}
          @change=${this.handleChange}
          @input=${this.handleInput}
        >
          ${this.optionsTemplate()}
        </select>
        ${this.endTemplate()}
        <slot hidden @slotchange=${this.handleSlotChange}></slot>
      </div>
    `;
  }

  /** Generates the start slot template */
  protected startTemplate() {
    return startTemplate();
  }

  /** Generates the select options template */
  protected optionsTemplate() {
    return this.optionNodes?.map(node => this.renderOptionNode(node)) || '';
  }

  protected renderOptionNode(node: SelectChildElement) {
    if (node instanceof HTMLOptGroupElement) {
      return this.html`
        <optgroup label=${node.label} ?disabled=${node.disabled} ?hidden=${node.hidden}>
          ${Array.from(node.children)
            .filter((child): child is HTMLOptionElement => child instanceof HTMLOptionElement)
            .map(option => this.renderOption(option))}
        </optgroup>
      `;
    }

    return this.renderOption(node);
  }

  protected renderOption(option: HTMLOptionElement) {
    const selected = this.multiple
      ? this.selectedValues.includes(option.value)
      : option.value === this.value || option.textContent === this.value;
    return this
      .html`<option .value=${option.value} ?selected=${selected} ?disabled=${option.disabled} ?hidden=${option.hidden} label=${ifDefined(option.label || undefined)}>
      ${option.textContent ?? ''}
    </option>`;
  }

  /** Generates the end slot template */
  protected endTemplate() {
    return this.html`
      <div class="end-icons">
        <scoped-icon class="chevron" name="chevron-down" part="select-icon"></scoped-icon>
        ${endTemplate()}
      </div>
    `;
  }

  protected override render() {
    return this.selectTemplate();
  }
}

export default CoreSelect;
