import { html } from 'lit/static-html.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { CharmElement, CharmFormControlElement } from '../../base/index.js';
import { endTemplate, startTemplate } from '../../templates/index.js';
import { CoreIcon } from '../icon/icon.js';
import styles from './select.styles.js';

/**
 * A select lets people choose a single option from a list of at least four options. Selects use browser native styling for the listed options. They are ideal for data submission in forms and ease of use on mobile platforms. Classified as a form control.
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
 * @cssproperty --select-icon-size - Determines the chevron size.
 * @cssproperty --select-option-bg-color - Determines the background color of the options.
 * @cssproperty --select-option-fg-color - Determines the foreground color of the options.
 *
 * @dependency icon
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

  @query('#input')
  protected override input?: HTMLInputElement | HTMLSelectElement | undefined;

  @state()
  protected options?: Array<HTMLOptionElement> = [];

  public static override get dependencies(): (typeof CharmElement)[] {
    return [CoreIcon];
  }

  protected override firstUpdated(): void {
    super.firstUpdated();
    this.setInputPadding();
  }

  /** Gets all the options for the select. */
  protected getOptions() {
    return Array.from(this.querySelectorAll<HTMLOptionElement>('option'));
  }

  /** Handles the change of the select. */
  protected handleChange(e: Event) {
    this.value = (e.target as HTMLSelectElement).value;
    this.emitChange();
  }

  protected handleInput(e: Event) {
    e.stopImmediatePropagation();
    this.emitInput();
  }

  protected setInputPadding() {
    const startIconsWidth = this.shadowRoot?.querySelector('.start')?.clientWidth ?? 0;
    const endIconsWidth = this.shadowRoot?.querySelector('.end-icons')?.clientWidth ?? 0;
    if (this.input) {
      this.input.style.paddingInlineStart = `calc( var(--form-control-padding-x) + ${startIconsWidth}px`;
      this.input.style.paddingInlineEnd = `calc( var(--form-control-padding-x) + ${endIconsWidth}px`;
    }
  }

  /** Handles the change of the options in the default slot */
  protected handleSlotChange() {
    this.options = this.getOptions();
    if (this.value) {
      this.options.forEach(o => {
        if (o.value === this.value || o.textContent === this.value) {
          o.setAttribute('selected', '');
        } else {
          o.removeAttribute('selected');
        }
      });
    } else {
      const lastSelectedValue = this.options.find(o => o.selected)?.value;
      this.value = lastSelectedValue ?? this.options?.[0]?.value ?? this.options?.[0]?.textContent ?? '';
    }
  }

  /** Generates the template for the select component */
  protected selectTemplate() {
    return html` <div
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
    return html`
      <label
        aria-hidden=${this.label ? 'false' : 'true'}
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
    return html`
      <div class="form-control-input" part="select-control-wrapper">
        ${this.startTemplate()}
        <select
          aria-label=${ifDefined(this.label)}
          aria-describedby="help-text"
          aria-errormessage="error-text"
          aria-invalid=${this.invalid}
          class="input-control form-control-base-input"
          id="input"
          name=${ifDefined(this.name)}
          part="select-control"
          size=${ifDefined(this.size)}
          ?autofocus=${this.autofocus}
          ?disabled=${this.disabled}
          ?multiple=${this.multiple}
          ?required=${this.required}
          .value=${this.value as string}
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
    return (
      this.options?.map(
        o => html`<option .value=${o.value} ?selected=${o.selected} ?disabled=${o.disabled}>${o.textContent}</option>`
      ) || ''
    );
  }

  /** Generates the end slot template */
  protected endTemplate() {
    return html`
      <div class="end-icons">
        <${this.scope.tag('icon')} class="chevron" name="chevron-down" part="select-icon"></${this.scope.tag('icon')}>
        ${endTemplate()}
      </div>
    `;
  }

  protected override render() {
    return this.selectTemplate();
  }
}

export default CoreSelect;
