import { property, state } from 'lit/decorators.js';
import { html } from 'lit/static-html.js';
import { classMap } from 'lit/directives/class-map.js';
import { CharmFormControlElement } from '../../base/index.js';
import { keys } from '../../utilities/key-map.js';
import styles from './radio.styles.js';

/**
 * Radio buttons enable users to select exactly one option from a mutually exclusive set of choices. Unlike checkboxes, which allow multiple selections, radio buttons enforce single-choice selection and are optimized for use within a Radio Group component for proper keyboard navigation and accessibility.
 *
 * @tag ch-radio
 * @since 1.0.0
 * @status beta
 *
 * @slot - The radio's label.
 *
 * @event ready - Emitted when the component has completed its initial render.
 * @event blur - Emitted when the control loses focus.
 * @event focus - Emitted when the control gains focus.
 * @event selected - Emitted when the radio is selected.
 *
 * @csspart radio-base - The component's internal wrapper.
 * @csspart radio-control - The radio control.
 * @csspart radio-checked-icon - The container the wraps the checked icon.
 * @csspart radio-label - The radio label.
 *
 * @cssprop --charm-radio-active-bg-color - The background color of the radio control when active.
 * @cssprop --charm-radio-checked-active-border-color - The border color of the checked radio control when active.
 * @cssprop --charm-radio-unchecked-active-border-color - The border color of the unchecked radio control when active.
 * @cssprop --charm-radio-bg-color - The background color of the radio control.
 * @cssprop --charm-radio-border-color - The border color of the radio control.
 * @cssprop --charm-radio-checked-bg-color - The color of the checked indicator inside the radio control.
 * @cssprop --charm-radio-checked-border-color - The border color of the radio control when the radio is checked.
 * @cssprop --charm-radio-control-size - The size of the radio button.
 * @cssprop --charm-radio-disabled-bg-color - The background color of the radio control when disabled.
 * @cssprop --charm-radio-disabled-border-color - The border color of the radio control when disabled.
 * @cssprop --charm-radio-hover-bg-color - The background color of the radio control when hovered.
 * @cssprop --charm-radio-checked-hover-border-color - The border color of the checked radio control when hovered.
 * @cssprop --charm-radio-unchecked-hover-border-color - The border color of the unchecked radio control when hovered.
 * @cssprop --charm-radio-indicator-size - The size of the checked indicator inside radio control.
 * @cssprop --charm-radio-label-active-color - The color of the radio label when active.
 * @cssprop --charm-radio-label-checked-color - The color of the radio label when the radio is checked.
 * @cssprop --charm-radio-label-checked-hover-color - The color of the radio label when the radio is checked and hovered.
 * @cssprop --charm-radio-label-disabled-color - The color of the radio label when disabled.
 * @cssprop --charm-radio-label-unchecked-hover-color - The color of the radio label when the radio is unchecked and hovered.
 */

export class CoreRadio extends CharmFormControlElement {
  public static override styles = [...super.styles, styles];
  public static override baseName = 'radio';
  public static override watchedSlots = ['[default]', 'label', 'help-text'];
  public static override shadowRootOptions = { ...super.shadowRootOptions, delegatesFocus: false };

  /** This toggles the selected status for the radio and is for use when a radio button is used outside of a radio group. When used within a radio group, this value be overridden by the radio group's value. */
  @property({ type: Boolean, reflect: true })
  public checked?: boolean;

  /** @internal Disables the radio while preserving its own `disabled` state. Set by the containing radio group when the group is disabled. */
  @state()
  public forceDisabled = false;

  /** @internal Makes the radio readonly while preserving its own `readonly` state. Set by the containing radio group when the group is readonly. */
  @state()
  public forceReadonly = false;

  protected initialChecked = false;

  /** Whether the radio is disabled directly, by its form, or by a containing group. */
  protected get effectivelyDisabled() {
    return !!(this.disabled || this.forceDisabled);
  }

  /** Whether the radio is readonly by itself or by a containing group. */
  protected get effectivelyReadonly() {
    return !!(this.readonly || this.forceReadonly);
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListeners();
    this.setInitialAttributes();
    if (this.checked && !this.isInRadioGroup()) this.uncheckNamedPeers();
  }

  public override disconnectedCallback() {
    this.removeEventListeners();
    super.disconnectedCallback();
  }

  public override checkValidity(): boolean {
    return this.internals.checkValidity();
  }

  public override reportValidity(): boolean {
    this.hadFocus = true;
    this.invalid = this.disabled || this.readonly ? false : !this.internals.validity.valid;
    return this.internals.reportValidity();
  }

  public override setCustomValidity(message = '') {
    this.hadFocus = true;
    this.customErrorMessage = message;
    this.updateValidity();
  }

  protected override getInitialFormValue(): string {
    return this.checked ? this.value || 'on' : '';
  }

  protected override syncInitialFormValue() {
    if (this.hasCapturedInitialValue) return;
    this.initialChecked = !!this.checked;
    super.syncInitialFormValue();
  }

  protected override restoreInitialFormValue() {
    this.checked = this.initialChecked;
  }

  protected override formStateRestoreCallback(state: string | File | FormData | null) {
    this.checked = state === 'checked' || (typeof state === 'string' && state === (this.value || 'on'));
  }

  protected override firstUpdated() {
    super.firstUpdated();
    this.updateValidity();
  }

  protected override updateValidity() {
    const customError = this.customErrorMessage !== '';
    this.internals.setValidity(customError ? { customError: true } : {}, this.customErrorMessage);
    if (this.hadFocus || this.hasFocus) this.updateErrorMessage();
    this.invalid = this.disabled || this.readonly ? false : !this.internals.validity.valid;
    this.syncFormValue();
  }

  /** Handles the change in the `disabled` and `forceDisabled` state. */
  protected handleDisabledChange() {
    const disabled = this.effectivelyDisabled;
    this.toggleAttribute('force-disabled', this.forceDisabled);
    this.internals.ariaDisabled = disabled ? 'true' : 'false';
    this.setAttribute('tabindex', disabled ? '-1' : this.isInRadioGroup() ? (this.checked ? '0' : '-1') : '0');
  }

  /** Handles the change in the `checked` property. */
  protected handleCheckedChanged() {
    this.internals.ariaChecked = String(!!this.checked);
    if (!this.isInRadioGroup()) this.setAttribute('tabindex', this.effectivelyDisabled ? '-1' : '0');
    if (this.checked) {
      if (!this.isInRadioGroup()) this.uncheckNamedPeers();
      this.emit('selected');
    }
  }

  protected override willUpdate(changedProperties: Map<string | number | symbol, unknown>) {
    super.willUpdate(changedProperties);
    if (changedProperties.has('disabled') || changedProperties.has('forceDisabled')) {
      this.handleDisabledChange();
    }
    if (changedProperties.has('checked')) {
      this.handleCheckedChanged();
    }
    if (changedProperties.has('checked') || changedProperties.has('value') || changedProperties.has('forceDisabled')) {
      this.syncFormValue();
    }
  }

  /** Handles the click event. */
  protected handleClick = () => {
    if (!this.effectivelyDisabled && !this.effectivelyReadonly) {
      this.checked = true;
      if (!this.isInRadioGroup()) this.uncheckNamedPeers();
    }
  };

  /** Handles the keydown event. */
  protected handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === keys.Space) {
      e.preventDefault();
      if (this.effectivelyDisabled || this.effectivelyReadonly) return;
      this.checked = true;
      if (!this.isInRadioGroup()) this.uncheckNamedPeers();
    }
  };

  /** Adds event listeners for the CoreRadio component. */
  protected addEventListeners() {
    this.addEventListener('keydown', this.handleKeyDown);
    this.addEventListener('click', this.handleClick);
  }

  protected removeEventListeners() {
    this.removeEventListener('keydown', this.handleKeyDown);
    this.removeEventListener('click', this.handleClick);
  }

  protected isInRadioGroup(): boolean {
    return this.parentElement?.localName === this.scope.tagName('radio-group').toLowerCase();
  }

  protected override getFormAssociatedValue(): string | null {
    return this.isInRadioGroup() || this.effectivelyDisabled || !this.checked ? null : this.value || 'on';
  }

  protected override getFormAssociatedState() {
    return this.checked ? 'checked' : 'unchecked';
  }

  protected uncheckNamedPeers() {
    if (!this.name) return;
    const root = this.getRootNode();
    if (!(root instanceof Document || root instanceof ShadowRoot)) return;
    const radios = root.querySelectorAll<CoreRadio>(this.scope.tagName('radio'));
    for (const radio of radios) {
      if (
        radio !== this &&
        !radio.isInRadioGroup() &&
        radio.name === this.name &&
        radio.internals.form === this.internals.form
      ) {
        radio.checked = false;
      }
    }
  }

  /** Sets the initial attributes for the CoreRadio component. */
  protected setInitialAttributes() {
    this.internals.role = 'radio';
    this.setAttribute(
      'tabindex',
      this.effectivelyDisabled ? '-1' : this.isInRadioGroup() ? (this.checked ? '0' : '-1') : '0'
    );
    this.internals.ariaDisabled = this.effectivelyDisabled ? 'true' : 'false';
    this.internals.ariaChecked = String(!!this.checked);
    if (this.forceDisabled) this.setAttribute('force-disabled', '');
  }

  /** Generates the HTML template for the radio's control. */
  protected radioControlTemplate() {
    return html`
      <span part="radio-control" class="radio-control form-control-input">
        <span class="radio-check" part="radio-checked-icon" ?hidden=${!this.checked}></span>
      </span>
    `;
  }

  /** Generates the HTML template for the radio's label. */
  protected radioLabelTemplate() {
    return html` <span
      part="radio-label"
      class=${classMap({
        'radio-label': true,
        'form-control-label': true,
        'visually-hidden': this.hideLabel ?? false,
      })}
    >
      ${this.label ? html`${this.label}` : html`<slot></slot>`}
    </span>`;
  }

  /** Generates the HTML template for the radio. */
  protected radioTemplate() {
    return html` <span
      part="radio-base"
      class=${classMap({
        radio: true,
        'form-control-group-item': true,
        'form-control-has-label': !!this.label || this.test('[default]'),
      })}
    >
      ${this.radioControlTemplate()} ${this.radioLabelTemplate()}
    </span>`;
  }

  protected override render() {
    return html` ${this.radioTemplate()} `;
  }
}

export default CoreRadio;
