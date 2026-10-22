import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { CharmElement } from '../../base/index.js';
import { CoreIcon } from '../icon/icon.js';
import { CoreOptionGroup } from '../option-group/option-group.js';
import styles from './option.styles.js';

/**
 * An option represents a single choice within a combobox or option group. Options are slotted into the combobox's
 * listbox and render themselves. The parent combobox manages `selected`, `current`, and `hidden`.
 *
 * @tag ch-option
 * @since 0.6.0
 * @status beta
 *
 * @slot - The option's label. Supports rich content such as text and inline markup.
 * @slot start - Decorative content placed before the label, such as an icon.
 * @slot end - Decorative content placed after the label, such as an icon.
 *
 * @csspart base - The option row.
 * @csspart start - Container for the start content.
 * @csspart label - The option's label.
 * @csspart end - Container for the end content.
 * @csspart check - The checkmark shown for selected options.
 *
 * @cssprop --charm-combobox-option-active-bg-color - The background color of the active option.
 * @cssprop --charm-combobox-option-bg-color - The background color of an option.
 * @cssprop --charm-combobox-option-border-radius - The border radius of an option.
 * @cssprop --charm-combobox-option-check-color - The color of the selected option checkmark.
 * @cssprop --charm-combobox-option-check-size - The size of the selected option checkmark.
 * @cssprop --charm-combobox-option-disabled-fg-color - The foreground color of a disabled option.
 * @cssprop --charm-combobox-option-fg-color - The foreground color of an option.
 * @cssprop --charm-combobox-option-hover-bg-color - The background color of a hovered option.
 * @cssprop --charm-combobox-option-padding-x - The inline padding within an option.
 * @cssprop --charm-combobox-option-padding-y - The block padding within an option.
 * @cssprop --charm-combobox-option-selected-bg-color - The background color of a selected option.
 *
 * @dependency CoreIcon
 */
export class CoreOption extends CharmElement {
  public static override styles = [...super.styles, styles];
  public static override baseName = 'option';

  /** The value submitted with the form when this option is selected. Defaults to the option's text content. */
  @property({ reflect: true })
  public value?: string;

  /** A plain-text label used for filtering, typeahead, and selected-value display. Defaults to the text content. */
  @property({ reflect: true })
  public label?: string;

  /** Disables the option so it cannot be selected or focused. */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  /** Indicates that the option is selected. Managed by the parent combobox. */
  @property({ type: Boolean, reflect: true })
  public selected = false;

  /** Indicates that the option is the active option of the parent combobox. Managed by the parent combobox. */
  @property({ type: Boolean, reflect: true })
  public current = false;

  @state() protected hasStart = false;

  @state() protected hasEnd = false;

  public static override get dependencies(): (typeof CharmElement)[] {
    return [CoreIcon];
  }

  /** The option's text content, used as a fallback label. Excludes the `start` and `end` slotted content. */
  public get textLabel(): string {
    return Array.from(this.childNodes)
      .filter(node => !(node instanceof Element && node.hasAttribute('slot')))
      .map(node => node.textContent ?? '')
      .join('')
      .trim();
  }

  /** The value used by the parent component, falling back to the label when no value is set. */
  public get resolvedValue(): string {
    return this.value ?? this.label ?? this.textLabel;
  }

  /** Whether the option is disabled directly or through its option group. */
  protected get isDisabled(): boolean {
    return this.disabled || (this.parentElement instanceof CoreOptionGroup && this.parentElement.disabled);
  }

  public override connectedCallback() {
    super.connectedCallback();
    if (!this.hasAttribute('role')) this.setAttribute('role', 'option');
    this.handleSlotChange();
  }

  protected override updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);
    if (
      changedProperties.size === 0 ||
      changedProperties.has('disabled') ||
      changedProperties.has('selected') ||
      changedProperties.has('current')
    ) {
      this.setAttribute('aria-selected', String(this.selected));
      this.setAttribute('aria-disabled', String(this.isDisabled));
    }
  }

  /** Tracks whether the start and end slots have content, so empty slots take no space. */
  protected handleSlotChange() {
    this.hasStart = this.querySelector(':scope > [slot="start"]') !== null;
    this.hasEnd = this.querySelector(':scope > [slot="end"]') !== null;
  }

  protected override render() {
    return this.html`
      <span class="option-base" part="base">
        <span class=${classMap({ 'option-start': true, 'has-content': this.hasStart })} part="start">
          <slot name="start" @slotchange=${this.handleSlotChange}></slot>
        </span>
        <span class="option-label" part="label"><slot></slot></span>
        <span class=${classMap({ 'option-end': true, 'has-content': this.hasEnd })} part="end">
          <slot name="end" @slotchange=${this.handleSlotChange}></slot>
        </span>
        ${
          this.selected ? this.html`<scoped-icon class="option-check" part="check" name="checkmark"></scoped-icon>` : ''
        }
      </span>
    `;
  }
}

export default CoreOption;
