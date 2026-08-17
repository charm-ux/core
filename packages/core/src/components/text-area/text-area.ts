import { html } from 'lit/static-html.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { live } from 'lit/directives/live.js';
import { property, query } from 'lit/decorators.js';
import { CharmElement, CharmFormControlElement } from '../../base/index.js';
import { CoreIcon } from '../icon/icon.js';
import styles from './text-area.styles.js';
import type { PropertyValues } from 'lit';

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
 * @cssprop --charm-text-area-input-line-height - The line-height of the textarea control input.
 * @cssprop --charm-text-area-input-min-height - The min-height of the textarea control input.
 * @cssprop --charm-text-area-input-min-width - The min-width of the textarea control input.
 *
 * @dependency CoreIcon
 **/
export class CoreTextArea extends CharmFormControlElement {
  public static override styles = [...super.styles, styles];

  public static override baseName = 'text-area';

  /** The number of rows to display by default. */
  @property({ reflect: true })
  public rows: number = 4;

  /**
   * Controls how the textarea can be resized. Use `auto` to grow the textarea to fit its content.
   */
  @property({ reflect: true })
  public resize?: 'none' | 'horizontal' | 'vertical' | 'both' | 'auto';

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

  /** The width last observed by the resize observer, used to recompute height only when wrapping changes. */
  private lastObservedWidth = 0;

  /** Deferred recompute handle, cancelled on teardown. */
  private resizeFrame?: number;

  private resizeObserver?: ResizeObserver;

  public static override get dependencies(): (typeof CharmElement)[] {
    return [CoreIcon];
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.updateComplete.then(() => this.updateResizeObserver());
  }

  public override disconnectedCallback() {
    if (this.resizeFrame !== undefined) {
      cancelAnimationFrame(this.resizeFrame);
      this.resizeFrame = undefined;
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = undefined;
    }
    super.disconnectedCallback();
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

  protected override updated(changedProperties: PropertyValues<this>) {
    super.updated(changedProperties);

    if (changedProperties.has('value') || changedProperties.has('rows')) {
      this.setTextareaDimensions();
    }

    if (changedProperties.has('resize')) {
      this.setTextareaDimensions();
      this.updateResizeObserver();
    }
  }

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
        aria-hidden=${!this.hasLabel}
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
          aria-describedby=${ifDefined(this.describedBy)}
          aria-errormessage=${ifDefined(this.invalid ? 'error-text' : undefined)}
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

  /**
   * Creates or destroys the resize observer based on the current resize mode. The observer is only
   * needed in `auto` mode, where the height must be recomputed when the width changes and text re-wraps.
   */
  private updateResizeObserver() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = undefined;
    }

    if (!this.isConnected || this.resize !== 'auto' || !this.input) return;

    this.lastObservedWidth = 0;
    this.resizeObserver = new ResizeObserver(entries => {
      // Guard against callbacks firing after disconnect
      if (!this.isConnected) return;

      // Height mutations are skipped so our own sizing doesn't recurse into the observer.
      const width = entries[0]?.contentRect.width ?? 0;
      if (width === this.lastObservedWidth) return;
      this.lastObservedWidth = width;

      // Deferred to the next frame so it runs outside the observer callback.
      if (this.resizeFrame !== undefined) {
        cancelAnimationFrame(this.resizeFrame);
      }
      this.resizeFrame = requestAnimationFrame(() => {
        this.resizeFrame = undefined;
        this.setTextareaDimensions();
      });
    });
    this.resizeObserver.observe(this);
  }

  /**
   * Grows the textarea to fit its content when `resize` is `auto`, or clears the measured height when
   * the textarea switches back to a manual resize mode.
   */
  private setTextareaDimensions() {
    if (!this.input) return;

    if (this.resize !== 'auto') {
      this.input.style.height = '';
      return;
    }

    this.input.style.height = 'auto';
    const newHeight = this.input.scrollHeight;
    this.input.style.height = `${newHeight}px`;
  }
}

export default CoreTextArea;
