import { property } from 'lit/decorators.js';
import { literal } from 'lit/static-html.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { startContentEndTemplate } from '../../templates/start-content-end.js';
import { CharmFocusableElement } from '../../base/index.js';
import styles from './breadcrumb-item.styles.js';

/**
 * Breadcrumb item is meant to be used with breadcrumb. Please refer to breadcrumb for more guidance.
 *
 * @tag ch-breadcrumb-item
 * @since 1.0.0
 * @status beta
 *
 * @slot - Breadcrumb item's content.
 * @slot start - A presentational prefix icon or similar element.
 * @slot separator - Internal: filled by the parent `ch-breadcrumb` with a clone of its separator. Don't slot content here; set the separator on `ch-breadcrumb` instead.
 * @slot end - A presentational suffix icon or similar element.
 *
 * @csspart breadcrumb-item-base - The component's base wrapper.
 * @csspart breadcrumb-item-control - The container for start, default, and end slot.
 * @csspart breadcrumb-item-separator - The wrapper around the separator the parent breadcrumb places after this item.
 * @csspart start - The container for the 'start' slot.
 * @csspart content - The container for the default slot.
 * @csspart end - The container for the 'end' slot.
 *
 * @cssprop --charm-breadcrumb-item-control-width - Determines the width of the control.
 * @cssprop --charm-breadcrumb-item-gap - Determines margin around start/end slot and separator.
 * @cssprop --charm-breadcrumb-item-padding - Determines the padding of the breadcrumb item.
 * @cssprop --charm-breadcrumb-item-border-width - Determines the width of the breadcrumb item border.
 * @cssprop --charm-breadcrumb-item-bg-color - Set the background color of the breadcrumb item.
 * @cssprop --charm-breadcrumb-item-border-color - Set the border color of the breadcrumb item.
 * @cssprop --charm-breadcrumb-item-fg-color - Set the foreground color of the breadcrumb item.
 * @cssprop --charm-breadcrumb-item-hover-bg-color - Set the background color of the breadcrumb item when hover.
 * @cssprop --charm-breadcrumb-item-hover-border-color - Set the border color of the breadcrumb item when hover.
 * @cssprop --charm-breadcrumb-item-hover-fg-color - Set the foreground color of the breadcrumb item when hover.
 * @cssprop --charm-breadcrumb-item-active-bg-color - Set the background color of the breadcrumb item when active.
 * @cssprop --charm-breadcrumb-item-active-border-color - Set the border color of the breadcrumb item when active.
 * @cssprop --charm-breadcrumb-item-active-fg-color - Set the foreground color of the breadcrumb item when active.
 * @cssprop --charm-breadcrumb-item-focus-bg-color - Set the background color of the breadcrumb item when focus.
 * @cssprop --charm-breadcrumb-item-focus-border-color - Set the border color of the breadcrumb item when focus.
 * @cssprop --charm-breadcrumb-item-focus-fg-color - Set the foreground color of the breadcrumb item when focus.
 * @cssprop --charm-breadcrumb-item-disabled-bg-color - Set the background color of the breadcrumb item when disabled.
 * @cssprop --charm-breadcrumb-item-disabled-border-color - Set the border color of the breadcrumb item when disabled.
 * @cssprop --charm-breadcrumb-item-disabled-fg-color - Set the foreground color of the breadcrumb item when disabled.
 *
 **/
export class CoreBreadcrumbItem extends CharmFocusableElement {
  public static override styles = [...super.styles, styles];
  public static override baseName = 'breadcrumb-item';

  /**
   * Sets `aria-current` on the link or text control.
   */
  @property({ reflect: true })
  public current?: 'page' | 'step';

  /**
   * When set, renders a navigable `<a>` with this `href`. Without it, the item is non-interactive text.
   */
  @property({ reflect: true })
  public href?: string;

  /** Prevents navigation and presents this item as non-interactive text. */
  @property({ type: Boolean, reflect: true })
  public disabled?: boolean;

  /** @internal Set by the parent `ch-breadcrumb`; false on the last item so no separator follows it. */
  @property({ reflect: true, type: Boolean })
  public separator: boolean = true;

  /**
   * Defining which referrer is sent when fetching the resource.
   * Only applies to links.
   */
  @property({ attribute: 'referrerpolicy' })
  public referrerPolicy:
    | 'no-referrer'
    | 'no-referrer-when-downgrade'
    | 'origin'
    | 'origin-when-cross-origin'
    | 'same-origin'
    | 'strict-origin'
    | 'strict-origin-when-cross-origin'
    | 'unsafe-url'
    | (string & {}) = 'strict-origin-when-cross-origin';

  /**
   * Tells the browser where to open the link. Only used when `href` is set.
   */
  @property()
  public target?: '_blank' | '_parent' | '_self' | '_top' | (string & {});

  /** @internal Handles the click event on the control. */
  public override click() {
    if (this.disabled || !this.href) return;
    this.shadowRoot?.querySelector<HTMLAnchorElement>('a.control')?.click();
  }

  protected handleControlClick(event: MouseEvent) {
    if (this.disabled) event.preventDefault();
  }

  /** Generates a link when navigable, otherwise a non-interactive text item. */
  protected breadcrumbItemControlTemplate() {
    const isLink = Boolean(this.href && !this.disabled);
    const controlTag = isLink ? literal`a` : literal`span`;

    return this.html`<${controlTag}
      class="control"
      href=${ifDefined(isLink ? this.href : undefined)}
      target=${ifDefined(isLink ? this.target : undefined)}
      rel=${ifDefined(isLink && this.target ? 'noreferrer noopener' : undefined)}
      referrerpolicy=${ifDefined(isLink ? this.referrerPolicy : undefined)}
      aria-current=${ifDefined(this.current)}
      aria-disabled=${ifDefined(this.disabled ? 'true' : undefined)}
      part="breadcrumb-item-control"
      @focus=${this.handleFocus}
      @blur=${this.handleBlur}
      @click=${this.handleControlClick}
    >${startContentEndTemplate()}</${controlTag}>`;
  }

  /** Generates the wrapper for the separator the parent breadcrumb places in the `separator` slot. */
  protected breadcrumbItemSeparatorTemplate() {
    return this.separator
      ? this
          .html`<span aria-hidden="true" part="breadcrumb-item-separator" class="separator"><slot name="separator"></slot></span>`
      : this.html``;
  }

  /** Generates the HTML template for the breadcrumb item. */
  protected breadcrumbItemTemplate() {
    return this.html`
      <div class="base" role="listitem" part="breadcrumb-item-base">
        ${this.breadcrumbItemControlTemplate()} ${this.breadcrumbItemSeparatorTemplate()}
      </div>
    `;
  }

  protected override render() {
    return this.breadcrumbItemTemplate();
  }
}

export default CoreBreadcrumbItem;
