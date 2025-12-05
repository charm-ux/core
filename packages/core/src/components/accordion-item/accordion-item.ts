import { html, unsafeStatic } from 'lit/static-html.js';
import { property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { CharmDismissibleElement, CharmElement } from '../../base/index.js';
import { startTemplate } from '../../templates/start.js';
import { endTemplate } from '../../templates/end.js';
import CoreIcon from '../icon/icon.js';
import styles from './accordion-item.styles.js';

const headingLevels = [1, 2, 3, 4, 5, 6];
export type HeadingLevel = (typeof headingLevels)[number];

/**
 * An accordion item is a single selectable item in an accordion. It is used to create a collapsible section of content.
 *
 * @tag ch-accordion-item
 * @since 1.0.0
 * @status beta
 *
 * @slot - The collapsible content of the accordion item.
 * @slot heading - The content of the toggle element.
 * @slot start - Content rendered before the content in the toggle element
 * @slot end - Content rendered after the content in the toggle element
 * @slot expand-icon - Custom expand icon. If no icon is provided, a default icon will be used.
 * @slot collapse-icon - Custom collapse icon. If no icon is provided, a default icon will be used.
 *
 * @event accordion-item-open-change - Dispatched when the accordion item is expanded or collapsed.
 *
 * @csspart accordion-item-base - The wrapper element.
 * @csspart accordion-item-summary - The summary element.
 * @csspart accordion-item-icon - The wrapper element for the expand/collapse icon.
 * @csspart accordion-item-chevron - The expand/collapse icon.
 * @csspart accordion-item-heading - The heading element.
 * @csspart accordion-item-start - The start slot container.
 * @csspart accordion-item-end - The end slot container.
 *
 * @cssprop --accordion-item-border-width - Sets border width.
 * @cssprop --accordion-item-focus-width - Sets focus width.
 * @cssprop --accordion-item-font-size - Sets font size.
 * @cssprop --accordion-item-font-weight - Sets font weight.
 * @cssprop --accordion-item-line-height - Sets the line height of accordion-item.
 * @cssprop --accordion-item-padding-y - Sets vertical padding.
 * @cssprop --accordion-item-padding-x - Sets horizontal padding.
 *
 * @cssprop --accordion-item-bg-color - Sets background color.
 * @cssprop --accordion-item-border-color - Sets border color.
 * @cssprop --accordion-item-fg-color - Sets foreground color.
 *
 * @cssprop --accordion-item-disabled-bg-color - Sets background color of accordion-item when disabled.
 * @cssprop --accordion-item-disabled-border-color - Sets border color of accordion-item when disabled.
 * @cssprop --accordion-item-disabled-fg-color - Sets foreground color of accordion-item when disabled.
 *
 * @cssprop --accordion-item-hover-bg-color - Sets background color of accordion-item when hovered.
 * @cssprop --accordion-item-hover-border-color - Sets border color of accordion-item when hovered.
 * @cssprop --accordion-item-hover-fg-color - Sets foreground color of accordion-item when hovered.
 *
 * @cssprop --accordion-item-focus-bg-color - Sets background color of accordion-item when focused.
 * @cssprop --accordion-item-focus-border-color - the border color of accordion-item when focused.
 * @cssprop --accordion-item-focus-fg-color - Sets foreground color of accordion-item when focused.
 *
 * @cssprop --accordion-item-active-bg-color - Sets background color of accordion-item when active.
 * @cssprop --accordion-item-active-border-color - Sets border color of accordion-item when active.
 * @cssprop --accordion-item-active-fg-color - Sets foreground color of accordion-item when active.
 *
 * @cssprop --accordion-item-indicator-open-transition - Transition for the icon when opening an accordion item
 * @cssprop --accordion-item-indicator-close-transition - Transition for the icon when closing an accordion item
 * @cssprop --accordion-item-open-transition - Transition for the content when opening an accordion item
 * @cssprop --accordion-item-close-transition - Transition for the content when closing an accordion item
 *
 * @cssprop --accordion-item-icon-collapsed-transform - Sets the transform for the orientation of the icon when collapsed.
 * @cssprop --accordion-item-icon-expanded-transform - Sets the transform for the orientation of the icon when expanded.
 * @cssprop --accordion-item-bottom-border-color - The bottom border color of the accordion item.
 * @cssprop --accordion-item-animation-duration - The duration of the accordion item animation.
 * @cssprop --accordion-item-animation-timing-function - The timing function of the accordion item animation.
 * @cssprop --accordion-item-icon-transition - The transition for the icon when the state changes.
 * @cssprop --accordion-item-icon-down-start-transform - The starting transform for the down icon when the icon position is 'start'.
 * @cssprop --accordion-item-icon-down-end-transform - The starting transform for the down icon when the icon position is 'end'.
 *
 * @dependency CoreIcon
 **/
export class CoreAccordionItem extends CharmDismissibleElement {
  public static override styles = [...super.styles, styles];
  public static override baseName = 'accordion-item';

  /** The content of the toggle element. Can be used in lieu of the slot if only a string is needed. */
  @property()
  public heading?: string;

  /** Disables the emitted click event. */
  @property({ type: Boolean, reflect: true })
  public disabled?: boolean;

  /** Determines whether the expand icon position: 'start' or 'end'. */
  @property({ reflect: true, attribute: 'expand-icon-position' })
  public expandIconPosition?: 'start' | 'end';

  @query('details')
  private details!: HTMLDetailsElement;

  protected _headingLevel?: number;

  public constructor() {
    super();
  }

  public static override get dependencies(): (typeof CharmElement)[] {
    return [CoreIcon];
  }

  /** The header level value (1-6) for summary, when summary is rendered as a header. */
  @property({ attribute: 'heading-level', type: Number })
  public get headingLevel(): HeadingLevel | undefined {
    return this._headingLevel;
  }

  public set headingLevel(value: HeadingLevel | undefined) {
    this._headingLevel = headingLevels.includes(value || 0) ? value : undefined;
  }

  protected override firstUpdated() {
    super.firstUpdated();
    this.details.open = this.open;
  }

  /**
   * Handles click event and prevents toggle if disabled.
   * @param event
   * @returns
   */
  protected handleSummaryClick(event: MouseEvent) {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
  }

  /**
   * Handles the `details` element toggle event.
   * @param event
   */
  protected handleToggle(event: Event) {
    this.open = (event.target as HTMLDetailsElement).open;
    this.emit('accordion-item-open-change');
  }

  /** Returns the template for the open/close indicator. */
  protected iconTemplate() {
    return html`
      <span class="icon" part="accordion-item-icon">
        <slot name="${this.open ? 'collapse-icon' : 'expand-icon'}">
          <${this.scope.tag('icon')}
            class=${classMap({
              chevron: true,
              'chevron-rtl': this.dir === 'rtl',
            })}
            part="accordion-item-chevron"
            name="chevron-down"
          ></${this.scope.tag('icon')}>
        </slot>
      </span>
  `;
  }

  /** Returns the template for the header.*/
  protected headerTemplate() {
    if (!this.headingLevel) {
      return html`<slot name="heading">${this.heading}</slot>`;
    }

    const headingTag = unsafeStatic(`h${this.headingLevel}`);
    return html`<${headingTag}>
      <slot name="heading">${this.heading}</slot>
    </${headingTag}>`;
  }

  /** Returns the template for the summary. */
  protected summaryTemplate() {
    return html`
      <summary class="summary" part="accordion-item-summary" role="button" @click=${this.handleSummaryClick}>
        ${this.iconTemplate()} ${startTemplate('accordion-item-start')} ${this.headerTemplate()}
        ${endTemplate('accordion-item-end')}
      </summary>
    `;
  }

  /** Returns the template for the details. */
  protected detailsTemplate() {
    return html`
      <details class="base" part="accordion-item-base" ?open=${this.open} @toggle=${this.handleToggle}>
        ${this.summaryTemplate()}
        <slot></slot>
      </details>
    `;
  }

  protected override render() {
    return this.detailsTemplate();
  }
}

export default CoreAccordionItem;
