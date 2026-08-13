import { property, query, queryAssignedElements } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { CharmElement } from '../../base/index.js';
import { CoreIcon } from '../icon/icon.js';
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
 * @slot separator - The default separator used between breadcrumb items. When set, it is cloned into every item that does not provide its own.
 *
 * @csspart breadcrumb-base - The component's base wrapper.
 * @csspart breadcrumb-list - Default slot's wrapper.
 *
 * @dependency CoreIcon
 **/
export class CoreBreadcrumb extends CharmElement {
  public static override styles = [...super.styles, styles];

  public static override baseName = 'breadcrumb';

  /** The `aria-label` for the entire breadcrumb. Will not be displayed, but is required for accessibility. */
  @property()
  public label?: string = 'breadcrumb';

  @queryAssignedElements()
  protected slottedNodes!: Array<CoreBreadcrumbItem>;

  @query('slot[name="separator"]')
  protected separatorSlot!: HTMLSlotElement;

  /** @internal The direction of the breadcrumb, used to regenerate default separators when it changes. */
  protected separatorDir?: 'ltr' | 'rtl' | 'auto';

  public static override get dependencies(): (typeof CharmElement)[] {
    return [CoreIcon];
  }

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

    // Inject/refresh separators into every item that will display one, and remove injected
    // separators from the final item so it can never show a stale one.
    this.slottedNodes.forEach((item: CoreBreadcrumbItem, index) => {
      if (index < this.slottedNodes.length - 1) {
        this.setItemSeparatorContent(item);
      } else {
        item.querySelector('[slot="separator"][data-default]')?.remove();
      }
    });
  }

  /** Sets the `current` attribute for a given CoreBreadcrumbItem. */
  protected setAriaCurrent(item: CoreBreadcrumbItem, isLastNode: boolean): void {
    item.current = isLastNode ? 'page' : undefined;
  }

  /** Controls the display of item separators for a given CoreBreadcrumbItem. */
  protected setItemSeparator(item: CoreBreadcrumbItem, isLastNode: boolean): void {
    item.separator = !isLastNode;
  }

  /** Clones the breadcrumb's separator into an item that does not provide its own. */
  protected setItemSeparatorContent(item: CoreBreadcrumbItem): void {
    const separator = item.querySelector('[slot="separator"]');
    const clone = this.getSeparator();

    if (clone === null) {
      return;
    }

    if (separator === null) {
      item.append(clone);
    } else if (separator.hasAttribute('data-default')) {
      separator.replaceWith(clone);
    }
    // Otherwise the item provides a custom separator — leave it alone.
  }

  /** Generates a clone of the breadcrumb's separator element. */
  protected getSeparator() {
    const separator = this.separatorSlot?.assignedElements({ flatten: true })[0] as HTMLElement | undefined;

    if (!separator) {
      return null;
    }

    const clone = separator.cloneNode(true) as HTMLElement;

    [clone, ...clone.querySelectorAll('[id]')].forEach(el => el.removeAttribute('id'));
    clone.setAttribute('data-default', '');
    clone.removeAttribute('slot');
    clone.slot = 'separator';

    return clone;
  }

  /**
   * Template for the breadcrumb component.
   */
  protected breadcrumbTemplate() {
    return this.html`
      <nav part="breadcrumb-base" aria-label=${ifDefined(this.label)}>
        <div role="list" class="list" part="breadcrumb-list">
          <slot @slotchange=${this.handleSlotChange}></slot>
        </div>
      </nav>

      <span hidden aria-hidden="true">
        <slot name="separator" @slotchange=${this.handleSlotChange}>
          <scoped-icon class="icon" name=${this.dir === 'rtl' ? 'chevron-left' : 'chevron-right'}></scoped-icon>
        </slot>
      </span>
    `;
  }

  protected override render() {
    // We clone the separator into each breadcrumb item, so the default separators need to be
    // regenerated when the directionality changes.
    if (this.separatorDir !== this.dir) {
      this.separatorDir = this.dir;

      if (this.dir === 'rtl' || this.dir === 'ltr') {
        this.updateComplete.then(() => this.handleSlotChange());
      }
    }

    return this.breadcrumbTemplate();
  }
}

export default CoreBreadcrumb;
