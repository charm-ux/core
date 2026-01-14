import { html } from 'lit/static-html.js';
import { property, query } from 'lit/decorators.js';
import CharmElement from '../../base/charm-element/charm-element.js';
import styles from './spinner.styles.js';

/**
 * Spinners are used to to represent an indeterminate wait time.
 *
 * @tag ch-spinner
 * @since 1.0.0
 * @status beta
 *
 * @slot - A label to show next to the spinner when the `label` attribute is not provided.
 *
 * @cssproperty --spinner-gap - Gap between the ring and the label.
 * @cssproperty --spinner-image-animation - Animation for the spinner ring.
 * @cssproperty --spinner-indicator-animation - Animation for the spinner indicator.
 * @cssproperty --spinner-indicator-color - Color of the shaded in track.
 * @cssproperty --spinner-label-color - Font color of the label text.
 * @cssproperty --spinner-label-font-size -  Font size of the label text.
 * @cssproperty --spinner-label-font-weight - Font weight of the label text.
 * @cssproperty --spinner-label-line-height - Line height of the label text.
 * @cssproperty --spinner-ring-size - Spinner ring's width and height.
 * @cssproperty --spinner-track-color - Color of the unshaded track.
 * @cssproperty --spinner-track-width - Width of the progress ring indicator.
 *
 * @csspart spinner-base - The component's base wrapper.
 * @csspart spinner-container - The spinner's container.
 * @csspart spinner-image - The spinner's SVG element.
 * @csspart spinner-indicator - The spinner's indicator.
 * @csspart spinner-label - The spinner's label.
 * @csspart spinner-track - The spinner's track.
 **/
export class CoreSpinner extends CharmElement {
  public static override styles = [...super.styles, styles];

  public static override baseName = 'spinner';

  /** A custom label rendered under the progress ring. */
  @property() public label?: string;

  /** The position of the progress label. */
  @property({ attribute: 'label-position' }) public labelPosition?: 'below' | 'before' | 'after' | 'above';

  @query('.spinner-indicator') protected indicator?: SVGCircleElement;

  /** Generates the template for the ring container. */
  protected containerTemplate() {
    return html`<div class="spinner-container" part="spinner-container">
      <svg class="spinner-image" part="spinner-image">
        <circle class="spinner-track" part="spinner-track"></circle>
        <circle class="spinner-indicator" part="spinner-indicator"></circle>
      </svg>
    </div>`;
  }

  /** Generates the template for the label. */
  protected labelTemplate() {
    return html`<div id="spinner-label" class="label">
      <span class="spinner-label" part="spinner-label"> ${this.label ? this.label : html`<slot></slot>`} </span>
    </div>`;
  }

  /** Generates the template for the spinner. */
  protected spinnerTemplate() {
    return html` <div part="spinner-base" class="spinner" role="status" aria-labelledby="spinner-label">
      ${this.containerTemplate()} ${this.labelTemplate()}
    </div>`;
  }

  protected override render() {
    return this.spinnerTemplate();
  }
}

export default CoreSpinner;
