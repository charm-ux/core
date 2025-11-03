import { aTimeout, elementUpdated, expect, oneEvent } from '@open-wc/testing';
import { setViewport } from '@web/test-runner-commands';
import sinon from 'sinon';

import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import { project } from '../../utilities/index.js';
import type { CoreOverflow } from './index.js';

export class CoreOverflowTests<T extends CoreOverflow> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      overflow: {
        description: 'overflow',
        afterEach: async () => {
          await setViewport({ width: 500, height: 600 });
        },
        tests: {
          // accessibility tests
          accessibility: {
            description: 'accessibility',
            tests: {
              accessibleOverflow: {
                description: 'should be accessible when overflowing',
                test: async () => {
                  await setViewport({ width: 100, height: 600 });
                  const el = this.component;
                  await elementUpdated(el);
                  await expect(el).to.be.accessible();
                },
              },
            },
          },

          // attribute and property tests
          properties: {
            description: 'properties',
            tests: {
              minVisible: {
                description: 'should display the min number of slotted elements',
                test: async () => {
                  await setViewport({ width: 100, height: 600 });
                  const el = this.component;
                  await elementUpdated(el);
                  await aTimeout(20);

                  const defaultSlot = el.shadowRoot!.querySelector('slot:not([name])') as HTMLSlotElement;
                  const slottedElements = defaultSlot.assignedElements() as HTMLElement[];
                  let visibleCount = 0;
                  slottedElements.forEach(item => {
                    if (!item.hidden) {
                      visibleCount++;
                    }
                  });

                  expect(visibleCount).to.equal(3);
                },
                config: {
                  min: 3,
                },
              },
              minDefault: {
                description: 'should display 0 elements with viewport too small',
                test: async () => {
                  await setViewport({ width: 10, height: 600 });
                  const el = this.component;

                  await elementUpdated(el);
                  await aTimeout(200);
                  const defaultSlot = el.shadowRoot!.querySelector('slot:not([name])') as HTMLSlotElement;
                  const slottedElements = defaultSlot.assignedElements() as HTMLElement[];
                  let visibleCount = 0;

                  slottedElements.forEach(item => {
                    if (!item.hidden) {
                      visibleCount++;
                    }
                  });

                  expect(visibleCount).to.equal(0);
                },
              },
              overflowDirectionEnd: {
                description: 'should collapse items from end to start',
                test: async () => {
                  await setViewport({ width: 220, height: 600 });
                  const el = this.component;
                  setTimeout(
                    () =>
                      (el.innerHTML = `
                              <button style="width: 100px">one</button><button style="width: 100px">two</button
                  ><button style="width: 100px">three</button>
                              `),
                    100
                  );
                  await oneEvent(el, 'overflow');

                  const defaultSlot = el.shadowRoot!.querySelector('slot:not([name])') as HTMLSlotElement;
                  const slottedElements = defaultSlot.assignedElements() as HTMLElement[];

                  expect(slottedElements.length).to.equal(3);
                  expect(slottedElements[0].hidden).to.be.false;
                  expect(slottedElements[2].hidden).to.be.true;
                },
                config: {
                  'overflow-direction': 'end',
                },
              },
              overflowDirectionStart: {
                description: 'should collapse items from start to end',
                test: async () => {
                  await setViewport({ width: 250, height: 600 });
                  const el = this.component;
                  setTimeout(
                    () =>
                      (el.innerHTML = `
                              <button style="width: 100px">one</button><button style="width: 100px">two</button
                  ><button style="width: 100px">three</button>
                              `),
                    100
                  );
                  await oneEvent(el, 'overflow');

                  const defaultSlot = el.shadowRoot!.querySelector('slot:not([name])') as HTMLSlotElement;
                  const slottedElements = defaultSlot.assignedElements() as HTMLElement[];

                  expect(slottedElements.length).to.equal(3);
                  expect(slottedElements[0].hidden).to.be.true;
                  expect(slottedElements[2].hidden).to.be.false;
                },
                config: {
                  'overflow-direction': 'start',
                },
              },
              overflowingTrue: {
                description: 'should have overflowing true when overflowing',
                test: async () => {
                  await setViewport({ width: 10, height: 600 });
                  const el = this.component;

                  await elementUpdated(el);
                  await aTimeout(200);

                  expect(el.overflowing).to.be.true;
                },
              },
              overflowingFalse: {
                description: 'should have overflowing false when not overflowing',
                test: async () => {
                  await setViewport({ width: 500, height: 600 });
                  const el = this.component;

                  await elementUpdated(el);
                  await aTimeout(20);

                  expect(el.overflowing).to.be.false;
                },
              },
              overflowMenuShow: {
                description: 'should have menu when overflowing',
                test: async () => {
                  expect(this.component.shadowRoot!.querySelector('[menu]')).to.not.exist;

                  await setViewport({ width: 100, height: 600 });
                  await elementUpdated(this.component);
                  await aTimeout(20);

                  expect(this.component.shadowRoot!.querySelector('[menu]')).to.exist;
                },
              },
              overflowMenuHide: {
                description: 'should not have menu when not overflowing',
                test: async () => {
                  await setViewport({ width: 100, height: 600 });
                  await elementUpdated(this.component);
                  await aTimeout(20);

                  expect(this.component.shadowRoot!.querySelector('[menu]')).to.exist;

                  await setViewport({ width: 600, height: 600 });
                  await elementUpdated(this.component);
                  await aTimeout(20);

                  expect(this.component.shadowRoot!.querySelector('[menu]')).to.not.exist;
                },
              },
              overflowMenuItems: {
                description: 'should have overflowing items in menu',
                test: async () => {
                  await setViewport({ width: 75, height: 600 });
                  await elementUpdated(this.component);
                  await aTimeout(20);
                  const menu = this.component.shadowRoot!.querySelector('[menu]');
                  // no items until menu is opened
                  expect(menu!.querySelectorAll('[menu-item]').length).to.equal(0);
                  const trigger = this.component.shadowRoot!.querySelector(
                    '[menu] > [slot="trigger"]'
                  ) as HTMLButtonElement;
                  trigger.click();
                  await elementUpdated(this.component);
                  await aTimeout(20);
                  expect(menu!.querySelectorAll('[menu-item]').length).to.equal(3);
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

          // children tests
          children: {
            description: 'children',
            tests: {
              overflowMenuSubMenuItems: {
                description: 'should create child submenu from menu child in overflow',
                test: async () => {
                  const el = this.component;
                  const button = document.createElement('button');
                  button.setAttribute('slot', 'trigger');
                  const childMenu = document.createElement(project.scope.tagName('menu'));
                  childMenu.appendChild(button);
                  const menuItem1 = document.createElement(project.scope.tagName('menu-item'));
                  menuItem1.innerText = 'Item 1';
                  const menuItem2 = document.createElement(project.scope.tagName('menu-item'));
                  menuItem2.innerText = 'Item 2';
                  childMenu.appendChild(menuItem1);
                  childMenu.appendChild(menuItem2);
                  el.appendChild(childMenu);

                  await elementUpdated(el);
                  await setViewport({ width: 75, height: 600 });
                  await aTimeout(50);
                  const menu = el.shadowRoot!.querySelector('[menu]');
                  // Show overflow menu
                  const trigger = this.component.shadowRoot!.querySelector(
                    '[menu] > [slot="trigger"]'
                  ) as HTMLButtonElement;
                  trigger.click();
                  await elementUpdated(this.component);
                  await aTimeout(20);
                  // Find the submenu and check its items
                  const subMenu = menu!.querySelectorAll('[menu-item][has-submenu]');
                  expect(subMenu.length).to.equal(1);
                  const subMenuitems = subMenu[0].querySelectorAll<HTMLElement>('[menu-item]');
                  expect(subMenuitems.length).to.equal(2);
                  expect(subMenuitems[0].innerText.trim()).to.equal('Item 1');
                  expect(subMenuitems[1]?.innerText.trim()).to.equal('Item 2');
                },
              },
            },
          },
          // event tests
          events: {
            description: 'events',
            tests: {
              overflowOnHide: {
                description: 'emits an overflow event when an element is hidden',
                test: async () => {
                  const spy = sinon.spy();
                  this.component.addEventListener('overflow', spy);
                  await setViewport({ width: 75, height: 600 });

                  await elementUpdated(this.component);
                  await aTimeout(20);

                  expect(spy).to.have.been.calledOnce;

                  await setViewport({ width: 300, height: 600 });

                  await elementUpdated(this.component);
                  await aTimeout(20);

                  expect(spy).to.have.been.calledTwice;
                },
              },
            },
          },
        },
      },
    });
  }
}
