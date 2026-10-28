import { html } from 'lit/static-html.js';
import { property, query } from 'lit/decorators.js';
import CharmDismissibleElement from '../../base/dismissible-element/charm-dismissible-element.js';
import styles from './disclosure.styles.js';

/**
 * Disclosure is used for composing collapsible components
 *
 * @tag ch-disclosure
 * @since 1.0.0
 * @status beta
 *
 * @slot - Content to be toggled.
 * @slot trigger - A button that toggles the expandable content.
 *
 * @csspart disclosure-base - The component's base wrapper.
 * @csspart disclosure-content - Wrapper around the main slotted content.
 *
 * @cssprop --charm-disclosure-gap - controls the space between the trigger and the expandable content.
 * @cssprop --charm-disclosure-content-border - controls the border styles of expanded region.
 * @cssprop --charm-disclosure-content-border-radius - controls the border styles of expanded region.
 * @cssprop --charm-disclosure-bg-color - controls the background color of the expanded region.
 * @cssprop --charm-disclosure-fg-color - controls the text color of the expanded region.
 * @cssprop --charm-disclosure-closed-max-height - controls the height of the collapsed region when it's closed (default is 0).
 * @cssprop --charm-disclosure-opened-max-height - controls the height of the collapsed region when it's opened.
 * @cssprop --charm-disclosure-show-transition - Transition for the content when opening.
 * @cssprop --charm-disclosure-hide-transition - Transition for the content when closing.
 *
 * @event disclosure-show - Emitted when the disclosure begins to show.
 * @event disclosure-after-show - Emitted after the disclosure has shown and all animations are complete.
 * @event disclosure-hide - Emitted when the disclosure begins to hide.
 * @event disclosure-after-hide - Emitted after the disclosure has hidden and all animations are complete.
 * @event disclosure-request-close - Cancelable event emitted when the trigger requests closing.
 **/
export class CoreDisclosure extends CharmDismissibleElement {
  public static override styles = [...super.styles, styles];
  public static override baseName = 'disclosure';

  /** Controls the expand direction of the component. */
  @property({ reflect: true, type: Boolean, attribute: 'content-below' })
  public contentBelow?: boolean;

  @query('.disclosure-content')
  protected content?: HTMLElement;

  @query('slot:not([name])')
  protected contentSlot!: HTMLSlotElement;

  /** Query for the trigger element */
  protected trigger?: HTMLElement;

  public override connectedCallback() {
    super.connectedCallback();
    void this.updateComplete.then(() => {
      if (this.isConnected) this.refreshTrigger();
    });
  }

  public override disconnectedCallback() {
    super.disconnectedCallback();
    this.trigger?.removeEventListener('click', this.handleTriggerClick);
  }

  protected override onOpenChange(open: boolean): void {
    super.onOpenChange(open);
    const activeElement = this.ownerDocument.activeElement;
    const focusIsInContent =
      this.content?.contains(activeElement) ||
      this.contentSlot
        ?.assignedElements({ flatten: true })
        .some(element => element === activeElement || element.contains(activeElement));
    if (!open && focusIsInContent) {
      this.getTriggerControl()?.focus();
    }
    this.getTriggerControl()?.setAttribute('aria-expanded', open.toString());
  }

  /** Handle slot change for trigger slot */
  protected handleTriggerSlotChange(e: Event) {
    const target = e.target as HTMLSlotElement;
    if (target.name !== 'trigger') return;
    this.setTrigger(target);
  }

  protected setTrigger(slot: HTMLSlotElement) {
    this.trigger?.removeEventListener('click', this.handleTriggerClick);
    this.trigger = (slot.assignedElements({ flatten: true })[0] as HTMLElement | undefined) ?? undefined;
    this.trigger?.addEventListener('click', this.handleTriggerClick);
    this.setExpandedState();
  }

  protected refreshTrigger() {
    const slot = this.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="trigger"]');
    if (slot) this.setTrigger(slot);
  }

  protected getTriggerControl(): HTMLElement | undefined {
    if (!this.trigger) return undefined;
    return this.trigger.matches('button, [role="button"]')
      ? this.trigger
      : (this.trigger.querySelector<HTMLElement>('button, [role="button"]') ?? undefined);
  }

  /** Handles trigger activation; closing remains cancelable by consumers. */
  protected handleTriggerClick = (e: MouseEvent) => {
    if (e.defaultPrevented) return;

    if (this.open) {
      this.emitRequestClose('trigger');
    } else {
      this.show();
    }
  };

  /** Sets expanded state synchronously when the slotted trigger is assigned. */
  protected setExpandedState() {
    this.getTriggerControl()?.setAttribute('aria-expanded', this.open.toString());
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
    return html`
      <div
        class="disclosure-content"
        part="disclosure-content"
        ?inert=${!this.open}
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
