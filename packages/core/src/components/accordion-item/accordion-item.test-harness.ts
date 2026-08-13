import { aTimeout, elementUpdated, expect, waitUntil } from '@open-wc/testing';
import sinon from 'sinon';
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

          events: {
            description: 'events',
            tests: {
              show: {
                description: 'emits accordion-item-show and accordion-item-after-show when opened',
                test: async () => {
                  const el = this.component;
                  el.open = false;
                  await elementUpdated(el);
                  await aTimeout(50);

                  const showHandler = sinon.spy();
                  const afterShowHandler = sinon.spy();
                  el.addEventListener('accordion-item-show', showHandler);
                  el.addEventListener('accordion-item-after-show', afterShowHandler);

                  el.open = true;

                  await waitUntil(() => showHandler.calledOnce, 'accordion-item-show should fire');
                  await waitUntil(() => afterShowHandler.calledOnce, 'accordion-item-after-show should fire');

                  expect(el.open).to.be.true;
                },
              },
              hide: {
                description: 'emits accordion-item-hide and accordion-item-after-hide when closed',
                test: async () => {
                  const el = this.component;
                  el.open = true;
                  await elementUpdated(el);
                  await aTimeout(50);

                  const hideHandler = sinon.spy();
                  const afterHideHandler = sinon.spy();
                  el.addEventListener('accordion-item-hide', hideHandler);
                  el.addEventListener('accordion-item-after-hide', afterHideHandler);

                  el.open = false;

                  await waitUntil(() => hideHandler.calledOnce, 'accordion-item-hide should fire');
                  await waitUntil(() => afterHideHandler.calledOnce, 'accordion-item-after-hide should fire');

                  expect(el.open).to.be.false;
                },
              },
            },
          },
        },
      },
    });
  }
}
