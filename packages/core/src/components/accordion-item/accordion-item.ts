import { unsafeStatic } from 'lit/static-html.js';
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
 * @event accordion-item-show - Emitted when the accordion item begins to show.
 * @event accordion-item-after-show - Emitted after the accordion item has shown and all animations are complete.
 * @event accordion-item-hide - Emitted when the accordion item begins to hide.
 * @event accordion-item-after-hide - Emitted after the accordion item has hidden and all animations are complete.
 *
 * @csspart accordion-item-base - The wrapper element.
 * @csspart accordion-item-summary - The summary element.
 * @csspart accordion-item-icon - The wrapper element for the expand/collapse icon.
 * @csspart accordion-item-chevron - The expand/collapse icon.
 * @csspart accordion-item-heading - The heading element.
 * @csspart accordion-item-start - The start slot container.
 * @csspart accordion-item-end - The end slot container.
 *
 * @cssprop --charm-accordion-item-animation-duration - The duration of the accordion item animation.
 * @cssprop --charm-accordion-item-animation-timing-function - The timing function of the accordion item animation.
 * @cssprop --charm-accordion-item-show-transition - The transition applied to the content when the item opens.
 * @cssprop --charm-accordion-item-hide-transition - The transition applied to the content when the item closes.
 * @cssprop --charm-accordion-item-bg-color - Sets background color.
 * @cssprop --charm-accordion-item-border-color - Sets border color.
 * @cssprop --charm-accordion-item-border-width - Sets border width.
 * @cssprop --charm-accordion-item-disabled-bg-color - Sets background color of accordion-item when disabled.
 * @cssprop --charm-accordion-item-disabled-border-color - Sets border color of accordion-item when disabled.
 * @cssprop --charm-accordion-item-disabled-fg-color - Sets foreground color of accordion-item when disabled.
 * @cssprop --charm-accordion-item-fg-color - Sets foreground color.
 * @cssprop --charm-accordion-item-hover-bg-color - Sets background color of accordion-item when hovered.
 * @cssprop --charm-accordion-item-hover-border-color - Sets border color of accordion-item when hovered.
 * @cssprop --charm-accordion-item-hover-fg-color - Sets foreground color of accordion-item when hovered.
 * @cssprop --charm-accordion-item-icon-collapsed-transform - Sets the transform for the orientation of the icon when collapsed.
 * @cssprop --charm-accordion-item-icon-expanded-transform - Sets the transform for the orientation of the icon when expanded.
 * @cssprop --charm-accordion-item-icon-transition - The transition for the icon when the state changes.
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
   * Handles the `details` element toggle event. Keeps `open` and the native element's open state in
   * sync; the base class emits the standardized `show` / `hide` / `after-show` / `after-hide` events.
   * @param event
   */
  protected handleToggle(event: Event) {
    this.open = (event.target as HTMLDetailsElement).open;
  }

  /** Returns the template for the open/close indicator. */
  protected iconTemplate() {
    return this.html`
      <span class="icon" part="accordion-item-icon">
        <slot name="${this.open ? 'collapse-icon' : 'expand-icon'}">
          <scoped-icon
            class=${classMap({
              chevron: true,
              'chevron-rtl': this.dir === 'rtl',
            })}
            part="accordion-item-chevron"
            name="chevron-down"
          ></scoped-icon>
        </slot>
      </span>
  `;
  }

  /** Returns the template for the header.*/
  protected headerTemplate() {
    if (!this.headingLevel) {
      return this.html`<slot name="heading">${this.heading}</slot>`;
    }

    const headingTag = unsafeStatic(`h${this.headingLevel}`);
    return this.html`<${headingTag}>
      <slot name="heading">${this.heading}</slot>
    </${headingTag}>`;
  }

  /** Returns the template for the summary. */
  protected summaryTemplate() {
    return this.html`
      <summary class="summary" part="accordion-item-summary" role="button" @click=${this.handleSummaryClick}>
        ${this.iconTemplate()} ${startTemplate('accordion-item-start')} ${this.headerTemplate()}
        ${endTemplate('accordion-item-end')}
      </summary>
    `;
  }

  /** Returns the template for the details. */
  protected detailsTemplate() {
    return this.html`
      <details
        class="base"
        part="accordion-item-base"
        ?open=${this.open}
        @toggle=${this.handleToggle}
        @transitionend=${this.handleTransitionEnd}
      >
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
