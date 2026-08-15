import { elementUpdated, expect, oneEvent } from '@open-wc/testing';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import type { CorePopup } from './index.js';
import type { PopupPlacement } from './popup.js';

export class CorePopupTests<T extends CorePopup> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      popup: {
        description: 'popup',
        tests: {
          // attribute and property tests
          properties: {
            description: 'properties',
            tests: {
              open: {
                description: 'shows the popup when open',
                test: async () => {
                  const el = this.component;
                  const popup = el.shadowRoot!.querySelector('.popup') as HTMLElement;

                  expect(getComputedStyle(popup).opacity).to.equal('0');

                  el.open = true;
                  await elementUpdated(el);

                  expect(el.hasAttribute('open')).to.equal(true);
                  expect(popup.hidden).to.equal(false);
                },
              },
              anchorFromId: {
                description: 'should set anchor element when using `anchor` set to an ID',
                test: async () => {
                  const el = this.component;

                  const anchor = document.createElement('span');
                  anchor.id = 'anchor';
                  el.after(anchor);
                  el.anchor = 'anchor';

                  await elementUpdated(el);
                  await elementUpdated(el);

                  // @ts-expect-error anchorEl is private
                  expect(el.anchorEl).to.equal(document.querySelector('#anchor'));
                },
              },
              anchorFromElement: {
                description: 'should set anchor element when using `anchor` set to an element',
                test: async () => {
                  const el = this.component;

                  const anchor = document.createElement('span');
                  el.after(anchor);
                  el.anchor = anchor;

                  await elementUpdated(el);
                  await elementUpdated(el);

                  // @ts-expect-error anchorEl is private
                  expect(el.anchorEl).to.equal(anchor);
                },
              },
              arrow: {
                description: 'should render an arrow when `arrow` is set',
                test: async () => {
                  const el = this.component;
                  el.innerHTML = `
                    <span slot="anchor"></span>
                    <div></div>
                  `;
                  el.arrow = true;
                  el.open = true;
                  await elementUpdated(el);

                  await oneEvent(el, 'popup-reposition');

                  expect(el.shadowRoot!.querySelector('.arrow')).to.not.be.null;
                },
              },
              autosize: {
                description: '',
                test: async () => {
                  const el = this.component;
                  el.innerHTML = `
                    <span slot="anchor"></span>
                    <div style="width: 100px; height: 100px"></div>
                    `;
                  el.open = true;
                  await elementUpdated(el);

                  await oneEvent(el, 'popup-reposition');

                  expect(el.style.getPropertyValue('--popup-auto-size-available-width')).to.equal('');
                  expect(el.style.getPropertyValue('--popup-auto-size-available-height')).to.equal('');

                  el.autoSize = 'both';
                  await oneEvent(el, 'popup-reposition');

                  expect(el.style.getPropertyValue('--popup-auto-size-available-width')).to.contain('px');
                  expect(el.style.getPropertyValue('--popup-auto-size-available-height')).to.contain('px');

                  el.autoSize = 'vertical';
                  await oneEvent(el, 'popup-reposition');

                  expect(el.style.getPropertyValue('--popup-auto-size-available-width')).to.equal('');
                  expect(el.style.getPropertyValue('--popup-auto-size-available-height')).to.contain('px');

                  el.autoSize = 'horizontal';
                  await oneEvent(el, 'popup-reposition');

                  expect(el.style.getPropertyValue('--popup-auto-size-available-width')).to.contain('px');
                  expect(el.style.getPropertyValue('--popup-auto-size-available-height')).to.equal('');
                },
              },
              scrollBoundary: {
                description: 'uses overflow ancestors when `boundary` is set to `scroll`',
                test: async () => {
                  const el = this.component;
                  const scrollContainer = document.createElement('div');
                  const anchor = document.createElement('span');

                  scrollContainer.style.position = 'relative';
                  scrollContainer.style.overflow = 'auto';
                  scrollContainer.style.width = '120px';
                  scrollContainer.style.height = '120px';
                  anchor.style.display = 'inline-block';
                  anchor.style.width = '20px';
                  anchor.style.height = '20px';
                  scrollContainer.append(anchor);
                  document.body.append(scrollContainer);

                  el.anchor = anchor;
                  el.boundary = 'scroll';
                  el.flip = true;
                  el.shift = true;
                  el.autoSize = 'both';
                  el.open = true;
                  await elementUpdated(el);

                  await oneEvent(el, 'popup-reposition');

                  expect(el.style.getPropertyValue('--popup-auto-size-available-width')).to.contain('px');
                  expect(el.style.getPropertyValue('--popup-auto-size-available-height')).to.contain('px');

                  scrollContainer.remove();
                },
              },
              sync: {
                description: 'should sync popup size to anchor size if using `sync`',
                test: async () => {
                  const el = this.component;
                  el.sync = 'width';
                  el.open = true;
                  el.innerHTML = `
                      <span slot="anchor" style="position: absolute; top: 0; left:0; width: 100px; height: 100px"></span>
                      <div style="width: 100%; height: 100%"></div>
                    `;
                  await elementUpdated(el);

                  await oneEvent(el, 'popup-reposition');
                  await elementUpdated(el);

                  // @ts-ignore
                  expect(el.popup?.style.width).to.equal('100px');
                  // @ts-ignore
                  expect(el.popup?.style.height).to.equal('');

                  el.sync = 'height';
                  await oneEvent(el, 'popup-reposition');
                  // @ts-ignore
                  expect(el.popup?.style.height).to.equal('100px');
                  // @ts-ignore
                  expect(el.popup?.style.width).to.equal('');

                  el.sync = 'both';
                  await oneEvent(el, 'popup-reposition');
                  // @ts-ignore
                  expect(el.popup?.style.width).to.equal('100px');
                  // @ts-ignore
                  expect(el.popup?.style.height).to.equal('100px');
                },
              },
              positioning: {
                description: 'popup should be positioned correctly on load',
                test: async () => {
                  const el = this.component;
                  el.innerHTML = `
                    <span slot="anchor"></span>
                    <div style="width: 100px; height: 100px"></div>
                  `;
                  el.distance = 20;
                  await oneEvent(el, 'popup-reposition');
                  await elementUpdated(el);
                  expect(el.style.getPropertyValue('--hover-bridge-top-left-x')).to.exist;
                },
              },
              popupPlacements: {
                description:
                  'should return correct Floating UI Placement from a PopupPlacement with `floatingUIPlacement()`',
                test: async () => {
                  const el = this.component;
                  el.open = true;
                  await elementUpdated(el); // these should match popup placement exactly

                  const unchangedPositions: Array<PopupPlacement> = [
                    'top',
                    'top-start',
                    'top-end',
                    'bottom',
                    'bottom-start',
                    'bottom-end',
                  ];

                  // the rest change to appropriate floating ui placement
                  const changedPositionsMap = [
                    { popupPlacement: 'start', floatingPlacement: 'left' },
                    { popupPlacement: 'start-top', floatingPlacement: 'left-start' },
                    { popupPlacement: 'start-bottom', floatingPlacement: 'left-end' },
                    { popupPlacement: 'end', floatingPlacement: 'right' },
                    { popupPlacement: 'end-top', floatingPlacement: 'right-start' },
                    { popupPlacement: 'end-bottom', floatingPlacement: 'right-end' },
                  ];

                  unchangedPositions.forEach(position => {
                    // @ts-expect-error - private method
                    expect(el.floatingUIPlacement(position)).to.equal(position);
                  });

                  changedPositionsMap.forEach(({ popupPlacement, floatingPlacement }) => {
                    // @ts-expect-error - private method
                    expect(el.floatingUIPlacement(popupPlacement)).to.equal(floatingPlacement);
                  });
                },
              },
            },
          },

          // method tests
          methods: {
            description: 'methods',
            tests: {},
          },

          // slot tests
          slots: {
            description: 'slots',
            tests: {},
          },

          // event tests
          events: {
            description: 'events',
            tests: {
              popupReposition: {
                description: 'emits `popup-reposition` event when the popup is repositioned',
                test: async () => {
                  const el = this.component;
                  el.placement = 'top';
                  el.open = true;
                  el.innerHTML = `
                    <span slot="anchor"></span>
                    <div></div>
                  `;
                  await elementUpdated(el);

                  el.placement = 'bottom';

                  await oneEvent(el, 'popup-reposition');
                },
              },
            },
          },

          // interaction tests
          interactions: {
            description: 'interactions',
            tests: {},
          },
        },
      },
    });
  }
}
