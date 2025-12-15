import { html } from 'lit/static-html.js';
import { property } from 'lit/decorators.js';
import CharmElement from '../../base/charm-element/charm-element.js';
import CoreAccordionItem from '../accordion-item/accordion-item.js';
import styles from './accordion.styles.js';

/**
 * An accordion is a vertically stacked set of interactive headings that each contain a title, content snippet, or thumbnail representing a section of content. The headings function as controls that enable users to reveal or hide their associated sections of content. Accordions are commonly used to reduce the need to scroll when presenting multiple sections of content on a single page.
 *
 * @tag ch-accordion
 * @since 1.0.0
 * @status beta
 *
 * @slot - The default slot where accordion items are placed.
 *
 * @cssprop --accordion-top-border-color - Sets the border top color of the accordion.
 *
 **/

export class CoreAccordion extends CharmElement {
  public static override styles = [...super.styles, styles];
  public static override baseName = 'accordion';

  /** If set, allows only one child accordion-item to be open at a time. */
  @property({ type: Boolean, reflect: true, attribute: 'open-single' })
  public openSingle?: boolean = false;

  /** Used to prevent multiple calls to the logic when updating the `open` attribute when `openSingle` is true */
  protected updating = false;

  /** Ensures only one item is open at a time. */
  protected async handleOpenChange(event: Event) {
    if (!this.openSingle || this.updating) return;

    this.updating = true;
    const toggledItem = event.target as CoreAccordionItem;
    const items = this.querySelectorAll('[accordion-item]') as NodeListOf<CoreAccordionItem>;

    for (const item of items) {
      if (item !== toggledItem && item.open) {
        item.open = false;
        await item.updateComplete;
      }
    }

    // Allow the update to complete before resetting the updating flag
    setTimeout(() => (this.updating = false));
  }

  /** Generate the accordion template with declarative event handling. */
  protected accordionTemplate() {
    return html`<slot @accordion-item-open-change=${this.handleOpenChange}></slot>`;
  }

  protected override render() {
    return this.accordionTemplate();
  }
}

export default CoreAccordion;
