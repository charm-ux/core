import { property } from 'lit/decorators.js';
import { CharmElement } from '../../base/index.js';
import { CoreOption } from '../option/option.js';
import styles from './option-group.styles.js';

let optionGroupId = 0;

/**
 * An option group labels and groups related options within a combobox. The label is announced before its options.
 *
 * @tag ch-option-group
 * @since 0.6.0
 * @status beta
 *
 * @slot - The options in the group.
 * @slot label - The group's label. Alternatively, use the `label` property.
 *
 * @csspart label - The group's label.
 *
 * @cssprop --charm-combobox-group-gap - The gap between option groups.
 * @cssprop --charm-combobox-group-label-color - The group label color.
 * @cssprop --charm-combobox-group-label-font-size - The group label font size.
 * @cssprop --charm-combobox-group-label-font-weight - The group label font weight.
 * @cssprop --charm-combobox-group-label-line-height - The group label line height.
 * @cssprop --charm-combobox-group-label-padding-y - The block padding within a group label.
 */
export class CoreOptionGroup extends CharmElement {
  public static override styles = [...super.styles, styles];
  public static override baseName = 'option-group';

  /** The group's label, announced before its options. */
  @property({ reflect: true })
  public label?: string;

  /** Disables every option in the group. */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  protected readonly labelId = `option-group-label-${++optionGroupId}`;

  protected generatedLabel?: HTMLSpanElement;

  protected get hasLabel(): boolean {
    return Boolean(this.label || this.querySelector(':scope > [slot="label"]'));
  }

  public override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'group');
    this.syncLabelReference();
  }

  protected override updated(changedProperties: Map<string | number | symbol, unknown>) {
    super.updated(changedProperties);

    this.syncLabelReference();

    if (changedProperties.has('disabled')) {
      Array.from(this.children).forEach(child => {
        if (child instanceof CoreOption) child.requestUpdate();
      });
    }
  }

  protected override render() {
    return this.html`
      ${
        this.hasLabel
          ? this.html`<div class="option-group-label" part="label">
            <slot name="label" @slotchange=${this.handleLabelSlotChange}></slot>
          </div>`
          : ''
      }
      <slot></slot>
    `;
  }

  /** Keeps the accessible name tied to translatable light-DOM content instead of putting text in aria-label. */
  protected syncLabelReference() {
    const slottedLabel = this.querySelector<HTMLElement>(':scope > [slot="label"]');

    if (slottedLabel && slottedLabel !== this.generatedLabel) {
      this.generatedLabel?.remove();
      this.generatedLabel = undefined;
      if (!slottedLabel.id) slottedLabel.id = this.labelId;
      this.setAttribute('aria-labelledby', slottedLabel.id);
      return;
    }

    if (!this.label) {
      this.generatedLabel?.remove();
      this.generatedLabel = undefined;
      this.removeAttribute('aria-labelledby');
      return;
    }

    const generatedLabel = this.generatedLabel ?? document.createElement('span');
    generatedLabel.id = this.labelId;
    generatedLabel.slot = 'label';
    generatedLabel.textContent = this.label;
    if (!generatedLabel.isConnected) this.prepend(generatedLabel);
    this.generatedLabel = generatedLabel;
    this.setAttribute('aria-labelledby', this.labelId);
  }

  protected handleLabelSlotChange = () => {
    this.syncLabelReference();
  };
}

export default CoreOptionGroup;
