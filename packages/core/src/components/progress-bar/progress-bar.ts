import { type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { html } from 'lit/static-html.js';
import CharmElement from '../../base/charm-element/charm-element.js';
import formControlStyles from '../../base/form-control-element/form-control.styles.js';
import { HasSlotController } from '../../controller/index.js';
import styles from './progress-bar.styles.js';

/** Fallback text used to name the progress bar for assistive tech when no label is provided. */
const PROGRESS_BAR_DEFAULT_LABEL = 'Progress';

/**
 * Progress bar is used to visualize a known percentage value (determinate) or to represent an unspecified wait time (indeterminate).
 *
 * @tag ch-progress-bar
 * @since 1.0.0
 * @status beta
 *
 * @slot - A label shown above the track. When the `label` attribute is not provided and the slot is empty, a default `Progress` text is used to name the bar for assistive tech.
 * @slot help-text - The progress bar's help text.
 *
 * @csspart progress-bar-base - The component's internal wrapper.
 * @csspart progress-bar-help-text - The progress bar's help text.
 * @csspart progress-bar-indicator - The progress bar indicator.
 * @csspart progress-bar-label - The progress bar label.
 * @csspart progress-bar-track - The progress bar's track.
 *
 * @cssprop --charm-form-control-invalid-border-color - Determines the error border color.
 * @cssprop --charm-form-control-invalid-message-color - Determines the error text color.
 * @cssprop --charm-form-control-invalid-message-font-size - Determines the error message font size.
 * @cssprop --charm-form-control-label-color - Determines the label color.
 * @cssprop --charm-form-control-label-font-size - Determines the label font size.
 * @cssprop --charm-form-control-label-font-weight - Determines the label font weight.
 * @cssprop --charm-form-control-label-gap - Determines the margin between label and the control.
 * @cssprop --charm-progress-bar-animation - The animation for the indeterminate state.
 * @cssprop --charm-progress-bar-border-radius - The border radius of the track.
 * @cssprop --charm-progress-bar-height - The progress bar's track's height.
 * @cssprop --charm-progress-bar-icon-color - The color of the icon in the default slot.
 * @cssprop --charm-progress-bar-indicator-bg-color - The background color of the indicator.
 * @cssprop --charm-progress-bar-track-color - The track color.
 * @cssprop --charm-progress-bar-transition - The transition for the indicator.
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

  /** A custom label for the progress bar's aria label. When omitted and the default slot is empty, a default `Progress` text is used. */
  @property() public label?: string;

  /** Hides the input label and help text. */
  @property({ type: Boolean, attribute: 'hide-label', reflect: true }) public hideLabel?: boolean;

  /** The input's help text. Alternatively, you can use the help-text slot. */
  @property({ attribute: 'help-text' }) public helpText?: string;

  /** Update the role of the progress bar from 'progressbar' to 'meter' to indicate that it measures a specific value instead of progress towards a specific task. */
  @property({ type: Boolean, reflect: true }) public meter?: boolean;

  protected readonly hasSlotController = new HasSlotController(this, '[default]', 'help-text');

  /** The id of the pending animation frame that defers the width sync, if one is scheduled. */
  private _syncRangeFrame?: number;

  /** Whether a label is present via the `label` attribute or the default slot. */
  protected get hasLabel(): boolean {
    return !!this.label || this.hasSlotController.hasDefaultSlot();
  }

  /** Whether help text is present via the `help-text` attribute or the `help-text` slot. */
  protected get hasHelpText(): boolean {
    return !!this.helpText || this.hasSlotController.hasNamedSlot('help-text');
  }

  public override disconnectedCallback() {
    super.disconnectedCallback();
    if (this._syncRangeFrame !== undefined) {
      cancelAnimationFrame(this._syncRangeFrame);
      this._syncRangeFrame = undefined;
    }
  }

  protected override willUpdate(changedProperties: PropertyValues<this>) {
    super.willUpdate(changedProperties);
    // The initial value is synced synchronously so the bar doesn't sweep in from 0 on
    // mount. Subsequent value/max changes are deferred a frame in `updated()` so Safari
    // reliably animates the width transition.
    if (!this.hasUpdated) {
      this.syncRange();
    }
  }

  protected override updated(changedProperties: PropertyValues<this>) {
    super.updated(changedProperties);
    if (changedProperties.has('value') || changedProperties.has('max')) {
      this.syncRangeOnNextFrame();
    }
  }

  /** Updates the percentage of the progress bar loaded. */
  protected syncRange() {
    const value = this.value ?? 0;
    const max = this.max ?? 100;
    const safeMax = max > 0 ? max : 100;
    const progressPercent = `${Math.min(100, Math.max(0, (value / safeMax) * 100))}%`;

    this.style.setProperty('--progress-percent', progressPercent);
  }

  /**
   * Defers the width sync by a frame so Safari animates the width transition instead of snapping it.
   */
  protected syncRangeOnNextFrame() {
    if (this._syncRangeFrame !== undefined) {
      cancelAnimationFrame(this._syncRangeFrame);
    }
    this._syncRangeFrame = requestAnimationFrame(() => {
      this._syncRangeFrame = undefined;
      this.syncRange();
    });
  }

  /** Generates the template for the label. */
  protected labelTemplate() {
    return html`
      <div
        id="label"
        class=${classMap({
          'form-control-label': true,
          'progress-bar-label': true,
          'visually-hidden': this.hideLabel || !this.hasLabel,
        })}
        part="progress-bar-label"
      >
        ${this.label ? this.label : html`<slot>${PROGRESS_BAR_DEFAULT_LABEL}</slot>`}
      </div>
    `;
  }

  /** Generates the template for form control help text */
  protected helpTextTemplate() {
    const hasHelpText = this.hasHelpText;
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
        aria-describedby=${ifDefined(this.hasHelpText ? 'help-text' : undefined)}
        aria-valuemin="0"
        aria-valuemax=${this.max ?? 100}
        aria-valuenow=${ifDefined(this.indeterminate ? undefined : this.value)}
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
