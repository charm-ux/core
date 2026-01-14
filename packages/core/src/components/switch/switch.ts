import { html } from 'lit/static-html.js';
import { property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { CharmElement, CharmFormControlElement } from '../../base/index.js';
import { CoreIcon } from '../icon/icon.js';
import styles from './switch.styles.js';

/**
 *
 * Switch mimics a physical switch that can be turned on or off.
 *
 * @tag ch-switch
 * @since 1.0.0
 * @status beta
 *
 * @slot label - The switch's label.
 * @slot checked-message - The message to display when the toggle is checked.
 * @slot unchecked-message - The message to display when the toggle is unchecked.
 *
 * @event ready - Emitted when the component has completed its initial render.
 * @event blur - Emitted when the control loses focus.
 * @event change - Emitted when the control's checked state changes.
 * @event focus - Emitted when the control gains focus.
 *
 * @csspart switch-base - The component's internal wrapper.
 * @csspart switch-checked-message - The message to display when the toggle is checked.
 * @csspart switch-control - The switch control.
 * @csspart switch-label - The switch label.
 * @csspart switch-thumb - The switch position indicator.
 * @csspart switch-unchecked-message - The message to display when the toggle is unchecked.
 *
 * @cssproperty --switch-control-active-bg-color - The background color of the switch control when active.
 * @cssproperty --switch-control-active-border-color - The border color of the switch control when active.
 * @cssproperty --switch-control-bg-color - The background color of the switch control.
 * @cssproperty --switch-control-border-color - The border color of the switch control.
 * @cssproperty --switch-control-checked-active-bg-color - The background color of the switch control when checked and active.
 * @cssproperty --switch-control-checked-active-border-color - The border color of the switch control when checked and active.
 * @cssproperty --switch-control-checked-bg-color - The background color of the switch control when checked.
 * @cssproperty --switch-control-checked-border-color - The border color of the switch control when checked.
 * @cssproperty --switch-control-checked-hover-bg-color - The background color of the switch control when checked and hovered.
 * @cssproperty --switch-control-checked-hover-border-color - The border color of the switch control when checked and hovered.
 * @cssproperty --switch-control-hover-bg-color - The background color of the switch control when hovered.
 * @cssproperty --switch-control-hover-border-color - The border color of the switch control when hovered.
 * @cssproperty --switch-control-transition - The transition effect of the switch control.
 * @cssproperty --switch-focused-outline - The outline style of the switch wrapper when the switch is focused.
 * @cssproperty --switch-height - The height of the switch.
 * @cssproperty --switch-thumb-active-bg-color - The background color of the switch thumb when active.
 * @cssproperty --switch-thumb-bg-color - The background color of the switch thumb.
 * @cssproperty --switch-thumb-checked-active-bg-color - The background color of the switch thumb when checked and active.
 * @cssproperty --switch-thumb-checked-bg-color - The background color of the switch thumb when checked.
 * @cssproperty --switch-thumb-checked-hover-bg-color - The background color of the switch thumb when checked and hovered.
 * @cssproperty --switch-thumb-hover-bg-color - The background color of the switch thumb when hovered.
 * @cssproperty --switch-thumb-size - The size of the thumb.
 * @cssproperty --switch-thumb-transform - The shift of the thumb along the x-axis.
 * @cssproperty --switch-thumb-transition - The transition effect of the switch thumb.
 * @cssproperty --switch-width - The width of the switch.
 *
 * @dependency icon
 */

export class CoreSwitch extends CharmFormControlElement {
  public static override styles = [...super.styles, styles];
  public static override baseName = 'switch';

  @query('input[type="checkbox"]') protected override input?: HTMLInputElement;

  protected usesArrowKeys = true;
  protected _checked: boolean = false;

  public static override get dependencies(): (typeof CharmElement)[] {
    return [CoreIcon];
  }

  /** Draws the switch in a checked state. */
  @property({ type: Boolean, reflect: true })
  public get checked(): boolean {
    return this._checked;
  }

  public set checked(val: boolean) {
    this._checked = val;
    this.updateValidity();
    this.requestUpdate('checked');
  }

  /** Simulates a click on the switch. */
  public override click() {
    this.input?.click();
  }

  protected override firstUpdated() {
    super.firstUpdated();
    this.updateValidity();
  }

  /** Handles the click event on the switch. Toggles the checked state and emits a 'change' event. */
  protected handleClick() {
    if (this.readonly || this.disabled) return;
    this.checked = !this.checked;
    this.emit('change');
  }

  /** Handles the arrow left keydown event on the switch.*/
  protected handleArrowLeftKey(event: KeyboardEvent) {
    event.preventDefault();
    this.checked = false;
    this.emit('change');
  }

  /** Handles the arrow right keydown event on the switch. */
  protected handleArrowRightKey(event: KeyboardEvent) {
    event.preventDefault();
    this.checked = true;
    this.emit('change');
  }

  /** Handles the keydown event on the switch. */
  protected handleKeyDown(event: KeyboardEvent) {
    if (this.readonly || this.disabled) return;
    if (event.key === 'ArrowLeft') {
      this.handleArrowLeftKey(event);
    }
    if (event.key === 'ArrowRight') {
      this.handleArrowRightKey(event);
    }
  }

  /** Generates the template for the input element. */
  protected inputTemplate() {
    return html`
      <input
        class="switch-input"
        type="checkbox"
        name=${ifDefined(this.name)}
        value=${ifDefined(this.value)}
        .checked=${live(this.checked ?? false)}
        role="switch"
        aria-invalid=${this.invalid && this.hadFocus}
        aria-checked=${this.checked ? 'true' : 'false'}
        ?autofocus=${this.autofocus}
        ?checked=${live(this.checked ?? false)}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly || this.disabled}
        ?required=${this.required}
        @keydown=${this.handleKeyDown}
        @click=${this.handleClick}
        @invalid=${(e: Event) => e.preventDefault()}
      />
    `;
  }

  /** Generates the template for the label. */
  protected labelTemplate() {
    return html`
      <span
        part="switch-label"
        class=${classMap({
          'form-control-label': true,
          'visually-hidden': this.hideLabel ?? false,
        })}
      >
        ${this.labelContentTemplate()} ${this.helpTextTemplate()}
      </span>
    `;
  }

  /**
   * Generates the template for the control.
   */
  protected controlTemplate() {
    return html`
      <span part="switch-control" class="switch-control">
        <span part="switch-thumb" class="switch-thumb"></span>
      </span>
    `;
  }

  /** Generates the template for the checked message. */
  protected checkedMessageTemplate() {
    return html`
      <span part="switch-checked-message" class="switch-checked-message" aria-hidden="true">
        <slot name="checked-message"></slot>
      </span>
    `;
  }

  /** Generates the template for the unchecked message. */
  protected unCheckedMessageTemplate() {
    return html`
      <span part="switch-unchecked-message" class="switch-unchecked-message" aria-hidden="true">
        <slot name="unchecked-message"></slot>
      </span>
    `;
  }

  /** Generates the template for the control wrapper.*/
  protected controlWrapperTemplate() {
    return html` <div class="switch-control-wrapper">
      ${this.controlTemplate()} ${this.checkedMessageTemplate()} ${this.unCheckedMessageTemplate()}
    </div>`;
  }

  /** Generates the template for the base. */
  protected baseTemplate() {
    return html`
      <label part="switch-base" class="switch switch-${this.dir}">
        ${this.inputTemplate()} ${this.labelTemplate()} ${this.controlWrapperTemplate()}
      </label>
    `;
  }

  /** Generates the template for the switch. */
  protected switchTemplate() {
    return html`
      <div
        part="form-control"
        class=${classMap({
          'form-control': true,
          'form-control-has-interaction': this.hadFocus,
          'form-control-has-label': this.label || !!this.querySelector('slot[name="label"]')?.hasChildNodes(),
          'form-control-has-help-text': this.hasHelpText,
        })}
      >
        ${this.baseTemplate()} ${this.errorMessageTemplate()}
      </div>
    `;
  }

  protected override render() {
    return this.switchTemplate();
  }
}

export default CoreSwitch;
