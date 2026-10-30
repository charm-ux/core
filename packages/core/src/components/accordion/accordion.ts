import { html } from 'lit/static-html.js';
import { property } from 'lit/decorators.js';
import CharmElement from '../../base/charm-element/charm-element.js';
import CoreAccordionItem from '../accordion-item/accordion-item.js';
import styles from './accordion.styles.js';
import type { PropertyValues } from 'lit';

/**
 * An accordion is a vertically stacked set of interactive headings that each contain a title, content snippet, or thumbnail representing a section of content. The headings function as controls that enable users to reveal or hide their associated sections of content. Accordions are commonly used to reduce the need to scroll when presenting multiple sections of content on a single page.
 *
 * @tag ch-accordion
 * @since 1.0.0
 * @status beta
 *
 * @slot - Direct child accordion items.
 *
 * @cssproperty --charm-accordion-top-border-color - The border top color of the accordion.
 *
 **/

export class CoreAccordion extends CharmElement {
  public static override styles = [...super.styles, styles];
  public static override baseName = 'accordion';

  /** If set, allows only one child accordion-item to be open at a time. */
  @property({ type: Boolean, reflect: true, attribute: 'open-single' })
  public openSingle?: boolean = false;

  /** Ensures only one item is open at a time. */
  protected handleOpenChange(event: Event) {
    if (!this.openSingle) return;
    const toggledItem = event.target as CoreAccordionItem;
    if (toggledItem.parentElement !== this) return;
    this.closeOtherItems(toggledItem);
  }

  protected closeOtherItems(openItem?: CoreAccordionItem) {
    const items = Array.from(this.children).filter(
      (child): child is CoreAccordionItem => child instanceof CoreAccordionItem
    );
    const keep = openItem ?? items.find(item => item.open);
    for (const item of items) {
      if (item !== keep && item.open) item.open = false;
    }
  }

  protected handleSlotChange() {
    if (this.openSingle) this.closeOtherItems();
  }

  protected override updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);
    if (changedProperties.has('openSingle') && this.openSingle) this.closeOtherItems();
  }

  /** Generate the accordion template with declarative event handling. */
  protected accordionTemplate() {
    return html`<slot @slotchange=${this.handleSlotChange} @accordion-item-show=${this.handleOpenChange}></slot>`;
  }

  protected override render() {
    return this.accordionTemplate();
  }
}

export default CoreAccordion;
