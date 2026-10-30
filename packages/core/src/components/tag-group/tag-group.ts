import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import CharmElement from '../../base/charm-element/charm-element.js';
import { keys } from '../../utilities/key-map.js';
import CoreTag from '../tag/tag.js';
import styles from './tag-group.styles.js';
import type { PropertyValues } from 'lit';

/** Detail of the `change` event. */
export interface TagGroupChangeEvent {
  /** The selected values serialized with the group's delimiter. */
  value: string;
  /** The selected values as an array. */
  valueAsArray: string[];
}

export type TagGroupSelection = 'none' | 'single' | 'multiple';

const MANAGED_ATTRIBUTES = ['role', 'aria-selected', 'tabindex'] as const;
const TYPEAHEAD_RESET_MS = 700;

/**
 * A tag group presents a set of related tags as a list, with a single tab stop, arrow-key navigation, optional
 * selection, and focus management when tags are removed. Tags are authored as `<ch-tag>` children. The group never
 * removes tags itself; listen for `tag-remove` (which bubbles from the tag) and remove the element from your code.
 *
 * With `selection="none"` the group is a plain list. With `selection="single"` or `selection="multiple"` it becomes
 * a listbox whose options are the tags, following the WAI-ARIA keyboard guidance for a horizontal, flat collection:
 * Arrow keys move focus, Home/End jump to the ends, typing jumps to a matching tag, and Space (or Enter) toggles
 * selection.
 *
 * @tag ch-tag-group
 * @since 1.0.0
 * @status beta
 *
 * @dependency CoreTag
 *
 * @slot - The tags.
 * @slot label - The group's accessible name. Alternatively, use the `label` property.
 * @slot help-text - A description of the group. Alternatively, use the `help-text` property.
 * @slot empty - Content shown when the group contains no tags.
 *
 * @event {TagGroupChangeEvent} change - Emitted when the user changes the selection.
 *
 * @csspart tag-group-base - The component's base wrapper.
 * @csspart tag-group-label - The label container.
 * @csspart tag-group-help-text - The help text container.
 * @csspart tag-group-list - The list element that wraps the tags.
 * @csspart tag-group-empty - The empty state container.
 *
 * @cssprop --charm-tag-group-gap - The gap between tags.
 * @cssprop --charm-tag-group-label-gap - The gap between the label, help text, and list.
 * @cssprop --charm-tag-group-label-color - The label color.
 * @cssprop --charm-tag-group-label-font-size - The label font size.
 * @cssprop --charm-tag-group-label-font-weight - The label font weight.
 * @cssprop --charm-tag-group-help-text-color - The help text color.
 * @cssprop --charm-tag-group-help-text-font-size - The help text font size.
 * @cssprop --charm-tag-group-empty-color - The empty state text color.
 **/
export class CoreTagGroup extends CharmElement {
  public static override styles = [...super.styles, styles];
  public static override baseName = 'tag-group';
  public static override watchedSlots = ['label', 'help-text', 'empty'];

  /** The group's accessible name. If you need to display HTML, use the `label` slot instead. */
  @property()
  public label?: string;

  /** A description of the group. If you need to display HTML, use the `help-text` slot instead. */
  @property({ attribute: 'help-text' })
  public helpText?: string;

  /** Hides the label and help text visually while keeping them available to assistive technology. */
  @property({ type: Boolean, attribute: 'hide-label', reflect: true })
  public hideLabel = false;

  /** Whether tags can be selected, and how many at a time. */
  @property({ reflect: true })
  public selection: TagGroupSelection = 'none';

  /** Disables the group and every tag in it, without changing the tags' own `disabled` state. */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  /** The delimiter used to parse and serialize `value`. Defaults to a comma. */
  @property({ attribute: 'value-delimiter' })
  public valueDelimiter = ',';

  @query('slot:not([name])')
  protected defaultSlot?: HTMLSlotElement;

  @state()
  protected tagCount = 0;

  protected tags: CoreTag[] = [];
  protected focusedIndex = -1;
  protected pendingFocusIndex = -1;
  protected pendingValueAsArray?: string[];
  protected typeahead = '';
  protected typeaheadTimer?: number;
  protected managedAttributes = new WeakMap<CoreTag, Map<string, string | null>>();

  /** The values of the selected tags as an array. A tag's value is its `value` property, or its text content. */
  @property({ attribute: false })
  public get valueAsArray(): string[] {
    if (this.pendingValueAsArray) return [...this.pendingValueAsArray];
    return this.tags.filter(tag => tag.selected).map(tag => this.getTagValue(tag));
  }

  public set valueAsArray(values: string[]) {
    const next = [...new Set(values.map(value => value.trim()).filter(Boolean))];
    this.pendingValueAsArray = next;
    this.requestUpdate('valueAsArray');
  }

  /** The selected values serialized with `valueDelimiter`. */
  @property()
  public get value(): string {
    return this.valueAsArray.join(this.valueDelimiter);
  }

  public set value(value: string) {
    this.valueAsArray = value ? value.split(this.valueDelimiter) : [];
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.addEventListener('keydown', this.handleKeyDown);
    this.addEventListener('click', this.handleClick);
    this.addEventListener('focusin', this.handleFocusIn);
    this.addEventListener('tag-remove', this.handleTagRemove);
  }

  public override disconnectedCallback() {
    super.disconnectedCallback();
    this.clearTypeahead();
    this.removeEventListener('keydown', this.handleKeyDown);
    this.removeEventListener('click', this.handleClick);
    this.removeEventListener('focusin', this.handleFocusIn);
    this.removeEventListener('tag-remove', this.handleTagRemove);
    this.tags.forEach(tag => this.releaseTag(tag));
    this.tags = [];
  }

  /** Moves focus to the active tag, or the first enabled tag. */
  public override focus(options?: FocusOptions) {
    const index = this.isTagEnabled(this.tags[this.focusedIndex]) ? this.focusedIndex : this.firstEnabledIndex();
    if (index === -1) return;
    this.setFocusedIndex(index);
    this.tags[index].focus(options);
  }

  protected override willUpdate(changedProperties: PropertyValues<this>) {
    super.willUpdate(changedProperties);
    if (changedProperties.has('selection') && this.selection === 'none') {
      this.tags.forEach(tag => (tag.selected = false));
    }
    if (changedProperties.has('selection') && this.selection === 'single') {
      let found = false;
      this.tags.forEach(tag => {
        if (tag.selected && found) tag.selected = false;
        if (tag.selected) found = true;
      });
    }
    if (this.pendingValueAsArray) {
      const values = this.pendingValueAsArray;
      this.pendingValueAsArray = undefined;
      this.applyValues(values);
    }
    if (changedProperties.has('selection') || changedProperties.has('disabled')) {
      this.syncTags();
    }
  }

  protected get isSelectable(): boolean {
    return this.selection !== 'none';
  }

  protected get hasLabel(): boolean {
    return !!this.label || this.hasNamedSlot('label');
  }

  protected get hasHelpText(): boolean {
    return !!this.helpText || this.hasNamedSlot('help-text');
  }

  protected getTagValue(tag: CoreTag): string {
    return tag.value ?? tag.textContent?.trim() ?? '';
  }

  protected getTagLabel(tag: CoreTag): string {
    return tag.textContent?.trim() ?? '';
  }

  protected isTagEnabled(tag?: CoreTag): tag is CoreTag {
    return !!tag && !this.disabled && !tag.disabled;
  }

  protected firstEnabledIndex(): number {
    return this.tags.findIndex(tag => this.isTagEnabled(tag));
  }

  protected lastEnabledIndex(): number {
    for (let index = this.tags.length - 1; index >= 0; index--) {
      if (this.isTagEnabled(this.tags[index])) return index;
    }
    return -1;
  }

  /** Finds the next enabled tag in a direction without wrapping. */
  protected nextEnabledIndex(start: number, direction: 1 | -1): number {
    for (let index = start + direction; index >= 0 && index < this.tags.length; index += direction) {
      if (this.isTagEnabled(this.tags[index])) return index;
    }
    return -1;
  }

  protected getSlottedTags(): CoreTag[] {
    const elements = this.defaultSlot?.assignedElements({ flatten: true }) ?? [...this.children];
    return elements.filter((element): element is CoreTag => element instanceof CoreTag);
  }

  /** Applies a set of selected values to the tags, honoring the selection mode. */
  protected applyValues(values: string[]) {
    if (!this.isSelectable) return;
    let remaining = this.selection === 'single' ? values.slice(0, 1) : values;
    this.tags.forEach(tag => {
      const value = this.getTagValue(tag);
      const selected = remaining.includes(value);
      tag.selected = selected;
      if (selected && this.selection === 'single') remaining = [];
    });
  }

  /** Reconciles the slotted tags with the group: roles, selection ARIA, roving tabindex, and forced disabled state. */
  protected syncTags() {
    const next = this.getSlottedTags();
    this.tags.filter(tag => !next.includes(tag)).forEach(tag => this.releaseTag(tag));
    this.tags = next;
    this.tagCount = next.length;

    if (!this.isTagEnabled(this.tags[this.focusedIndex])) {
      const selectedIndex = this.tags.findIndex(tag => this.isTagEnabled(tag) && tag.selected);
      this.focusedIndex = selectedIndex >= 0 ? selectedIndex : this.firstEnabledIndex();
    }

    this.tags.forEach((tag, index) => {
      this.rememberAttributes(tag);
      tag.managedFocus = true;
      tag.forceDisabled = this.disabled;
      tag.setAttribute('role', this.isSelectable ? 'option' : 'listitem');
      if (this.isSelectable) tag.setAttribute('aria-selected', String(tag.selected));
      else tag.removeAttribute('aria-selected');
      tag.setAttribute('tabindex', index === this.focusedIndex && this.isTagEnabled(tag) ? '0' : '-1');
    });
  }

  protected rememberAttributes(tag: CoreTag) {
    if (this.managedAttributes.has(tag)) return;
    this.managedAttributes.set(tag, new Map(MANAGED_ATTRIBUTES.map(name => [name, tag.getAttribute(name)])));
  }

  /** Restores a tag's original attributes and state when it leaves the group. */
  protected releaseTag(tag: CoreTag) {
    const attributes = this.managedAttributes.get(tag);
    if (attributes) {
      attributes.forEach((value, name) => {
        if (value === null) tag.removeAttribute(name);
        else tag.setAttribute(name, value);
      });
      this.managedAttributes.delete(tag);
    }
    tag.managedFocus = false;
    tag.forceDisabled = false;
  }

  protected setFocusedIndex(index: number) {
    if (index === this.focusedIndex || !this.isTagEnabled(this.tags[index])) return;
    const previous = this.tags[this.focusedIndex];
    if (previous) previous.setAttribute('tabindex', '-1');
    this.focusedIndex = index;
    this.tags[index].setAttribute('tabindex', '0');
  }

  protected moveFocus(index: number) {
    if (index === -1) return;
    this.setFocusedIndex(index);
    this.tags[index].focus();
  }

  /** Toggles a tag's selection and emits `change` when the selection actually changed. */
  protected toggleSelection(tag: CoreTag) {
    if (!this.isSelectable || !this.isTagEnabled(tag)) return;
    const before = this.valueAsArray;
    if (this.selection === 'single') {
      const next = !tag.selected;
      this.tags.forEach(other => (other.selected = other === tag ? next : false));
    } else {
      tag.selected = !tag.selected;
    }
    this.tags.forEach(other => other.setAttribute('aria-selected', String(other.selected)));
    const after = this.valueAsArray;
    if (before.length === after.length && before.every((value, index) => value === after[index])) return;
    this.emitChange({ value: after.join(this.valueDelimiter), valueAsArray: after });
  }

  protected selectAll() {
    if (this.selection !== 'multiple') return;
    const before = this.valueAsArray;
    this.tags.forEach(tag => {
      if (this.isTagEnabled(tag)) tag.selected = true;
      tag.setAttribute('aria-selected', String(tag.selected));
    });
    const after = this.valueAsArray;
    if (before.length === after.length) return;
    this.emitChange({ value: after.join(this.valueDelimiter), valueAsArray: after });
  }

  protected emitChange(detail: TagGroupChangeEvent) {
    this.emit('change', { detail });
  }

  protected handleKeyDown = (event: KeyboardEvent) => {
    if (event.defaultPrevented || this.disabled || !this.tags.length) return;
    const rtl = this.resolvedDir === 'rtl';
    let nextIndex = -1;

    switch (event.key) {
      case keys.ArrowRight:
        nextIndex = this.nextEnabledIndex(this.focusedIndex, rtl ? -1 : 1);
        break;
      case keys.ArrowLeft:
        nextIndex = this.nextEnabledIndex(this.focusedIndex, rtl ? 1 : -1);
        break;
      case keys.ArrowDown:
        nextIndex = this.nextEnabledIndex(this.focusedIndex, 1);
        break;
      case keys.ArrowUp:
        nextIndex = this.nextEnabledIndex(this.focusedIndex, -1);
        break;
      case keys.Home:
        nextIndex = this.firstEnabledIndex();
        break;
      case keys.End:
        nextIndex = this.lastEnabledIndex();
        break;
      case keys.Space:
      case keys.Enter:
        if (!this.isSelectable) return;
        event.preventDefault();
        this.toggleSelection(this.tags[this.focusedIndex]);
        return;
      default:
        if (event.key === 'a' && (event.ctrlKey || event.metaKey) && this.selection === 'multiple') {
          event.preventDefault();
          this.selectAll();
          return;
        }
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          event.preventDefault();
          this.handleTypeahead(event.key);
        }
        return;
    }

    event.preventDefault();
    this.moveFocus(nextIndex);
  };

  protected handleTypeahead(character: string) {
    this.clearTypeahead(false);
    const search = `${this.typeahead}${character}`.toLocaleLowerCase();
    let index = this.findTypeaheadMatch(search);
    if (index === -1 && this.typeahead) {
      // A new prefix: restart the search from the typed character.
      index = this.findTypeaheadMatch(character.toLocaleLowerCase());
      this.typeahead = character.toLocaleLowerCase();
    } else {
      this.typeahead = search;
    }
    if (index !== -1) this.moveFocus(index);
    this.typeaheadTimer = window.setTimeout(() => this.clearTypeahead(), TYPEAHEAD_RESET_MS);
  }

  protected findTypeaheadMatch(prefix: string): number {
    const count = this.tags.length;
    // When repeating a single character, step past the current tag so the same key cycles through matches.
    const start = this.focusedIndex < 0 ? -1 : this.focusedIndex;
    const skipCurrent = prefix.length === 1;
    for (let offset = skipCurrent ? 1 : 0; offset <= count; offset++) {
      const index = (start + offset + count) % count;
      const tag = this.tags[index];
      if (this.isTagEnabled(tag) && this.getTagLabel(tag).toLocaleLowerCase().startsWith(prefix)) return index;
    }
    return -1;
  }

  protected clearTypeahead(resetBuffer = true) {
    if (this.typeaheadTimer !== undefined) {
      window.clearTimeout(this.typeaheadTimer);
      this.typeaheadTimer = undefined;
    }
    if (resetBuffer) this.typeahead = '';
  }

  protected handleClick = (event: MouseEvent) => {
    const tag = event.composedPath().find((node): node is CoreTag => node instanceof CoreTag);
    if (!tag || !this.tags.includes(tag) || !this.isTagEnabled(tag)) return;
    this.setFocusedIndex(this.tags.indexOf(tag));
    this.toggleSelection(tag);
  };

  /** Keeps the roving tabindex in sync when focus arrives by click, Tab, or script. */
  protected handleFocusIn = (event: FocusEvent) => {
    const tag = event.composedPath().find((node): node is CoreTag => node instanceof CoreTag);
    if (!tag) return;
    const index = this.tags.indexOf(tag);
    if (index !== -1) this.setFocusedIndex(index);
  };

  /** Records which tag asked to be removed so focus can move to its neighbour once it leaves the DOM. */
  protected handleTagRemove = (event: Event) => {
    const tag = event.target;
    if (!(tag instanceof CoreTag)) return;
    this.pendingFocusIndex = this.tags.indexOf(tag);
  };

  protected handleSlotChange() {
    const removedFocusTarget = this.pendingFocusIndex >= 0 ? this.tags[this.pendingFocusIndex] : undefined;
    const pendingIndex = this.pendingFocusIndex;
    this.pendingFocusIndex = -1;
    this.syncTags();

    // The removed tag was the one that requested removal: move focus to the tag that took its place, else the
    // previous one. If no tags remain, focus is left where the browser put it.
    if (removedFocusTarget && !this.tags.includes(removedFocusTarget) && this.tags.length) {
      const next =
        this.nextEnabledIndex(pendingIndex - 1, 1) !== -1
          ? this.nextEnabledIndex(pendingIndex - 1, 1)
          : this.nextEnabledIndex(pendingIndex, -1);
      this.moveFocus(next);
    }
  }

  protected labelTemplate() {
    return this.html`
      <span
        class=${classMap({ label: true, 'visually-hidden': this.hideLabel })}
        id="label"
        part="tag-group-label"
        ?hidden=${!this.hasLabel}
      >
        <slot name="label">${this.label}</slot>
      </span>
    `;
  }

  protected helpTextTemplate() {
    return this.html`
      <span
        class=${classMap({ 'help-text': true, 'visually-hidden': this.hideLabel })}
        id="help-text"
        part="tag-group-help-text"
        ?hidden=${!this.hasHelpText}
      >
        <slot name="help-text">${this.helpText}</slot>
      </span>
    `;
  }

  protected listTemplate() {
    return this.html`
      <ul
        aria-describedby=${ifDefined(this.hasHelpText ? 'help-text' : undefined)}
        aria-disabled=${ifDefined(this.disabled ? 'true' : undefined)}
        aria-labelledby=${ifDefined(this.hasLabel ? 'label' : undefined)}
        aria-multiselectable=${ifDefined(this.selection === 'multiple' ? 'true' : undefined)}
        aria-orientation=${ifDefined(this.isSelectable ? 'horizontal' : undefined)}
        class="list"
        part="tag-group-list"
        role=${this.isSelectable ? 'listbox' : 'list'}
        ?hidden=${!this.tagCount}
      >
        <slot @slotchange=${this.handleSlotChange}></slot>
      </ul>
    `;
  }

  protected emptyTemplate() {
    return this.html`
      <div class="empty" part="tag-group-empty" ?hidden=${this.tagCount > 0}>
        <slot name="empty"></slot>
      </div>
    `;
  }

  protected tagGroupTemplate() {
    return this.html`
      <div class="base" part="tag-group-base">
        ${this.labelTemplate()} ${this.helpTextTemplate()} ${this.listTemplate()} ${this.emptyTemplate()}
      </div>
    `;
  }

  protected override render() {
    return this.tagGroupTemplate();
  }
}

export default CoreTagGroup;
