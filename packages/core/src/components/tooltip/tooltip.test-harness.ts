import { aTimeout, elementUpdated, expect, oneEvent, waitUntil } from '@open-wc/testing';
import sinon from 'sinon';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import { CorePopup } from '../popup/index.js';
import { CoreTooltip } from './index.js';

// Headless WebKit throttles timers while the suite runs every test file, so the
// transition-settle timer (transitionMaxTime + 50ms) can land past waitUntil's
// 1000ms default. Give all settle-driven waits a generous window.
const SETTLE_WAIT_TIMEOUT = 5000;

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
                  await waitUntil(() => getComputedStyle(body).opacity === '1', undefined, {
                    timeout: SETTLE_WAIT_TIMEOUT,
                  });
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
                  expect(el.shadowRoot!.querySelector('[part="body"]')).to.be.null;
                },
              },
              lazyContent: {
                description: 'should render content on first show and describe the anchor while closed',
                config: { trigger: 'manual' },
                test: async () => {
                  const el = this.component;
                  const anchor = el.querySelector('button')!;
                  expect(el.shadowRoot!.querySelector('[part="body"]')).to.be.null;
                  const descriptionId = anchor.getAttribute('aria-describedby')!;
                  expect(descriptionId).to.match(/ch-tooltip-description-/);
                  const description = document.getElementById(descriptionId)!;
                  expect(description.textContent).to.equal('This is a tooltip');
                  // The description must resolve in the anchor's tree scope.
                  expect(description.getRootNode()).to.equal(anchor.getRootNode());

                  el.open = true;
                  await elementUpdated(el);
                  expect(el.shadowRoot!.querySelector('[part="body"]')).to.exist;

                  el.open = false;
                  await elementUpdated(el);
                  expect(el.shadowRoot!.querySelector('[part="body"]')).to.exist;
                  expect(anchor.getAttribute('aria-describedby')).to.equal(descriptionId);
                },
              },
              descriptionTracksContent: {
                description: 'should update the anchor description when content changes while open',
                config: { trigger: 'manual' },
                test: async () => {
                  const el = this.component;
                  const anchor = el.querySelector('button')!;
                  el.open = true;
                  await elementUpdated(el);

                  el.content = 'Updated tooltip';
                  await elementUpdated(el);
                  const description = document.getElementById(anchor.getAttribute('aria-describedby')!)!;
                  expect(description.textContent).to.equal('Updated tooltip');

                  const slotted = document.createElement('span');
                  slotted.slot = 'content';
                  slotted.textContent = 'Slotted tooltip';
                  el.append(slotted);
                  await waitUntil(() => description.textContent === 'Slotted tooltip');
                },
              },
              descriptionRemovedOnDisconnectAndDisable: {
                description: 'should remove the anchor description when disabled or disconnected',
                config: { trigger: 'manual' },
                test: async () => {
                  const el = this.component;
                  const anchor = el.querySelector('button')!;
                  anchor.setAttribute('aria-describedby', `external ${anchor.getAttribute('aria-describedby')}`);

                  el.disabled = true;
                  expect(anchor.getAttribute('aria-describedby')).to.equal('external');
                  el.disabled = false;
                  expect(anchor.getAttribute('aria-describedby')).to.match(/^external ch-tooltip-description-/);

                  const parent = el.parentElement!;
                  el.remove();
                  expect(anchor.getAttribute('aria-describedby')).to.equal('external');
                  expect(el.querySelector('[id^="ch-tooltip-description-"]')).to.be.null;
                  parent.append(el);
                },
              },
              preservesContentDuringHide: {
                description: 'should preserve tooltip text until the hide transition completes',
                config: { trigger: 'manual' },
                test: async () => {
                  const el = this.component;
                  el.style.setProperty('--charm-tooltip-hide-transition', 'opacity 0.1s');
                  el.style.setProperty('--charm-popup-hide-transition', 'opacity 1s');
                  el.open = true;
                  await oneEvent(el, 'tooltip-after-show');

                  const body = el.shadowRoot!.querySelector<HTMLElement>('[part="body"]')!;
                  expect(body.textContent).to.contain('This is a tooltip');

                  const afterHide = oneEvent(el, 'tooltip-after-hide');
                  el.hide();
                  await elementUpdated(el);
                  await aTimeout(200);

                  expect(body.hidden).to.be.false;
                  expect(body.textContent).to.contain('This is a tooltip');
                  await afterHide;
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
                  await waitUntil(() => getComputedStyle(body).opacity === '0', undefined, {
                    timeout: SETTLE_WAIT_TIMEOUT,
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
              show: {
                description: 'should emit tooltip-show and tooltip-after-show when calling show()',
                // Use manual trigger so Chromium's synthetic hover events can't race the manual open/close.
                config: { trigger: 'manual' },
                test: async () => {
                  const el = this.component;
                  el.open = false;
                  await elementUpdated(el);
                  await aTimeout(200);

                  const showHandler = sinon.spy();
                  const afterShowHandler = sinon.spy();

                  el.addEventListener('tooltip-show', showHandler);
                  el.addEventListener('tooltip-after-show', afterShowHandler);
                  el.show();

                  await waitUntil(() => showHandler.calledOnce, undefined, { timeout: SETTLE_WAIT_TIMEOUT });
                  await waitUntil(() => afterShowHandler.calledOnce, undefined, { timeout: SETTLE_WAIT_TIMEOUT });

                  const body = el.shadowRoot!.querySelector<HTMLElement>('[part="body"]')!;
                  expect(body.hidden).to.be.false;
                  await waitUntil(() => getComputedStyle(body).opacity === '1', undefined, {
                    timeout: SETTLE_WAIT_TIMEOUT,
                  });
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

                  const showHandler = sinon.spy();
                  const afterShowHandler = sinon.spy();

                  el.addEventListener('tooltip-show', showHandler);
                  el.addEventListener('tooltip-after-show', afterShowHandler);
                  el.open = true;

                  await waitUntil(() => showHandler.calledOnce, undefined, { timeout: SETTLE_WAIT_TIMEOUT });
                  await waitUntil(() => afterShowHandler.calledOnce, undefined, { timeout: SETTLE_WAIT_TIMEOUT });

                  const body = el.shadowRoot!.querySelector<HTMLElement>('[part="body"]')!;
                  expect(body.hidden).to.be.false;
                  await waitUntil(() => getComputedStyle(body).opacity === '1', undefined, {
                    timeout: SETTLE_WAIT_TIMEOUT,
                  });
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

                  await waitUntil(() => hideHandler.calledOnce, undefined, { timeout: SETTLE_WAIT_TIMEOUT });
                  await waitUntil(() => afterHideHandler.calledOnce, undefined, { timeout: SETTLE_WAIT_TIMEOUT });

                  expect(body.hidden).to.be.true;
                  await waitUntil(() => getComputedStyle(body).opacity === '0', undefined, {
                    timeout: SETTLE_WAIT_TIMEOUT,
                  });
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

                  await waitUntil(() => hideHandler.calledOnce, undefined, { timeout: SETTLE_WAIT_TIMEOUT });
                  await waitUntil(() => afterHideHandler.calledOnce, undefined, { timeout: SETTLE_WAIT_TIMEOUT });

                  expect(body.hidden).to.be.true;
                  await waitUntil(() => getComputedStyle(body).opacity === '0', undefined, {
                    timeout: SETTLE_WAIT_TIMEOUT,
                  });
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
                  await waitUntil(() => showHandler.calledOnce, undefined, { timeout: SETTLE_WAIT_TIMEOUT });

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
            tests: {
              staysOpenWhenMovingAnchorToTooltip: {
                description: 'stays open when the pointer moves from the anchor into the tooltip',
                config: { trigger: 'hover' },
                test: async () => {
                  const el = this.component;
                  const anchor = el.querySelector('button')!;
                  anchor.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, composed: true }));
                  await waitUntil(() => el.open, undefined, { timeout: SETTLE_WAIT_TIMEOUT });
                  const body = el.shadowRoot!.querySelector<HTMLElement>('[part="body"]')!;

                  anchor.dispatchEvent(
                    new MouseEvent('mouseout', { bubbles: true, composed: true, relatedTarget: body })
                  );
                  // hide-delay is 0ms, so a regression here would close the tooltip almost immediately.
                  await aTimeout(100);
                  expect(el.open).to.be.true;
                },
              },
              staysOpenWhenMovingTooltipToAnchor: {
                description: 'stays open when the pointer moves from the tooltip into the anchor',
                config: { trigger: 'hover' },
                test: async () => {
                  const el = this.component;
                  const anchor = el.querySelector('button')!;
                  anchor.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, composed: true }));
                  await waitUntil(() => el.open, undefined, { timeout: SETTLE_WAIT_TIMEOUT });
                  const body = el.shadowRoot!.querySelector<HTMLElement>('[part="body"]')!;

                  body.dispatchEvent(
                    new MouseEvent('mouseout', { bubbles: true, composed: true, relatedTarget: anchor })
                  );
                  await aTimeout(100);
                  expect(el.open).to.be.true;
                },
              },
              hidesWhenPointerFullyLeaves: {
                description: 'hides when the pointer fully leaves the anchor and tooltip',
                config: { trigger: 'hover' },
                test: async () => {
                  const el = this.component;
                  const anchor = el.querySelector('button')!;

                  anchor.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, composed: true }));
                  await waitUntil(() => el.open, undefined, { timeout: SETTLE_WAIT_TIMEOUT });

                  anchor.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, composed: true }));
                  await waitUntil(() => !el.open, undefined, { timeout: SETTLE_WAIT_TIMEOUT });
                },
              },
              pressDismissesUntilRearmed: {
                description: 'light dismisses on press and keeps the tooltip hidden until re-armed',
                config: { trigger: 'hover focus' },
                test: async () => {
                  const el = this.component;
                  const anchor = el.querySelector('button')!;

                  anchor.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, composed: true }));
                  await waitUntil(() => el.open, undefined, { timeout: SETTLE_WAIT_TIMEOUT });

                  anchor.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, composed: true }));
                  await waitUntil(() => !el.open, undefined, { timeout: SETTLE_WAIT_TIMEOUT });

                  // Re-hovering while dismissed must not reopen the tooltip.
                  anchor.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, composed: true }));
                  // Longer than the 300ms show-delay to prove the hover was ignored.
                  await aTimeout(350);
                  expect(el.open).to.be.false;

                  // Fully leaving the anchor re-arms hover.
                  anchor.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, composed: true }));
                  await aTimeout(50);

                  anchor.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, composed: true }));
                  await waitUntil(() => el.open, undefined, { timeout: SETTLE_WAIT_TIMEOUT });
                },
              },
              focusReopensAfterMove: {
                description: 'shows on anchor focus after the tooltip is moved to a new parent',
                config: { trigger: 'focus' },
                test: async () => {
                  const el = this.component;
                  const anchor = el.querySelector('button')!;
                  const newParent = document.createElement('div');
                  el.parentElement!.append(newParent);
                  newParent.append(el);
                  await elementUpdated(el);

                  anchor.focus();
                  await waitUntil(() => el.open, undefined, { timeout: SETTLE_WAIT_TIMEOUT });
                  expect(anchor.getAttribute('aria-describedby')).to.match(/ch-tooltip-description-/);
                  anchor.blur();
                },
              },
              focusAfterPressStaysDismissed: {
                description: 'does not reopen on the focus that follows a press',
                config: { trigger: 'hover focus' },
                test: async () => {
                  const el = this.component;
                  const anchor = el.querySelector('button')!;
                  anchor.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, composed: true }));
                  anchor.dispatchEvent(new FocusEvent('focus'));
                  expect(el.open).to.be.false;
                  anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
                  await aTimeout(50);
                  expect(el.open).to.be.false;
                },
              },
              escapeOnAnchorStopsPropagation: {
                description: 'closes only the tooltip when Escape is pressed on the anchor',
                config: { trigger: 'manual' },
                test: async () => {
                  const el = this.component;
                  const anchor = el.querySelector('button')!;
                  el.open = true;
                  await elementUpdated(el);

                  const hideHandler = sinon.spy();
                  const outerListener = sinon.spy();
                  el.addEventListener('tooltip-hide', hideHandler);
                  el.parentElement!.addEventListener('keydown', outerListener);
                  anchor.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true }));
                  el.parentElement!.removeEventListener('keydown', outerListener);

                  expect(el.open).to.be.false;
                  expect(hideHandler).to.have.been.calledOnce;
                  expect(outerListener).not.to.have.been.called;
                },
              },
              escapeDismissesHoverTooltip: {
                description: 'dismisses an open hover tooltip on Escape without swallowing the key event',
                config: { trigger: 'hover' },
                test: async () => {
                  const el = this.component;
                  const anchor = el.querySelector('button')!;
                  anchor.dispatchEvent(new MouseEvent('mouseover', { bubbles: true, composed: true }));
                  await waitUntil(() => el.open, undefined, { timeout: SETTLE_WAIT_TIMEOUT });

                  const outerListener = sinon.spy();
                  document.addEventListener('keydown', outerListener, { once: true });
                  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

                  expect(el.open).to.be.false;
                  expect(outerListener).to.have.been.calledOnce;
                },
              },
            },
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
