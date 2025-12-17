import { html } from 'lit/static-html.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { property, query } from 'lit/decorators.js';
import { CharmElement, CharmFormControlElement } from '../../base/index.js';
import { CoreIcon } from '../icon/icon.js';
import styles from './text-area.styles.js';

/**
 * A text field that allows multiple lines of text entry.
 *
 * @tag ch-text-area
 * @since 1.0.0
 * @status beta
 *
 * @event change - Emitted when an alteration to the control's value is committed by the user.
 * @event input - Emitted when the control receives input and its value changes.
 * @event focus - Emitted when the control gains focus.
 * @event blur - Emitted when the control loses focus.
 * @event keydown - Emitted when a key is pressed down while the control is focused.
 *
 * @csspart textarea-base - The component's base wrapper.
 * @csspart textarea-label - The textarea label.
 * @csspart textarea-control - The textarea control.
 * @csspart textarea-control-input - The textarea input.
 *
 * @cssproperty --textarea-control-input-line-height - The line-height of the textarea control input.
 * @cssproperty --textarea-control-input-min-height - The min-height of the textarea control input.
 * @cssproperty --textarea-control-input-min-width - The min-width of the textarea control input.
 *
 * @dependency icon
 **/
export class CoreTextArea extends CharmFormControlElement {
  public static override styles = [...super.styles, styles];

  public static override baseName = 'text-area';

  /** The number of rows to display by default. */
  @property({ reflect: true })
  public rows: number = 4;

  /** Controls how the textarea can be resized. */
  @property({ reflect: true })
  public resize?: 'none' | 'horizontal' | 'vertical' | 'both';

  /** Controls whether and how text input is automatically capitalized as it is entered/edited by the user. */
  @property({ reflect: true })
  public override autocapitalize: 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters' = 'none';

  /** This attribute specifies whether the browser can automatically fill in the control's value. */
  @property()
  public autocomplete?: 'off' | 'on';

  /** Used to customize the label or icon of the Enter key on virtual keyboards. */
  @property({ reflect: true })
  public enterkeyhint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';

  /** Hints at the type of data that might be entered by the user while editing the element or its contents. */
  @property()
  public inputmode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';

  /** The maximum length of input that will be considered valid. */
  @property({ reflect: true })
  public maxlength?: number;

  /** The minimum length of input that will be considered valid. */
  @property({ reflect: true })
  public minlength?: number;

  /** The textarea's placeholder text. */
  @property({ reflect: true })
  public placeholder?: string;

  @query('#input')
  protected override input?: HTMLTextAreaElement;

  public static override get dependencies(): (typeof CharmElement)[] {
    return [CoreIcon];
  }

  protected handleChange() {
    this.value = this.input!.value;
    this.emitChange();
  }

  protected handleInput = () => {
    this.value = this.input!.value;
    this.emitInput();
  };

  protected handleKeyDown = (event: KeyboardEvent) => {
    event.stopPropagation();
  };

  protected override render() {
    return this.textAreaTemplate();
  }

  /** Generates the template for the text area */
  protected textAreaTemplate() {
    return html`
      <div
        part="textarea-base"
        class=${classMap({
          'form-control': true,
          'form-control-has-error': this.invalid,
          'form-control-has-interaction': this.hadFocus,
          'form-control-has-help-text': this.hasHelpText,
          'form-control-has-label': this.hasLabel,
        })}
      >
        ${this.labelTemplate()} ${this.helpTextTemplate()} ${this.controlTemplate()} ${this.errorMessageTemplate()}
      </div>
    `;
  }

  /** Generates the template for the text area label. The `for` attribute must match the id of the textarea control for appropriate accessibility */
  protected labelTemplate() {
    return html`
      <label
        aria-hidden=${this.label ? 'false' : 'true'}
        part="textarea-label"
        class=${classMap({
          'form-control-label': true,
          'visually-hidden': this.hideLabel,
        })}
        for="input"
      >
        ${this.labelContentTemplate()}
      </label>
    `;
  }

  /** Generates the template for the text area control. Ensure that the id present matches the `for` attribute of the label  */
  protected controlTemplate() {
    return html`
      <div class="form-control-input" part="textarea-control">
        <textarea
          aria-describedby="help-text"
          aria-errormessage="error-text"
          aria-invalid=${this.invalid}
          autocapitalize=${ifDefined(this.autocapitalize)}
          autocomplete=${ifDefined(this.autocomplete)}
          class="form-control-base-input"
          enterkeyhint=${ifDefined(this.enterkeyhint)}
          id="input"
          inputmode=${ifDefined(this.inputmode)}
          maxlength=${ifDefined(this.maxlength)}
          minlength=${ifDefined(this.minlength)}
          name=${ifDefined(this.name)}
          part="textarea-control-input"
          placeholder=${ifDefined(this.placeholder)}
          rows=${ifDefined(this.rows)}
          spellcheck=${ifDefined(this.spellcheck)}
          ?autofocus=${this.autofocus}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          ?required=${this.required}
          .value=${live((this.value || '').toString())}
          @change=${this.handleChange}
          @input=${this.handleInput}
          @keydown=${this.handleKeyDown}
        ></textarea>
      </div>
    `;
  }
}

export default CoreTextArea;
