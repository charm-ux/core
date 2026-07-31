import { elementUpdated, expect, oneEvent } from '@open-wc/testing';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import { CoreIcon } from './index.js';

export class CoreIconTests<T extends CoreIcon> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      icon: {
        description: 'icon',
        tests: {
          properties: {
            description: 'properties',
            tests: {
              accessibleWithLabel: {
                description: 'should be accessible with label',
                test: async () => {
                  const el = this.component;
                  el.label = 'Label';
                  await el.updateComplete;
                  await expect(el).to.be.accessible();
                },
              },
              doesIconExist: {
                description: 'svg not rendered with an icon that does not exist in the library',
                test: async () => {
                  const el = this.component;
                  // @ts-ignore
                  el.name = 'does-not-exist';
                  await elementUpdated(el);
                  expect(el.shadowRoot?.querySelector('.question')).to.not.be.null;
                },
              },
              roleImgWhenLabel: {
                description: 'sets role="img" and aria-label on the icon base when a label is provided',
                test: async () => {
                  const el = this.component;
                  el.label = 'Close';
                  await elementUpdated(el);
                  const base = el.shadowRoot?.querySelector('[part="icon-base"]');
                  expect(base?.getAttribute('role')).to.equal('img');
                  expect(base?.getAttribute('aria-label')).to.equal('Close');
                },
              },
              ariaHiddenWithoutLabel: {
                description: 'marks the icon base as aria-hidden when no label is provided',
                test: async () => {
                  const el = this.component;
                  const base = el.shadowRoot?.querySelector('[part="icon-base"]');
                  expect(base?.getAttribute('aria-hidden')).to.equal('true');
                },
              },
            },
          },
          events: {
            description: 'events',
            tests: {
              iconRetrievalError: {
                description: 'emits `icon-error` when the file cant be retrieved',
                test: async () => {
                  const el = this.component;
                  const listener = oneEvent(el, 'icon-error') as Promise<CustomEvent>;
                  el.url = 'https://www.example.com/bad-url.svg';
                  const ev = await listener;
                  await elementUpdated(el);
                  expect(el.shadowRoot?.querySelector('.question')).to.not.be.null;
                  expect(ev).to.exist;
                },
              },
            },
          },
        },
      },
    });
  }
}
