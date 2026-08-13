import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { startContentEndTemplate } from '../../templates/start-content-end.js';
import { CharmElement, CharmFocusableElement } from '../../base/index.js';
import { CoreIcon } from '../icon/icon.js';
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
 * @slot separator - A separator between breadcrumb items.
 * @slot end - A presentational suffix icon or similar element.
 *
 * @csspart breadcrumb-item-base - The component's base wrapper.
 * @csspart breadcrumb-item-control - The container for start, default, and end slot.
 * @csspart breadcrumb-item-separator - The separator between breadcrumb items.
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
 * @dependency CoreIcon
 **/
export class CoreBreadcrumbItem extends CharmFocusableElement {
  public static override styles = [...super.styles, styles];
  public static override baseName = 'breadcrumb-item';

  /**
   * Sets `aria-current` on the div.
   */
  @property({ reflect: true })
  public current?: 'page' | 'step';

  /**
   * When set, the underlying button will be rendered as an `<a>` with this `href`
   * instead of a `<button>`.
   */
  @property({ reflect: true })
  public href?: string;

  /**
   * When true, will render the separator content.
   */
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

  public static override get dependencies(): (typeof CharmElement)[] {
    return [CoreIcon];
  }

  /** @internal Handles the click event on the control. */
  public override click() {
    super.click();
    this.shadowRoot?.querySelector<HTMLElement>('.control')?.click();
  }

  /** Generates the HTML template for the control. When no `href` is set, a `<button>` is rendered so the item remains keyboard accessible. */
  protected breadcrumbItemControlTemplate() {
    return this.href
      ? this.html`
          <a
            class="control"
            href=${this.href}
            target=${ifDefined(this.target)}
            rel=${ifDefined(this.target ? 'noreferrer noopener' : undefined)}
            referrerpolicy=${ifDefined(this.referrerPolicy)}
            aria-current=${ifDefined(this.current)}
            part="breadcrumb-item-control"
            @focus=${this.handleFocus}
            @blur=${this.handleBlur}
          >
            ${startContentEndTemplate()}
          </a>
        `
      : this.html`
          <button
            class="control"
            type="button"
            aria-current=${ifDefined(this.current)}
            part="breadcrumb-item-control"
            @focus=${this.handleFocus}
            @blur=${this.handleBlur}
          >
            ${startContentEndTemplate()}
          </button>
        `;
  }

  /** Generates the HTML template for the separator. */
  protected breadcrumbItemSeparatorTemplate() {
    return this.separator
      ? this.html`<span part="breadcrumb-item-separator" class="separator"><slot name="separator"> <scoped-icon
    class="icon"
    name=${this.dir === 'rtl' ? 'chevron-left' : 'chevron-right'}
></scoped-icon> </slot></span>`
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
