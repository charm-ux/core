import { html } from 'lit/static-html.js';
import { property } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import CharmDismissibleElement from '../../base/dismissible-element/charm-dismissible-element.js';
import styles from './disclosure.styles.js';

// id for slotted trigger (will only be added if one doesn't exist)
let disclosureButtonId = 0;

/**
 * Disclosure is used for composing collapsible components
 *
 * @tag ch-disclosure
 * @since 1.0.0
 * @status beta
 *
 * @slot - default - Content to be toggled.
 * @slot - trigger - Slot to provide a trigger to automatically toggle expandable region.
 *
 * @csspart disclosure-base - The component's base wrapper.
 * @csspart disclosure-content - Wrapper around the main slotted content.
 *
 * @cssproperty --disclosure-gap - controls the space between the trigger and the expandable content.
 * @cssproperty --disclosure-content-border - controls the border styles of expanded region.
 * @cssproperty --disclosure-content-border-radius - controls the border styles of expanded region.
 * @cssproperty --disclosure-bg-color - controls the background color of the expanded region.
 * @cssproperty --disclosure-fg-color - controls the text color of the expanded region.
 * @cssproperty --disclosure-closed-max-height - controls the height of the collapsed region when it's closed (default is 0).
 * @cssproperty --disclosure-opened-max-height - controls the height of the collapsed region when it's opened.
 * @cssproperty --disclosure-open-transition - Transition for the content when opening.
 * @cssproperty --disclosure-close-transition - Transition for the content when closing,
 *
 * @event disclosure-show - Emitted when the disclosure begins to show.
 * @event disclosure-after-show - Emitted after the disclosure has shown and all animations are complete.
 * @event disclosure-hide - Emitted when the disclosure begins to hide.
 * @event disclosure-after-hide - Emitted after the disclosure has hidden and all animations are complete.
 **/
export class CoreDisclosure extends CharmDismissibleElement {
  public static override styles = [...super.styles, styles];
  public static override baseName = 'disclosure';

  /** Controls the expand direction of the component. */
  @property({ reflect: true, attribute: 'content-below' })
  public contentBelow?: boolean;

  /** Query for the trigger element */
  protected trigger?: HTMLElement;

  /*
   * Initializes the component.
   */
  public constructor() {
    super();
  }

  protected override onOpenChange(open: boolean): void {
    super.onOpenChange(open);
    if (!this.trigger) return;
    this.trigger.setAttribute('aria-expanded', open.toString());
  }

  /** Handle slot change for trigger slot */
  protected handleTriggerSlotChange(e: Event) {
    const target = e.target as HTMLSlotElement;
    if (target.name !== 'trigger') return;

    const elements = target.assignedElements({ flatten: true }) as HTMLElement[];
    if (!elements.length) return;

    this.trigger?.removeEventListener('click', this.handleTriggerClick);
    this.trigger = elements[0];
    this.trigger?.addEventListener('click', this.handleTriggerClick);
    this.setAriaLabels();
  }

  /** Handle trigger click to show/hide the menu */
  protected handleTriggerClick = async (e: MouseEvent) => {
    if (e.defaultPrevented) return;

    if (this.open) {
      this.hide();
    } else {
      this.show();
    }
  };

  /** Sets aria labels for trigger element */
  protected setAriaLabels() {
    if (!this.trigger) return;
    this.trigger.setAttribute('aria-expanded', this.open.toString());

    if (!this.trigger.id) {
      this.trigger.id = `disclosure-button-${++disclosureButtonId}`;
    }
  }

  /*
   * Returns the template for the heading and button component.
   */
  protected triggerSlotTemplate() {
    return html` <slot name="trigger" @slotchange=${this.handleTriggerSlotChange}></slot> `;
  }

  /*
   * Returns the template for the content that is expanded and collapsed.
   */
  protected contentTemplate() {
    // aria-labelled-by, we need the trigger id
    return html`
      <div
        aria-hidden=${!this.open}
        aria-labelledby=${ifDefined(this.trigger?.id)}
        class="disclosure-content"
        role="region"
        part="disclosure-content"
        @transitionend=${this.handleTransitionEnd}
      >
        <slot></slot>
      </div>
    `;
  }

  /*
   * Returns the template for the disclosure base wrapper.
   */
  protected baseTemplate() {
    return html`
      <div class="disclosure-base" part="disclosure-base">${this.triggerSlotTemplate()}${this.contentTemplate()}</div>
    `;
  }

  protected override render() {
    return this.baseTemplate();
  }
}

export default CoreDisclosure;
