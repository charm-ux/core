import { elementUpdated, expect } from '@open-wc/testing';
import sinon from 'sinon';
import { sendKeys } from '@web/test-runner-commands';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import CoreTab from '../tab/tab.js';
import type { CoreTabs } from './index.js';

export class CoreTabsTests<T extends CoreTabs> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      tabs: {
        description: 'Tabs',
        tests: {
          slots: {
            description: 'slots',
            tests: {
              defaultSlot: {
                description: 'place children in the default slot',
                test: async () => {
                  const el = this.component;
                  const defaultSlot = el.shadowRoot?.querySelector('slot:not(name)') as HTMLSlotElement;
                  expect(defaultSlot).to.not.be.undefined;
                },
              },
            },
          },
          interactions: {
            description: 'interactions',
            tests: {
              selectedTab: {
                description: 'selected tab',
                tests: {
                  onClick: {
                    description: 'changes selected tab on click',
                    test: async () => {
                      const el = this.component;
                      const newSelection = el.querySelector('#tab-4')! as HTMLElement;
                      newSelection.click();

                      await elementUpdated(el);

                      const selectedTab = el.querySelector("[role='tab'][selected]") as CoreTab;

                      expect(selectedTab.textContent).to.equal('four');
                    },
                  },
                  activeId: {
                    description: 'changes selected tab when active-id updated',
                    test: async () => {
                      const el = this.component;

                      el.activeId = 'tab-4';
                      await elementUpdated(el);

                      const selectedTab = el.querySelector("[role='tab'][selected]") as CoreTab;
                      expect(selectedTab.textContent).to.equal('four');
                    },
                  },
                  childClick: {
                    description: 'changes selected tab when clicking a child element',
                    test: async () => {
                      const el = this.component;

                      const child = el.querySelector('#tab-3 span')! as HTMLElement;
                      child.click();

                      await elementUpdated(el);

                      expect(el.activeId).to.equal('tab-3');
                    },
                  },
                  arrowRight: {
                    description: 'changes selected tab on ArrowRight',
                    test: async () => {
                      const el = this.component;

                      await sendKeys({ press: 'Tab' });
                      await sendKeys({ press: 'ArrowRight' });

                      await elementUpdated(el);

                      expect(el.activeId).to.equal('tab-2');
                    },
                  },
                  arrowRightLastTab: {
                    description: 'changes selected tab to first if ArrowRight is pressed on last tab',
                    test: async () => {
                      const el = this.component;

                      await sendKeys({ press: 'Tab' });
                      await sendKeys({ press: 'End' });
                      await sendKeys({ press: 'ArrowRight' });

                      await elementUpdated(el);

                      expect(el.activeId).to.equal('tab-1');
                    },
                  },
                  arrowRightManualActivation: {
                    description:
                      'does not change selected tab on ArrowRight until Enter is pushed if `manual-activation` is set',
                    test: async () => {
                      const el = this.component;
                      el.manualActivation = true;

                      await sendKeys({ press: 'Tab' });
                      await sendKeys({ press: 'ArrowRight' });
                      await elementUpdated(el);

                      expect(el.activeId).to.equal('tab-1');

                      await sendKeys({ press: 'Enter' });
                      await elementUpdated(el);

                      expect(el.activeId).to.equal('tab-2');
                    },
                  },
                  onSpace: {
                    description: 'changes selected tab on Space if `manual-activation` is set',
                    test: async () => {
                      const el = this.component;
                      el.manualActivation = true;

                      await sendKeys({ press: 'Tab' });
                      await sendKeys({ press: 'ArrowRight' });
                      await sendKeys({ press: ' ' });

                      await elementUpdated(el);

                      expect(el.activeId).to.equal('tab-2');
                    },
                  },
                  onEnd: {
                    description: 'changes selected tab on End key',
                    test: async () => {
                      const el = this.component;

                      await sendKeys({ press: 'Tab' });
                      await sendKeys({ press: 'End' });

                      await elementUpdated(el);

                      const selectedTab = el.querySelector("[role='tab'][selected]") as CoreTab;

                      expect(selectedTab.textContent).to.equal('six');
                    },
                  },
                  onHome: {
                    description: 'changes selected tab on Home key',
                    test: async () => {
                      const el = this.component;

                      await sendKeys({ press: 'Tab' });
                      await sendKeys({ press: 'End' });
                      await sendKeys({ press: 'Home' });

                      await elementUpdated(el);

                      const selectedTab = el.querySelector("[role='tab'][selected]") as CoreTab;

                      expect(selectedTab.textContent).to.equal('one');
                    },
                  },
                  onArrowLeft: {
                    description: 'changes selected tab on ArrowLeft',
                    test: async () => {
                      const el = this.component;

                      await sendKeys({ press: 'Tab' });
                      await sendKeys({ press: 'End' });
                      await sendKeys({ press: 'ArrowLeft' });

                      await elementUpdated(el);

                      expect(el.activeId).to.equal('tab-5');
                    },
                  },
                  arrowLeftLastTab: {
                    description: 'changes selected tab to last if ArrowLeft is pressed on first tab',
                    test: async () => {
                      const el = this.component;

                      await sendKeys({ press: 'Tab' });
                      await sendKeys({ press: 'ArrowLeft' });

                      await elementUpdated(el);

                      expect(el.activeId).to.equal('tab-6');
                    },
                  },
                  arrowLeftManualActivation: {
                    description:
                      'does not change selected tab on ArrowLeft until Enter is pushed if `manual-activation` is set',
                    test: async () => {
                      const el = this.component;
                      el.manualActivation = true;

                      await sendKeys({ press: 'Tab' });
                      await sendKeys({ press: 'End' });
                      await sendKeys({ press: 'Enter' });
                      await sendKeys({ press: 'ArrowLeft' });
                      await elementUpdated(el);

                      expect(el.activeId).to.equal('tab-6');

                      await sendKeys({ press: 'Enter' });
                      await elementUpdated(el);

                      expect(el.activeId).to.equal('tab-5');
                    },
                  },
                  arrowDown: {
                    description: 'changes selected tab on ArrowDown when `layout` is "vertical"',
                    test: async () => {
                      const el = this.component;
                      el.layout = 'vertical';

                      await sendKeys({ press: 'Tab' });
                      await sendKeys({ press: 'ArrowDown' });

                      await elementUpdated(el);

                      expect(el.activeId).to.equal('tab-2');
                    },
                  },
                  arrowUp: {
                    description: 'changes selected tab on ArrowUp when `layout` is "vertical"',
                    test: async () => {
                      const el = this.component;
                      el.layout = 'vertical';

                      await sendKeys({ press: 'Tab' });
                      await sendKeys({ press: 'End' });
                      await sendKeys({ press: 'ArrowUp' });

                      await elementUpdated(el);

                      expect(el.activeId).to.equal('tab-5');
                    },
                  },
                  arrowUpFirstTab: {
                    description:
                      'changes selected tab to last if ArrowUp is pressed on first tab when `layout` is "vertical"',
                    test: async () => {
                      const el = this.component;
                      el.layout = 'vertical';

                      await sendKeys({ press: 'Tab' });
                      await sendKeys({ press: 'ArrowUp' });

                      await elementUpdated(el);

                      expect(el.activeId).to.equal('tab-6');
                    },
                  },
                  arrowDownLast: {
                    description:
                      'changes selected tab to first if ArrowDown is pressed on last tab when `layout` is "vertical"',
                    test: async () => {
                      const el = this.component;
                      el.layout = 'vertical';

                      await sendKeys({ press: 'Tab' });
                      await sendKeys({ press: 'End' });
                      await sendKeys({ press: 'ArrowDown' });

                      await elementUpdated(el);

                      expect(el.activeId).to.equal('tab-1');
                    },
                  },
                  tabIndexNavigation: {
                    description: 'changes tab index on navigation',
                    test: async () => {
                      const el = this.component;
                      const tab1 = el.querySelector('#tab-1')!;
                      const tab2 = el.querySelector('#tab-2')!;

                      await sendKeys({ press: 'Tab' });
                      await sendKeys({ press: 'ArrowRight' });

                      await elementUpdated(el);

                      expect(tab1.getAttribute('tabindex')).to.equal('-1');
                      expect(tab2.getAttribute('tabindex')).to.equal('0');
                    },
                  },
                  tabIndexManualNavigation: {
                    description: 'changes tab index on navigation with `manual-activation`',
                    test: async () => {
                      const el = this.component;
                      const tab1 = el.querySelector('#tab-1')!;
                      const tab2 = el.querySelector('#tab-2')!;

                      el.manualActivation = true;
                      await elementUpdated(el);

                      await sendKeys({ press: 'Tab' });
                      await sendKeys({ press: 'ArrowRight' });

                      await elementUpdated(el);

                      expect(tab1.getAttribute('tabindex')).to.equal('-1');
                      expect(tab2.getAttribute('tabindex')).to.equal('0');
                    },
                  },

                  manualSelectedTab: {
                    description: 'allows to specify a selected tab',
                    test: async () => {
                      const el = this.component;

                      el.activeId = 'tab-3';
                      const panel = el.querySelector('#panel-3');

                      await elementUpdated(el);
                      await elementUpdated(el);

                      const selectedTab = el.querySelector("[role='tab'][selected]") as CoreTab;

                      expect(selectedTab.textContent).to.equal('three child');
                      expect(panel?.getAttribute('hidden')).to.be.null;
                    },
                  },
                  disabledNavigation: {
                    description: 'does not navigate to disabled tab on click',
                    test: async () => {
                      const el = this.component;
                      const tabTwo = el.querySelector('#tab-2') as CoreTab;
                      tabTwo.disabled = true;

                      el.requestUpdate();

                      const newSelection = el.querySelector('#tab-2') as CoreTab;
                      newSelection.click();

                      await elementUpdated(el);

                      expect(el.activeId).to.equal('tab-1');
                    },
                  },
                },
              },
            },
          },
          properties: {
            description: 'properties',
            tests: {
              ariaSelected: {
                description: 'sets `aria-selected` on all tabs correctly',
                test: async () => {
                  const el = this.component;

                  const tabs = el.querySelectorAll("[role='tab']") as NodeListOf<CoreTab>;
                  const tab1 = tabs[0];
                  expect(tab1.getAttribute('aria-selected')).to.equal('true');
                  for (let i = 1; i < tabs.length; i++) {
                    expect(tabs[i].getAttribute('aria-selected')).to.equal('false');
                  }

                  const tab3 = el.querySelector('#tab-3') as CoreTab;
                  tab3.click();
                  await elementUpdated(el);

                  expect(tab3.getAttribute('aria-selected')).to.equal('true');
                  expect(tab1.getAttribute('aria-selected')).to.equal('false');
                  for (let i = 0; i < tabs.length; i++) {
                    if (i !== 2) {
                      expect(tabs[i].getAttribute('aria-selected')).to.equal('false');
                    }
                  }
                },
              },
              ariaDisabled: {
                description: 'has `aria-disabled` attribute on disabled tab',
                test: async () => {
                  const el = this.component;

                  const tab = el.querySelector('#tab-4') as CoreTab;
                  expect(tab.getAttribute('aria-disabled')).to.equal(null);

                  tab.disabled = true;
                  await elementUpdated(el);

                  expect(tab.getAttribute('aria-disabled')).to.equal('true');
                },
              },
              activeId: {
                description: 'should change the selection based on the `active-id` attribute',
                test: async () => {
                  const el = this.component;

                  el.activeId = 'tab-3';
                  const panel = el.querySelector('#panel-3');

                  await elementUpdated(el);

                  const selectedTab = el.querySelector("[role='tab'][selected]") as CoreTab;

                  expect(selectedTab.textContent).to.equal('three child');
                  expect(panel!.getAttribute('hidden')).to.be.null;
                },
              },
            },
          },
          events: {
            description: 'events',
            tests: {
              emitsChangeOnClick: {
                description: 'emits a change event on a new selection on click',
                test: async () => {
                  const el = this.component;
                  const spy = sinon.spy();

                  el.addEventListener('tabs-change', spy);

                  const newSelection = el.querySelector('#tab-4') as HTMLElement;
                  newSelection.click();

                  expect(spy).to.have.been.calledOnce;
                },
              },
              emitsChangeOnSelect: {
                description: 'emits a change event on a new selection',
                test: async () => {
                  const el = this.component;
                  const spy = sinon.spy();

                  el.addEventListener('tabs-change', spy);

                  await sendKeys({ press: 'Tab' });
                  await sendKeys({ press: 'ArrowRight' });

                  expect(spy).to.have.been.calledOnce;
                },
              },
              noChangeWhenClickingActiveTab: {
                description: 'does not emit a change event if clicking an already active tab',
                test: async () => {
                  const el = this.component;
                  const spy = sinon.spy();

                  el.addEventListener('tabs-change', spy);

                  const newSelection = el.querySelector('#tab-1') as HTMLElement;
                  newSelection.click();

                  expect(spy).to.not.have.been.called;
                },
              },
              tabShowEvents: {
                description: 'emits `tab-show` and `tab-after-show` from tab panel when tab is selected',
                test: async () => {
                  const el = this.component;
                  const panel = el.querySelector('#panel-4') as HTMLElement;
                  panel.style.transition = 'none'; // Disable transition for testing

                  const spy = sinon.spy();
                  const afterSpy = sinon.spy();

                  panel.addEventListener('tab-show', spy);
                  panel.addEventListener('tab-after-show', afterSpy);

                  const newSelection = el.querySelector('#tab-4')! as HTMLElement;
                  newSelection.click();

                  await elementUpdated(el);

                  expect(spy).to.have.been.calledOnce;
                  expect(afterSpy).to.have.been.calledOnce;
                },
              },
              tabHideEvents: {
                description: 'emits `tab-hide` and `tab-after-hide` from tab panel when tab is unselected',
                test: async () => {
                  const el = this.component;
                  const panel = el.querySelector('#panel-1') as HTMLElement;
                  panel.style.transition = 'none'; // Disable transition for testing

                  const spy = sinon.spy();
                  const afterSpy = sinon.spy();

                  panel.addEventListener('tab-hide', spy);
                  panel.addEventListener('tab-after-hide', afterSpy);

                  const newSelection = el.querySelector('#tab-3')! as HTMLElement;
                  newSelection.click();

                  await elementUpdated(el);

                  expect(spy).to.have.been.calledOnce;
                  expect(afterSpy).to.have.been.calledOnce;
                },
              },
            },
          },
        },
      },
    });
  }
}

export class CoreDisabledTabsTests<T extends CoreTabs> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      tabs: {
        description: 'Disabled Tabs',
        tests: {
          interactions: {
            description: 'interactions',
            tests: {
              selectedTab: {
                description: 'selected tab',
                tests: {
                  disabledItemFocus: {
                    description: 'allows to focus on a disabled item, but does not trigger selection',
                    test: async () => {
                      const el = this.component;
                      const tabOne = el.querySelector('#tab-1') as CoreTab;

                      await sendKeys({ press: 'Tab' });
                      await sendKeys({ press: 'ArrowLeft' });

                      await elementUpdated(el);

                      expect(tabOne!.getAttribute('tabindex')).to.equal('0');
                      expect(tabOne!.getAttribute('aria-selected')).to.equal('false');
                    },
                  },
                },
              },
            },
          },
          properties: {
            description: 'properties',
            tests: {
              ariaDisabled: {
                description: 'has `aria-disabled` attribute on disabled tab',
                test: async () => {
                  const el = this.component;

                  const tab = el.querySelector('#tab-4') as CoreTab;
                  expect(tab.getAttribute('aria-disabled')).to.equal(null);

                  tab.disabled = true;
                  await elementUpdated(el);

                  expect(tab.getAttribute('aria-disabled')).to.equal('true');
                },
              },
            },
          },
        },
      },
    });
  }
}
