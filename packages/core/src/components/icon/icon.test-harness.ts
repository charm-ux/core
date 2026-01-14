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
