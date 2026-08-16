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
                description: 'renders a visually-hidden label for assistive tech when a label is provided',
                test: async () => {
                  const el = this.component;
                  el.label = 'Close';
                  await elementUpdated(el);
                  const base = el.shadowRoot?.querySelector('[part="icon-base"]');
                  expect(base?.getAttribute('role')).to.equal('img');
                  expect(base?.querySelector('.visually-hidden')?.textContent).to.equal('Close');
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
              rotateAndFlipTransform: {
                description: 'applies rotation and flip values to the rendered svg',
                test: async () => {
                  const el = this.component;
                  el.rotate = 90;
                  el.flip = 'both';
                  await elementUpdated(el);
                  expect(el.style.getPropertyValue('--icon-rotate')).to.equal('90deg');
                  expect(el.style.getPropertyValue('--icon-scale-x')).to.equal('-1');
                  expect(el.style.getPropertyValue('--icon-scale-y')).to.equal('-1');
                },
              },
              svgStableAcrossUpdates: {
                description: 'keeps a stable svg node across updates without re-rendering',
                test: async () => {
                  const el = this.component;
                  el.name = 'checkmark';
                  await elementUpdated(el);
                  const svg = el.shadowRoot?.querySelector('svg');
                  await elementUpdated(el);
                  await elementUpdated(el);
                  expect(el.shadowRoot?.querySelector('svg')).to.equal(svg);
                },
              },
              viewBoxPreserved: {
                description: 'preserves the source viewBox instead of forcing one',
                test: async () => {
                  const el = this.component;
                  el.name = 'warning';
                  await elementUpdated(el);
                  expect(el.shadowRoot?.querySelector('svg')?.getAttribute('viewBox')).to.equal('0 0 12 12');
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
