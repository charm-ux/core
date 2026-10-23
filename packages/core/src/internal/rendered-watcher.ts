/**
 * Watches an element and reports when it stops or starts generating layout boxes, e.g. when
 * third-party CSS applies "display: none" to it or an ancestor. A ResizeObserver signals changes
 * and getClientRects() determines the state, since it distinguishes "not rendered" from "rendered
 * at zero size". Visibility and opacity never count as hidden.
 */
export class RenderedWatcher {
  private observer: ResizeObserver | undefined;
  private mutationObserver: MutationObserver | undefined;
  private initialCheckHandle: number | undefined;
  private observing = false;

  private readonly element: HTMLElement;
  private readonly callback: (isRendered: boolean) => void;

  public constructor(element: HTMLElement, callback: (isRendered: boolean) => void) {
    this.element = element;
    this.callback = callback;
  }

  /**
   * Starts watching and reports the current state on the next frame. Additional targets also act
   * as change signals, e.g. an internal element that always has a non-zero box when rendered.
   */
  public start(...additionalTargets: Element[]): void {
    this.observing = true;
    this.observer ??= new ResizeObserver(() => this.check());
    this.mutationObserver ??= new MutationObserver(() => this.check());

    this.observer.disconnect();
    this.observer.observe(this.element);

    // ResizeObserver does not reliably signal display:none toggles in every engine when the
    // observed box remains at zero size. Observe visibility-affecting attributes on the element
    // and its composed ancestors as a second change signal.
    this.mutationObserver.disconnect();
    let ancestor: Element | null = this.element;
    while (ancestor) {
      this.mutationObserver.observe(ancestor, {
        attributes: true,
        attributeFilter: ['class', 'hidden', 'style'],
      });

      const root = ancestor.getRootNode();
      ancestor = ancestor.parentElement ?? (root instanceof ShadowRoot ? root.host : null);
    }

    for (const target of additionalTargets) {
      this.observer.observe(target);
    }

    // ResizeObserver doesn't deliver an initial observation for elements that aren't rendered, so
    // check once in case the element is already hidden. Deferred to the next frame because a
    // synchronous layout flush here, right after showModal(), can hang Firefox and WebKit.
    this.initialCheckHandle ??= requestAnimationFrame(() => {
      this.initialCheckHandle = undefined;
      this.check();
    });
  }

  /** Stops watching. */
  public stop(): void {
    this.observing = false;

    if (this.initialCheckHandle !== undefined) {
      cancelAnimationFrame(this.initialCheckHandle);
      this.initialCheckHandle = undefined;
    }

    this.observer?.disconnect();
    this.mutationObserver?.disconnect();
  }

  private check(): void {
    if (!this.observing || !this.element.isConnected) return;
    this.callback(this.element.getClientRects().length > 0);
  }
}
