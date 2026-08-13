import { type PropertyValues, type TemplateResult } from 'lit';
import { property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { HasSlotController } from '../../controller/index.js';
import CharmElement from '../../base/charm-element/charm-element.js';
import CoreIcon from '../icon/icon.js';
import styles from './avatar.styles.js';

/**
 * Used to represent a person or an object.
 *
 * @tag ch-avatar
 * @since 1.0.0
 * @status beta
 *
 * @slot - Utilized for specifying the default element, typically an icon. When no image, initials, or
 * slot content is provided, a default person icon is rendered.
 * @slot image - Utilized for specifying a custom image to be used as the avatar.
 * @slot status-indicator - Provides an indicator on the avatar, commonly using a badge or an icon element. This component should have a `label` provided for assistive technologies.
 *
 * @event avatar-error - Emitted when the avatar's image fails to load. When this fires, the avatar
 * falls back to the initials or default icon.
 *
 * @csspart avatar-base - A wrapper for the entire avatar.
 * @csspart avatar-background - A wrapper around the default slot and image.
 * @csspart avatar-image - The image tag for the avatar.
 * @csspart avatar-icon - A wrapper for the default slot fallback when no image or initials are present.
 * @csspart avatar-initials - A wrapper for the user initials.
 * @csspart avatar-status-container - A wrapper for the status indicator.
 *
 * @cssprop --charm-avatar-bg-color - determine the background color.
 * @cssprop --charm-avatar-fg-color - determine the initials text color.
 * @cssprop --charm-avatar-size - determine the avatar size.
 * @cssprop --charm-avatar-border-radius - determine a round or square shape of the avatar.
 * @cssprop --charm-avatar-indicator-bg-color - determine the background color of the status indicator.
 * @cssprop --charm-avatar-indicator-border-width - determine the border width of the status indicator.
 * @cssprop --charm-avatar-indicator-border-color - determine the border color of the status indicator.
 * @cssprop --charm-avatar-indicator-border-radius - determine the border radius of the status indicator.
 * @cssprop --charm-avatar-indicator-fg-color - determine the color of the status indicator.
 * @cssprop --charm-avatar-indicator-size - determine the size of the status indicator.
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

  /** Indicates how the browser should load the avatar's image. */
  @property() public loading: 'eager' | 'lazy' = 'eager';

  @state() protected hasError = false;

  protected readonly hasSlotController = new HasSlotController(this, 'status-indicator', 'image');

  protected statusIndicatorSlotName = 'status-indicator';

  public static override get dependencies(): (typeof CharmElement)[] {
    return [CoreIcon];
  }

  /** Resets the image error state when a new image is provided, so the new source is retried. */
  protected override willUpdate(changed: PropertyValues<this>) {
    if (changed.has('image')) {
      this.hasError = false;
    }
  }

  /** Handles image load failures by falling back to the initials or default icon. */
  protected handleImageError() {
    this.hasError = true;
    this.emit('avatar-error');
  }

  /** Generates the template for the avatar's image. */
  protected imageTemplate() {
    return this.html`
      <img
        class="image"
        part="avatar-image"
        src=${this.image}
        alt=${ifDefined(this.label || '')}
        loading=${this.loading}
        @error=${this.handleImageError}
      />
    `;
  }

  /** Generates the template for the avatar's initials. */
  protected initialsTemplate() {
    return this.html`
      <div
        class="initials"
        part="avatar-initials"
        role=${ifDefined(this.label ? 'img' : undefined)}
        aria-label=${ifDefined(this.label)}
      >
        ${this.initials}
      </div>
    `;
  }

  /** Generates the fallback template used when no image or initials are present. */
  protected defaultSlotTemplate() {
    return this.html`
      <span
        class="default-slot"
        part="avatar-icon"
        role=${ifDefined(this.label ? 'img' : undefined)}
        aria-label=${ifDefined(this.label)}
      >
        <slot><scoped-icon name="person"></scoped-icon></slot>
      </span>
    `;
  }

  /** Generates the template for the avatar's background. */
  protected backgroundTemplate() {
    const hasImageSlot = this.hasSlotController.hasNamedSlot('image');

    let content: TemplateResult;
    if (hasImageSlot) {
      content = this.html`<slot name="image"></slot>`;
    } else if (this.image && !this.hasError) {
      content = this.imageTemplate();
    } else if (this.initials) {
      content = this.initialsTemplate();
    } else {
      content = this.defaultSlotTemplate();
    }

    return this.html`
      <div class="background" part="avatar-background">
        ${content}
      </div>
    `;
  }

  protected statusIndicatorSlotTemplate() {
    return this.html`<slot name=${this.statusIndicatorSlotName}></slot>`;
  }

  /** Generates a template for the status indicator. */
  protected statusIndicatorTemplate() {
    return this.html`
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
    return this.html`
      <div class="base" part="avatar-base">${this.backgroundTemplate()} ${this.statusIndicatorTemplate()}</div>
    `;
  }

  protected override render() {
    return this.avatarTemplate();
  }
}

export default CoreAvatar;
