import { expect } from '@open-wc/testing';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import type { CoreAccordionItem } from './index.js';

export class CoreAccordionItemTests<T extends CoreAccordionItem> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      accordionItem: {
        description: 'accordionItem',
        tests: {
          properties: {
            description: 'properties',
            tests: {
              expandDirection: {
                description: 'content should default be closed',
                test: async () => {
                  const el = this.component;
                  expect(el.open).to.equal(false);
                },
              },
            },
          },

          slots: {
            description: 'place children in default slot',
            tests: {
              defaultSlot: {
                description: 'default slot',
                test: async () => {
                  const el = this.component;
                  el.innerHTML = 'Accordion Item';
                  const defaultSlot = el.shadowRoot?.querySelector('slot:not(name)') as HTMLSlotElement;

                  expect(defaultSlot).to.not.be.undefined;
                },
              },
            },
          },
        },
      },
    });
  }
}
