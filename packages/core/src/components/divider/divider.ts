import { html } from 'lit/static-html.js';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import CharmElement from '../../base/charm-element/charm-element.js';
import { HasSlotController } from '../../controller/slot.js';
import styles from './divider.styles.js';

/**
 * Divider is a horizontal or vertical rule that separates content.
 *
 * @tag ch-divider
 * @since 1.0.0
 * @status beta
 *
 * @csspart divider-line - The divider's line.
 * @csspart divider-text - The divider's text.
 *
 * @cssproperty --divider-border - The border of the divider line.
 * @cssproperty --divider-inset - The padding of the divider in the direction of the inset.
 * @cssproperty --divider-text-gap - The gap between the divider and the text.
 * @cssproperty --divider-text-offset - The amount of space to offset the text in the divider when it is aligned.
 * @cssproperty --divider-vertical-min-height - The minimum height of the divider when it is vertical.
 **/

export class CoreDivider extends CharmElement {
  public static override styles = [...super.styles, styles];
  public static override baseName = 'divider';

  /** Determines the alignment of the content within the divider. */
  @property({ reflect: true, attribute: 'align-content' })
  public alignContent?: 'center' | 'start' | 'end';

  /** The divider's orientation. */
  @property({ reflect: true })
  public orientation?: 'horizontal' | 'vertical';

  /** Renders the divider as a presentational element instead of a content separator when set to true. */
  @property({ type: Boolean, reflect: true })
  public presentation?: boolean;

  /** Adds padding to the beginning and end of the divider. */
  @property({ type: Boolean, reflect: true })
  public inset?: boolean;

  protected readonly hasSlotController = new HasSlotController(this, '[default]');

  protected override willUpdate(changedProperties: Map<string | number | symbol, unknown>) {
    if (changedProperties.has('orientation') || changedProperties.has('presentation')) {
      if (this.presentation) {
        this.setAttribute('role', 'presentation');
        this.removeAttribute('aria-orientation');
      } else {
        this.setAttribute('role', 'separator');
        this.setAttribute('aria-orientation', this.orientation ? this.orientation : 'horizontal');
      }
    }
  }

  /** Generates the template for the start line of the divider. */
  protected startLineTemplate() {
    return html`<span class="line start" part="divider-line"></span>`;
  }

  /** Generates the template for the end line of the divider. */
  protected endLineTemplate() {
    return html`<span class="line end" part="divider-line"></span>`;
  }

  /** Generates the template for the content slot of the divider. */
  protected contentTemplate() {
    return html`
      <span
        class=${classMap({
          content: true,
          text: this.hasSlotController.hasDefaultSlot(),
        })}
        part="divider-content"
      >
        <slot></slot>
      </span>
    `;
  }

  /** Generates the template for the divider. */
  protected dividerTemplate() {
    return html` ${this.startLineTemplate()} ${this.contentTemplate()} ${this.endLineTemplate()} `;
  }

  protected override render() {
    return this.dividerTemplate();
  }
}

export default CoreDivider;
