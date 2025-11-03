import { html } from 'lit/static-html.js';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import CharmElement from '../../base/charm-element/charm-element.js';
import formControlStyles from '../../base/form-control-element/form-control.styles.js';
import { HasSlotController } from '../../controller/index.js';
import styles from './progress-bar.styles.js';

/**
 * Progress bar is used to visualize a known percentage value (determinate) or to represent an unspecified wait time (indeterminate).
 *
 * @tag ch-progress-bar
 * @since 1.0.0
 * @status beta
 *
 * @slot - A label to show inside the indicator when the `label` attribute is not provided.
 * @slot help-text - The progress bar's help text.
 *
 * @csspart progress-bar-base - The component's internal wrapper.
 * @csspart progress-bar-help-text - The progress bar's help text.
 * @csspart progress-bar-indicator - The progress bar indicator.
 * @csspart progress-bar-label - The progress bar label.
 * @csspart progress-bar-track - The progress bar's track.
 *
 * @cssproperty --form-control-invalid-border-color - Determines the error border color.
 * @cssproperty --form-control-invalid-message-fg-color - Determines the error text color.
 * @cssproperty --form-control-invalid-message-font-size - Determines the error message font size.
 * @cssproperty --form-control-label-fg-color - Determines the label color.
 * @cssproperty --form-control-label-font-size - Determines the label font size.
 * @cssproperty --form-control-label-font-weight - Determines the label font weight.
 * @cssproperty --form-control-label-gap - Determines the margin between label and the control.
 * @cssproperty --progress-bar-animation - The animation for the indeterminate state.
 * @cssproperty --progress-bar-border-radius - The border radius of the track.
 * @cssproperty --progress-bar-height - The progress bar's track's height.
 * @cssproperty --progress-bar-icon-color - The color of the icon in the default slot.
 * @cssproperty --progress-bar-indicator-color - The background color of the indicator.
 * @cssproperty --progress-bar-track-color - The track color.
 * @cssproperty --progress-bar-transition - The transition for the indicator.
 **/
export class CoreProgressBar extends CharmElement {
  public static override styles = [...super.styles, formControlStyles, styles];

  public static override baseName = 'progress-bar';

  /** The current progress, 0 to `max` or 100 if max is not defined. */
  @property({ type: Number, reflect: true }) public value?: number;

  /** The maximum value, which indicates the task is complete.. */
  @property({ type: Number, reflect: true }) public max?: number;

  /** When true, percentage is ignored, the label is hidden, and the progress bar is drawn in an indeterminate state. */
  @property({ type: Boolean, reflect: true }) public indeterminate?: boolean;

  /** A custom label for the progress bar's aria label. */
  @property() public label?: string;

  /** Hides the input label and help text. */
  @property({ type: Boolean, attribute: 'hide-label', reflect: true }) public hideLabel?: boolean;

  /** The input's help text. Alternatively, you can use the help-text slot. */
  @property({ attribute: 'help-text' }) public helpText?: string;

  /** Update the role of the progress bar from 'progressbar' to 'meter' to indicate that it measures a specific value instead of progress towards a specific task. */
  @property({ type: Boolean }) public meter?: boolean;

  protected readonly hasSlotController = new HasSlotController(this, '[label], [help-text]');

  protected override async willUpdate(changedProperties: Map<string | number | symbol, unknown>) {
    super.willUpdate(changedProperties);
    this.syncRange();
  }

  /** Updates the percentage of the progress bar loaded. */
  protected syncRange() {
    const value = this.value ?? 0;
    const max = this.max ?? 100;
    const progressPercent = `${(value / max) * 100}%`;

    this.style.setProperty('--progress-percent', progressPercent);
  }

  /** Generates the template for the label. */
  protected labelTemplate() {
    return html`
      <div
        id="label"
        class=${classMap({
          'form-control-label': true,
          'progress-bar-label': true,
          'visually-hidden': this.hideLabel || false,
        })}
        part="progress-bar-label"
      >
        ${this.label ? this.label : html`<slot></slot>`}
      </div>
    `;
  }

  /** Generates the template for form control help text */
  protected helpTextTemplate() {
    const hasHelpText = this.hasSlotController.hasNamedSlot('help-text') || this.helpText;
    return html`<div
      part="progress-bar-help-text"
      id="help-text"
      class=${classMap({
        'form-control-help-text': true,
        'progress-bar-help-text': true,
        'visually-hidden': this.hideLabel ?? false,
      })}
      aria-hidden=${!hasHelpText}
    >
      <slot name="help-text">${this.helpText}</slot>
    </div>`;
  }

  /** Generates the template for the track. */
  protected trackTemplate() {
    return html`
      <div
        part="progress-bar-track"
        class="progress-bar-track"
        role=${this.meter ? 'meter' : 'progressbar'}
        aria-labelledby="label"
        aria-valuemin="0"
        aria-valuemax=${this.max ?? 100}
        aria-valuenow=${this.indeterminate ? 0 : (this.value ?? 0)}
      >
        <div part="progress-bar-indicator" class="progress-bar-indicator"></div>
      </div>
    `;
  }

  /** Generates the template for the progress bar. */
  protected progressBarTemplate() {
    return html`
      <div class="progress-bar-base" part="progress-bar-base">
        ${this.labelTemplate()} ${this.trackTemplate()} ${this.helpTextTemplate()}
      </div>
    `;
  }

  protected override render() {
    return this.progressBarTemplate();
  }
}

export default CoreProgressBar;
