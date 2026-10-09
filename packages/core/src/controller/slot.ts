import type { ReactiveController } from 'lit';
import type { CharmReactiveControllerHost } from '../base/types.js';

export class HasSlotController implements ReactiveController {
  public host: CharmReactiveControllerHost;
  protected slotNames: string[] = [];
  protected slotState = new Map<string, boolean>();

  public constructor(host: CharmReactiveControllerHost, ...slotNames: string[]) {
    (this.host = host).addController(this);
    this.slotNames = slotNames;
    for (const slotName of slotNames) {
      this.slotState.set(slotName, this.readSlotState(slotName));
    }
    this.handleSlotChange = this.handleSlotChange.bind(this);
  }

  public hostConnected() {
    for (const slotName of this.slotNames) {
      this.slotState.set(slotName, this.readSlotState(slotName));
    }
    this.host.shadowRoot?.addEventListener('slotchange', this.handleSlotChange);
  }

  public hostDisconnected() {
    this.host.shadowRoot?.removeEventListener('slotchange', this.handleSlotChange);
  }

  public hasDefaultSlot() {
    return this.slotState.get('[default]') ?? this.readDefaultSlotState();
  }

  public test(slotName: string) {
    return slotName === '[default]' ? this.hasDefaultSlot() : this.hasNamedSlot(slotName);
  }

  public addSlotNames(...slotNames: string[]) {
    for (const slotName of slotNames) {
      if (this.slotNames.includes(slotName)) continue;
      this.slotNames.push(slotName);
      this.slotState.set(slotName, this.readSlotState(slotName));
    }
  }

  public hasNamedSlot(name: string) {
    return this.slotState.get(name) ?? this.readNamedSlotState(name);
  }

  protected readDefaultSlotState() {
    for (const node of this.host.childNodes) {
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
    }
    return false;
  }

  protected readNamedSlotState(name: string) {
    return this.host.querySelector(`:scope > [slot="${name}"]`) !== null;
  }

  protected readSlotState(slotName: string) {
    return slotName === '[default]' ? this.readDefaultSlotState() : this.readNamedSlotState(slotName);
  }

  protected handleSlotChange(event: Event) {
    const slot = event.target as HTMLSlotElement;

    const slotName = slot.name || '[default]';
    if (!this.slotNames.includes(slotName)) return;

    const nextState = this.readSlotState(slotName);
    if (this.slotState.get(slotName) !== nextState) {
      this.slotState.set(slotName, nextState);
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
