import { html } from 'lit/static-html.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { CharmElement, CharmFormControlElement } from '../../base/index.js';
import { HasSlotController } from '../../controller/index.js';
import { CoreIcon } from '../icon/icon.js';
import styles from './checkbox.styles.js';

/**
 * Checkboxes allow users to select multiple items from a list or toggle a single option on/off. They provide a visual indication of binary choices through checked and unchecked states.
 *
 * @tag ch-checkbox
 * @since 1.0.0
 * @status beta
 *
 * @slot - Used for the label.
 *
 * @event blur - Emitted when the control loses focus.
 * @event change - Emitted when the control's checked state changes.
 * @event focus - Emitted when the control gains focus.
 * @event input - Emitted when the value of the control changes.
 *
 * @csspart checkbox - HTML label element, whose purpose is to aid with styling.
 * @csspart checkbox-base - The checkbox's base wrapper.
 * @csspart checkbox-control - Checkbox visual representation as a span.
 * @csspart checkbox-label - The checkbox's label.
 * @csspart checkbox-visual-base - Part who parent's the rendered checkbox as a span and its label.
 *
 * @cssprop --charm-checkbox-active-border-color - Border color of checkbox when active.
 * @cssprop --charm-checkbox-active-fg-color - Font color of checkbox when active.
 * @cssprop --charm-checkbox-bg-color - The background color of the checkbox.
 * @cssprop --charm-checkbox-border-color - Border color of checkbox.
 * @cssprop --charm-checkbox-border-radius - The border radius of the checkbox.
 * @cssprop --charm-checkbox-checked-active-bg-color - Background color when checked and active.
 * @cssprop --charm-checkbox-checked-active-border-color - Border color of checkbox when checked and active.
 * @cssprop --charm-checkbox-checked-bg-color - The background color of the checkbox when checked.
 * @cssprop --charm-checkbox-checked-border-color - Border color of checkbox when checked.
 * @cssprop --charm-checkbox-checked-fg-color - Font color of checkbox when checked.
 * @cssprop --charm-checkbox-checked-hover-bg-color - Background color when checked and hovered over.
 * @cssprop --charm-checkbox-checked-hover-border-color - Border color of checkbox when checked and hovered over.
 * @cssprop --charm-checkbox-disabled-bg-color - Background color of checkbox when disabled.
 * @cssprop --charm-checkbox-disabled-border-color - Border color of checkbox when disabled.
 * @cssprop --charm-checkbox-disabled-fg-color - Font color of checkbox when disabled.
 * @cssprop --charm-checkbox-fg-color - Font color of checkbox.
 * @cssprop --charm-checkbox-hover-border-color - Border color of checkbox while being hovered over.
 * @cssprop --charm-checkbox-hover-fg-color - Font color of checkbox when being hovered over.
 * @cssprop --charm-checkbox-icon-size - The size of the checkbox's icon.
 * @cssprop --charm-checkbox-size - The size of the checkbox.
 *
 * @omit placeholder
 *
 * @dependency CoreIcon
 **/
export class CoreCheckbox extends CharmFormControlElement {
  public static override styles = [...super.styles, styles];
  public static override baseName = 'checkbox';

  /** Draws the checkbox in a checked state. */
  @property({ type: Boolean, reflect: true })
  public checked?: boolean;

  /** Draws the checkbox in an indeterminate state. */
  @property({ type: Boolean, reflect: true })
  public indeterminate?: boolean;

  @query('.input')
  protected override input?: HTMLInputElement;

  protected override readonly hasSlotController = new HasSlotController(this, '[default]', 'help-text');

  public static override get dependencies(): (typeof CharmElement)[] {
    return [CoreIcon];
  }

  /** @internal Click the checkbox. */
  public override click() {
    super.click();
    if (!this.disabled && !this.readonly) {
      this.input?.click();
    }
  }

  protected override firstUpdated(): void {
    super.firstUpdated();
    this.initialValue = this.checked ? this.value || 'on' : '';
  }

  protected override formResetCallback(): void {
    this.checked = this.initialValue === 'on';
  }

  protected override willUpdate(changedProperties: Map<string | number | symbol, unknown>) {
    super.willUpdate(changedProperties);
    if (changedProperties.has('checked')) {
      this.internals.setFormValue(this.checked ? this.value || 'on' : null);
      this.validate();
    }
    if (changedProperties.has('hasFocus')) {
      this.validate();
    }
  }

  protected validate() {
    if (this.hadFocus && this.required) {
      this.invalid = !this.checked;
      this.invalid
        ? this.setCustomValidity(this.errorMessage || this.internals.validationMessage)
        : this.setCustomValidity('');
    }
  }

  /** Handles the 'click' event on the checkbox. Toggles the checked state and emits the 'change' event. */
  protected handleClick() {
    if (this.disabled || this.readonly) return;
    this.checked = !this.checked;
    this.indeterminate = false;
    this.emitChange();
  }

  /** Generates the HTML template for the checkbox'S checked icon and indeterminate icon. */
  protected iconTemplate() {
    return html`<span class="control" part="checkbox-control">
      <${this.scope.tag('icon')}
        class="icon icon-checked"
        name="${this.indeterminate ? 'square' : 'checkmark'}"
      ></${this.scope.tag('icon')}> 
    </span>`;
  }

  /** Generates the HTML template for the checkbox. */
  protected checkboxTemplate() {
    return html`
      <div
        class=${classMap({
          'form-control': true,
          'form-control-has-error': this.invalid,
          'form-control-has-interaction': this.hadFocus,
          'form-control-has-label': !!(this.label || this.hasSlotController.hasDefaultSlot()),
        })}
        part="checkbox-base"
      >
        <label class="checkbox form-control-label" part="checkbox">
          <input
            aria-describedby=${ifDefined(this.describedBy)}
            aria-errormessage=${ifDefined(this.invalid ? 'error-text' : undefined)}
            aria-invalid=${this.invalid}
            class="input"
            id=${ifDefined(this.name)}
            name=${ifDefined(this.name)}
            type="checkbox"
            value=${ifDefined(this.value)}
            ?autofocus=${this.autofocus}
            ?checked=${this.checked}
            ?disabled=${this.disabled}
            ?readonly=${this.readonly}
            ?required=${this.required}
            .indeterminate=${live(this.indeterminate ?? false)}
            @click=${this.handleClick}
            @invalid=${(e: Event) => e.preventDefault()}
          />

          <span class="control-label-wrapper" part="checkbox-visual-base">
            ${this.iconTemplate()}

            <span
              class=${classMap({
                label: true,
                'form-control-group-item-label': true,
                'visually-hidden': this.hideLabel,
              })}
              part="checkbox-label"
            >
              ${this.labelContentTemplate(false)}
            </span>
          </span>
        </label>

        ${this.helpTextTemplate()} ${this.errorMessageTemplate()}
      </div>
    `;
  }

  protected override render() {
    return html`${this.checkboxTemplate()}`;
  }
}

export default CoreCheckbox;
