import { elementUpdated, expect, oneEvent } from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import sinon from 'sinon';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import { CoreButton } from './index.js';

export class CoreButtonTests<T extends CoreButton> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      switch: {
        description: 'button',
        tests: {
          // property tests
          properties: {
            description: 'properties',
            tests: {
              accessible: {
                description: 'should be accessible',
                test: async () => {
                  const el = this.component;
                  await expect(el).to.be.accessible();
                },
              },
              childrenInSlot: {
                description: 'places children in the default slot',
                test: async () => {
                  const el = this.component;
                  const defaultSlot = el.shadowRoot?.querySelector('slot:not(name)') as HTMLSlotElement;
                  expect(defaultSlot).to.not.be.null;
                },
              },
              hasStartSlot: {
                description: 'has a start slot',
                test: async () => {
                  const el = this.component;
                  el.innerHTML = '<span slot="start">START</span>';
                  const startSlot = el.shadowRoot?.querySelector('slot[name="start"]') as HTMLSlotElement;
                  const [span] = startSlot.assignedNodes();
                  expect(span?.textContent).to.equal('START');
                },
              },
              hasEndSlot: {
                description: 'has an end slot',
                test: async () => {
                  const el = this.component;
                  el.innerHTML = '<span slot="end">END</span>';
                  const endSlot = el.shadowRoot?.querySelector('slot[name="end"]') as HTMLSlotElement;
                  const [span] = endSlot.assignedNodes();
                  expect(span?.textContent).to.equal('END');
                },
              },
              shadowDOMAttributes: {
                description: 'has attributes from light DOM present in shadow DOM',
                test: async () => {
                  const el = this.component;
                  el.expanded = true;
                  el.pressed = true;
                  el.current = 'page';
                  el.innerHTML = 'Button';
                  await elementUpdated(el);
                  const getButton = () => el.shadowRoot?.querySelector('button');
                  expect(getButton()?.getAttribute('aria-expanded')).to.equal('true');
                  expect(getButton()?.getAttribute('aria-pressed')).to.equal('true');
                  expect(getButton()?.getAttribute('aria-current')).to.equal('page');
                },
              },
              linkAccessible: {
                description: 'link should be accessible',
                test: async () => {
                  const el = this.component;
                  el.href = '#';
                  el.innerHTML = 'Link';
                  await expect(el).to.be.accessible();
                },
              },
              linkNoNameAttribute: {
                description: 'link should not have a name attribute',
                test: async () => {
                  const el = this.component;
                  el.href = '#';
                  el.name = 'test link';
                  el.innerHTML = 'Link';
                  await elementUpdated(el);
                  await expect(el.shadowRoot?.querySelector('a')!.getAttribute('name')).to.be.null;
                },
              },
            },
          },
          // event tests
          events: {
            description: 'events',
            tests: {
              togglePresentEmit: {
                description: 'emits an event "change" event when toggle is present',
                test: async () => {
                  const el = this.component;
                  el.toggle = true;
                  el.innerHTML = 'Button';
                  const clickSpy = sinon.spy();
                  el.addEventListener('change', clickSpy);
                  setTimeout(() => el.shadowRoot?.querySelector('button')!.click());
                  const event = (await oneEvent(el, 'change')) as CustomEvent;
                  expect(event.target).to.equal(el);
                  expect(clickSpy.callCount).to.equal(1);
                },
              },
              disabledNoEmit: {
                description: 'emits an event "change" is not emitted when button is disabled',
                test: async () => {
                  const el = this.component;
                  el.toggle = true;
                  el.disabled = true;
                  el.innerHTML = 'Button';
                  const clickSpy = sinon.spy();
                  el.addEventListener('change', clickSpy);
                  setTimeout(() => el.shadowRoot?.querySelector('button')!.click());
                  expect(clickSpy.callCount).to.equal(0);
                },
              },
              anchorNoEmit: {
                description: 'event "change" is not emitted when it is an anchor',
                test: async () => {
                  const el = this.component;
                  el.toggle = true;
                  el.href = '#';
                  el.innerHTML = 'Link';
                  const clickSpy = sinon.spy();
                  el.addEventListener('change', clickSpy);
                  setTimeout(() => el.shadowRoot?.querySelector('a')!.click());
                  expect(clickSpy.callCount).to.equal(0);
                },
              },
            },
          },
          // interaction tests
          interactions: {
            description: 'interactions',
            tests: {
              bubbleClickEvent: {
                description: 'bubbles the click event',
                test: async () => {
                  const clickSpy = sinon.spy();
                  const el = this.component;
                  el.addEventListener('click', clickSpy);
                  el.click();
                  expect(clickSpy.callCount).to.equal(1);
                },
              },
              noBubbleOnDisabled: {
                description: 'does not bubble the click event when disabled',
                test: async () => {
                  const el = this.component;
                  el.disabled = true;
                  const clickSpy = sinon.spy();
                  el.addEventListener('click', clickSpy);
                  await elementUpdated(el);
                  el.click();
                  expect(clickSpy.callCount).to.equal(0);
                },
              },
              focusOnCall: {
                description: 'focuses button when focus is called',
                test: async () => {
                  const el = this.component;
                  el.focus();
                  expect(document.activeElement).to.equal(el);
                },
              },
            },
          },
          // keyboard tests
          keyboard: {
            description: 'keyboard',
            tests: {
              onEnterClickEvent: {
                description: 'should fire click event on "Enter"',
                test: async () => {
                  const el = this.component;
                  const clickSpy = sinon.spy();
                  el.focus();
                  el.addEventListener('click', clickSpy);
                  await sendKeys({ press: 'Enter' });
                  expect(clickSpy.callCount).to.equal(1);
                },
              },
              onSpaceClickEvent: {
                description: 'should fire click event on "Space"',
                test: async () => {
                  const el = this.component;
                  const clickSpy = sinon.spy();
                  el.focus();
                  el.addEventListener('click', clickSpy);
                  await sendKeys({ press: 'Space' });
                  await elementUpdated(el);
                  expect(clickSpy.callCount).to.equal(1);
                },
              },
              noEnterEventOnDisabled: {
                description: 'should not fire click event on "Enter" when disabled',
                test: async () => {
                  const el = this.component;
                  el.disabled = true;
                  const clickSpy = sinon.spy();
                  el.focus();
                  el.addEventListener('click', clickSpy);
                  await sendKeys({ press: 'Enter' });
                  expect(clickSpy.callCount).to.equal(0);
                },
              },
              noSpaceEventOnDisabled: {
                description: 'should not fire click event on "Space" when disabled',
                test: async () => {
                  const el = this.component;
                  el.disabled = true;
                  const clickSpy = sinon.spy();
                  el.focus();
                  el.addEventListener('click', clickSpy);
                  await sendKeys({ press: 'Space' });
                  expect(clickSpy.callCount).to.equal(0);
                },
              },
            },
          },
        },
      },
    });
  }
}
