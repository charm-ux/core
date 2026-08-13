import { elementUpdated, expect } from '@open-wc/testing';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import type { CoreBreadcrumb } from './index.js';
import '../breadcrumb-item/index.js';

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
              separatorSlot: {
                description: 'clones the breadcrumb separator into items without their own',
                test: async () => {
                  const el = this.component;
                  el.innerHTML =
                    '<ch-breadcrumb-item>one</ch-breadcrumb-item><ch-breadcrumb-item>two</ch-breadcrumb-item><span slot="separator">|</span>';
                  await elementUpdated(el);
                  const items = el.querySelectorAll('ch-breadcrumb-item');
                  expect(items[0].querySelector('[slot="separator"]')).not.to.be.null;
                  expect(items[0].querySelector('[slot="separator"]')?.textContent?.trim()).to.equal('|');
                },
              },
              customItemSeparator: {
                description: 'leaves a custom per-item separator alone',
                test: async () => {
                  const el = this.component;
                  el.innerHTML =
                    '<ch-breadcrumb-item>one<span slot="separator">/</span></ch-breadcrumb-item><ch-breadcrumb-item>two</ch-breadcrumb-item><span slot="separator">|</span>';
                  await elementUpdated(el);
                  const item = el.querySelector('ch-breadcrumb-item')!;
                  const separator = item.querySelector('[slot="separator"]');
                  expect(separator?.textContent?.trim()).to.equal('/');
                  expect(separator?.hasAttribute('data-default')).to.be.false;
                },
              },
            },
          },
        },
      },
    });
  }
}
