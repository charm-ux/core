import type { ReactiveController } from 'lit';
import type { CharmReactiveControllerHost } from '../base/types.js';

export class HasSlotController implements ReactiveController {
  public host: CharmReactiveControllerHost;
  protected slotNames: string[] = [];

  public constructor(host: CharmReactiveControllerHost, ...slotNames: string[]) {
    (this.host = host).addController(this);
    this.slotNames = slotNames;
    this.handleSlotChange = this.handleSlotChange.bind(this);
  }

  public hostConnected() {
    this.host.shadowRoot?.addEventListener('slotchange', this.handleSlotChange);
  }

  public hostDisconnected() {
    this.host.shadowRoot?.removeEventListener('slotchange', this.handleSlotChange);
  }

  public hasDefaultSlot() {
    return [...this.host.childNodes].some(node => {
      if (node.nodeType === node.TEXT_NODE && node.textContent && node.textContent.trim() !== '') {
        return true;
      }

      if (node.nodeType === node.ELEMENT_NODE) {
        const el = node as Node & Element;

        // Ignore visually hidden elements since they aren't rendered
        if ('classList' in el && (el.tagName.includes('visually-hidden') || el.classList.contains('visually-hidden'))) {
          return false;
        }

        // If it doesn't have a slot attribute, it's part of the default slot
        if ('hasAttribute' in el && !el.hasAttribute('slot')) {
          return true;
        }
      }

      return false;
    });
  }

  public test(slotName: string) {
    return slotName === '[default]' ? this.hasDefaultSlot() : this.hasNamedSlot(slotName);
  }

  public hasNamedSlot(name: string) {
    return this.host.querySelector(`:scope > [slot="${name}"]`) !== null;
  }

  protected handleSlotChange(event: Event) {
    const slot = event.target as HTMLSlotElement;

    if ((this.slotNames.includes('[default]') && !slot.name) || (slot.name && this.slotNames.includes(slot.name))) {
      this.host.requestUpdate();
    }
  }
}

/**
 * Given a slot, this function iterates over all of its assigned element and text nodes and returns the concatenated
 * HTML as a string. This is useful because we can't use slot.innerHTML as an alternative.
 */
export function getInnerHTML(slot: HTMLSlotElement): string {
  const nodes = slot.assignedNodes({ flatten: true });
  let html = '';

  [...nodes].forEach(node => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      html += (node as HTMLElement).outerHTML;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      html += node.textContent;
    }
  });

  return html;
}

/**
 * Given a slot, this function iterates over all of its assigned text nodes and returns the concatenated text as a
 * string. This is useful because we can't use slot.textContent as an alternative.
 */
export function getTextContent(slot: HTMLSlotElement | undefined | null): string {
  if (!slot) {
    return '';
  }
  const nodes = slot.assignedNodes({ flatten: true });
  let text = '';

  [...nodes].forEach(node => {
    text += node.textContent;
  });

  return text;
}
