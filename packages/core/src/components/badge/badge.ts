import { html } from 'lit/static-html.js';
import CharmElement from '../../base/charm-element/charm-element.js';
import { endTemplate, startTemplate } from '../../templates/index.js';
import styles from './badge.styles.js';

/**
 * A badge is a small component typically used in user interfaces to convey additional information or status in a compact visual form.
 *
 * @tag ch-badge
 * @since 1.0.0
 * @status beta
 *
 * @slot - The content of the badge.
 * @slot start - Content rendered before the badge content.
 * @slot end - Content rendered after the badge content.
 *
 * @csspart badge-base - The component's base wrapper.
 * @csspart badge-start - The start slot container.
 * @csspart badge-end - The end slot container.
 *
 * @cssprop --charm-badge-bg-color - determines the background color.
 * @cssprop --charm-badge-border-color - determines the border color.
 * @cssprop --charm-badge-border-radius - override css property `--badge-shape` if customs are needed.
 * @cssprop --charm-badge-border-style - determines border style.
 * @cssprop --charm-badge-border-width - determines the border.
 * @cssprop --charm-badge-fg-color - determines the color of the text.
 * @cssprop --charm-badge-gap - determines the space between the start slot, content, and end slot.
 * @cssprop --charm-badge-padding - determines the padding.
 * @cssprop --charm-badge-size - used to size the badge in relation to the font.
 **/
export class CoreBadge extends CharmElement {
  public static override styles = [...super.styles, styles];
  public static override baseName = 'badge';

  /** Generates the HTML template for badge. */
  protected badgeTemplate() {
    return html`
      <div class="base" part="badge-base">
        ${startTemplate('badge-start')}
        <slot></slot>
        ${endTemplate('badge-end')}
      </div>
    `;
  }

  protected override render() {
    return this.badgeTemplate();
  }
}

export default CoreBadge;
