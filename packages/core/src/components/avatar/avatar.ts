import { html } from 'lit/static-html.js';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { HasSlotController } from '../../controller/index.js';
import CharmElement from '../../base/charm-element/charm-element.js';
import styles from './avatar.styles.js';

/**
 * Used to represent a person or an object.
 *
 * @tag ch-avatar
 * @since 1.0.0
 * @status beta
 *
 * @slot - Utilized for specifying the default element, typically an icon.
 * @slot image - Utilized for specifying a custom image to be used as the avatar.
 * @slot status-indicator - Provides an indicator on the avatar, commonly using a badge or an icon element. This component should have a `label` provided for assistive technologies.
 *
 * @csspart avatar-base - A wrapper for the entire avatar.
 * @csspart avatar-background - A wrapper around the default slot and image.
 * @csspart avatar-image - The image tag for the avatar.
 * @csspart avatar-status-container - A wrapper for the status indicator.
 * @csspart avatar-initials - A wrapper for the user initials.
 *
 * @cssproperty --avatar-bg-color - determine the background color.
 * @cssproperty --avatar-size - determine the avatar size.
 * @cssproperty --avatar-border-radius - determine a round or square shape of the avatar.
 * @cssproperty --avatar-indicator-bg-color - determine the background color of the status indicator.
 * @cssproperty --avatar-indicator-border-width - determine the border width of the status indicator.
 * @cssproperty --avatar-indicator-border-color - determine the border color of the status indicator.
 * @cssproperty --avatar-indicator-border-radius - determine the border radius of the status indicator.
 * @cssproperty --avatar-indicator-color - determine the color of the status indicator.
 * @cssproperty --avatar-indicator-size - determine the size of the status indicator.
 * @cssproperty --avatar-indicator-padding - determine the padding of the status indicator.
 **/

export class CoreAvatar extends CharmElement {
  public static override styles = [...super.styles, styles];
  public static override baseName = 'avatar';

  /** The alt text for the avatar. */
  @property({ reflect: true }) public label?: string;

  /** The initials of the represented user. */
  @property({ reflect: true }) public initials?: string;

  /** The image URL for the user's avatar. */
  @property({ reflect: true }) public image?: string;

  protected readonly hasSlotController = new HasSlotController(this, 'status-indicator', 'image');

  protected statusIndicatorSlotName = 'status-indicator';

  /** Generates the template for the avatar's background. The slot image is used to provide custom image content that will override the image property. */
  protected backgroundTemplate() {
    const hasImageSlot = this.hasSlotController.hasNamedSlot('image');
    return html`
      <div class="background" part="avatar-background">
        ${!hasImageSlot
          ? html`
              <div
                class="initials"
                part="avatar-initials"
                role=${ifDefined(this.label ? 'img' : undefined)}
                aria-label=${ifDefined(this.label)}
              >
                ${this.initials}
              </div>
            `
          : ''}
        ${hasImageSlot
          ? html`<slot name="image"></slot>`
          : this.image
            ? html`<img class="image" part="avatar-image" src=${this.image} alt=${ifDefined(this.label || '')} />`
            : ''}
        ${!hasImageSlot && !this.image && !this.initials ? html`<slot></slot>` : ''}
      </div>
    `;
  }

  protected statusIndicatorSlotTemplate() {
    return html`<slot name=${this.statusIndicatorSlotName}></slot>`;
  }

  /** Generates a template for the status indicator. */
  protected statusIndicatorTemplate() {
    return html`
      <div
        class="status-container"
        part="avatar-status-container"
        ?hidden=${!this.hasSlotController.hasNamedSlot('status-indicator')}
      >
        ${this.statusIndicatorSlotTemplate()}
      </div>
    `;
  }

  /** Generates the complete template for the avatar component. */
  protected avatarTemplate() {
    return html`
      <div class="base" part="avatar-base">${this.backgroundTemplate()} ${this.statusIndicatorTemplate()}</div>
    `;
  }

  protected override render() {
    return this.avatarTemplate();
  }
}

export default CoreAvatar;
