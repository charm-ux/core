import { aTimeout, elementUpdated, expect, oneEvent, waitUntil } from '@open-wc/testing';
import sinon from 'sinon';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import { CorePopup } from '../popup/index.js';
import { CoreTooltip } from './index.js';

export class CoreTooltipTests<T extends CoreTooltip> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      tooltip: {
        description: 'tooltip',
        tests: {
          // attribute and property tests
          properties: {
            description: 'properties',
            tests: {
              visibleWhenOpen: {
                description: 'should be visible when open',
                // Use manual trigger so Chromium's synthetic hover events can't race the manual open/close.
                config: { trigger: 'manual' },
                test: async () => {
                  const el = this.component;
                  // The after-show event is emitted once the show transition has settled, which is the
                  // authoritative signal that the body is visible. Waiting for it avoids racing the
                  // requestAnimationFrame-driven visible class and its CSS opacity transition.
                  const afterShow = oneEvent(el, 'tooltip-after-show');
                  el.open = true;
                  await afterShow;

                  const body = el.shadowRoot!.querySelector<HTMLElement>('[part="body"]')!;
                  expect(body.hidden).to.be.false;
                  // The after-show event settles via a timer; let the compositor catch up before
                  // reading the computed opacity so headless WebKit can't resolve the event first.
                  await waitUntil(() => getComputedStyle(body).opacity === '1');
                },
              },
              notVisibleWhenClosed: {
                description: '.should not be visible when closed',
                // Use manual trigger so Chromium's synthetic hover events can't show the closed tooltip.
                config: { trigger: 'manual' },
                test: async () => {
                  const el = this.component;
                  el.open = false;
                  await elementUpdated(el);
                  await aTimeout(500);
                  const body = el.shadowRoot!.querySelector<HTMLElement>('[part="body"]')!;
                  expect(body.hidden).to.be.true;
                  await waitUntil(() => getComputedStyle(body).opacity === '0');
                },
              },
              disabled: {
                description: 'should hide the tooltip when tooltip is visible and disabled becomes true',
                // Use manual trigger so Chromium's synthetic hover events can't race the manual open/close.
                config: { trigger: 'manual' },
                test: async () => {
                  const el = this.component;
                  // Wait for the show transition to fully settle before disabling the tooltip.
                  const afterShow = oneEvent(el, 'tooltip-after-show');
                  el.open = true;
                  await afterShow;

                  const body = el.shadowRoot!.querySelector<HTMLElement>('[part="body"]')!;
                  expect(body.hidden).to.be.false;

                  // hide() is triggered by the disabled setter and its side effects only run once the
                  // hide transition settles, so wait for the after-hide event before asserting.
                  const afterHide = oneEvent(el, 'tooltip-after-hide');
                  el.disabled = true;
                  await afterHide;

                  expect(body.hidden).to.be.true;
                  await waitUntil(() => getComputedStyle(body).opacity === '0');
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
              show: {
                description: 'should emit tooltip-show and tooltip-after-show when calling show()',
                // Use manual trigger so Chromium's synthetic hover events can't race the manual open/close.
                config: { trigger: 'manual' },
                test: async () => {
                  const el = this.component;
                  el.open = false;
                  await elementUpdated(el);
                  await aTimeout(200);

                  const body = el.shadowRoot!.querySelector<HTMLElement>('[part="body"]')!;
                  const showHandler = sinon.spy();
                  const afterShowHandler = sinon.spy();

                  el.addEventListener('tooltip-show', showHandler);
                  el.addEventListener('tooltip-after-show', afterShowHandler);
                  el.show();

                  await waitUntil(() => showHandler.calledOnce);
                  await waitUntil(() => afterShowHandler.calledOnce);

                  expect(body.hidden).to.be.false;
                  await waitUntil(() => getComputedStyle(body).opacity === '1');
                },
              },
              showFromAttribute: {
                description: 'should emit tooltip-show and tooltip-after-show when setting open = true',
                // Use manual trigger so Chromium's synthetic hover events can't race the manual open/close.
                config: { trigger: 'manual' },
                test: async () => {
                  const el = this.component;
                  el.open = false;
                  await elementUpdated(el);
                  await aTimeout(200);

                  const body = el.shadowRoot!.querySelector<HTMLElement>('[part="body"]')!;
                  const showHandler = sinon.spy();
                  const afterShowHandler = sinon.spy();

                  el.addEventListener('tooltip-show', showHandler);
                  el.addEventListener('tooltip-after-show', afterShowHandler);
                  el.open = true;

                  await waitUntil(() => showHandler.calledOnce);
                  await waitUntil(() => afterShowHandler.calledOnce);

                  expect(body.hidden).to.be.false;
                  await waitUntil(() => getComputedStyle(body).opacity === '1');
                },
              },
              hide: {
                description: 'should emit tooltip-hide and tooltip-after-hide when calling hide()',
                // Use manual trigger so Chromium's synthetic hover events can't race the manual open/close.
                config: { trigger: 'manual' },
                test: async () => {
                  const el = this.component;
                  el.open = true;
                  await elementUpdated(el);
                  await aTimeout(200);

                  const body = el.shadowRoot!.querySelector<HTMLElement>('[part="body"]')!;
                  const hideHandler = sinon.spy();
                  const afterHideHandler = sinon.spy();

                  el.addEventListener('tooltip-hide', hideHandler);
                  el.addEventListener('tooltip-after-hide', afterHideHandler);
                  el.hide();

                  await waitUntil(() => hideHandler.calledOnce);
                  await waitUntil(() => afterHideHandler.calledOnce);

                  expect(body.hidden).to.be.true;
                  await waitUntil(() => getComputedStyle(body).opacity === '0');
                },
              },
              hideFromAttribute: {
                description: 'should emit tooltip-hide and tooltip-after-hide when setting open = false',
                // Use manual trigger so Chromium's synthetic hover events can't race the manual open/close.
                config: { trigger: 'manual' },
                test: async () => {
                  const el = this.component;
                  el.open = true;
                  await elementUpdated(el);
                  await aTimeout(200);

                  const body = el.shadowRoot!.querySelector<HTMLElement>('[part="body"]')!;
                  const hideHandler = sinon.spy();
                  const afterHideHandler = sinon.spy();

                  el.addEventListener('tooltip-hide', hideHandler);
                  el.addEventListener('tooltip-after-hide', afterHideHandler);
                  el.hide();

                  await waitUntil(() => hideHandler.calledOnce);
                  await waitUntil(() => afterHideHandler.calledOnce);

                  expect(body.hidden).to.be.true;
                  await waitUntil(() => getComputedStyle(body).opacity === '0');
                },
              },
              liveRegionAnnouncement: {
                description: 'should update live region content when tooltip is shown',
                // Use manual trigger so Chromium's synthetic hover events can't race the manual open/close.
                config: { trigger: 'manual' },
                test: async () => {
                  const el = this.component;
                  el.content = 'Test tooltip content';
                  el.open = false;
                  await elementUpdated(el);

                  const showHandler = sinon.spy();
                  el.addEventListener('tooltip-show', showHandler);

                  el.open = true;
                  await elementUpdated(el);
                  await waitUntil(() => showHandler.calledOnce);

                  const liveRegion = el.shadowRoot!.querySelector('.visually-hidden');
                  expect(liveRegion).to.exist;
                  expect(liveRegion!.textContent!.trim()).to.equal('Test tooltip content');

                  expect(liveRegion!.getAttribute('aria-live')).to.equal('polite');
                  expect(liveRegion!.getAttribute('aria-atomic')).to.equal('true');

                  el.open = false;
                  await elementUpdated(el);

                  expect(liveRegion!.textContent!.trim()).to.equal('');
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

export class SiblingTooltipTests<T extends CoreTooltip> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      tooltip: {
        description: 'tooltip',
        tests: {
          // attribute and property tests
          properties: {
            description: 'properties',
            tests: {
              popoverHasAnchorElement: {
                description: 'popover should have anchor element found from anchor prop',
                test: async () => {
                  const el = this.component;
                  el.open = true;
                  await elementUpdated(el);
                  await aTimeout(200);
                  const anchor = document.querySelector<HTMLElement>('#tooltip-button');
                  const popup = el.shadowRoot?.querySelector<CorePopup>('[part="tooltip-base"]');
                  expect((popup?.anchor as HTMLElement).id).to.equal(anchor?.id);
                },
              },
            },
          },
        },
      },
    });
  }
}
