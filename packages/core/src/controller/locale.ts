import { normalizeLocale } from '../utilities/locale.js';
import type { ReactiveController, ReactiveControllerHost } from 'lit';

const LANG_OBSERVER_OPTIONS: MutationObserverInit = { attributes: true, attributeFilter: ['lang'] };

/** Returns the next ancestor in the composed tree, crossing shadow roots to their host. */
function composedParent(node: Node): Element | null {
  const parent = node.parentNode;
  if (parent instanceof ShadowRoot) return parent.host;
  return parent instanceof Element ? parent : null;
}

/**
 * Tracks the host's effective, normalized `lang`, resolved through composed ancestors (crossing shadow roots),
 * and requests a host update when it changes.
 */
export class LocaleController implements ReactiveController {
  public host: ReactiveControllerHost & HTMLElement;
  protected cachedLocale = '';
  protected observer?: MutationObserver;

  public constructor(host: ReactiveControllerHost & HTMLElement) {
    (this.host = host).addController(this);
  }

  /** The normalized effective locale, falling back to the browser language. */
  public get locale(): string {
    return this.cachedLocale || this.resolve();
  }

  public hostConnected(): void {
    this.refresh();
  }

  public hostDisconnected(): void {
    this.observer?.disconnect();
    this.observer = undefined;
  }

  /** The nearest composed ancestor-or-self carrying a `lang` attribute. */
  protected langElement(): Element | null {
    for (let element: Element | null = this.host; element; element = composedParent(element)) {
      if (element.hasAttribute('lang')) return element;
    }
    return null;
  }

  protected resolve(): string {
    this.cachedLocale = normalizeLocale(this.langElement()?.getAttribute('lang') || navigator.language || 'en');
    return this.cachedLocale;
  }

  /** Re-resolves the locale and observes every ancestor up to (and including) the one providing it. */
  protected refresh(): void {
    const previous = this.cachedLocale;
    this.resolve();
    this.observer ??= new MutationObserver(() => {
      if (this.host.isConnected) this.refresh();
    });
    this.observer.disconnect();
    for (let element: Element | null = this.host; element; element = composedParent(element)) {
      this.observer.observe(element, LANG_OBSERVER_OPTIONS);
      if (element.hasAttribute('lang')) break;
    }
    if (previous && previous !== this.cachedLocale) this.host.requestUpdate();
  }
}
