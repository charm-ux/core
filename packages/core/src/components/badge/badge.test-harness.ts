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
              startSlot: {
                description: 'places children in the start slot',
                test: async () => {
                  this.component.innerHTML = '<span slot="start">Start</span>';
                  await elementUpdated(this.component);
                  const startSlot = this.component.shadowRoot?.querySelector('slot[name="start"]') as HTMLSlotElement;
                  expect(startSlot).to.not.be.null;
                },
              },
              endSlot: {
                description: 'places children in the end slot',
                test: async () => {
                  this.component.innerHTML = '<span slot="end">End</span>';
                  await elementUpdated(this.component);
                  const endSlot = this.component.shadowRoot?.querySelector('slot[name="end"]') as HTMLSlotElement;
                  expect(endSlot).to.not.be.null;
                },
              },
            },
          },
        },
      },
    });
  }
}
