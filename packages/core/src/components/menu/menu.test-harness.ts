import { elementUpdated, expect } from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import sinon from 'sinon';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import type { CoreMenu } from './index.js';

export class CoreMenuTests<T extends CoreMenu> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      menu: {
        description: 'menu',
        tests: {
          properties: {
            description: 'properties',
            tests: {
              open: {
                description: 'should open and close the dropdown',
                test: async () => {
                  this.component.open = true;
                  await elementUpdated(this.component);
                  expect(this.component.popup).to.have.attribute('open');

                  this.component.open = false;
                  await elementUpdated(this.component);
                  expect(this.component.popup).to.not.have.attribute('open');
                },
              },
              expanded: {
                description: 'should set "expanded" on trigger when it is a charm button',
                test: async () => {
                  const trigger = this.component.querySelector('#triggerId') as HTMLElement;
                  expect(trigger.hasAttribute('expanded')).to.be.false;

                  this.component.open = true;
                  await elementUpdated(this.component);

                  expect(trigger.hasAttribute('expanded')).to.be.true;

                  this.component.open = false;
                  await elementUpdated(this.component);

                  expect(trigger.hasAttribute('expanded')).to.be.false;
                },
              },
              expandedNativeButton: {
                description: 'should set "aria-expanded" on trigger when it is a native button',
                test: async () => {
                  const oldTrigger = this.component.querySelector('#triggerId') as HTMLElement;
                  const newTrigger = document.createElement('button');
                  newTrigger.setAttribute('slot', 'trigger');
                  newTrigger.id = 'triggerId';
                  newTrigger.textContent = 'click me';

                  // Replace the old trigger with the new one
                  if (oldTrigger && oldTrigger.parentNode) {
                    oldTrigger.parentNode.replaceChild(newTrigger, oldTrigger);
                  }

                  await elementUpdated(this.component);
                  expect(newTrigger.getAttribute('aria-expanded')).to.equal('false');

                  this.component.open = true;
                  await elementUpdated(this.component);

                  expect(newTrigger.getAttribute('aria-expanded')).to.equal('true');
                  this.component.open = false;
                  await elementUpdated(this.component);

                  expect(newTrigger.getAttribute('aria-expanded')).to.equal('false');
                },
              },
            },
          },

          methods: {
            description: 'methods',
            tests: {
              showMethod: {
                description: 'should set "open" to true when calling the show method',
                test: async () => {
                  const el = this.component;

                  el.show();
                  await elementUpdated(el);

                  expect(el.open).to.be.true;
                },
              },
              hideMethod: {
                description: 'should set "open" to false when calling the hide method',
                test: async () => {
                  const el = this.component;

                  el.open = true;
                  await elementUpdated(el);

                  el.hide();
                  expect(el.open).to.be.false;
                },
              },
              toggleMethod: {
                description: 'should toggle "open" when calling the toggle method',
                test: async () => {
                  const el = this.component;

                  expect(el.open).to.be.false;

                  el.toggle();
                  await elementUpdated(el);

                  expect(el.open).to.be.true;

                  el.toggle();
                  await elementUpdated(el);

                  expect(el.open).to.be.false;
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
                  expect(defaultSlot).to.not.be.undefined;
                },
              },
              triggerSlot: {
                description: 'has a trigger slot',
                test: async () => {
                  const el = this.component;
                  const trigger = el.shadowRoot?.querySelector('slot[name="trigger"]') as HTMLSlotElement;
                  expect(trigger).to.not.be.undefined;
                },
              },
            },
          },

          interactions: {
            description: 'interactions',
            tests: {
              triggerClicked: {
                description: 'opens the dropdown when the trigger is clicked',
                test: async () => {
                  const el = this.component;
                  const triggerElement = el.querySelector('#triggerId') as HTMLButtonElement;

                  triggerElement.click();
                  await elementUpdated(el);

                  expect(el.open).to.be.true;
                },
              },
              triggerPressedSpace: {
                description: 'opens the dropdown when the trigger is pressed with "space"',
                test: async () => {
                  const el = this.component;
                  const triggerElement = el.querySelector('#triggerId') as HTMLButtonElement;

                  triggerElement.focus();
                  await sendKeys({ press: 'Space' });
                  await elementUpdated(el);

                  expect(el.open).to.be.true;
                },
              },
              triggerPressedEnter: {
                description: 'opens the dropdown when the trigger is pressed with "enter"',
                test: async () => {
                  const el = this.component;
                  const triggerElement = el.querySelector('#triggerId') as HTMLButtonElement;

                  triggerElement.focus();
                  await sendKeys({ press: 'Enter' });
                  await elementUpdated(el);

                  expect(el.open).to.be.true;
                },
              },
              triggerPressedArrowUp: {
                description: 'opens the dropdown when the trigger is pressed with "arrow up"',
                test: async () => {
                  const el = this.component;
                  const triggerElement = el.querySelector('#triggerId') as HTMLButtonElement;

                  triggerElement.focus();
                  await sendKeys({ press: 'ArrowUp' });
                  await elementUpdated(el);

                  expect(el.open).to.be.true;
                },
              },
              triggerPressedArrowUpFocusOnItem: {
                description: 'focuses on the last item when the trigger is pressed with "arrow up"',
                test: async () => {
                  const el = this.component;
                  const triggerElement = el.querySelector('#triggerId') as HTMLButtonElement;
                  const handleFocus = sinon.spy();
                  const menuItems = el.querySelectorAll('[role="menuitem"]');
                  const lastMenuItem = menuItems[menuItems.length - 1] as HTMLElement;

                  lastMenuItem.focus = handleFocus;

                  triggerElement.focus();
                  await elementUpdated(el);
                  await sendKeys({ press: 'ArrowUp' });
                  await elementUpdated(el);

                  expect(handleFocus).to.have.been.calledOnce;
                },
              },
              triggerPressedArrowDown: {
                description: 'opens the dropdown when the trigger is pressed with "arrow down"',
                test: async () => {
                  const el = this.component;
                  const triggerElement = el.querySelector('#triggerId') as HTMLButtonElement;

                  triggerElement.focus();
                  await sendKeys({ press: 'ArrowDown' });
                  await elementUpdated(el);

                  expect(el.open).to.be.true;
                },
              },
              triggerPressedArrowDownFocusOnItem: {
                description: 'focuses on the first item when the trigger is pressed with "arrow down"',
                test: async () => {
                  const el = this.component;
                  const triggerElement = el.querySelector('#triggerId') as HTMLButtonElement;
                  const handleFocus = sinon.spy();
                  const menuItems = el.querySelectorAll('[role="menuitem"]');
                  const firstMenuItem = menuItems[0] as HTMLElement;

                  firstMenuItem.focus = handleFocus;

                  triggerElement.focus();
                  await elementUpdated(el);
                  await sendKeys({ press: 'ArrowDown' });
                  await elementUpdated(el);

                  expect(handleFocus).to.have.been.calledOnce;
                },
              },
              clickOutsideOfDropdown: {
                description: 'should set "open" to false when clicking outside of the dropdown',
                test: async () => {
                  const el = this.component;

                  el.open = true;
                  await elementUpdated(el);

                  expect(el.open).to.be.true;

                  document.querySelector('body')?.click();
                  await elementUpdated(el);

                  expect(el.open).to.be.false;
                },
              },
              pressEscapeInsideDropdown: {
                description:
                  'should set "open" to false and focus trigger when pressing escape inside of an expanded menu',
                test: async () => {
                  const el = this.component;
                  const triggerElement = el.querySelector('#triggerId') as HTMLButtonElement;

                  triggerElement.focus();
                  await elementUpdated(el);
                  await sendKeys({ press: 'Enter' });
                  await elementUpdated(el);

                  expect(el.open).to.be.true;

                  await sendKeys({ press: 'Escape' });
                  await elementUpdated(el);

                  expect(document.activeElement).to.equal(triggerElement);
                },
              },
              clickOnMenuItem: {
                description: 'should set "open" to false when clicking on a menuitem',
                test: async () => {
                  const el = this.component;
                  const menuitem = el.querySelector('[role="menuitem"]') as HTMLElement;

                  el.open = true;
                  await elementUpdated(el);

                  expect(el.open).to.be.true;

                  menuitem.click();
                  await elementUpdated(el);

                  expect(el.open).to.be.false;
                },
              },
              pressSpaceOnMenuItem: {
                description: 'should set "open" to false when pressing space on a menuitem',
                test: async () => {
                  const el = this.component;
                  const triggerElement = el.querySelector('#triggerId') as HTMLButtonElement;

                  triggerElement.focus();
                  await elementUpdated(el);
                  await sendKeys({ press: 'Enter' });
                  await elementUpdated(el);

                  expect(el.open).to.be.true;

                  await sendKeys({ press: 'ArrowDown' });
                  await elementUpdated(el);

                  await sendKeys({ press: 'Space' });
                  await elementUpdated(el);

                  expect(el.open).to.be.false;
                },
              },
            },
          },
        },
      },
    });
  }
}
