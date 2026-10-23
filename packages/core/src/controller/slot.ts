import type { ReactiveController } from 'lit';
import type { CharmReactiveControllerHost } from '../base/types.js';

const hostsWithSlotControllers = new WeakSet<CharmReactiveControllerHost>();

export class HasSlotController implements ReactiveController {
  public host: CharmReactiveControllerHost;
  protected readonly watchedSlots: readonly string[];
  private readonly cachedSlots = new Map<string, boolean>();
  private readonly warnedSlotNames = new Set<string>();
  private mutationObserver?: MutationObserver;

  public constructor(host: CharmReactiveControllerHost, ...slotNames: string[]) {
    if (hostsWithSlotControllers.has(host)) {
      const message = `Only one HasSlotController may be registered for ${host.tagName.toLowerCase()}.`;
      if (typeof process === 'undefined' || process.env.NODE_ENV !== 'production') {
        throw new Error(message);
      }
    }

    hostsWithSlotControllers.add(host);
    (this.host = host).addController(this);
    this.watchedSlots =
      slotNames.length > 0
        ? slotNames
        : ((host.constructor as { watchedSlots?: readonly string[] }).watchedSlots ?? []);
    this.handleSlotChange = this.handleSlotChange.bind(this);
  }

  public hostConnected() {
    if (this.watchedSlots.length === 0) return;
    this.updateWatchedSlots();
    this.host.shadowRoot?.addEventListener('slotchange', this.handleSlotChange);
    if (this.watchedSlots.includes('[default]')) {
      this.mutationObserver ??= new MutationObserver(() => {
        if (this.host.isConnected && this.updateWatchedSlots()) this.host.requestUpdate();
      });
      this.mutationObserver.observe(this.host, { childList: true, characterData: true, subtree: true });
    }
  }

  public hostDisconnected() {
    this.host.shadowRoot?.removeEventListener('slotchange', this.handleSlotChange);
    this.mutationObserver?.disconnect();
  }

  public hasDefaultSlot() {
    if (this.cachedSlots.has('[default]')) return this.cachedSlots.get('[default]')!;
    this.warnIfUnwatched('[default]');
    return this.hasDefaultSlotContent();
  }

  public test(slotName: string) {
    return slotName === '[default]' ? this.hasDefaultSlot() : this.hasNamedSlot(slotName);
  }

  public hasNamedSlot(name: string) {
    if (this.cachedSlots.has(name)) return this.cachedSlots.get(name)!;

    this.warnIfUnwatched(name);

    return this.host.querySelector(`:scope > [slot="${name}"]`) !== null;
  }

  protected handleSlotChange(event: Event) {
    if (!this.host.isConnected) return;

    const slot = event.target as HTMLSlotElement;

    if (
      (this.watchedSlots.includes('[default]') && !slot.name) ||
      (slot.name && this.watchedSlots.includes(slot.name))
    ) {
      if (this.updateWatchedSlots()) {
        this.host.requestUpdate();
      }
    }
  }

  private updateWatchedSlots(): boolean {
    let changed = false;

    for (const slotName of this.watchedSlots) {
      const hasSlot =
        slotName === '[default]'
          ? this.hasDefaultSlotContent()
          : this.host.querySelector(`:scope > [slot="${slotName}"]`) !== null;
      if (this.cachedSlots.get(slotName) !== hasSlot) {
        this.cachedSlots.set(slotName, hasSlot);
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
        if (
          'classList' in el &&
          (el.localName.includes('visually-hidden') || el.classList.contains('visually-hidden'))
        ) {
          return false;
        }

        return 'getAttribute' in el && !el.getAttribute('slot');
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
      html += (node.textContent ?? '').replace(/[&<>]/g, character => {
        if (character === '&') return '&amp;';
        if (character === '<') return '&lt;';
        return '&gt;';
      });
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
