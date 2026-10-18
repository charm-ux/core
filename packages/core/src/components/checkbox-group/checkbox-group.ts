import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { CharmFormControlElement } from '../../base/index.js';
import { findNextEnabledIndex } from '../../utilities/helpers.js';
import { keys } from '../../utilities/key-map.js';
import CoreCheckbox from '../checkbox/checkbox.js';
import styles from './checkbox-group.styles.js';

let checkboxGroupId = 0;

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
 */
export class CoreCheckboxGroup extends CharmFormControlElement {
  public static override styles = [...super.styles, styles];
  public static override baseName = 'checkbox-group';
  public static override watchedSlots = ['help-text', 'label'];
  public static override shadowRootOptions = { ...super.shadowRootOptions, delegatesFocus: false };

  /** How the checkboxes are laid out in the group. */
  @property({ reflect: true })
  public layout?: 'horizontal' | 'vertical' | 'horizontal-stacked';

  /** Presents the choices as a single-tab-stop listbox with arrow-key navigation. */
  @property({ type: Boolean, reflect: true })
  public listbox = false;

  @state()
  protected listboxActiveIndex = -1;

  @query('.checkboxes')
  protected checkboxListbox?: HTMLElement;

  @query('slot:not([name])')
  protected defaultSlot?: HTMLSlotElement;

  protected _valueAsArray: string[] = [];
  protected _valueDelimiter = ',';
  protected pendingValue = '';
  protected valueAssignmentPending = false;
  protected checkboxes: CoreCheckbox[] = [];
  protected initialValueAsArray: string[] = [];
  protected listboxHostAttributes = new Map<string, string | null>();
  protected listboxAttributes = new WeakMap<CoreCheckbox, Map<string, string | null>>();
  protected listboxTypeahead = '';
  protected listboxTypeaheadTimer?: number;
  protected readonly listboxId = ++checkboxGroupId;

  public constructor() {
    super();
    this.useBlurHandler = false;
    this.useFocusHandler = false;
  }

  /** The checkbox group's selected values as an array. */
  @property({ attribute: false })
  public get valueAsArray(): string[] {
    return this._valueAsArray;
  }

  /** The delimiter used to parse and serialize `value`. Defaults to a comma. */
  @property({ attribute: 'value-delimiter' })
  public get valueDelimiter(): string {
    return this._valueDelimiter;
  }

  /** The selected values serialized using the configured delimiter. */
  public override get value(): string {
    return this.valueAsArray.join(this.valueDelimiter);
  }

  /** Gets the current validation message, if one exists. */
  public override get validationMessage() {
    return this.customErrorMessage || (this.validity.valid ? '' : this.getNativeErrorMessage());
  }

  /** Gets group validity, where a required group must have at least one selected checkbox. */
  public override get validity(): ValidityState {
    const valueMissing = this.required && this.valueAsArray.length === 0 && !this.disabled;
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

  public set valueDelimiter(delimiter: string) {
    const nextDelimiter = delimiter || ',';
    if (nextDelimiter === this._valueDelimiter) return;

    const oldDelimiter = this._valueDelimiter;
    const oldValue = this.value;
    this._valueDelimiter = nextDelimiter;
    this.requestUpdate('valueDelimiter', oldDelimiter);
    this.requestUpdate('value', oldValue);
  }

  public set valueAsArray(values: string[]) {
    const oldValue = this.value;
    const oldValueAsArray = [...this._valueAsArray];
    this.valueAssignmentPending = false;
    this._valueAsArray = this.normalizeValueAsArray(values);
    this.requestUpdate('valueAsArray', oldValueAsArray);
    this.requestUpdate('value', oldValue);
  }

  public override set value(value: string) {
    const oldValue = this.value;
    const oldValueAsArray = [...this._valueAsArray];
    this.pendingValue = value;
    this.valueAssignmentPending = true;
    this._valueAsArray = this.parseValueAsArray(value);
    this.requestUpdate('valueAsArray', oldValueAsArray);
    this.requestUpdate('value', oldValue);
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.internals.setFormValue(this.getFormValue());
    void this.syncCheckboxElements();
    this.addEventListener('focus', this.handleHostFocus);
    this.addEventListener('focus', this.handleListboxFocus);
    this.addEventListener('blur', this.handleHostBlur);
    this.addEventListener('keydown', this.handleListboxKeyDown);
    this.addEventListener('click', this.handleListboxClick);
  }

  public override disconnectedCallback() {
    if (this.listboxTypeaheadTimer !== undefined) {
      window.clearTimeout(this.listboxTypeaheadTimer);
      this.listboxTypeaheadTimer = undefined;
    }
    super.disconnectedCallback();
    this.removeEventListener('focus', this.handleHostFocus);
    this.removeEventListener('focus', this.handleListboxFocus);
    this.removeEventListener('blur', this.handleHostBlur);
    this.removeEventListener('keydown', this.handleListboxKeyDown);
    this.removeEventListener('click', this.handleListboxClick);
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
    this.initialValueAsArray = [...this.valueAsArray];
  }

  protected override restoreInitialFormValue() {
    this.valueAsArray = [...this.initialValueAsArray];
  }

  protected override formStateRestoreCallback(state: string | File | FormData | null) {
    if (state instanceof FormData && this.name) {
      this.valueAsArray = state.getAll(this.name).map(value => String(value));
      return;
    }

    if (typeof state === 'string') {
      try {
        const value: unknown = JSON.parse(state);
        if (Array.isArray(value) && value.every(item => typeof item === 'string')) {
          this.valueAsArray = value;
        }
      } catch {
        this.valueAsArray = this.parseValueAsArray(state);
      }
    }
  }

  protected getFormValue(): FormData | null {
    if (!this.name || this.disabled) return null;

    const formValue = new FormData();
    const enabledValues = this.getAllCheckboxes()
      .filter(checkbox => !checkbox.disabled && !checkbox.forceDisabled)
      .map(checkbox => this.getCheckboxValue(checkbox))
      .filter(value => this.valueAsArray.includes(value));

    enabledValues.forEach(value => formValue.append(this.name!, value));
    return enabledValues.length ? formValue : null;
  }

  protected parseValueAsArray(value: string): string[] {
    return this.normalizeValueAsArray(
      value
        ? value
            .split(this.valueDelimiter)
            .map(item => item.trim())
            .filter(Boolean)
        : []
    );
  }

  protected normalizeValueAsArray(values: string[]): string[] {
    return [...new Set(values.map(value => value.trim()).filter(Boolean))];
  }

  protected override willUpdate(changedProperties: Map<string | number | symbol, unknown>) {
    super.willUpdate(changedProperties);

    if (this.valueAssignmentPending) {
      this._valueAsArray = this.parseValueAsArray(this.pendingValue);
      this.valueAssignmentPending = false;
    }

    if (changedProperties.has('listbox')) this.syncListboxOptions();
    if (this.shouldSyncListboxHostAttributes(changedProperties)) {
      this.syncListboxHostAttributes();
    }

    if (changedProperties.has('valueAsArray') || changedProperties.has('listbox')) {
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
    input.checked = this.valueAsArray.length > 0;
    return input.validationMessage;
  }

  protected getAllCheckboxes(): CoreCheckbox[] {
    const elements = this.defaultSlot?.assignedElements({ flatten: true }) ?? [...this.children];
    return elements.filter((child): child is CoreCheckbox => child instanceof CoreCheckbox);
  }

  protected getCheckboxValue(checkbox: CoreCheckbox): string {
    return checkbox.value || 'on';
  }

  protected handleCheckboxChange(event: Event) {
    const checkbox = event.target as CoreCheckbox;
    if (!this.getAllCheckboxes().includes(checkbox)) return;

    event.stopPropagation();
    if (this.disabled || this.readonly || checkbox.disabled || checkbox.forceDisabled || checkbox.readonly) return;
    if (this.listbox) {
      this.checkboxes = this.getAllCheckboxes();
      this.setListboxActiveIndex(this.checkboxes.indexOf(checkbox));
      this.focus();
    }

    const checkboxValue = this.getCheckboxValue(checkbox);
    const nextValue = checkbox.checked
      ? [...this.valueAsArray, checkboxValue]
      : this.valueAsArray.filter(value => value !== checkboxValue);

    if (
      nextValue.length === this.valueAsArray.length &&
      nextValue.every((value, index) => value === this.valueAsArray[index])
    )
      return;

    this.valueAsArray = nextValue;
    this.emitInput();
    this.emitChange();
  }

  protected handleListboxKeyDown(event: KeyboardEvent) {
    if (!this.listbox || event.altKey || event.ctrlKey || event.metaKey) return;

    const checkboxes = this.checkboxes.length ? this.checkboxes : this.getAllCheckboxes();
    const horizontal = this.layout === 'horizontal' || this.layout === 'horizontal-stacked';
    let nextIndex = -1;

    switch (event.key) {
      case keys.ArrowDown:
        nextIndex = this.findNextListboxIndex(checkboxes, 1);
        break;
      case keys.ArrowUp:
        nextIndex = this.findNextListboxIndex(checkboxes, -1);
        break;
      case keys.ArrowRight:
        if (!horizontal) return;
        nextIndex = this.findNextListboxIndex(checkboxes, this.resolvedDir === 'rtl' ? -1 : 1);
        break;
      case keys.ArrowLeft:
        if (!horizontal) return;
        nextIndex = this.findNextListboxIndex(checkboxes, this.resolvedDir === 'rtl' ? 1 : -1);
        break;
      case keys.Home:
        nextIndex = checkboxes.findIndex(checkbox => this.isListboxOptionEnabled(checkbox));
        break;
      case keys.End:
        nextIndex = this.findLastEnabledListboxIndex(checkboxes);
        break;
      case keys.Space: {
        event.preventDefault();
        const activeCheckbox = checkboxes[this.listboxActiveIndex];
        if (activeCheckbox && this.isListboxOptionEnabled(activeCheckbox) && !this.readonly) {
          activeCheckbox.click();
        }
        return;
      }
      default:
        if (event.key.length === 1) {
          event.preventDefault();
          this.handleListboxTypeahead(event.key, checkboxes);
        }
        return;
    }

    event.preventDefault();
    if (nextIndex !== -1) this.setListboxActiveIndex(nextIndex);
  }

  protected handleListboxFocus() {
    if (!this.listbox) return;
    const checkboxes = this.checkboxes.length ? this.checkboxes : this.getAllCheckboxes();
    if (!this.isListboxOptionEnabled(checkboxes[this.listboxActiveIndex])) {
      this.setInitialListboxActiveOption(checkboxes);
      this.syncListboxOptions();
    }
  }

  protected handleListboxClick(event: MouseEvent) {
    if (!this.listbox) return;
    const checkbox = event.composedPath().find((target): target is CoreCheckbox => target instanceof CoreCheckbox);
    const index = checkbox ? this.checkboxes.indexOf(checkbox) : -1;
    if (index === -1 || !this.isListboxOptionEnabled(checkbox)) return;

    this.setListboxActiveIndex(index);
    this.checkboxListbox?.focus();
  }

  protected findNextListboxIndex(checkboxes: CoreCheckbox[], direction: 1 | -1): number {
    if (!checkboxes.length) return -1;
    if (this.listboxActiveIndex < 0) {
      return direction === 1
        ? checkboxes.findIndex(checkbox => this.isListboxOptionEnabled(checkbox))
        : this.findLastEnabledListboxIndex(checkboxes);
    }
    return findNextEnabledIndex(checkboxes, this.listboxActiveIndex, direction, checkbox =>
      this.isListboxOptionEnabled(checkbox)
    );
  }

  protected handleListboxTypeahead(character: string, checkboxes: CoreCheckbox[]) {
    if (this.listboxTypeaheadTimer !== undefined) window.clearTimeout(this.listboxTypeaheadTimer);
    const nextSearch = `${this.listboxTypeahead}${character}`.toLocaleLowerCase();
    let nextIndex = this.findNextListboxMatch(checkboxes, nextSearch);
    this.listboxTypeahead = nextIndex === -1 && this.listboxTypeahead ? character.toLocaleLowerCase() : nextSearch;
    if (nextIndex === -1 && this.listboxTypeahead !== nextSearch) {
      nextIndex = this.findNextListboxMatch(checkboxes, this.listboxTypeahead);
    }
    if (nextIndex !== -1) this.setListboxActiveIndex(nextIndex);
    this.listboxTypeaheadTimer = window.setTimeout(() => {
      this.listboxTypeahead = '';
      this.listboxTypeaheadTimer = undefined;
    }, 700);
  }

  protected findNextListboxMatch(checkboxes: CoreCheckbox[], prefix: string): number {
    const startIndex = this.listboxActiveIndex < 0 ? -1 : this.listboxActiveIndex;
    return findNextEnabledIndex(
      checkboxes,
      startIndex,
      1,
      checkbox =>
        this.isListboxOptionEnabled(checkbox) &&
        this.getListboxOptionLabel(checkbox).toLocaleLowerCase().startsWith(prefix)
    );
  }

  protected findLastEnabledListboxIndex(checkboxes: CoreCheckbox[]): number {
    for (let index = checkboxes.length - 1; index >= 0; index--) {
      if (this.isListboxOptionEnabled(checkboxes[index])) return index;
    }
    return -1;
  }

  protected isListboxOptionEnabled(checkbox?: CoreCheckbox): checkbox is CoreCheckbox {
    return !!checkbox && !this.disabled && !checkbox.disabled && !checkbox.forceDisabled;
  }

  protected getListboxOptionLabel(checkbox: CoreCheckbox): string {
    return checkbox.getAttribute('aria-label') || checkbox.label || checkbox.textContent?.trim() || '';
  }

  protected getActiveListboxOptionId(): string | undefined {
    return this.listbox && this.listboxActiveIndex >= 0 ? this.checkboxes[this.listboxActiveIndex]?.id : undefined;
  }

  protected getListboxLabel(): string {
    const slottedLabel = [...this.querySelectorAll('[slot="label"]')]
      .map(element => element.textContent?.trim())
      .filter(Boolean)
      .join(' ');
    return this.label || slottedLabel;
  }

  protected getListboxDescription(): string {
    const slottedHelpText = [...this.querySelectorAll('[slot="help-text"]')]
      .map(element => element.textContent?.trim())
      .filter(Boolean)
      .join(' ');
    const parts = [this.helpText || slottedHelpText, this.invalid ? this.errorMessage : ''].filter(Boolean);
    return parts.join(' ');
  }

  protected syncListboxHostAttributes() {
    const names = [
      'role',
      'aria-label',
      'aria-description',
      'aria-activedescendant',
      'aria-invalid',
      'aria-required',
      'aria-readonly',
      'aria-disabled',
      'aria-multiselectable',
      'tabindex',
    ];

    if (!this.listbox) {
      this.listboxHostAttributes.forEach((value, name) => {
        if (value === null) this.removeAttribute(name);
        else this.setAttribute(name, value);
      });
      this.listboxHostAttributes.clear();
      return;
    }

    if (!this.listboxHostAttributes.size) {
      names.forEach(name => this.listboxHostAttributes.set(name, this.getAttribute(name)));
    }

    this.setAttribute('role', 'listbox');
    this.setAttribute('aria-multiselectable', 'true');
    this.setAttribute('aria-required', String(this.required));
    this.setAttribute('aria-invalid', String(this.invalid));
    this.setAttribute('tabindex', this.disabled ? '-1' : '0');

    const label = this.getListboxLabel() || this.listboxHostAttributes.get('aria-label') || '';
    if (label) this.setAttribute('aria-label', label);
    else this.removeAttribute('aria-label');

    const description = this.getListboxDescription() || this.listboxHostAttributes.get('aria-description') || '';
    if (description) this.setAttribute('aria-description', description);
    else this.removeAttribute('aria-description');

    if (this.readonly) this.setAttribute('aria-readonly', 'true');
    else this.removeAttribute('aria-readonly');
    if (this.disabled) this.setAttribute('aria-disabled', 'true');
    else this.removeAttribute('aria-disabled');

    const activeOptionId = this.getActiveListboxOptionId();
    if (activeOptionId) this.setAttribute('aria-activedescendant', activeOptionId);
    else this.removeAttribute('aria-activedescendant');
  }

  protected shouldSyncListboxHostAttributes(changedProperties: Map<string | number | symbol, unknown>) {
    if (changedProperties.has('listbox')) return true;
    if (!this.listbox) return false;

    const listboxRelevantChanges = [
      'listboxActiveIndex',
      'required',
      'invalid',
      'readonly',
      'disabled',
      'label',
      'helpText',
      'customErrorMessage',
      'hasLabel',
      'hasHelpText',
    ];

    return listboxRelevantChanges.some(property => changedProperties.has(property));
  }

  protected setInitialListboxActiveOption(checkboxes: CoreCheckbox[]) {
    const enabledCheckboxes = checkboxes.filter(checkbox => this.isListboxOptionEnabled(checkbox));
    const selectedIndex = checkboxes.findIndex(checkbox => this.isListboxOptionEnabled(checkbox) && checkbox.checked);
    this.listboxActiveIndex =
      selectedIndex >= 0 ? selectedIndex : enabledCheckboxes.length ? checkboxes.indexOf(enabledCheckboxes[0]) : -1;
  }

  protected setListboxActiveIndex(index: number) {
    if (!this.isListboxOptionEnabled(this.checkboxes[index])) return;
    this.listboxActiveIndex = index;
    this.syncListboxOptions();
  }

  protected syncListboxOptions() {
    const nextCheckboxes = this.getAllCheckboxes();
    this.checkboxes
      .filter(checkbox => !nextCheckboxes.includes(checkbox))
      .forEach(checkbox => {
        this.restoreListboxOption(checkbox);
      });
    this.checkboxes = nextCheckboxes;

    if (!this.listbox) {
      this.checkboxes.forEach(checkbox => this.restoreListboxOption(checkbox));
      this.listboxActiveIndex = -1;
      return;
    }

    if (!this.isListboxOptionEnabled(this.checkboxes[this.listboxActiveIndex])) {
      this.setInitialListboxActiveOption(this.checkboxes);
    }

    this.checkboxes.forEach((checkbox, index) => {
      this.rememberListboxAttributes(checkbox);
      checkbox.listboxOption = true;
      if (!checkbox.id) checkbox.id = `checkbox-group-${this.listboxId}-option-${index}`;
      checkbox.setAttribute('role', 'option');
      checkbox.setAttribute('aria-selected', String(checkbox.checked));
      if (checkbox.disabled || checkbox.forceDisabled) checkbox.setAttribute('aria-disabled', 'true');
      else checkbox.removeAttribute('aria-disabled');
      const previousLabel = this.listboxAttributes.get(checkbox)?.get('aria-label');
      const optionLabel = previousLabel || checkbox.label || checkbox.textContent?.trim();
      if (optionLabel) checkbox.setAttribute('aria-label', optionLabel);
      checkbox.toggleAttribute('data-listbox-active', index === this.listboxActiveIndex);
    });

    this.syncListboxHostAttributes();
  }

  protected rememberListboxAttributes(checkbox: CoreCheckbox) {
    if (this.listboxAttributes.has(checkbox)) return;
    const names = ['role', 'aria-selected', 'aria-disabled', 'aria-label', 'tabindex', 'id', 'data-listbox-active'];
    this.listboxAttributes.set(checkbox, new Map(names.map(name => [name, checkbox.getAttribute(name)])));
  }

  protected restoreListboxOption(checkbox: CoreCheckbox) {
    const attributes = this.listboxAttributes.get(checkbox);
    if (!attributes) return;
    checkbox.listboxOption = false;
    attributes.forEach((value, name) => {
      if (value === null) checkbox.removeAttribute(name);
      else checkbox.setAttribute(name, value);
    });
    this.listboxAttributes.delete(checkbox);
  }

  protected handleSlotChange() {
    const nextCheckboxes = this.getAllCheckboxes();
    this.checkboxes
      .filter(checkbox => !nextCheckboxes.includes(checkbox))
      .forEach(checkbox => {
        this.restoreListboxOption(checkbox);
      });
    this.checkboxes = nextCheckboxes;
    void this.syncCheckboxElements().then(() => this.internals.setFormValue(this.getFormValue()));
  }

  protected handleFocusElement() {
    this.hasFocus = true;
  }

  protected handleBlurElement(event: FocusEvent) {
    const relatedTarget = event.relatedTarget;
    if (relatedTarget instanceof Node && this.contains(relatedTarget)) return;

    this.hasFocus = false;
    this.hadFocus = true;
    this.reportValidity();
  }

  protected handleHostFocus = () => {
    if (!this.listbox) this.focusOnFirstFocusableElement();
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
      checkbox.listboxOption = this.listbox;
      checkbox.checked = this.valueAsArray.includes(this.getCheckboxValue(checkbox));
    });
    await Promise.all(checkboxes.map(checkbox => checkbox.updateComplete));
    this.syncListboxOptions();
  }

  /** Focuses the first enabled checkbox. */
  protected focusOnFirstFocusableElement() {
    const checkboxes = this.checkboxes.length ? this.checkboxes : this.getAllCheckboxes();
    if (this.listbox) {
      this.setInitialListboxActiveOption(checkboxes);
      this.syncListboxOptions();
      this.checkboxListbox?.focus();
      return;
    }
    checkboxes.find(checkbox => !checkbox.disabled && !checkbox.forceDisabled)?.focus();
  }

  /** Generates the HTML template for the label. */
  protected checkboxGroupLabelTemplate() {
    return this.html`
      <legend
        part="checkbox-group-label"
        id="checkbox-group-label"
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
    return this.html`<div
      part="checkbox-group-checkboxes"
      class="checkboxes"
    >
      <slot
        @slotchange=${this.handleSlotChange}
        @change=${this.handleCheckboxChange}
        @focusin=${this.handleFocusElement}
        @focusout=${this.handleBlurElement}
        role=${ifDefined(this.listbox ? undefined : 'presentation')}
      ></slot>
    </div>`;
  }

  /** Generates the HTML template for the checkbox group. */
  protected checkboxGroupTemplate() {
    return this.html`<fieldset
      part="checkbox-group-base"
      aria-describedby=${ifDefined(!this.listbox ? this.describedBy : undefined)}
      aria-errormessage=${ifDefined(!this.listbox && this.invalid ? 'error-text' : undefined)}
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
