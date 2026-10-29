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

  /** The selected light-DOM options, tracked by identity so duplicate values stay distinct. */
  @state()
  protected selectedOptions: HTMLOptionElement[] = [];

  protected hasUserSelection = false;
  protected pendingNativeValue?: string;

  protected optionsObserver?: MutationObserver;

  public static override get dependencies(): (typeof CharmElement)[] {
    return [CoreIcon];
  }

  /** The values of the selected options. */
  protected get selectedValues(): string[] {
    return this.selectedOptions.map(option => option.value);
  }

  public override connectedCallback() {
    super.connectedCallback();
    // The observer catches option additions/removals and attribute/text edits; read the current options once here.
    this.handleSlotChange();
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
    this.selectedOptions = this.toLightOptions(select.selectedOptions);
    this.setValueFromSelection(this.selectedValues[0] ?? '');
    this.updateValidity();
  }

  /** Maps rendered native options back to the light-DOM options they mirror. */
  protected toLightOptions(nativeOptions: Iterable<HTMLOptionElement>): HTMLOptionElement[] {
    return Array.from(nativeOptions, option => this.options?.[option.index]).filter(
      (option): option is HTMLOptionElement => !!option
    );
  }

  protected findOptionByValue(value: string) {
    return value ? this.options?.find(option => option.value === value || option.textContent === value) : undefined;
  }

  protected setValueFromSelection(value: string) {
    this.pendingNativeValue = value;
    this.value = value;
  }

  protected override getFormAssociatedValue(): string | File | FormData | null {
    if (!this.multiple) return super.getFormAssociatedValue();
    const formData = new FormData();
    if (!this.disabled && this.name) {
      this.selectedOptions.forEach(option => {
        if (!option.disabled && !option.closest('optgroup')?.disabled) formData.append(this.name!, option.value);
      });
    }
    return formData;
  }

  /** Handles the change of the options in the default slot */
  protected handleSlotChange() {
    this.optionNodes = this.getOptionNodes();
    this.options = this.getOptions();
    if (this.multiple) {
      const options = this.options;
      this.selectedOptions = this.hasUserSelection
        ? this.selectedOptions.filter(option => options.includes(option))
        : options.filter(option => option.selected);
      if (!this.selectedOptions.length) {
        const selected = this.findOptionByValue(this.value);
        if (selected) this.selectedOptions = [selected];
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
      const selected = this.findOptionByValue(this.value);
      this.selectedOptions = selected ? [selected] : [];
    } else {
      const lastSelectedValue = this.options.find(o => o.selected)?.value;
      this.setValueFromSelection(lastSelectedValue ?? this.options?.[0]?.value ?? this.options?.[0]?.textContent ?? '');
      const selected = this.findOptionByValue(this.value);
      this.selectedOptions = selected ? [selected] : [];
    }
    this.updateValidity();
  }

  protected override updated(changedProperties: Map<string, unknown>) {
    super.updated(changedProperties);
    if (changedProperties.has('value')) {
      const isNativeSelection = this.pendingNativeValue === this.value;
      this.pendingNativeValue = undefined;
      if (!isNativeSelection) {
        const selected = this.findOptionByValue(this.value);
        const nextSelection = selected ? [selected] : [];
        if (nextSelection.length !== this.selectedOptions.length || nextSelection[0] !== this.selectedOptions[0]) {
          this.selectedOptions = nextSelection;
        }
      }
    }
    if (['multiple', 'value', 'selectedOptions', 'optionNodes'].some(property => changedProperties.has(property))) {
      this.syncNativeSelection();
    }
    // `name` keys the multiple-select FormData payload, so rebuild it when the name changes.
    if (['multiple', 'value', 'name'].some(property => changedProperties.has(property))) this.updateValidity();
  }

  /**
   * Syncs native option selectedness from state. Once the user picks an option its selectedness is
   * dirty, so the rendered `selected` attributes (kept for reset semantics) no longer drive it.
   */
  protected syncNativeSelection() {
    if (!(this.input instanceof HTMLSelectElement) || !this.options) return;
    const options = this.options;
    if (this.multiple) {
      for (const option of this.input.options) option.selected = this.selectedOptions.includes(options[option.index]);
      return;
    }
    const index = options.findIndex(option => this.isOptionSelected(option));
    if (index !== -1 && this.input.selectedIndex !== index) this.input.selectedIndex = index;
  }

  protected isOptionSelected(option: HTMLOptionElement) {
    return this.multiple
      ? this.selectedOptions.includes(option)
      : option.value === this.value || option.textContent === this.value;
  }

  protected override formResetCallback() {
    this.hasUserSelection = false;
    if (this.multiple) {
      this.selectedOptions = this.options?.filter(option => option.defaultSelected) ?? [];
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
    const values = state.getAll(this.name ?? '');
    this.selectedOptions =
      this.options?.filter(option => {
        const index = values.indexOf(option.value);
        if (index === -1 || option.disabled) return false;
        values.splice(index, 1);
        return true;
      }) ?? [];
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
          aria-errormessage=${ifDefined(this.showInvalid ? 'error-text' : undefined)}
          aria-invalid=${this.showInvalid}
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
        <slot hidden></slot>
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
    return this
      .html`<option .value=${option.value} ?selected=${this.isOptionSelected(option)} ?disabled=${option.disabled} ?hidden=${option.hidden} label=${ifDefined(option.label || undefined)}>
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
