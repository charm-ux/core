import { expect } from '@open-wc/testing';
import { RenderedWatcher } from './rendered-watcher.js';

describe('RenderedWatcher', () => {
  it('disconnects old ResizeObserver targets before re-arming', () => {
    const original = window.ResizeObserver;
    const observers: FakeResizeObserver[] = [];

    class FakeResizeObserver {
      public disconnectCount = 0;
      public observed: Element[] = [];

      public constructor(_callback: ResizeObserverCallback) {
        observers.push(this);
      }

      public observe(target: Element) {
        this.observed.push(target);
      }

      public disconnect() {
        this.disconnectCount += 1;
        this.observed = [];
      }

      public unobserve() {}
    }

    Object.defineProperty(window, 'ResizeObserver', { configurable: true, value: FakeResizeObserver });
    try {
      const element = document.createElement('div');
      const firstTarget = document.createElement('span');
      const secondTarget = document.createElement('span');
      const watcher = new RenderedWatcher(element, () => undefined);
      watcher.start(firstTarget);
      watcher.start(secondTarget);

      expect(observers[0]?.disconnectCount).to.equal(2);
      expect(observers[0]?.observed).to.deep.equal([element, secondTarget]);
      watcher.stop();
    } finally {
      Object.defineProperty(window, 'ResizeObserver', { configurable: true, value: original });
    }
  });
});
