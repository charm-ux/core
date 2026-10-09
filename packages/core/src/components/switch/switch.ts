import { html } from 'lit/static-html.js';
import { property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { keys } from '../../utilities/key-map.js';
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
 * @cssprop --charm-switch-control-active-bg-color - The background color of the switch control when active.
 * @cssprop --charm-switch-control-active-border-color - The border color of the switch control when active.
 * @cssprop --charm-switch-control-bg-color - The background color of the switch control.
 * @cssprop --charm-switch-control-border-color - The border color of the switch control.
 * @cssprop --charm-switch-control-checked-active-bg-color - The background color of the switch control when checked and active.
 * @cssprop --charm-switch-control-checked-active-border-color - The border color of the switch control when checked and active.
 * @cssprop --charm-switch-control-checked-bg-color - The background color of the switch control when checked.
 * @cssprop --charm-switch-control-checked-border-color - The border color of the switch control when checked.
 * @cssprop --charm-switch-control-checked-hover-bg-color - The background color of the switch control when checked and hovered.
 * @cssprop --charm-switch-control-checked-hover-border-color - The border color of the switch control when checked and hovered.
 * @cssprop --charm-switch-control-hover-bg-color - The background color of the switch control when hovered.
 * @cssprop --charm-switch-control-hover-border-color - The border color of the switch control when hovered.
 * @cssprop --charm-switch-control-transition - The transition effect of the switch control.
 * @cssprop --charm-switch-height - The height of the switch.
 * @cssprop --charm-switch-thumb-active-bg-color - The background color of the switch thumb when active.
 * @cssprop --charm-switch-thumb-bg-color - The background color of the switch thumb.
 * @cssprop --charm-switch-thumb-checked-active-bg-color - The background color of the switch thumb when checked and active.
 * @cssprop --charm-switch-thumb-checked-bg-color - The background color of the switch thumb when checked.
 * @cssprop --charm-switch-thumb-checked-hover-bg-color - The background color of the switch thumb when checked and hovered.
 * @cssprop --charm-switch-thumb-hover-bg-color - The background color of the switch thumb when hovered.
 * @cssprop --charm-switch-thumb-size - The size of the thumb.
 * @cssprop --charm-switch-thumb-transform - The shift of the thumb along the x-axis.
 * @cssprop --charm-switch-thumb-transition - The transition effect of the switch thumb.
 * @cssprop --charm-switch-width - The width of the switch.
 *
 * @dependency CoreIcon
 */

export class CoreSwitch extends CharmFormControlElement {
  public static override styles = [...super.styles, styles];
  public static override baseName = 'switch';

  @query('input[type="checkbox"]') protected override input?: HTMLInputElement;

  @query('.switch') protected switchBase?: HTMLElement;

  @query('.switch-thumb') protected switchThumb?: HTMLElement;

  protected usesArrowKeys = true;
  protected _checked: boolean = false;

  protected animationTimer?: number;

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
    this.switchBase?.classList.toggle('switch-checked', val);
    this.requestUpdate('checked');
  }

  /** Simulates a click on the switch. */
  public override click() {
    this.input?.click();
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    // The base class syncs the form value from `value` on (re)connection, which
    // would clobber the checked-dependent form value. Re-apply it.
    this.internals.setFormValue(this.checked ? this.value || 'on' : null);
  }

  public override disconnectedCallback(): void {
    this.clearAnimation();
    this.switchThumb?.removeEventListener('transitionend', this.handleTransitionEnd);
    super.disconnectedCallback();
  }

  /** Gets the control's initial form value for reset behavior. */
  protected override getInitialFormValue(): string {
    return this.checked ? this.value || 'on' : '';
  }

  protected override firstUpdated(): void {
    super.firstUpdated();
    this.syncInitialFormValue();
    this.switchThumb?.addEventListener('transitionend', this.handleTransitionEnd);
  }

  protected override formResetCallback(): void {
    this.checked = this.initialValue === 'on';
  }

  protected override restoreInitialFormValue(): void {
    this.checked = this.initialValue === 'on';
  }

  protected override willUpdate(changedProperties: Map<string | number | symbol, unknown>): void {
    super.willUpdate(changedProperties);
    if (changedProperties.has('checked')) {
      this.updateValidity();
      // Set the form value after updateValidity() so the base class' form-value sync
      // (which uses `value`) doesn't clobber the checked-dependent value.
      this.internals.setFormValue(this.checked ? this.value || 'on' : null);
    }
  }

  /** Handles the click event on the switch. Toggles the checked state and emits a 'change' event. */
  protected handleClick(event: MouseEvent) {
    event.preventDefault();
    if (this.readonly || this.disabled) {
      return;
    }
    this.animateSwitch();
    this.checked = !this.checked;
    this.emit('change');
  }

  /** Handles the arrow left keydown event on the switch.*/
  protected handleArrowLeftKey(event: KeyboardEvent) {
    event.preventDefault();
    this.animateSwitch();
    this.checked = this.resolvedDir === 'rtl';
    this.emitInput();
    this.emitChange();
  }

  /** Handles the arrow right keydown event on the switch. */
  protected handleArrowRightKey(event: KeyboardEvent) {
    event.preventDefault();
    this.animateSwitch();
    this.checked = this.resolvedDir !== 'rtl';
    this.emitInput();
    this.emitChange();
  }

  /** Handles the keydown event on the switch. */
  protected handleKeyDown(event: KeyboardEvent) {
    if (this.readonly || this.disabled) return;
    if (event.key === keys.ArrowLeft) {
      this.handleArrowLeftKey(event);
    }
    if (event.key === keys.ArrowRight) {
      this.handleArrowRightKey(event);
    }
  }

  protected handleInvalid(event: Event) {
    event.preventDefault();
  }

  protected animateSwitch() {
    if (!this.switchBase || !this.switchThumb) return;
    this.clearAnimation();
    this.switchBase.classList.add('switch-animate');
    const style = getComputedStyle(this.switchThumb);
    const duration = this.parseTransitionTime(style.transitionDuration);
    const delay = this.parseTransitionTime(style.transitionDelay);
    this.animationTimer = window.setTimeout(() => this.clearAnimation(), duration + delay + 50);
  }

  protected handleTransitionEnd = (event: TransitionEvent) => {
    if (event.target === this.switchThumb && event.propertyName === 'transform') this.clearAnimation();
  };

  protected clearAnimation() {
    if (this.animationTimer !== undefined) {
      window.clearTimeout(this.animationTimer);
      this.animationTimer = undefined;
    }
    this.switchBase?.classList.remove('switch-animate');
  }

  protected parseTransitionTime(value: string): number {
    const times = value.split(',').map(time => {
      const trimmed = time.trim();
      const milliseconds = trimmed.endsWith('ms') ? Number.parseFloat(trimmed) : Number.parseFloat(trimmed) * 1000;
      return Number.isFinite(milliseconds) ? milliseconds : 0;
    });
    return Math.max(...times, 0);
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
        aria-describedby=${ifDefined(this.describedBy)}
        aria-errormessage=${ifDefined(this.invalid ? 'error-text' : undefined)}
        aria-invalid=${this.invalid}
        ?autofocus=${this.autofocus}
        ?disabled=${this.disabled}
        ?required=${this.required}
        @keydown=${this.handleKeyDown}
        @click=${this.handleClick}
        @invalid=${this.handleInvalid}
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

  /** Generates the template for the base. */
  protected baseTemplate() {
    return html`
      <label
        part="switch-base"
        class=${classMap({
          switch: true,
          'switch-checked': this.checked,
          'switch-disabled': this.disabled,
        })}
      >
        ${this.inputTemplate()} ${this.labelTemplate()}
        <span class="switch-control-wrapper">
          <span part="switch-control" class="switch-control">
            <span part="switch-thumb" class="switch-thumb"></span>
          </span>
          <slot
            name="checked-message"
            part="switch-checked-message"
            class="switch-checked-message"
            aria-hidden="true"
          ></slot>
          <slot
            name="unchecked-message"
            part="switch-unchecked-message"
            class="switch-unchecked-message"
            aria-hidden="true"
          ></slot>
        </span>
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
          'form-control-has-label': this.label || this.hasSlotController.hasNamedSlot('label'),
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
