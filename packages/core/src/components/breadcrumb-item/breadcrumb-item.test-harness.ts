import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import sinon from 'sinon';
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
            description: 'is accessible when used inside a breadcrumb list',
            test: async () => {
              const parent = await fixture(
                html`<nav aria-label="Breadcrumb navigation">
                  <div role="list">
                    <ch-breadcrumb-item href="/current">Current page</ch-breadcrumb-item>
                  </div>
                </nav>`
              );
              await expect(parent).to.be.accessible();
            },
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
              nonLinkTextControl: {
                description: 'renders non-interactive text when no href is set',
                test: async () => {
                  const el = this.component;
                  expect(el.shadowRoot?.querySelector('.control')?.tagName).to.equal('SPAN');
                },
              },
              anchorWithHref: {
                description: 'renders an anchor control when href is set',
                test: async () => {
                  const el = this.component;
                  el.href = 'https://example.com';
                  await elementUpdated(el);
                  expect(el.shadowRoot?.querySelector('.control')?.tagName).to.equal('A');
                },
              },
              disabledIsNonInteractive: {
                description: 'renders disabled links as non-interactive text',
                test: async () => {
                  const el = this.component;
                  el.href = '/disabled';
                  el.disabled = true;
                  await elementUpdated(el);
                  const control = el.shadowRoot?.querySelector('.control');
                  expect(control?.tagName).to.equal('SPAN');
                  expect(control?.getAttribute('aria-disabled')).to.equal('true');
                },
              },
              clickDispatchesOnce: {
                description: 'dispatches only one composed click when click() is called',
                test: async () => {
                  const el = this.component;
                  el.href = '/destination';
                  await elementUpdated(el);
                  const spy = sinon.spy();
                  el.addEventListener('click', event => {
                    event.preventDefault();
                    spy();
                  });
                  el.click();
                  expect(spy).to.have.been.calledOnce;
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
