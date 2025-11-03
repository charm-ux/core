import { html } from 'lit/static-html.js';
import { property, queryAssignedElements } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import CharmElement from '../../base/charm-element/charm-element.js';
import styles from './breadcrumb.styles.js';
import type CoreBreadcrumbItem from '../breadcrumb-item/breadcrumb-item.js';

/**
 * Breadcrumbs should be used as a navigational aid in your app or site. They indicate the current page’s location within a hierarchy and help the user understand where they are in relation to the rest of that hierarchy.
 *
 * @tag ch-breadcrumb
 * @since 1.0.0
 * @status beta
 *
 * @slot - Breadcrumb's contents, which should typically be a breadcrumb-item.
 *
 * @csspart breadcrumb-base - The component's base wrapper.
 * @csspart breadcrumb-list - Default slot's wrapper.
 **/
export class CoreBreadcrumb extends CharmElement {
  public static override styles = [...super.styles, styles];

  public static override baseName = 'breadcrumb';

  /** The `aria-label` for the entire breadcrumb. Will not be displayed, but is required for accessibility. */
  @property()
  public label?: string = 'breadcrumb';

  @queryAssignedElements()
  protected slottedNodes!: Array<CoreBreadcrumbItem>;

  /** Handles changes in the default slot. */
  protected handleSlotChange() {
    if (this.slottedNodes == undefined || this.slottedNodes.length <= 0) {
      return;
    }

    const lastNode: CoreBreadcrumbItem = this.slottedNodes[this.slottedNodes.length - 1];

    this.slottedNodes.forEach((item: CoreBreadcrumbItem) => {
      this.setItemSeparator(item, false);
      this.setAriaCurrent(item, false);
    });

    this.setItemSeparator(lastNode, true);
    this.setAriaCurrent(lastNode, true);
  }

  /** Sets the `current` attribute for a given CoreBreadcrumbItem. */
  protected setAriaCurrent(item: CoreBreadcrumbItem, isLastNode: boolean): void {
    item.current = isLastNode ? 'page' : undefined;
  }

  /** Controls the display of item separators for a given CoreBreadcrumbItem. */
  protected setItemSeparator(item: CoreBreadcrumbItem, isLastNode: boolean): void {
    item.separator = !isLastNode;
  }

  /*
   * Template for the breadcrumb component.
   */
  protected breadcrumbTemplate() {
    return html`
      <nav part="breadcrumb-base" aria-label=${ifDefined(this.label)}>
        <div role="list" class="list" part="breadcrumb-list">
          <slot @slotchange=${this.handleSlotChange}></slot>
        </div>
      </nav>
    `;
  }

  protected override render() {
    return this.breadcrumbTemplate();
  }
}

export default CoreBreadcrumb;
