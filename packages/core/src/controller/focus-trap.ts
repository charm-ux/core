import type { ReactiveController } from 'lit';
import type { CharmReactiveControllerHost } from '../base/types.js';
/**
 * A controller to trap focus within a component.
 */
export class FocusTrapController implements ReactiveController {
  public host: CharmReactiveControllerHost;
  protected firstElement: HTMLElement | null = null;
  protected lastElement: HTMLElement | null = null;
  protected previousFocus: HTMLElement | null = null;
  public constructor(host: CharmReactiveControllerHost) {
    this.host = host;
    host.addController(this);
  }

  public hostConnected() {
    this.host.addEventListener('keydown', this.handleKeyDown);
  }

  public hostDisconnected() {
    this.host.removeEventListener('keydown', this.handleKeyDown);
    this.restorePreviousFocus();
  }

  public activate() {
    this.previousFocus = document.activeElement as HTMLElement;
    this.focusFirstElement();
  }

  public deactivate() {
    this.restorePreviousFocus();
  }

  /**
   * Restores focus to the element that was focused before the focus trap was activated.
   */
  protected restorePreviousFocus() {
    if (this.previousFocus) {
      this.previousFocus.focus();
    }
    this.previousFocus = null;
  }

  protected focusFirstElement() {
    this.getFocusableElements()[0]?.focus();
  }

  protected focusLastElement() {
    const elements = this.getFocusableElements();
    elements[elements.length - 1]?.focus();
  }

  protected isVisible(el: HTMLElement): boolean {
    const style = getComputedStyle(el);
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0' &&
      el.offsetWidth > 0 &&
      el.offsetHeight > 0
    );
  }

  protected getDeepActiveElement(): Element | null {
    let active = document.activeElement;
    while (active?.shadowRoot?.activeElement) {
      active = active.shadowRoot.activeElement;
    }
    return active;
  }

  /**
   * Finds first and last focusable elements within the host component.
   */
  protected getFocusableElements(): HTMLElement[] {
    const elements: HTMLElement[] = [];
    // Selector for natively focusable elements + anything with tabindex >= 0
    const selector =
      'a[href], area[href], input:not([disabled]), select:not([disabled]), ' +
      'textarea:not([disabled]), button:not([disabled]), iframe, object, embed, ' +
      '[tabindex]:not([tabindex="-1"]), [contenteditable], [focusable]';
    // Check shadow DOM elements
    this.host.shadowRoot?.querySelectorAll<HTMLElement>(selector).forEach(el => {
      if (el.tagName !== 'DIALOG') elements.push(el);
    });
    // Check slotted elements
    this.host.shadowRoot?.querySelectorAll<HTMLSlotElement>('slot').forEach(slot => {
      slot.assignedElements({ flatten: true }).forEach(assigned => {
        // With delegatesFocus, the custom element itself is focusable
        if (assigned.matches(selector)) {
          elements.push(assigned as HTMLElement);
        }
        // Also check children (in case of nested regular HTML)
        elements.push(...assigned.querySelectorAll<HTMLElement>(selector));
        // Also check shadow DOM of assigned elements
        if (assigned.shadowRoot) {
          assigned.shadowRoot.querySelectorAll<HTMLElement>(selector).forEach(el => {
            if (el.tagName !== 'DIALOG') elements.push(el);
          });
        }
      });
    });
    return elements.filter(el => this.isVisible(el));
  }

  protected matchesFocusableElement(activeEl: Element | null, targetEl: HTMLElement): boolean {
    if (activeEl === targetEl) return true;
    // Check if activeEl is inside targetEl's shadow DOM
    if (targetEl.shadowRoot && targetEl.shadowRoot.contains(activeEl as Node)) {
      return true;
    }
    // Check if activeEl is the host of an element that delegates to targetEl
    let current = activeEl;
    while (current?.shadowRoot) {
      if (current === targetEl) return true;
      current = current.shadowRoot.activeElement;
    }
    return false;
  }

  /**
   * Handles 'keydown' events to trap focus within the component.
   */
  protected handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;
    const elements = this.getFocusableElements();
    if (elements.length === 0) return;
    const firstElement = elements[0];
    const lastElement = elements[elements.length - 1];
    const activeElement = this.getDeepActiveElement();
    if (e.shiftKey && this.matchesFocusableElement(activeElement, firstElement)) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && this.matchesFocusableElement(activeElement, lastElement)) {
      e.preventDefault();
      firstElement.focus();
    }
  };
}
