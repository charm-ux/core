import { aTimeout, elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import { createScope } from '../../utilities/scope.js';
import CoreBreadcrumbItem from '../breadcrumb-item/breadcrumb-item.js';
import CoreBreadcrumb from './breadcrumb.js';
import '../breadcrumb-item/index.js';
import '../tooltip/index.js';

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
                description: 'clones the breadcrumb separator into every item except the last',
                test: async () => {
                  const el = this.component;
                  el.innerHTML =
                    '<ch-breadcrumb-item>one</ch-breadcrumb-item><ch-breadcrumb-item>two</ch-breadcrumb-item><span slot="separator">|</span>';
                  await elementUpdated(el);
                  const items = [...el.querySelectorAll('ch-breadcrumb-item')] as CoreBreadcrumbItem[];
                  expect(items[0].querySelector('[slot="separator"]')).not.to.be.null;
                  expect(items[0].querySelector('[slot="separator"]')?.textContent?.trim()).to.equal('|');
                },
              },
              defaultSeparator: {
                description: 'places the default chevron between items and not after the last item',
                test: async () => {
                  const el = this.component;
                  el.innerHTML =
                    '<ch-breadcrumb-item>one</ch-breadcrumb-item><ch-breadcrumb-item>two</ch-breadcrumb-item>';
                  await elementUpdated(el);
                  const items = [...el.querySelectorAll<CoreBreadcrumbItem>('ch-breadcrumb-item')];
                  const separator = items[0].querySelector(':scope > [slot="separator"]');
                  expect(separator?.getAttribute('name')).to.equal('chevron-right');
                  expect(items[1].querySelector('[slot="separator"]')).to.be.null;
                },
              },
              rtlMirrorsDefaultChevron: {
                description: 'mirrors the default chevron in rtl',
                test: async () => {
                  const el = this.component;
                  el.innerHTML =
                    '<ch-breadcrumb-item>one</ch-breadcrumb-item><ch-breadcrumb-item>two</ch-breadcrumb-item>';
                  el.dir = 'rtl';
                  await elementUpdated(el);
                  const wrapper = el
                    .querySelector('ch-breadcrumb-item')!
                    .shadowRoot!.querySelector<HTMLElement>('.separator')!;
                  expect(getComputedStyle(wrapper).transform).to.match(/^matrix\(-1/);
                },
              },
              customSeparatorMirrored: {
                description: 'mirrors a custom separator in rtl',
                test: async () => {
                  const el = this.component;
                  el.innerHTML =
                    '<span slot="separator">|</span><ch-breadcrumb-item>one</ch-breadcrumb-item><ch-breadcrumb-item>two</ch-breadcrumb-item>';
                  el.dir = 'rtl';
                  await elementUpdated(el);
                  const wrapper = el
                    .querySelector('ch-breadcrumb-item')!
                    .shadowRoot!.querySelector<HTMLElement>('.separator')!;
                  expect(getComputedStyle(wrapper).transform).to.match(/^matrix\(-1/);
                },
              },
              wrappedItems: {
                description: 'updates separator and current state on items inside wrappers',
                test: async () => {
                  const el = this.component;
                  el.innerHTML =
                    '<ch-tooltip><ch-breadcrumb-item>one</ch-breadcrumb-item></ch-tooltip><ch-breadcrumb-item>two</ch-breadcrumb-item>';
                  await elementUpdated(el);
                  await Promise.resolve();
                  const items = [...el.querySelectorAll('ch-breadcrumb-item')] as CoreBreadcrumbItem[];

                  expect(items[0].separator).to.be.true;
                  expect(items[0].current).to.be.undefined;
                  expect(items[1].separator).to.be.false;
                  expect(items[1].current).to.equal('page');
                },
              },
              scopedItems: {
                description: 'manages items registered in a suffixed scope',
                test: async () => {
                  createScope({ suffix: 'crumbs', components: [CoreBreadcrumb, CoreBreadcrumbItem] });
                  const el = await fixture<CoreBreadcrumb>(
                    html`<ch-breadcrumb_crumbs label="Scoped">
                      <ch-breadcrumb-item_crumbs>one</ch-breadcrumb-item_crumbs>
                      <ch-breadcrumb-item_crumbs>two</ch-breadcrumb-item_crumbs>
                    </ch-breadcrumb_crumbs>`
                  );
                  // Let the slotchange that places separators land.
                  await aTimeout(0);
                  const items = [...el.querySelectorAll<CoreBreadcrumbItem>('ch-breadcrumb-item_crumbs')];

                  expect(items[0].separator).to.be.true;
                  expect(items[0].querySelector(':scope > [slot="separator"]')).not.to.be.null;
                  expect(items[1].separator).to.be.false;
                  expect(items[1].current).to.equal('page');
                },
              },
            },
          },
        },
      },
    });
  }
}
