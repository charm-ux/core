import { property, state } from 'lit/decorators.js';
import { html } from 'lit/static-html.js';
import { classMap } from 'lit/directives/class-map.js';
import CharmElement from '../../base/charm-element/charm-element.js';
import formControlStyles from '../../base/form-control-element/form-control.styles.js';
import { HasSlotController } from '../../controller/slot.js';
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
 * @cssproperty --radio-active-bg-color - The background color of the radio control when active.
 * @cssproperty --radio-active-border-color-checked - The border color of the checked radio control when active.
 * @cssproperty --radio-active-border-color-unchecked - The border color of the unchecked radio control when active.
 * @cssproperty --radio-bg-color - The color of the icon inside radio control when the radio is checked.
 * @cssproperty --radio-border-color - The border color of the radio control.
 * @cssproperty --radio-checked-border-color - The border color of the radio control when the radio is checked.
 * @cssproperty --radio-control-size - The size of the radio button.
 * @cssproperty --radio-disabled-bg-color - The background color of the radio control when disabled.
 * @cssproperty --radio-disabled-border-color - The border color of the radio control when disabled.
 * @cssproperty --radio-hover-bg-color - The background color of the radio control when hovered.
 * @cssproperty --radio-hover-border-color-checked - The border color of the checked radio control when hovered.
 * @cssproperty --radio-hover-border-color-unchecked - The border color of the unchecked radio control when hovered.
 * @cssproperty --radio-indicator-size - The size of the checked indicator inside radio control.
 * @cssproperty --radio-label-active-fg-color - The color of the radio label when active.
 * @cssproperty --radio-label-checked-fg-color - The color of the radio label when the radio is checked.
 * @cssproperty --radio-label-checked-hover-fg-color - The color of the radio label when the radio is checked and hovered.
 * @cssproperty --radio-label-disabled-color - The color of the radio label when disabled.
 * @cssproperty --radio-label-unchecked-hover-fg-color - The color of the radio label when the radio is unchecked and hovered.
 */

export class CoreRadio extends CharmElement {
  public static override styles = [...super.styles, formControlStyles, styles];
  public static override baseName = 'radio';

  /** This toggles the selected status for the radio and is for use when a radio button is used outside of a radio group. When used within a radio group, this value be overridden by the radio group's value. */
  @property({ type: Boolean, reflect: true })
  public checked?: boolean;

  /** The radio's value attribute. */
  @property({ reflect: true })
  public value?: string;

  /** Disables the radio. */
  @property({ type: Boolean, reflect: true })
  public disabled?: boolean;

  /** Focus on the radio on page load. */
  @property({ type: Boolean, reflect: true })
  public override autofocus = false;

  /** The layout direction of the radio. */
  @property({ type: Boolean, reflect: true })
  public vertical?: boolean;

  /** The input's label. Alternatively, you can use the default slot. */
  @property({ reflect: true })
  public label?: string;

  /** Hides the input label. */
  @property({ type: Boolean, attribute: 'hide-label', reflect: true })
  public hideLabel?: boolean;

  /** Makes the input readonly. */
  @property({ type: Boolean, reflect: true })
  public readonly?: boolean;

  @state() protected hasFocus = false;
  protected readonly hasSlotController = new HasSlotController(this, '[default]');

  public override connectedCallback(): void {
    super.connectedCallback();
    this.addEventListeners();
    this.setInitialAttributes();
  }

  public override disconnectedCallback() {
    super.disconnectedCallback();
  }

  /** Handles the change in the `disabled` property. */
  protected handleDisabledChange() {
    this.setAttribute('aria-disabled', this.disabled ? 'true' : 'false');
    this.setAttribute('tabindex', this.disabled ? '-1' : '0');
    if (this.checked) this.checked = false;
  }

  /** Handles the change in the `checked` property. */
  protected handleCheckedChanged() {
    this.setAttribute('aria-checked', this.checked ? 'true' : 'false');
    if (this.checked) {
      this.emit('selected');
    }
  }

  protected override willUpdate(changedProperties: Map<string | number | symbol, unknown>) {
    if (changedProperties.has('disabled')) {
      this.handleDisabledChange();
    }
    if (changedProperties.has('checked')) {
      this.handleCheckedChanged();
    }
  }

  /** Handles the blur event. */
  protected handleBlur = () => {
    this.hasFocus = false;
    this.emit('blur');
  };

  /** Handles the focus event. */
  protected handleFocus = () => {
    this.hasFocus = true;
    this.emit('focus');
  };

  /** Handles the click event. */
  protected handleClick = () => {
    if (!this.disabled && !this.readonly) {
      this.checked = true;
    }
  };

  /** Handles the keydown event. */
  protected handleKeyDown = (e: KeyboardEvent) => {
    if (this.disabled || this.readonly) return;
    if (e.key === keys.Space) {
      this.checked = true;
    }
  };

  /** Adds event listeners for the CoreRadio component. */
  protected addEventListeners() {
    this.addEventListener('keydown', this.handleKeyDown);
    this.addEventListener('click', this.handleClick);
  }

  /** Sets the initial attributes for the CoreRadio component. */
  protected setInitialAttributes() {
    this.setAttribute('role', 'radio');
    this.setAttribute('tabindex', this.disabled ? '-1' : '0');
    this.setAttribute('aria-disabled', this.disabled ? 'true' : 'false');
    this.setAttribute('aria-checked', this.checked ? 'true' : 'false');
  }

  /** Generates the HTML template for the radio's control. */
  protected radioControlTemplate() {
    return html` <span part="radio-control" class="radio-control form-control-input">
      <span class="radio-check" part="radio-checked-icon" ?hidden=${!this.checked}></span>
    </span>`;
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
        'form-control-has-label': !!this.label || this.hasSlotController.test('[default]'),
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
