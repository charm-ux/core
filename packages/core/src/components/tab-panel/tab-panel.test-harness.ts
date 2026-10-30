import { elementUpdated, expect, fixture, html, oneEvent } from '@open-wc/testing';
import sinon from 'sinon';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import type { CoreTabPanel } from './index.js';
import '../tabs/index.js';
import '../tab/index.js';

export class CoreTabPanelTests<T extends CoreTabPanel> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      base: {
        description: 'base',
        tests: {
          accessibility: {
            description: 'is accessible inside a tab interface',
            test: async () => {
              const tabs = await fixture(
                html`<ch-tabs label="Test sections">
                  <ch-tab selected>One</ch-tab
                  ><ch-tab-panel><span style="color: #000">Panel content</span></ch-tab-panel>
                </ch-tabs>`
              );
              // This fixture focuses on tab semantics; contrast is owned by the shared theme, not this widget.
              await expect(tabs).to.be.accessible({ ignoredRules: ['color-contrast'] });
            },
          },
          attributes: {
            description: 'attributes',
            tests: {
              roleAndSlot: {
                description: 'has role=tabpanel and slot=tabpanel after connected',
                test: async () => {
                  const el = this.component;
                  // connectedCallback runs during creation in the test harness
                  await elementUpdated(el);
                  expect(el.getAttribute('role')).to.equal('tabpanel');
                  expect(el.getAttribute('slot')).to.equal('tabpanel');
                },
              },
              initiallyHidden: {
                description: 'is hidden by default',
                test: async () => {
                  const el = this.component;
                  await elementUpdated(el);
                  expect(el.hidden).to.be.true;
                },
              },
            },
          },
          visibility: {
            description: 'visibility and events',
            tests: {
              showEmitsTabShow: {
                description: 'setting visible=true emits tab-show and makes element visible',
                test: async () => {
                  const el = this.component;
                  el.style.transition = 'none';
                  let showEmitted = false;
                  el.addEventListener('tab-show', () => (showEmitted = true));
                  const afterShow = oneEvent(el, 'tab-after-show');

                  el.visible = true;
                  await elementUpdated(el);

                  // should have been un-hidden immediately
                  expect(el.hidden).to.be.false;
                  expect(showEmitted).to.be.true;

                  await afterShow;
                },
              },
              hideEmitsTabHide: {
                description: 'setting visible=false emits tab-hide and then tab-after-hide after transitionend',
                test: async () => {
                  const el = this.component;
                  el.style.transition = 'none';
                  let hideEmitted = false;
                  el.addEventListener('tab-hide', () => (hideEmitted = true));

                  // ensure visible starts true so hiding has effect
                  el.visible = true;
                  await elementUpdated(el);

                  // now hide
                  const afterHide = oneEvent(el, 'tab-after-hide');
                  el.visible = false;
                  await elementUpdated(el);

                  expect(hideEmitted).to.be.true;

                  await afterHide;
                  await elementUpdated(el);

                  // after hide, hidden should be true
                  expect(el.hidden).to.be.true;
                },
              },
              settlesOncePerChange: {
                description: 'settles on the longest duration despite a delay, and only once per change',
                test: async () => {
                  const el = this.component;
                  el.style.transition = 'opacity 200ms 300ms';
                  const afterShow = sinon.spy();
                  el.addEventListener('tab-after-show', afterShow);
                  const end = () =>
                    el.dispatchEvent(
                      new TransitionEvent('transitionend', { elapsedTime: 0.2, propertyName: 'opacity' })
                    );

                  el.visible = true;
                  await elementUpdated(el);
                  end();
                  expect(afterShow).to.have.been.calledOnce;
                  end();
                  expect(afterShow).to.have.been.calledOnce;
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
                  el.innerHTML = 'Panel content';
                  await elementUpdated(el);
                  const slot = el.shadowRoot?.querySelector('slot:not([name])') as HTMLSlotElement | null;
                  expect(slot).to.not.be.null;
                  const assigned = slot?.assignedNodes({ flatten: true }) ?? [];
                  expect(assigned.length).to.be.greaterThan(0);
                },
              },
              focusableTextOnlyPanel: {
                description: 'allows a text-only panel to receive keyboard focus',
                test: async () => {
                  const el = this.component;
                  el.innerHTML = 'Panel text';
                  await elementUpdated(el);
                  expect(el.getAttribute('tabindex')).to.equal('0');
                },
              },
              doesNotHideVisiblePanelOnReconnect: {
                description: 'preserves a visible panel when it is moved in the DOM',
                test: async () => {
                  const el = this.component;
                  el.visible = true;
                  await elementUpdated(el);
                  const parent = document.createElement('div');
                  el.replaceWith(parent);
                  parent.append(el);
                  await elementUpdated(el);
                  expect(el.hidden).to.be.false;
                },
              },
            },
          },
        },
      },
    });
  }
}
