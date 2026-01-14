import { html } from 'lit/static-html.js';
import { property } from 'lit/decorators.js';
import CharmElement from '../../base/charm-element/charm-element.js';
import { HasSlotController } from '../../controller/index.js';
import styles from './card.styles.js';

/**
 * Cards are used to show an associated group of data as a visual interface of 'blocks' of information.
 *
 * @tag ch-card
 * @since 1.0.0
 * @status beta
 *
 * @slot - The card's main content.
 * @slot footer - The card's footer.
 * @slot heading - Wraps the heading element.
 * @slot subheading - Wraps the subheading element.
 * @slot media - A presentational slot for media such as an image or icon.
 *
 * @csspart card-base - The component's base wrapper.
 * @csspart card-content - The card's main content.
 * @csspart card-footer - The card's footer.
 * @csspart card-header - The card's header.
 * @csspart card-heading - The card's heading element.
 * @csspart card-media - The card's media.
 * @csspart card-subheading - The card's subheading element.
 *
 * @cssproperty --card-bg-color - Sets the background color for the card.
 * @cssproperty --card-body-padding-x - Controls the horizontal padding of the card body.
 * @cssproperty --card-body-padding-y - Controls the vertical padding of the card body.
 * @cssproperty --card-border-color - Sets the border color for the card.
 * @cssproperty --card-border-radius - Sets border-radius for the card.
 * @cssproperty --card-border-size - Sets the border width for the card.
 * @cssproperty --card-border-style - Sets the border style for the card.
 * @cssproperty --card-box-shadow - Sets the style of the shadowing for the card.
 * @cssproperty --card-content-gap - Determines the spacing between the slots.
 * @cssproperty --card-fg-color - Sets the foreground color (text color) for the card.
 * @cssproperty --card-footer-padding-x - Controls the horizontal padding of the card footer.
 * @cssproperty --card-footer-padding-y - Controls the vertical padding of the card footer.
 * @cssproperty --card-heading-gap - Controls the gap between the heading and subheading.
 * @cssproperty --card-heading-padding-x - Controls the horizontal padding of the card heading.
 * @cssproperty --card-heading-padding-y - Controls the vertical padding of the card heading.
 * @cssproperty --card-heading-size - Controls the font size of the heading.
 * @cssproperty --card-heading-weight - Controls the font weight of the heading.
 * @cssproperty --card-padding - Sets the padding for the card.
 * @cssproperty --card-subheading-size - Controls the font size of the subheading.
 * @cssproperty --card-subheading-weight - Controls the font weight of the subheading.
 **/

export class CoreCard extends CharmElement {
  public static override styles = [...super.styles, styles];
  public static override baseName = 'card';

  /**
   * A flag used to change visual positioning of any media (default 'top').
   */
  @property({ reflect: true, attribute: 'media-position' })
  public mediaPosition?: 'top' | 'bottom' | 'start' | 'end';

  /** Provides a heading for the card. */
  @property()
  public heading?: string;

  /** Provides a subheading for the card. */
  @property()
  public subheading?: string;

  protected readonly hasSlotController = new HasSlotController(this, 'media', 'footer', 'heading', 'subheading');

  /** Generate HTML template for card media. */
  protected mediaTemplate() {
    return html`<div ?hidden=${!this.hasSlotController.hasNamedSlot('media')} part="card-media">
      <slot name="media"></slot>
    </div>`;
  }

  /** Generate HTML template for card header. */
  protected headerTemplate() {
    return html`
      <header class="header" part="card-header">
        <h3 part="card-heading" ?hidden=${!this.hasSlotController.hasNamedSlot('heading') && !this.heading}>
          <slot name="heading">${this.heading}</slot>
        </h3>
        <h4 part="card-subheading" ?hidden=${!this.hasSlotController.hasNamedSlot('subheading') && !this.subheading}>
          <slot name="subheading">${this.subheading}</slot>
        </h4>
      </header>
    `;
  }

  /** Generate HTML template for card footer. */
  protected footerTemplate() {
    return html`
      <footer class="footer" part="card-footer" ?hidden=${!this.hasSlotController.hasNamedSlot('footer')}>
        <slot name="footer"></slot>
      </footer>
    `;
  }

  /** Generates the HTML template for card content. */
  protected contentTemplate() {
    return html`
      <div class="card-content" part="card-content" ?hidden=${!this.hasSlotController.hasDefaultSlot()}>
        <slot></slot>
      </div>
    `;
  }

  /** Generates the HTML template for Card. */
  protected cardTemplate() {
    return html`<article class="base" part="card-base">
      ${this.mediaTemplate()} ${this.headerTemplate()} ${this.contentTemplate()} ${this.footerTemplate()}
    </article>`;
  }

  protected override render() {
    return this.cardTemplate();
  }
}

export default CoreCard;
