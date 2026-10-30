import { nothing } from 'lit';
import { property } from 'lit/decorators.js';
import { CharmElement, CharmFocusableElement } from '../../base/index.js';
import { endTemplate, startTemplate } from '../../templates/index.js';
import { keys } from '../../utilities/key-map.js';
import CoreIcon from '../icon/icon.js';
import styles from './tag.styles.js';
import type { PropertyValues } from 'lit';

/** Detail of the `tag-remove` event. */
export interface TagRemoveEvent {
  /** The tag's `value`, when one is set. */
  value?: string;
}

/**
 * A tag is a compact, keyboard-accessible label used to represent a category, keyword, filter, or selected item. Tags
 * can optionally be removed by the user. A tag does not remove itself from the DOM; listen for `tag-remove` and remove
 * (or veto) it from the consuming code. Tags are designed to be composed inside a tag group, which manages roles,
 * selection, and keyboard navigation between tags.
 *
 * @tag ch-tag
 * @since 1.0.0
 * @status beta
 *
 * @dependency CoreIcon
 *
 * @slot - The content of the tag.
 * @slot start - Content rendered before the tag content.
 * @slot end - Content rendered after the tag content.
 * @slot remove-label - Visually hidden text that names the remove button. Defaults to "Remove"; supply translated text here.
 *
 * @event {TagRemoveEvent} tag-remove - Emitted when the user requests removal of the tag via the remove button, Delete, or Backspace. Cancelable.
 *
 * @csspart tag-base - The component's base wrapper.
 * @csspart tag-start - The start slot container.
 * @csspart tag-content - The default slot container.
 * @csspart tag-end - The end slot container.
 * @csspart tag-remove - The remove button.
 * @csspart tag-remove-icon - The icon inside the remove button.
 *
 * @cssprop --charm-tag-bg-color - The background color.
 * @cssprop --charm-tag-fg-color - The foreground (text) color.
 * @cssprop --charm-tag-border-color - The border color.
 * @cssprop --charm-tag-border-radius - The border radius.
 * @cssprop --charm-tag-border-style - The border style.
 * @cssprop --charm-tag-border-width - The border width.
 * @cssprop --charm-tag-font-size - The font size.
 * @cssprop --charm-tag-gap - The space between the start slot, content, end slot, and remove button.
 * @cssprop --charm-tag-padding-x - The inline padding.
 * @cssprop --charm-tag-padding-y - The block padding.
 * @cssprop --charm-tag-hover-bg-color - The background color when hovered.
 * @cssprop --charm-tag-selected-bg-color - The background color when selected.
 * @cssprop --charm-tag-selected-fg-color - The foreground color when selected.
 * @cssprop --charm-tag-selected-border-color - The border color when selected.
 * @cssprop --charm-tag-disabled-bg-color - The background color when disabled.
 * @cssprop --charm-tag-disabled-fg-color - The foreground color when disabled.
 * @cssprop --charm-tag-disabled-border-color - The border color when disabled.
 * @cssprop --charm-tag-remove-bg-color - The background color of the remove button.
 * @cssprop --charm-tag-remove-border-radius - The border radius of the remove button.
 * @cssprop --charm-tag-remove-icon-size - The size of the remove icon.
 * @cssprop --charm-tag-remove-padding - The padding of the remove button.
 * @cssprop --charm-tag-remove-hover-bg-color - The background color of the remove button when hovered.
 **/
export class CoreTag extends CharmFocusableElement {
  public static override styles = [...super.styles, styles];
  public static override baseName = 'tag';

  public static override get dependencies(): (typeof CharmElement)[] {
    return [CoreIcon];
  }

  /** An identifier for the tag. Included in the `tag-remove` event detail. */
  @property()
  public value?: string;

  /** Disables the tag. A disabled tag cannot be removed. */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  /** Renders a remove button and enables removal with the Delete and Backspace keys. */
  @property({ type: Boolean, reflect: true })
  public removable = false;

  /** Draws the tag in a selected state. Selection semantics (ARIA) are managed by the containing tag group. */
  @property({ type: Boolean, reflect: true })
  public selected = false;

  protected override willUpdate(changedProperties: PropertyValues<this>) {
    super.willUpdate(changedProperties);
    if (changedProperties.has('disabled')) {
      if (this.disabled) this.setAttribute('aria-disabled', 'true');
      else this.removeAttribute('aria-disabled');
    }
  }

  /** Emits the cancelable `tag-remove` event. */
  protected emitRemove() {
    const detail: TagRemoveEvent = { value: this.value };
    return this.emit('tag-remove', { detail, cancelable: true });
  }

  /** Requests removal when the tag is removable and enabled. */
  protected requestRemove() {
    if (!this.removable || this.disabled) return;
    this.emitRemove();
  }

  protected handleRemoveClick(event: MouseEvent) {
    if (this.disabled) {
      event.preventDefault();
      return;
    }
    this.requestRemove();
  }

  /**
   * Delete and Backspace request removal. Keys are canceled synchronously so an enclosing group does not also act on
   * them. Arrow, Home, End, and Space navigation/selection are the containing group's responsibility.
   */
  protected handleKeyDown(event: KeyboardEvent) {
    if (!this.removable || this.disabled) return;
    if (event.key !== keys.Delete && event.key !== keys.Backspace) return;
    event.preventDefault();
    this.requestRemove();
  }

  /**
   * Generates the remove button. The button stays in the natural tab order so a standalone tag is operable; a tag
   * group sets `tabindex="-1"` on it and manages a roving tabindex on the tags themselves.
   */
  protected removeTemplate() {
    if (!this.removable) return nothing;
    return this.html`
      <button
        aria-labelledby="remove-label content"
        class="remove"
        ?disabled=${this.disabled}
        part="tag-remove"
        type="button"
        @click=${this.handleRemoveClick}
      >
        <scoped-icon class="remove-icon" name="dismiss" part="tag-remove-icon"></scoped-icon>
        <span class="visually-hidden" id="remove-label"><slot name="remove-label">Remove</slot></span>
      </button>
    `;
  }

  /** Generates the tag template. */
  protected tagTemplate() {
    return this.html`
      <div class="base" part="tag-base" @keydown=${this.handleKeyDown}>
        ${startTemplate('tag-start')}
        <span class="content" id="content" part="tag-content"><slot></slot></span>
        ${endTemplate('tag-end')}
        ${this.removeTemplate()}
      </div>
    `;
  }

  protected override render() {
    return this.tagTemplate();
  }
}

export default CoreTag;
