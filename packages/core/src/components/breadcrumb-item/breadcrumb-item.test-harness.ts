import { expect } from '@open-wc/testing';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import type { CoreBreadcrumbItem } from './index.js';

export class CoreBreadcrumbItemTests<T extends CoreBreadcrumbItem> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      base: {
        description: 'base',
        tests: {
          accessibility: {
            description: 'temporarily disabled. breadcrumb item accessibility requires a parent with the correct role.',
            test: async () => {},
          },
        },
      },
      breadcrumbItem: {
        description: 'breadcrumbItem',
        tests: {
          properties: {
            description: 'properties',
            tests: {
              ariaCurrent: {
                description: 'has aria-current="page" if current attribute is present',
                test: async () => {
                  const el = this.component;
                  expect(el.shadowRoot?.querySelector('[aria-current="page"]')).to.be.null;
                  await el.setAttribute('current', 'page');
                  expect(el.shadowRoot?.querySelector('[aria-current="page"]')).not.to.be.null;
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
                  expect(defaultSlot).to.not.be.null;
                },
              },
              separatorSlot: {
                description: 'has a separator slot by default',
                test: async () => {
                  const el = this.component;
                  expect(el.shadowRoot?.querySelector('[part="breadcrumb-item-separator"]')).not.to.be.null;
                },
              },
              noSeparatorSlot: {
                description: 'does not have a separator when separator property is false',
                test: async () => {
                  const el = this.component;
                  await el.toggleAttribute('separator', false);
                  expect(el.shadowRoot?.querySelector('[part="breadcrumb-item-separator"]')).to.be.null;
                },
              },
            },
          },
        },
      },
    });
  }
}
