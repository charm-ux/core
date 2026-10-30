import { elementUpdated, expect } from '@open-wc/testing';
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
                  await elementUpdated(control1);

                  expect(accordionItems[0].open).to.be.true;
                  expect(accordionItems[1].open).to.be.false;

                  control2.open = true;
                  await elementUpdated(control2);

                  expect(accordionItems[0].open).to.be.false;
                  expect(accordionItems[1].open).to.be.true;
                },
              },
              reconcilesWhenOpenSingleTurnsOn: {
                description: 'closes all but one already-open item when open-single is enabled',
                test: async () => {
                  const el = this.component;
                  const items = [...el.querySelectorAll<CoreAccordionItem>('[accordion-item]')];
                  items[0].open = true;
                  items[1].open = true;
                  await Promise.all(items.slice(0, 2).map(item => elementUpdated(item)));

                  el.openSingle = true;
                  await elementUpdated(el);

                  expect(items.filter(item => item.open)).to.have.lengthOf(1);
                },
              },
              openingNestedItemDoesNotCloseOuter: {
                description: 'keeps the outer item open when a nested accordion item opens',
                test: async () => {
                  const el = this.component;
                  const outerItem = el.querySelector<CoreAccordionItem>('#item1')!;
                  const nested = document.createElement('ch-accordion') as CoreAccordion;
                  const nestedItem = document.createElement('ch-accordion-item') as CoreAccordionItem;
                  nestedItem.textContent = 'Nested item';
                  nested.append(nestedItem);
                  outerItem.append(nested);
                  el.openSingle = true;
                  await elementUpdated(el);
                  outerItem.open = true;
                  await elementUpdated(outerItem);

                  nestedItem.open = true;
                  await elementUpdated(nestedItem);

                  expect(outerItem.open).to.be.true;
                  expect(nestedItem.open).to.be.true;
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
