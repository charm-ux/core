import { elementUpdated, expect } from '@open-wc/testing';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import type { CoreBadge } from './index.js';

export class CoreBadgeTests<T extends CoreBadge> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      badge: {
        description: 'badge',
        tests: {
          slots: {
            description: 'slot',
            tests: {
              defaultSlot: {
                description: 'places children in the default slot',
                test: async () => {
                  this.component.innerHTML = 'Badge Content';
                  await elementUpdated(this.component);
                  const defaultSlot = this.component.shadowRoot?.querySelector('slot:not(name)') as HTMLSlotElement;
                  expect(defaultSlot).to.not.be.null;
                },
              },
            },
          },
        },
      },
    });
  }
}
