import { aTimeout, elementUpdated, expect, waitUntil } from '@open-wc/testing';
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
                test: async () => {
                  const el = this.component;
                  // Disable pointer events-- Chromium gets a mouse out event on ADO
                  el.style.pointerEvents = 'none';
                  el.open = true;
                  await elementUpdated(el);
                  await aTimeout(500);

                  const body = el.shadowRoot!.querySelector<HTMLElement>('[part="body"]')!;
                  expect(body.hidden).to.be.false;
                  expect(getComputedStyle(body).opacity).to.equal('1');
                },
              },
              notVisibleWhenClosed: {
                description: '.should not be visible when closed',
                test: async () => {
                  const el = this.component;
                  el.open = false;
                  await elementUpdated(el);
                  await aTimeout(500);
                  const body = el.shadowRoot!.querySelector<HTMLElement>('[part="body"]')!;
                  expect(body.hidden).to.be.true;
                  expect(getComputedStyle(body).opacity).to.equal('0');
                },
              },
              disabled: {
                description: 'should hide the tooltip when tooltip is visible and disabled becomes true',
                test: async () => {
                  const el = this.component;
                  el.open = true;
                  await elementUpdated(el);
                  await aTimeout(200);

                  const body = el.shadowRoot!.querySelector<HTMLElement>('[part="body"]')!;
                  el.disabled = true;

                  await elementUpdated(el);
                  await aTimeout(200);

                  expect(body.hidden).to.be.true;
                  expect(getComputedStyle(body).opacity).to.equal('0');
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
                test: async () => {
                  const el = this.component;
                  // Disable pointer events-- Chromium gets a mouse out event on ADO
                  el.style.pointerEvents = 'none';
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
                  expect(getComputedStyle(body).opacity).to.equal('1');
                },
              },
              showFromAttribute: {
                description: 'should emit tooltip-show and tooltip-after-show when setting open = true',
                test: async () => {
                  const el = this.component;
                  // Disable pointer events-- Chromium gets a mouse out event on ADO
                  el.style.pointerEvents = 'none';
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
                  expect(getComputedStyle(body).opacity).to.equal('1');
                },
              },
              hide: {
                description: 'should emit tooltip-hide and tooltip-after-hide when calling hide()',
                test: async () => {
                  const el = this.component;
                  // Disable pointer events-- Chromium gets a mouse out event on ADO
                  el.style.pointerEvents = 'none';
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
                  expect(getComputedStyle(body).opacity).to.equal('0');
                },
              },
              hideFromAttribute: {
                description: 'should emit tooltip-hide and tooltip-after-hide when setting open = false',
                test: async () => {
                  const el = this.component;
                  // Disable pointer events-- Chromium gets a mouse out event on ADO
                  el.style.pointerEvents = 'none';
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
                  expect(getComputedStyle(body).opacity).to.equal('0');
                },
              },
              liveRegionAnnouncement: {
                description: 'should update live region content when tooltip is shown',
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
