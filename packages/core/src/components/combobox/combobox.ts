import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { CharmElement, CharmFormControlElement } from '../../base/index.js';
import { announce } from '../../internal/announce.js';
import { keys } from '../../utilities/key-map.js';
import { CoreIcon } from '../icon/icon.js';
import { CoreOption } from '../option/option.js';
import { CoreOptionGroup } from '../option-group/option-group.js';
import { CorePopup, type PopupPlacement } from '../popup/popup.js';
import { CoreSpinner } from '../spinner/spinner.js';
import styles from './combobox.styles.js';
import { findEdgeEnabledIndex, findTypeaheadMatch, normalizeValues } from './combobox.utils.js';

/** The interaction that opens the combobox listbox. */
export type ComboboxMenuTrigger = 'focus' | 'input' | 'manual';

/** A custom filter function. Receives the source option and the current input value. */
export type ComboboxFilter = (option: CoreOption, inputValue: string) => boolean;

/** The autocomplete behavior used by the combobox. */
export type ComboboxMode = 'none' | 'inline' | 'list' | 'both' | 'select-only';

interface ComboboxOptionInfo {
  disabled: boolean;
  element: CoreOption;
  label: string;
  searchLabel: string;
  value: string;
}

/** State derived from the options and the input, recomputed only when one of its inputs changes. */
interface ComboboxDerivedState {
  filter?: ComboboxFilter;
  inlineCompletion?: ComboboxOptionInfo;
  inlineCompletionEnabled: boolean;
  inputValue: string;
  isFiltering: boolean;
  mode: ComboboxMode;
  multiple: boolean;
  optionInfos: ComboboxOptionInfo[];
  visibleIndexByElement: Map<CoreOption, number>;
  visibleOptions: ComboboxOptionInfo[];
}

const INLINE_COMPLETION_KEYS = [
  'activeIndex',
  'filter',
  'inputValue',
  'isFiltering',
  'mode',
  'multiple',
  'open',
  'optionInfos',
];

const OPTION_STATE_KEYS = new Set([
  'activeIndex',
  'filter',
  'inputValue',
  'isFiltering',
  'mode',
  'open',
  'optionInfos',
]);

/** Option attributes that change an option's value, label, or disabled state. Other attributes are managed by the combobox. */
const OPTION_ATTRIBUTES = new Set(['disabled', 'label', 'value']);

let comboboxId = 0;

let validationProbe: HTMLInputElement | undefined;

/**
 * A combobox combines a text input with a listbox, allowing people to filter and select from a collection of options.
 * Options are authored as `<ch-option>` elements, optionally grouped with `<ch-option-group>`.
 *
 * @tag ch-combobox
 * @since 0.6.0
 * @status beta
 *
 * @slot - The options and option groups provided to the combobox.
 * @slot label - The combobox label. Alternatively, use the `label` property.
 * @slot help-text - Help text that describes how to use the combobox. Alternatively, use the `help-text` property.
 * @slot start - Content placed before the text input, such as an icon.
 * @slot toggle-label - Accessible name for the listbox toggle button. Defaults to "Options".
 * @slot clear-label - Accessible text for the clear button. Defaults to "Clear".
 * @slot loading - Replaces the default spinner shown while `loading` is true.
 * @slot no-results - Content shown when no options match the current input value.
 *
 * @event input - Emitted when the value is being changed by the user.
 * @event change - Emitted when the user commits a new value.
 * @event combobox-show - Emitted when the listbox opens.
 * @event combobox-hide - Emitted when the listbox closes.
 *
 * @csspart combobox-base - The component's form-control wrapper.
 * @csspart combobox-label - The combobox label.
 * @csspart combobox-control - The control wrapping the input, tags, and icons.
 * @csspart combobox-input - The native text input.
 * @csspart combobox-start - Container for the start slot.
 * @csspart combobox-tags - Container for selected-value tags.
 * @csspart combobox-tag - A selected-value tag.
 * @csspart combobox-tag-label - The text within a tag.
 * @csspart combobox-tag-remove - The remove button within a tag.
 * @csspart combobox-clear - The clear button.
 * @csspart combobox-chevron - The chevron indicator.
 * @csspart combobox-popup - The popup element that positions the listbox.
 * @csspart combobox-listbox - The listbox containing options.
 * @csspart combobox-empty - The container shown when no options match.
 * @csspart combobox-loading - The container shown while loading.
 *
 * @cssprop --charm-combobox-tag-bg-color - The selected tag background color.
 * @cssprop --charm-combobox-tag-border-radius - The selected tag border radius.
 * @cssprop --charm-combobox-tag-fg-color - The selected tag foreground color.
 * @cssprop --charm-combobox-tag-font-size - The selected tag font size.
 * @cssprop --charm-combobox-tag-gap - The gap between tags and within a tag.
 * @cssprop --charm-combobox-tag-padding-x - The inline padding within a tag.
 * @cssprop --charm-combobox-tag-padding-y - The block padding within a tag.
 * @cssprop --charm-combobox-icon-size - The size of the chevron, clear, and tag icons.
 * @cssprop --charm-combobox-listbox-bg-color - The listbox background color.
 * @cssprop --charm-combobox-listbox-border-color - The listbox border color.
 * @cssprop --charm-combobox-listbox-border-radius - The listbox border radius.
 * @cssprop --charm-combobox-listbox-border-style - The listbox border style.
 * @cssprop --charm-combobox-listbox-border-width - The listbox border width.
 * @cssprop --charm-combobox-listbox-empty-color - The color of the empty and loading states.
 * @cssprop --charm-combobox-listbox-max-height - The maximum height of the listbox.
 * @cssprop --charm-combobox-listbox-padding - The padding within the listbox.
 * @cssprop --charm-combobox-listbox-shadow - The listbox shadow.
 *
 * @dependency CoreIcon
 * @dependency CoreOption
 * @dependency CoreOptionGroup
 * @dependency CorePopup
 * @dependency CoreSpinner
 */
export class CoreCombobox extends CharmFormControlElement {
  public static override styles = [...super.styles, styles];
  public static override baseName = 'combobox';
  public static override watchedSlots = ['help-text', 'label'];

  /** Controls browser autofill for the text input. */
  @property() public autocomplete = 'off';

  /** Allows the user to commit a value that does not match any option. Only applies to single selection. */
  @property({ attribute: 'allows-custom-value', type: Boolean, reflect: true })
  public allowsCustomValue = false;

  /** Keeps the listbox open when the collection is empty. */
  @property({ attribute: 'allows-empty-collection', type: Boolean, reflect: true })
  public allowsEmptyCollection = false;

  /** Highlights the first enabled option while filtering. */
  @property({ attribute: 'auto-highlight', type: Boolean, reflect: true })
  public autoHighlight = false;

  /** A custom filter function. Receives the source option and the current input value. */
  @property({ attribute: false })
  public filter?: ComboboxFilter;

  /** Controls whether typing shows a list, an inline completion, both, or neither. */
  @property({ reflect: true })
  public mode: ComboboxMode = 'both';

  /** Hints at the type of data that might be entered by the user. */
  @property() public inputmode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';

  /** Shows a spinner and allows the listbox to open while options are loading. */
  @property({ type: Boolean, reflect: true })
  public loading = false;

  /** The interaction that opens the listbox. */
  @property({ attribute: 'menu-trigger', reflect: true })
  public menuTrigger: ComboboxMenuTrigger = 'input';

  /** Allows more than one option to be selected. */
  @property({ type: Boolean, reflect: true })
  public multiple = false;

  /** Indicates whether the listbox is open. */
  @property({ type: Boolean, reflect: true })
  public open = false;

  /** The text input's placeholder. */
  @property({ reflect: true })
  public placeholder?: string;

  /** The preferred placement of the listbox. */
  @property({ reflect: true })
  public placement: PopupPlacement = 'bottom-start';

  /** Accessible label prefix for a tag's remove button. */
  @property({ attribute: 'remove-label' })
  public removeLabel = 'Remove';

  /** Wraps keyboard navigation from the last option to the first and vice versa. */
  @property({ attribute: 'should-focus-wrap', type: Boolean, reflect: true })
  public shouldFocusWrap = false;

  /** Adds a clear button when the combobox has a selection or input text. */
  @property({ attribute: 'with-clear', type: Boolean })
  public withClear = false;

  @state() protected activeIndex = -1;

  /** The tag that holds the roving tab stop, so Tab and arrow keys return to the same tag. */
  @state() protected activeTagIndex = 0;

  @state() protected inputValue = '';

  @state() protected isFiltering = false;

  @state() protected optionInfos: ComboboxOptionInfo[] = [];

  @query('.combobox-input') protected override input?: HTMLInputElement;

  protected _valueDelimiter = ',';

  protected initialValues: string[] = [];

  protected initialValuesPending = false;

  protected readonly instanceId = ++comboboxId;

  protected readonly controlId = `combobox-control-${this.instanceId}`;

  protected readonly inputId = `combobox-input-${this.instanceId}`;

  protected readonly labelId = `combobox-label-${this.instanceId}`;

  protected readonly listboxId = `combobox-listbox-${this.instanceId}`;

  protected mutationObserver?: MutationObserver;

  protected optionsUpdatePending = false;

  protected optionsCollected = false;

  protected optionInfoByElement = new Map<CoreOption, ComboboxOptionInfo>();

  protected optionsByValue = new Map<string, ComboboxOptionInfo>();

  protected selectedValues: string[] = [];

  protected selectedSetCache?: { set: Set<string>; values: string[] };

  protected typeaheadBuffer = '';

  protected typeaheadLastTime = 0;

  protected inlineCompletionEnabled = false;

  protected derivedCache?: ComboboxDerivedState;

  /** The option element currently marked `current`, so only the changed option is updated. */
  protected currentElement?: CoreOption;

  protected activeIndexFromPointer = false;

  protected lastAnnouncement = '';

  protected blurTimeout?: number;

  public constructor() {
    super();
    this.useFocusHandler = false;
    this.useBlurHandler = false;
  }

  public static override get dependencies(): (typeof CharmElement)[] {
    return [CoreIcon, CoreOption, CoreOptionGroup, CorePopup, CoreSpinner];
  }

  /** The delimiter used to parse and serialize `value` when multiple selection is enabled. */
  @property({ attribute: 'value-delimiter' })
  public get valueDelimiter(): string {
    return this._valueDelimiter;
  }

  /** The selected values as an array. */
  @property({ attribute: false })
  public get valueAsArray(): string[] {
    return this.selectedValues;
  }

  /** The selected value, or a delimiter-separated list when multiple selection is enabled. */
  public override get value(): string {
    return this.multiple ? this.selectedValues.join(this.valueDelimiter) : (this.selectedValues[0] ?? '');
  }

  /** Gets the current validity, where a required combobox must have at least one selected value. */
  public override get validity(): ValidityState {
    const valueMissing = this.required && !this.disabled && !this.readonly && this.selectedValues.length === 0;
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

  /** Gets the current validation message, if one exists. */
  public override get validationMessage(): string {
    return this.customErrorMessage || (this.validity.valid ? '' : this.getNativeErrorMessage());
  }

  /** The active option, if one is highlighted. */
  protected get activeOption(): ComboboxOptionInfo | undefined {
    return this.activeIndex >= 0 ? this.visibleOptions[this.activeIndex] : undefined;
  }

  /** The label shown in the input for single selection. */
  protected get displayLabel(): string {
    return this.multiple || !this.selectedValues.length ? '' : this.getLabelForValue(this.selectedValues[0]);
  }

  /** Selected values paired with their display labels. */
  protected get selectedTags(): Array<{ label: string; value: string }> {
    return this.selectedValues.map(value => ({ label: this.getLabelForValue(value), value }));
  }

  /** The selected values as a set, for constant-time membership checks. */
  protected get selectedSet(): Set<string> {
    const cached = this.selectedSetCache;
    if (cached?.values === this.selectedValues) return cached.set;

    const set = new Set(this.selectedValues);
    this.selectedSetCache = { set, values: this.selectedValues };
    return set;
  }

  /** Whether the current mode uses a filtered listbox autocomplete. */
  protected get hasListAutocomplete(): boolean {
    return this.mode === 'list' || this.mode === 'both';
  }

  /** Whether the combobox is using the non-editable select-only interaction. */
  protected get isSelectOnly(): boolean {
    return this.mode === 'select-only';
  }

  /** The option used to complete a typed prefix inline, when this mode supports it. */
  protected get inlineCompletionOption(): ComboboxOptionInfo | undefined {
    return this.derived.inlineCompletion;
  }

  /** The inline completion for the active list option, falling back to the first match. */
  protected get inlineCompletionDisplayOption(): ComboboxOptionInfo | undefined {
    if (this.mode === 'both' && this.open && this.isFiltering && this.activeIndex >= 0) {
      const activeOption = this.activeOption;
      return activeOption?.searchLabel.startsWith(this.inputValue.toLocaleLowerCase()) ? activeOption : undefined;
    }

    return this.inlineCompletionOption;
  }

  /** The text rendered in the input, including an uncommitted inline completion. */
  protected get renderedInputValue(): string {
    return this.inlineCompletionDisplayOption?.label ?? this.inputValue;
  }

  /** Options that match the current input value. */
  protected get visibleOptions(): ComboboxOptionInfo[] {
    return this.derived.visibleOptions;
  }

  /** The option that finishing an edit would commit: the active option while open, otherwise the inline completion. */
  protected get pendingSuggestion(): ComboboxOptionInfo | undefined {
    if (this.open && this.activeOption && !this.activeOption.disabled) return this.activeOption;
    return this.isSelectOnly ? undefined : this.inlineCompletionOption;
  }

  /**
   * The derived filtering state. It is recomputed only when the options, input text, or filter inputs change, so
   * event handlers and rendering share one result per change instead of rescanning the collection.
   */
  protected get derived(): ComboboxDerivedState {
    const cached = this.derivedCache;
    if (
      cached &&
      cached.optionInfos === this.optionInfos &&
      cached.inputValue === this.inputValue &&
      cached.isFiltering === this.isFiltering &&
      cached.mode === this.mode &&
      cached.multiple === this.multiple &&
      cached.filter === this.filter &&
      cached.inlineCompletionEnabled === this.inlineCompletionEnabled
    ) {
      return cached;
    }

    this.derivedCache = this.computeDerivedState();
    return this.derivedCache;
  }

  public set valueDelimiter(delimiter: string) {
    const next = delimiter || ',';
    if (next === this._valueDelimiter) return;
    const oldValue = this.value;
    this._valueDelimiter = next;
    this.requestUpdate('valueDelimiter');
    this.requestUpdate('value', oldValue);
  }

  public set valueAsArray(values: string[]) {
    this.setSelectedValues(values, true);
  }

  public override set value(value: string) {
    this.setSelectedValues(this.parseValue(value), true);
  }

  /** Opens the listbox. */
  public show() {
    if (this.open) return;
    if (this.isSelectOnly) {
      this.isFiltering = false;
      this.openMenu();
      if (this.open) this.setInitialActiveOption();
      return;
    }
    if (!this.isFiltering || !this.inputValue) {
      this.isFiltering = false;
      this.activeIndex = -1;
    }
    this.openMenu();
  }

  /** Closes the listbox and restores the input to the selected value. */
  public hide() {
    if (!this.open) return;
    this.open = false;
  }

  /** Toggles the listbox. */
  public toggle() {
    if (!this.open) {
      this.show();
      return;
    }

    if (this.isSelectOnly) this.hide();
    else this.finishEditing(false);
  }

  /** Clears the selection and the input value. */
  public clear() {
    if (this.disabled || this.readonly) return;
    if (!this.selectedValues.length && !this.inputValue) return;

    this.setSelectedValues([], false);
    this.isFiltering = false;
    this.activeIndex = -1;
    this.syncInputToSelection();
    this.input?.focus();
    this.emitInput();
    this.emitChange();
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.mutationObserver = new MutationObserver(this.handleMutations);
    this.mutationObserver.observe(this, {
      attributes: true,
      characterData: true,
      childList: true,
      subtree: true,
    });
    if (this.children.length) this.collectOptions();
    this.syncFormValue();
    this.setDismissListener(this.open);
  }

  public override disconnectedCallback() {
    this.clearPendingBlur();
    this.mutationObserver?.disconnect();
    this.mutationObserver = undefined;
    this.setDismissListener(false);
    super.disconnectedCallback();
  }

  /** Checks for validity but doesn't report a validation message when invalid. */
  public override checkValidity(): boolean {
    return this.validity.valid;
  }

  /** Checks for validity and shows the browser's validation message if the control is invalid. */
  public override reportValidity(): boolean {
    this.hadFocus = true;
    this.syncFormValue();
    this.applyValidity();
    if (this.isConnected) this.internals.reportValidity();
    return this.validity.valid;
  }

  public override setCustomValidity(message = '') {
    super.setCustomValidity(message);
    this.updateValidity();
  }

  protected override firstUpdated() {
    super.firstUpdated();
    this.updateValidity();
  }

  /** Derives state that the render depends on, so it is ready before the same render. */
  protected override willUpdate(changedProperties: Map<string | number | symbol, unknown>) {
    super.willUpdate(changedProperties);

    if (!this.optionsCollected) this.collectOptions();

    if (changedProperties.has('multiple') && !this.multiple && this.selectedValues.length > 1) {
      this.setSelectedValues(this.selectedValues.slice(0, 1), true);
    }

    if (changedProperties.has('mode')) {
      this.isFiltering = false;
      this.activeIndex = -1;
      this.typeaheadBuffer = '';
      this.inlineCompletionEnabled = false;
    }

    if (changedProperties.has('open') && !this.open) {
      this.isFiltering = false;
      this.activeIndex = -1;
      this.typeaheadBuffer = '';
      this.typeaheadLastTime = 0;
      this.syncInputToSelection();
    }

    if (
      !this.isFiltering &&
      (changedProperties.has('valueAsArray') ||
        changedProperties.has('multiple') ||
        changedProperties.has('mode') ||
        changedProperties.has('optionInfos'))
    ) {
      this.syncInputToSelection();
    }
  }

  protected override updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has('open')) {
      this.onOpenChange(this.open);
    }

    if (
      changedProperties.has('disabled') ||
      changedProperties.has('multiple') ||
      changedProperties.has('name') ||
      changedProperties.has('readonly') ||
      changedProperties.has('required')
    ) {
      this.updateValidity();
    }

    if ([...changedProperties.keys()].some(property => OPTION_STATE_KEYS.has(String(property)))) {
      this.syncOptionState();
    }

    if (INLINE_COMPLETION_KEYS.some(key => changedProperties.has(key))) {
      this.syncInlineCompletionSelection();
    }

    if (changedProperties.has('activeIndex') && !this.activeIndexFromPointer) {
      this.handleKeyboardActiveOption();
    }
    this.activeIndexFromPointer = false;

    this.announceResults();
  }

  protected override syncInitialFormValue() {
    this.defaultValue = this.getAttribute('value') ?? null;
    this.initialValue = this.defaultValue ?? this.value ?? '';
    this.initialValues = normalizeValues(
      this.defaultValue !== null ? this.parseValue(this.defaultValue) : this.selectedValues
    );
    this.initialValuesPending = this.defaultValue === null && this.initialValues.length === 0;
  }

  protected override restoreInitialFormValue() {
    this.valueAsArray = [...this.initialValues];
  }

  protected override formResetCallback() {
    super.formResetCallback();
    this.updateValidity();
  }

  protected override formStateRestoreCallback(state: string | File | FormData | null) {
    if (state instanceof FormData && this.name) {
      this.valueAsArray = state.getAll(this.name).map(value => String(value));
      return;
    }

    if (typeof state === 'string') {
      this.valueAsArray = this.parseValue(state);
    }
  }

  protected override updateValidity() {
    this.syncFormValue();
    if (this.validityUpdatePending) return;

    this.validityUpdatePending = true;
    this.updateComplete.then(() => {
      this.validityUpdatePending = false;
      if (!this.isConnected) return;
      this.applyValidity();
    });
  }

  /** Applies the current validity state to the element internals and rendered error message. */
  protected applyValidity() {
    const validity = this.validity;
    this._errorMessage = validity.valid ? '' : this.validationMessage;
    this.internals.setValidity(
      validity.valid ? {} : { customError: validity.customError, valueMissing: validity.valueMissing },
      this._errorMessage,
      this.input
    );
    this.invalid = this.disabled || this.readonly ? false : !validity.valid;
  }

  /** Re-collects options when their values, labels, disabled state, or content change in the light DOM. */
  protected handleMutations = (mutations: MutationRecord[]) => {
    if (!this.isConnected || this.optionsUpdatePending) return;

    const affectsOptions = mutations.some(mutation => {
      if (mutation.type === 'attributes') {
        if (mutation.target === this) return false;
        return OPTION_ATTRIBUTES.has(mutation.attributeName ?? '');
      }
      return true;
    });

    if (!affectsOptions) return;

    this.optionsUpdatePending = true;
    queueMicrotask(() => {
      this.optionsUpdatePending = false;
      if (this.isConnected) this.collectOptions();
    });
  };

  /** Collects options from the light DOM, including options inside option groups. */
  protected collectOptions() {
    const options: ComboboxOptionInfo[] = [];

    const createOption = (element: CoreOption, groupDisabled = false) => {
      const label = element.label ?? element.textLabel;
      const option: ComboboxOptionInfo = {
        disabled: groupDisabled || element.disabled,
        element,
        label,
        searchLabel: label.toLocaleLowerCase(),
        value: element.resolvedValue,
      };
      options.push(option);
    };

    Array.from(this.children).forEach(child => {
      if (child instanceof CoreOption) {
        createOption(child);
      } else if (child instanceof CoreOptionGroup) {
        Array.from(child.children).forEach(grandchild => {
          if (grandchild instanceof CoreOption) createOption(grandchild, child.disabled);
        });
      }
    });

    this.optionInfoByElement = new Map(options.map(option => [option.element, option]));

    this.optionsByValue = new Map();
    options.forEach(option => {
      if (!this.optionsByValue.has(option.value)) this.optionsByValue.set(option.value, option);
    });

    if (!this.selectedValues.length) {
      const preselected = options.filter(option => option.element.selected).map(option => option.value);
      if (preselected.length) {
        this.selectedValues = normalizeValues(this.multiple ? preselected : preselected.slice(0, 1));
        this.requestUpdate('valueAsArray');
        this.requestUpdate('value');
      }
    }

    if (this.initialValuesPending) {
      this.initialValues = [...this.selectedValues];
      this.initialValuesPending = false;
    }

    this.optionInfos = options;
    this.optionsCollected = true;

    if (this.activeIndex >= this.visibleOptions.length) {
      this.activeIndex = -1;
    }

    this.syncOptionSelectedAttributes();
    this.updateValidity();
  }

  /** Sets the internal selected values and synchronizes related state. */
  protected setSelectedValues(values: readonly string[], syncInput: boolean): boolean {
    const next = normalizeValues(values);
    if (
      next.length === this.selectedValues.length &&
      next.every((value, index) => value === this.selectedValues[index])
    ) {
      return false;
    }

    const oldValue = this.value;
    const oldValues = this.selectedValues;
    this.selectedValues = next;
    this.requestUpdate('valueAsArray', oldValues);
    this.requestUpdate('value', oldValue);
    this.syncOptionSelectedAttributes();
    this.updateValidity();

    if (syncInput) {
      this.syncInputToSelection();
    }

    return true;
  }

  /** Applies selection state to the source options, writing only the options whose state changed. */
  protected syncOptionSelectedAttributes() {
    const selected = this.selectedSet;
    this.optionInfos.forEach(option => {
      const isSelected = selected.has(option.value);
      if (option.element.selected !== isSelected) option.element.selected = isSelected;
    });
  }

  /**
   * Applies the listbox state to the slotted options. Filtering hides options, the active option is marked `current`,
   * and groups are hidden when none of their options are visible. Only changed options are written.
   */
  protected syncOptionState() {
    const { visibleIndexByElement } = this.derived;
    this.optionInfos.forEach(option => {
      const hidden = !visibleIndexByElement.has(option.element);
      if (option.element.hidden !== hidden) option.element.hidden = hidden;
    });

    const current = this.activeOption?.element;
    if (current !== this.currentElement) {
      if (this.currentElement) this.currentElement.current = false;
      if (current) current.current = true;
      this.currentElement = current;
    }

    Array.from(this.children).forEach(child => {
      if (!(child instanceof CoreOptionGroup)) return;
      const hidden = !Array.from(child.children).some(
        grandchild => grandchild instanceof CoreOption && !grandchild.hidden
      );
      if (child.hidden !== hidden) child.hidden = hidden;
    });
  }

  /** Synchronizes the visible input value with the current selection. */
  protected syncInputToSelection() {
    this.inlineCompletionEnabled = false;
    const display = this.displayLabel;
    if (this.inputValue !== display) {
      this.inputValue = display;
    }
    const input = this.input;
    if (!input) return;
    if (input.value !== display) input.value = display;
    if (input.matches(':focus')) input.setSelectionRange(display.length, display.length);
  }

  /** Selects the inline-completed suffix once the rendered value is in the input. */
  protected syncInlineCompletionSelection() {
    const input = this.input;
    const completion = this.inlineCompletionDisplayOption;
    if (!input || !completion || !input.matches(':focus')) return;

    input.setSelectionRange(this.inputValue.length, completion.label.length);
  }

  /** Scrolls the active option into view. */
  protected scrollActiveOptionIntoView() {
    this.activeOption?.element.scrollIntoView({ block: 'nearest' });
  }

  /**
   * Handles a change of the active option from the keyboard or typing. Without `aria-activedescendant` the option is
   * never focused, so the change is scrolled into view and announced.
   */
  protected handleKeyboardActiveOption() {
    const option = this.activeOption;
    if (!option) return;

    this.scrollActiveOptionIntoView();
    this.announceOption(option);
  }

  /** Announces an option with its position in the visible list. */
  protected announceOption(option: ComboboxOptionInfo) {
    const visibleOptions = this.visibleOptions;
    announce(option.element, `${option.label}, ${visibleOptions.indexOf(option) + 1} of ${visibleOptions.length}`);
  }

  /**
   * Announces the listbox status when it changes: loading, and the result count while filtering. Repeats are skipped,
   * so typing that leaves the result count unchanged stays quiet.
   */
  protected announceResults() {
    const announcement = this.resultsAnnouncement();
    if (announcement === this.lastAnnouncement) return;

    this.lastAnnouncement = announcement;
    if (announcement) announce(this, announcement);
  }

  /** The status message for the current listbox state, or an empty string when there is nothing to announce. */
  protected resultsAnnouncement(): string {
    if (!this.open) return '';
    if (this.loading) return 'Loading options';
    if (!this.isFiltering || !this.inputValue) return '';

    const count = this.visibleOptions.length;
    if (count === 0) return 'No results';
    return `${count} ${count === 1 ? 'result' : 'results'} available`;
  }

  /** Opens the listbox when the current state allows it. */
  protected openMenu() {
    if (this.disabled || this.readonly || this.open) return;
    if (
      !(this.allowsCustomValue && !this.isSelectOnly) &&
      !this.allowsEmptyCollection &&
      !this.loading &&
      this.visibleOptions.length === 0
    ) {
      return;
    }
    this.open = true;
  }

  /** Handles the open state transition after it has rendered. */
  protected onOpenChange(open: boolean) {
    this.setDismissListener(open);
    this.emit(open ? 'combobox-show' : 'combobox-hide');
  }

  protected handleInputFocus() {
    this.handleFocus();
    if (this.menuTrigger === 'focus') {
      this.show();
    }
  }

  protected handleInputBlur() {
    this.handleBlur();
    this.clearPendingBlur();
    this.blurTimeout = window.setTimeout(() => {
      this.blurTimeout = undefined;
      this.finishEditing();
    }, 0);
  }

  protected clearPendingBlur() {
    if (this.blurTimeout === undefined) return;
    window.clearTimeout(this.blurTimeout);
    this.blurTimeout = undefined;
  }

  /**
   * Commits any editable input text and closes the listbox. Committing never moves focus, so leaving the combobox
   * stays left.
   */
  protected finishEditing(commitAutocomplete = true) {
    this.clearPendingBlur();

    const suggestion = commitAutocomplete ? this.pendingSuggestion : undefined;
    if (suggestion) {
      // Blur commits a value but never deselects one, so a highlighted option that is already selected is left alone.
      if (!this.multiple || !this.selectedSet.has(suggestion.value)) this.selectOption(suggestion, false);
    } else if (!this.isSelectOnly && this.allowsCustomValue && this.isFiltering && this.inputValue.trim() !== '') {
      this.commitCustomValue(false);
    }

    this.endEditing();
  }

  /** Closes the listbox and restores the input to the selected value. */
  protected endEditing() {
    this.open = false;
    this.isFiltering = false;
    this.activeIndex = -1;
    this.syncInputToSelection();
  }

  protected handleInput(event: Event) {
    if (this.isSelectOnly) return;

    const input = event.target as HTMLInputElement;
    const value = input.value;
    this.isFiltering = true;
    this.inputValue = value;
    this.inlineCompletionEnabled =
      (this.mode === 'inline' || this.mode === 'both') &&
      input.selectionStart === value.length &&
      input.selectionEnd === value.length;

    if (this.mode !== 'inline' && !this.open && value && this.menuTrigger === 'input') {
      this.openMenu();
    }

    if (!this.multiple && value === '' && this.selectedValues.length) {
      const changed = this.setSelectedValues([], false);
      if (changed) this.emitChange();
    }

    const inlineCompletion = this.mode === 'both' ? this.inlineCompletionOption : undefined;
    if (inlineCompletion) {
      this.activeIndex = this.indexOfVisibleOption(inlineCompletion);
    } else if (this.autoHighlight && this.hasListAutocomplete) {
      this.activeIndex = this.visibleOptions.findIndex(option => !option.disabled);
    } else {
      this.activeIndex = -1;
    }

    this.emitInput();
  }

  protected handleKeyDown(event: KeyboardEvent) {
    if (this.disabled || this.readonly) return;

    const selectOnly = this.isSelectOnly;
    const altKey = event.altKey;
    const hasModifier = event.ctrlKey || event.metaKey || altKey;

    if (altKey && (event.key === keys.ArrowDown || event.key === keys.ArrowUp)) {
      event.preventDefault();
      if (selectOnly) {
        if (event.key === keys.ArrowDown) this.show();
        else if (this.open && this.activeOption) this.selectOption(this.activeOption);
        else this.hide();
        return;
      }
      if (!this.open) this.show();
      if (this.open) this.setActiveEdge(event.key === keys.ArrowDown ? 'first' : 'last');
      return;
    }

    if (!selectOnly && event.key === keys.Enter && !this.open) {
      const inlineSuggestion = this.inlineCompletionOption;
      if (inlineSuggestion) {
        event.preventDefault();
        this.selectOption(inlineSuggestion);
        return;
      }
      if (this.allowsCustomValue && this.isFiltering && this.inputValue.trim()) {
        event.preventDefault();
        this.commitCustomValue();
        return;
      }
    }

    switch (event.key) {
      case keys.ArrowDown:
        event.preventDefault();
        if (!this.open) {
          this.show();
          if (this.open) this.setInitialActiveOption();
        } else {
          this.moveActiveOption(1);
        }
        return;
      case keys.ArrowUp:
        event.preventDefault();
        if (!this.open) {
          this.show();
          if (this.open) this.setActiveEdge(selectOnly ? 'first' : 'last');
        } else {
          this.moveActiveOption(-1);
        }
        return;
      case keys.Home:
      case keys.End:
        // Editable Home and End keep moving the caret unless the listbox is open.
        if (!this.open && !selectOnly) return;
        event.preventDefault();
        if (!this.open) this.show();
        if (this.open) this.setActiveEdge(event.key === keys.Home ? 'first' : 'last');
        return;
      case keys.PageDown:
      case keys.PageUp:
        if (!this.open && !selectOnly) return;
        event.preventDefault();
        if (!this.open) this.show();
        else this.moveActiveOption(event.key === keys.PageDown ? 10 : -10);
        return;
      case keys.Enter:
        if (!selectOnly && !this.open) return;
        event.preventDefault();
        if (this.open) this.commitActiveOption();
        else this.show();
        return;
      case keys.Space:
        // Space types into the editable input, so only select-only uses it as a command.
        if (!selectOnly) break;
        event.preventDefault();
        if (this.open) this.commitActiveOption();
        else this.show();
        return;
      case keys.Escape:
        if (this.open) {
          event.preventDefault();
          this.hide();
        } else if (!selectOnly && this.isFiltering) {
          event.preventDefault();
          this.isFiltering = false;
          this.activeIndex = -1;
          this.syncInputToSelection();
        }
        return;
      case keys.Backspace:
        if (
          !selectOnly &&
          this.multiple &&
          this.selectedValues.length > 0 &&
          (this.input?.value ?? '') === '' &&
          !event.ctrlKey &&
          !event.metaKey &&
          !altKey
        ) {
          event.preventDefault();
          this.removeValue(this.selectedValues[this.selectedValues.length - 1]);
        }
        return;
      case keys.ArrowLeft:
        // At the start of the input, Left continues into the tags that sit before it.
        if (
          this.multiple &&
          this.selectedValues.length > 0 &&
          !this.open &&
          !hasModifier &&
          this.input?.selectionStart === 0 &&
          this.input.selectionEnd === 0
        ) {
          event.preventDefault();
          this.focusTag(this.selectedValues.length - 1);
        }
        return;
      default:
        break;
    }

    // Tab is not handled here: focus moves naturally and the blur handler commits the active option.
    if (selectOnly) {
      if (!hasModifier && event.key.length === 1 && !event.isComposing) {
        event.preventDefault();
        this.handleSelectOnlyTypeahead(event.key);
      }
      return;
    }

    if (
      !hasModifier &&
      event.key.length === 1 &&
      !this.isFiltering &&
      !this.multiple &&
      this.selectedValues.length > 0
    ) {
      const input = this.input;
      if (input && input.selectionStart === input.selectionEnd) {
        this.isFiltering = true;
        this.inputValue = '';
        input.value = '';
      }
    }
  }

  /** Finds a matching option for printable-key typeahead without changing the input value. */
  protected handleSelectOnlyTypeahead(character: string) {
    const options = this.optionInfos;
    if (!options.length) return;

    const now = Date.now();
    const timedOut = now - this.typeaheadLastTime > 700;
    const previousBuffer = timedOut ? '' : this.typeaheadBuffer;
    const normalizedCharacter = character.toLocaleLowerCase();
    const repeatedCharacter =
      previousBuffer.length > 0 && Array.from(previousBuffer).every(value => value === normalizedCharacter);
    let query = repeatedCharacter ? normalizedCharacter : `${previousBuffer}${normalizedCharacter}`;
    const startIndex =
      this.activeIndex < 0 ? 0 : (this.activeIndex + (previousBuffer && !repeatedCharacter ? 0 : 1)) % options.length;

    let matchIndex = findTypeaheadMatch(options, query, startIndex);
    if (matchIndex === -1 && query.length > 1) {
      query = normalizedCharacter;
      matchIndex = findTypeaheadMatch(options, query, startIndex);
    }
    if (matchIndex === -1) return;

    this.typeaheadBuffer = query;
    this.typeaheadLastTime = now;
    this.activeIndex = matchIndex;
    if (!this.open) this.openMenu();
  }

  /** Commits the active option or editable input text. */
  protected commitActiveOption() {
    const activeOption = this.activeOption;
    if (activeOption && !activeOption.disabled) {
      this.selectOption(activeOption);
      return;
    }

    if (!this.isSelectOnly && this.allowsCustomValue && this.inputValue.trim()) {
      this.commitCustomValue();
      return;
    }

    const enabledOptions = this.visibleOptions.filter(option => !option.disabled);
    if (enabledOptions.length === 1) {
      this.selectOption(enabledOptions[0]);
      return;
    }

    this.hide();
  }

  /** Commits the current input text as a custom value. */
  protected commitCustomValue(focusInput = true): boolean {
    this.clearPendingBlur();
    const inputValue = this.inputValue.trim();
    if (!this.allowsCustomValue || this.multiple || !inputValue) return false;

    const normalizedInput = inputValue.toLocaleLowerCase();
    const matchingOption =
      this.optionInfos.find(option => !option.disabled && option.searchLabel === normalizedInput) ??
      this.optionInfos.find(option => !option.disabled && option.value.toLocaleLowerCase() === normalizedInput);

    if (matchingOption) {
      this.selectOption(matchingOption, focusInput);
      return true;
    }

    const changed = this.setSelectedValues([inputValue], true);
    this.isFiltering = false;
    this.open = false;
    if (focusInput) this.input?.focus();
    this.emitValueChange(changed);
    return true;
  }

  /** Selects or deselects an option. */
  protected selectOption(option: ComboboxOptionInfo, focusInput = true) {
    if (option.disabled) return;
    this.clearPendingBlur();

    if (this.multiple) {
      const values = this.selectedSet.has(option.value)
        ? this.selectedValues.filter(value => value !== option.value)
        : [...this.selectedValues, option.value];
      const changed = this.setSelectedValues(values, true);
      this.isFiltering = false;
      this.syncInputToSelection();
      this.activeIndex = this.indexOfVisibleOption(option);
      if (focusInput) this.input?.focus();
      this.emitValueChange(changed);
      return;
    }

    const changed = this.setSelectedValues([option.value], true);
    this.isFiltering = false;
    this.open = false;
    if (focusInput) this.input?.focus();
    this.emitValueChange(changed);
  }

  /** Removes a value from a multiple selection. */
  protected removeValue(value: string, focusInput = true) {
    const label = this.getLabelForValue(value);
    const changed = this.setSelectedValues(
      this.selectedValues.filter(selected => selected !== value),
      true
    );
    this.isFiltering = false;
    this.syncInputToSelection();
    if (focusInput) this.input?.focus();
    this.emitValueChange(changed);
    if (changed) announce(this, `${label} removed`, { priority: 'high' });
  }

  /** Moves focus to a tag and makes it the roving tab stop. */
  protected focusTag(index: number) {
    this.activeTagIndex = index;
    this.tagElements()[index]?.focus();
  }

  /** The rendered tag elements, in selection order. */
  protected tagElements(): HTMLElement[] {
    return Array.from(this.renderRoot.querySelectorAll<HTMLElement>('.combobox-tag'));
  }

  /**
   * Moves between tags with the arrow, Home, and End keys. Right from the last tag returns to the input. Delete and
   * Backspace remove the focused tag and move focus to the tag that takes its place.
   */
  protected async handleTagsKeyDown(event: KeyboardEvent) {
    const tags = this.tagElements();
    const index = tags.indexOf(event.target as HTMLElement);
    if (index === -1) return;

    switch (event.key) {
      case keys.ArrowLeft:
        event.preventDefault();
        if (index > 0) this.focusTag(index - 1);
        return;
      case keys.ArrowRight:
        event.preventDefault();
        if (index < tags.length - 1) this.focusTag(index + 1);
        else this.input?.focus();
        return;
      case keys.Home:
        event.preventDefault();
        this.focusTag(0);
        return;
      case keys.End:
        event.preventDefault();
        this.focusTag(tags.length - 1);
        return;
      case keys.Delete:
      case keys.Backspace:
        event.preventDefault();
        if (this.disabled || this.readonly) return;
        this.removeValue(this.selectedValues[index], false);
        await this.updateComplete;
        if (this.selectedValues.length) this.focusTag(Math.min(index, this.selectedValues.length - 1));
        else this.input?.focus();
        return;
      default:
        return;
    }
  }

  /** Emits `input` and `change` when a committed selection actually changed. */
  protected emitValueChange(changed: boolean) {
    if (!changed) return;
    this.emitInput();
    this.emitChange();
  }

  /** Sets the active option to the first or last enabled option. */
  protected setActiveEdge(edge: 'first' | 'last') {
    this.activeIndex = findEdgeEnabledIndex(this.visibleOptions, edge);
  }

  /** Sets the active option to the selected option, or the first enabled option. */
  protected setInitialActiveOption() {
    const selected = this.selectedSet;
    const selectedIndex = this.visibleOptions.findIndex(option => !option.disabled && selected.has(option.value));
    if (selectedIndex !== -1) {
      this.activeIndex = selectedIndex;
      return;
    }
    this.setActiveEdge('first');
  }

  /** Moves the active option by a number of enabled options in the given direction. */
  protected moveActiveOption(delta: number) {
    const visibleOptions = this.visibleOptions;
    if (!visibleOptions.length) {
      this.activeIndex = -1;
      return;
    }

    const enabledCount = visibleOptions.reduce((count, option) => count + (option.disabled ? 0 : 1), 0);
    if (!enabledCount) {
      this.activeIndex = -1;
      return;
    }

    const direction = delta > 0 ? 1 : -1;
    let remaining = Math.min(Math.abs(delta), enabledCount);
    let index = this.activeIndex;
    let nextIndex = -1;

    while (remaining > 0) {
      index += direction;
      if (index < 0 || index >= visibleOptions.length) {
        if (!this.shouldFocusWrap) break;
        index = index < 0 ? visibleOptions.length - 1 : 0;
      }
      if (!visibleOptions[index].disabled) {
        nextIndex = index;
        remaining -= 1;
      }
    }

    if (nextIndex !== -1) {
      this.activeIndex = nextIndex;
    } else if (this.activeIndex === -1) {
      this.setActiveEdge(direction === 1 ? 'first' : 'last');
    }
  }

  protected handleControlMouseDown(event: MouseEvent) {
    event.preventDefault();
  }

  protected handleControlClick() {
    if (this.isSelectOnly && !this.disabled && !this.readonly) {
      this.toggle();
    }
    this.input?.focus();
  }

  protected handleToggleClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (this.disabled || this.readonly) return;

    const wasOpen = this.open;
    this.toggle();
    if (!wasOpen) this.input?.focus();
  }

  protected handleClearClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.clear();
  }

  protected handleTagClick(event: MouseEvent) {
    const target = event
      .composedPath()
      .find(
        (element): element is HTMLElement => element instanceof HTMLElement && element.hasAttribute('data-tag-value')
      );
    if (!target) return;
    event.preventDefault();
    event.stopPropagation();
    const value = target.dataset.tagValue;
    if (value !== undefined) this.removeValue(value);
  }

  protected handleListboxMouseDown(event: MouseEvent) {
    event.preventDefault();
  }

  protected handleListboxClick(event: MouseEvent) {
    const option = this.optionInfoFromEvent(event);
    if (!option) return;
    event.preventDefault();
    this.selectOption(option);
  }

  protected handleListboxMouseMove(event: MouseEvent) {
    const option = this.optionInfoFromEvent(event);
    if (!option) return;
    const index = this.indexOfVisibleOption(option);
    if (index === -1 || option.disabled || index === this.activeIndex) return;

    this.activeIndexFromPointer = true;
    this.activeIndex = index;
  }

  /** The option whose element the event passed through, if any. */
  protected optionInfoFromEvent(event: Event): ComboboxOptionInfo | undefined {
    const element = event.composedPath().find((node): node is CoreOption => node instanceof CoreOption);
    return element ? this.optionInfoByElement.get(element) : undefined;
  }

  /** The index of a visible option, or -1 when it is not visible. */
  protected indexOfVisibleOption(option: ComboboxOptionInfo): number {
    return this.derived.visibleIndexByElement.get(option.element) ?? -1;
  }

  /** Commits an outside pointer press. Listens only while the listbox is open. */
  protected handleDocumentPointerDown = (event: PointerEvent) => {
    if (!this.open) return;
    if (event.composedPath().includes(this)) return;
    this.finishEditing();
  };

  protected setDismissListener(active: boolean) {
    if (active) document.addEventListener('pointerdown', this.handleDocumentPointerDown);
    else document.removeEventListener('pointerdown', this.handleDocumentPointerDown);
  }

  protected handlePopupRequestClose(event: Event) {
    event.stopPropagation();
    this.hide();
  }

  protected parseValue(value: string): string[] {
    if (!value) return [];
    return normalizeValues(this.multiple ? value.split(this.valueDelimiter) : [value]);
  }

  /** The label for a selected value, falling back to the raw value for custom values. */
  protected getLabelForValue(value: string): string {
    return this.optionsByValue.get(value)?.label ?? value;
  }

  /** Computes the filtering state for the current options and input. */
  protected computeDerivedState(): ComboboxDerivedState {
    const { filter, inputValue, isFiltering, mode, multiple, optionInfos } = this;
    const filtering = isFiltering && inputValue !== '';
    const query = inputValue.toLocaleLowerCase();

    let visibleOptions = optionInfos;
    if ((mode === 'list' || mode === 'both') && filtering) {
      visibleOptions = filter
        ? optionInfos.filter(option => filter(option.element, inputValue))
        : optionInfos.filter(option => option.searchLabel.startsWith(query));
    }

    let inlineCompletion: ComboboxOptionInfo | undefined;
    if ((mode === 'inline' || mode === 'both') && this.inlineCompletionEnabled && !multiple && filtering) {
      // In `both` mode the visible options have already passed the filter, so only the prefix needs checking.
      const candidates = mode === 'both' ? visibleOptions : optionInfos;
      inlineCompletion = candidates.find(
        option =>
          !option.disabled &&
          option.searchLabel.startsWith(query) &&
          (mode === 'both' || !filter || filter(option.element, inputValue))
      );
    }

    return {
      filter,
      inlineCompletion,
      inlineCompletionEnabled: this.inlineCompletionEnabled,
      inputValue,
      isFiltering,
      mode,
      multiple,
      optionInfos,
      visibleIndexByElement: new Map(visibleOptions.map((option, index) => [option.element, index])),
      visibleOptions,
    };
  }

  protected getFormValue(): FormData | string | null {
    if (!this.name || this.disabled) return null;
    if (!this.multiple) return this.value || null;

    const formValue = new FormData();
    this.selectedValues.forEach(value => formValue.append(this.name!, value));
    return this.selectedValues.length ? formValue : null;
  }

  protected syncFormValue() {
    this.internals.setFormValue(this.getFormValue());
  }

  protected getNativeErrorMessage(): string {
    validationProbe ??= Object.assign(document.createElement('input'), { required: true, type: 'text' });
    validationProbe.value = this.selectedValues.length ? 'selected' : '';
    return validationProbe.validationMessage;
  }

  /** Generates the form-control label. */
  protected labelTemplate() {
    return this.html`
      <label
        aria-hidden=${!this.hasLabel}
        class=${classMap({
          'form-control-label': true,
          'visually-hidden': this.hideLabel,
        })}
        for=${this.inputId}
        id=${this.labelId}
        part="combobox-label"
      >
        ${this.labelContentTemplate()}
      </label>
    `;
  }

  /** Generates the start slot. */
  protected startTemplate() {
    return this.html`<span class="combobox-start" part="combobox-start"><slot name="start"></slot></span>`;
  }

  /** Generates tags for the selected values. */
  protected tagsTemplate() {
    if (!this.multiple || !this.selectedValues.length) return '';

    const tabStop = Math.min(this.activeTagIndex, this.selectedValues.length - 1);
    return this.html`
      <span
        aria-labelledby=${ifDefined(this.hasLabel ? this.labelId : undefined)}
        aria-orientation="horizontal"
        class="combobox-tags"
        part="combobox-tags"
        role="listbox"
        @keydown=${this.handleTagsKeyDown}
        @mousedown=${this.handleControlMouseDown}
      >
        ${this.selectedTags.map(
          (tag, index) => this.html`
            <span
              aria-label=${`${this.removeLabel} ${tag.label}`}
              aria-selected="true"
              class="combobox-tag"
              part="combobox-tag"
              role="option"
              tabindex=${index === tabStop ? 0 : -1}
            >
              <span class="combobox-tag-label" part="combobox-tag-label">${tag.label}</span>
              <button
                aria-label=${`${this.removeLabel} ${tag.label}`}
                class="combobox-tag-remove"
                data-tag-value=${tag.value}
                ?disabled=${this.disabled || this.readonly}
                part="combobox-tag-remove"
                tabindex="-1"
                type="button"
                @click=${this.handleTagClick}
              >
                <scoped-icon name="dismiss"></scoped-icon>
              </button>
            </span>
          `
        )}
      </span>
    `;
  }

  /** Generates the clear button. */
  protected clearTemplate() {
    if (!this.withClear || this.disabled || this.readonly) return '';
    if (!this.selectedValues.length && !this.inputValue) return '';

    return this.html`
      <button
        class="combobox-clear"
        part="combobox-clear"
        tabindex="-1"
        type="button"
        @mousedown=${this.handleControlMouseDown}
        @click=${this.handleClearClick}
      >
        <scoped-icon name="dismiss"></scoped-icon>
        <slot name="clear-label"><span class="visually-hidden">Clear</span></slot>
      </button>
    `;
  }

  /** Generates the control containing the input and actions. */
  protected controlTemplate() {
    return this.html`
      <div
        class="form-control-input combobox-control"
        id=${this.controlId}
        part="combobox-control"
        @click=${this.handleControlClick}
      >
        ${this.startTemplate()}
        <input
          aria-autocomplete=${ifDefined(this.isSelectOnly ? undefined : this.mode)}
          aria-controls=${this.listboxId}
          aria-describedby=${ifDefined(this.describedBy)}
          aria-errormessage=${ifDefined(this.invalid ? 'error-text' : undefined)}
          aria-expanded=${this.open}
          aria-haspopup="listbox"
          aria-invalid=${this.invalid}
          autocomplete=${this.autocomplete as any}
          class="form-control-base-input combobox-input"
          id=${this.inputId}
          inputmode=${ifDefined(this.isSelectOnly ? 'none' : this.inputmode)}
          part="combobox-input"
          placeholder=${ifDefined(this.placeholder)}
          role="combobox"
          type="text"
          .value=${live(this.renderedInputValue)}
          ?autofocus=${this.autofocus}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly || this.isSelectOnly}
          ?required=${this.required}
          @blur=${this.handleInputBlur}
          @focus=${this.handleInputFocus}
          @input=${this.handleInput}
          @keydown=${this.handleKeyDown}
        />
        ${this.tagsTemplate()} ${this.clearTemplate()}
        <button
          aria-controls=${this.listboxId}
          aria-expanded=${this.open}
          aria-haspopup="listbox"
          class="combobox-chevron"
          ?disabled=${this.disabled || this.readonly}
          part="combobox-chevron"
          tabindex="-1"
          type="button"
          @mousedown=${this.handleControlMouseDown}
          @click=${this.handleToggleClick}
        >
          <scoped-icon name="chevron-down"></scoped-icon>
          <span class="visually-hidden"><slot name="toggle-label">Options</slot></span>
        </button>
      </div>
    `;
  }

  /** Generates the listbox. Options are slotted into it and render themselves. */
  protected listboxTemplate() {
    return this.html`
      <div
        aria-labelledby=${ifDefined(this.hasLabel ? this.labelId : undefined)}
        aria-multiselectable=${ifDefined(this.multiple ? 'true' : undefined)}
        class="combobox-listbox"
        id=${this.listboxId}
        part="combobox-listbox"
        role="listbox"
        @click=${this.handleListboxClick}
        @mousedown=${this.handleListboxMouseDown}
        @mousemove=${this.handleListboxMouseMove}
      >
        ${
          this.open && this.loading
            ? this.html`<div class="combobox-loading" part="combobox-loading">
              <slot name="loading"><scoped-spinner></scoped-spinner></slot>
            </div>`
            : ''
        }
        <slot></slot>
        ${
          this.open && !this.loading && !this.visibleOptions.length
            ? this.html`<div class="combobox-empty" part="combobox-empty">
              <slot name="no-results"><span class="visually-hidden">No results</span></slot>
            </div>`
            : ''
        }
      </div>
    `;
  }

  /** Generates the anchored popup. */
  protected popupTemplate() {
    return this.html`
      <scoped-popup
        anchor=${this.controlId}
        auto-size="vertical"
        class="combobox-popup"
        content-role="presentation"
        distance="4"
        exportparts="popup-base:combobox-popup-base"
        flip
        part="combobox-popup"
        placement=${this.placement}
        shift
        shift-padding="4"
        sync="width"
        ?open=${this.open}
        @popup-request-close=${this.handlePopupRequestClose}
      >
        ${this.listboxTemplate()}
      </scoped-popup>
    `;
  }

  /** Generates the combobox template. */
  protected comboboxTemplate() {
    return this.html`
      <div
        class=${classMap({
          'form-control': true,
          'form-control-has-error': this.invalid,
          'form-control-has-help-text': this.hasHelpText,
          'form-control-has-interaction': this.hadFocus,
          'form-control-has-label': this.hasLabel,
        })}
        part="combobox-base"
      >
        ${this.labelTemplate()} ${this.helpTextTemplate()} ${this.controlTemplate()} ${this.errorMessageTemplate()}
      </div>
      ${this.popupTemplate()}
    `;
  }

  protected override render() {
    return this.comboboxTemplate();
  }
}

export default CoreCombobox;
