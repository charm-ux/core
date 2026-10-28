import { property } from 'lit/decorators.js';
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
 * @slot separator - The separator placed between breadcrumb items. Defaults to a chevron that mirrors in `rtl`.
 *
 * @csspart breadcrumb-base - The component's base wrapper.
 * @csspart breadcrumb-list - Default slot's wrapper.
 *
 * @dependency CoreIcon
 **/
export class CoreBreadcrumb extends CharmElement {
  public static override styles = [...super.styles, styles];

  public static override baseName = 'breadcrumb';

  /** Required localized accessible name for the breadcrumb navigation landmark. */
  @property()
  public label!: string;

  public static override get dependencies(): (typeof CharmElement)[] {
    return [CoreIcon];
  }

  /** Handles changes in the default slot or the separator slot. */
  protected handleSlotChange() {
    const items = [...this.querySelectorAll<CoreBreadcrumbItem>('ch-breadcrumb-item')].filter(
      item => item.closest('ch-breadcrumb') === this
    );

    items.forEach((item, index) => {
      const isLastNode = index === items.length - 1;
      item.separator = !isLastNode;
      item.current = isLastNode ? 'page' : undefined;
      this.setItemSeparatorContent(item, !isLastNode);
    });
  }

  /** Replaces the separator this breadcrumb placed in an item. Items never own a separator. */
  protected setItemSeparatorContent(item: CoreBreadcrumbItem, show: boolean): void {
    item.querySelectorAll(':scope > [slot="separator"]').forEach(separator => separator.remove());

    if (!show) return;

    const separator = this.getSeparator();
    if (separator) item.append(separator);
  }

  /** Clones the breadcrumb's separator, or the default chevron when none is slotted. */
  protected getSeparator(): HTMLElement | null {
    const separatorSlot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="separator"]');
    const source = (separatorSlot?.assignedElements({ flatten: true })[0] ??
      this.shadowRoot?.querySelector('.default-separator')) as HTMLElement | null | undefined;

    if (!source) return null;

    const clone = source.cloneNode(true) as HTMLElement;

    [clone, ...clone.querySelectorAll('[id]')].forEach(el => el.removeAttribute('id'));
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
          <scoped-icon class="icon default-separator" name="chevron-right"></scoped-icon>
        </slot>
      </span>
    `;
  }

  protected override render() {
    return this.breadcrumbTemplate();
  }
}

export default CoreBreadcrumb;
