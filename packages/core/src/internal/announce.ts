import '@github/arianotify-polyfill';

interface Announcer {
  ariaNotify(message: string, options?: { priority?: 'high' | 'normal' }): void;
}

/**
 * Announces a message to screen readers without moving focus. Uses the native `ariaNotify()` where available and the
 * polyfill's live region otherwise. Announce from a light-DOM element, since the polyfill's live region is only
 * reliable outside a shadow root. A `high` priority interrupts speech already in progress.
 */
export function announce(element: Element, message: string, options?: { priority?: 'high' | 'normal' }) {
  (element as unknown as Announcer).ariaNotify(message, options);
}
