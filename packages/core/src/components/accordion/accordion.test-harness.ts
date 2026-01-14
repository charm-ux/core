import { aTimeout, elementUpdated, expect } from '@open-wc/testing';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import { CoreAccordionItem } from '../accordion-item/index.js';
import type { CoreAccordion } from './index.js';
import '../accordion-item/index.js';

export class CoreAccordionTests<T extends CoreAccordion> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      accordion: {
        description: 'accordion',
        tests: {
          properties: {
            description: 'properties',
            tests: {
              openSingleDefault: {
                description: 'should have a default openSingle value of false',
                test: async () => {
                  const el = this.component;
                  expect(el.openSingle).to.be.false;
                },
              },
              openSingleToggle: {
                description: 'should toggle openSingle property',
                test: async () => {
                  const el = this.component;

                  el.openSingle = true;
                  await el.updateComplete;
                  expect(el.openSingle).to.be.true;

                  el.openSingle = false;
                  await el.updateComplete;
                  expect(el.openSingle).to.be.false;
                },
              },
            },
          },
          methods: {
            description: 'methods',
            tests: {
              handleSingleToggle: {
                description: 'should handle single expand mode correctly',
                test: async () => {
                  const el = this.component;
                  await el.updateComplete;

                  const accordionItems = Array.from(el.querySelectorAll('[accordion-item]')) as CoreAccordionItem[];
                  expect(accordionItems).to.have.lengthOf(3);

                  el.openSingle = true;
                  await elementUpdated(el);

                  const control1 = accordionItems[0];
                  const control2 = accordionItems[1];

                  control1.open = true;
                  await aTimeout(50);

                  expect(accordionItems[0].open).to.be.true;
                  expect(accordionItems[1].open).to.be.false;

                  control2.open = true;
                  await aTimeout(50);

                  expect(accordionItems[0].open).to.be.false;
                  expect(accordionItems[1].open).to.be.true;
                },
              },
            },
          },
          slots: {
            description: 'slots',
            tests: {
              defaultSlot: {
                description: 'places children in the default slot',
                test: async () => {
                  const el = this.component;
                  const defaultSlot = el.shadowRoot?.querySelector('slot:not(name)') as HTMLSlotElement;

                  el.innerHTML = 'Default Content';
                  await el.updateComplete;

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
