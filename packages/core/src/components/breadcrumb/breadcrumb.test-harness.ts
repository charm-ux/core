import { expect } from '@open-wc/testing';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import type { CoreBreadcrumb } from './index.js';

export class CoreBreadcrumbTests<T extends CoreBreadcrumb> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      breadcrumb: {
        description: 'breadcrumb',
        tests: {
          slots: {
            description: 'slots',
            tests: {
              defaultSlot: {
                description: 'place children in the default slot',
                test: async () => {
                  const el = this.component;
                  el.innerHTML = 'children here';
                  const defaultSlot = el.shadowRoot?.querySelector('slot:not(name)') as HTMLSlotElement;
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
