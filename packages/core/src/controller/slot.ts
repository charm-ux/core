import type { ReactiveController } from 'lit';
import type { CharmReactiveControllerHost } from '../base/types.js';

const hostsWithSlotControllers = new WeakSet<CharmReactiveControllerHost>();

export class HasSlotController implements ReactiveController {
  public host: CharmReactiveControllerHost;
  protected readonly slotNames: string[];
  private readonly watchedSlots = new Map<string, boolean>();
  private readonly warnedSlotNames = new Set<string>();

  public constructor(host: CharmReactiveControllerHost, ...slotNames: string[]) {
    if (hostsWithSlotControllers.has(host)) {
      const message = `Only one HasSlotController may be registered for ${host.tagName.toLowerCase()}.`;
      if (typeof process === 'undefined' || process.env.NODE_ENV !== 'production') {
        throw new Error(message);
      }
    }

    hostsWithSlotControllers.add(host);
    (this.host = host).addController(this);
    this.slotNames = slotNames.length ? slotNames : ((host.constructor as { slotNames?: string[] }).slotNames ?? []);
    this.handleSlotChange = this.handleSlotChange.bind(this);
  }

  public hostConnected() {
    this.updateWatchedSlots();
    this.host.shadowRoot?.addEventListener('slotchange', this.handleSlotChange);
  }

  public hostDisconnected() {
    this.host.shadowRoot?.removeEventListener('slotchange', this.handleSlotChange);
  }

  public hasDefaultSlot() {
    if (this.watchedSlots.has('[default]')) return this.watchedSlots.get('[default]')!;
    this.warnIfUnwatched('[default]');
    return this.hasDefaultSlotContent();
  }

  public test(slotName: string) {
    return slotName === '[default]' ? this.hasDefaultSlot() : this.hasNamedSlot(slotName);
  }

  public hasNamedSlot(name: string) {
    if (this.watchedSlots.has(name)) return this.watchedSlots.get(name)!;

    this.warnIfUnwatched(name);

    return this.host.querySelector(`:scope > [slot="${name}"]`) !== null;
  }

  protected handleSlotChange(event: Event) {
    const slot = event.target as HTMLSlotElement;

    if ((this.slotNames.includes('[default]') && !slot.name) || (slot.name && this.slotNames.includes(slot.name))) {
      if (this.updateWatchedSlots()) {
        this.host.requestUpdate();
      }
    }
  }

  private updateWatchedSlots(): boolean {
    let changed = false;

    for (const slotName of this.slotNames) {
      const hasSlot =
        slotName === '[default]'
          ? this.hasDefaultSlotContent()
          : this.host.querySelector(`:scope > [slot="${slotName}"]`) !== null;
      if (this.watchedSlots.get(slotName) !== hasSlot) {
        this.watchedSlots.set(slotName, hasSlot);
        changed = true;
      }
    }

    return changed;
  }

  private hasDefaultSlotContent(): boolean {
    return [...this.host.childNodes].some(node => {
      if (node.nodeType === node.TEXT_NODE && node.textContent && node.textContent.trim() !== '') {
        return true;
      }

      if (node.nodeType === node.ELEMENT_NODE) {
        const el = node as Node & Element;

        // Ignore visually hidden elements since they aren't rendered.
        if ('classList' in el && (el.tagName.includes('visually-hidden') || el.classList.contains('visually-hidden'))) {
          return false;
        }

        return 'hasAttribute' in el && !el.hasAttribute('slot');
      }

      return false;
    });
  }

  private warnIfUnwatched(name: string) {
    if (this.warnedSlotNames.has(name) || typeof process === 'undefined' || process.env.NODE_ENV === 'production')
      return;

    console.warn(`HasSlotController queried unwatched slot "${name}" on ${this.host.tagName.toLowerCase()}.`);
    this.warnedSlotNames.add(name);
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
