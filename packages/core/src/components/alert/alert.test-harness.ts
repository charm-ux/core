import { expect, oneEvent, waitUntil } from '@open-wc/testing';
import sinon from 'sinon';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import type { CoreAlert } from './index.js';

export class CoreAlertTests<T extends CoreAlert> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      alert: {
        description: 'alert',
        tests: {
          // attribute and property tests

          properties: {
            description: 'properties',
            tests: {
              dismissible: {
                description: 'should reflect dismissible property',
                test: async () => {
                  const el = this.component;
                  el.dismissible = true;
                  await el.updateComplete;
                  expect(el.dismissible).to.be.true;
                  expect(el.hasAttribute('dismissible')).to.be.true;
                },
              },
              closeLabel: {
                description: 'should set closeLabel property',
                test: async () => {
                  const el = this.component;
                  el.closeLabel = 'Dismiss';
                  await el.updateComplete;
                  expect(el.closeLabel).to.equal('Dismiss');
                  if (el.dismissible) {
                    const btn = el.shadowRoot?.querySelector('.dismiss-button');
                    expect(btn?.innerHTML).to.contain('Dismiss');
                  }
                },
              },
              heading: {
                description: 'should set heading property',
                test: async () => {
                  const el = this.component;
                  el.heading = 'Test Heading';
                  await el.updateComplete;
                  const heading = el.shadowRoot?.querySelector('.alert-heading');
                  expect(heading?.textContent).to.contain('Test Heading');
                },
              },
              politeness: {
                description: 'should set politeness property and reflect aria-live',
                test: async () => {
                  const el = this.component;
                  el.politeness = 'assertive';
                  await el.updateComplete;
                  const alert = el.shadowRoot?.querySelector('.alert');
                  expect(alert?.getAttribute('aria-live')).to.equal('assertive');
                },
              },
            },
          },

          // method tests

          methods: {
            description: 'methods',
            tests: {
              show: {
                description: 'should open the alert when show() is called',
                test: async () => {
                  const el = this.component;
                  await el.hide();
                  await el.show();
                  expect(el.open).to.be.true;
                },
              },
              hide: {
                description: 'should close the alert when hide() is called',
                test: async () => {
                  const el = this.component;
                  await el.show();
                  await el.hide();
                  expect(el.open).to.be.false;
                },
              },
            },
          },

          // slot tests

          slots: {
            description: 'slots',
            tests: {
              defaultSlot: {
                description: 'should render default slot content',
                test: async () => {
                  const el = this.component;
                  await el.updateComplete;
                  const container = el.shadowRoot?.querySelector('.alert-message-inner-container');
                  const slot = container?.querySelector<HTMLSlotElement>('slot:not([name]');
                  const assignedContent = slot?.assignedNodes();
                  expect(assignedContent?.some(node => node.textContent?.includes('Message bar content'))).to.be.true;
                },
              },
              actionSlot: {
                description: 'should render action slot content',
                test: async () => {
                  const el = this.component;
                  const btn = document.createElement('button');
                  btn.setAttribute('slot', 'action');
                  btn.textContent = 'Action';
                  el.appendChild(btn);
                  await el.updateComplete;
                  const container = el.shadowRoot?.querySelector('.alert-actions');
                  const slot = container?.querySelector<HTMLSlotElement>('slot[name="action"]');
                  expect(slot?.assignedNodes()).to.contain(btn);
                  el.removeChild(btn);
                },
              },
              headingSlot: {
                description: 'should render heading slot content',
                test: async () => {
                  const el = this.component;
                  const heading = document.createElement('span');
                  heading.setAttribute('slot', 'heading');
                  heading.textContent = 'Slot Heading';
                  el.appendChild(heading);
                  await el.updateComplete;
                  const headingEl = el.shadowRoot?.querySelector('.alert-heading');
                  const slot = headingEl?.querySelector<HTMLSlotElement>('slot[name="heading"]');
                  const assignedContent = slot?.assignedNodes();
                  expect(assignedContent?.some(node => node.textContent?.includes('Slot Heading'))).to.be.true;
                },
              },
              iconSlot: {
                description: 'should render icon slot content',
                test: async () => {
                  const el = this.component;
                  const icon = document.createElement('span');
                  icon.setAttribute('slot', 'icon');
                  icon.textContent = 'Icon';
                  el.appendChild(icon);
                  await el.updateComplete;
                  const iconEl = el.shadowRoot?.querySelector('.alert-icon');
                  const slot = iconEl?.querySelector<HTMLSlotElement>('slot[name="icon"]');
                  const assignedContent = slot?.assignedNodes();
                  expect(assignedContent?.some(node => node.textContent?.includes('Icon'))).to.be.true;
                },
              },
            },
          },

          // event tests

          events: {
            description: 'events',
            tests: {
              show: {
                description: 'should fire the show event',
                test: async () => {
                  const el = this.component;
                  const handler = sinon.spy();
                  el.addEventListener('alert-show', handler);
                  await el.show();
                  expect(handler.calledOnce).to.be.true;
                },
              },
              afterShow: {
                description: 'should fire the after-show event',
                test: async () => {
                  // Event not occuring on webkit
                  if (/webkit/i.test(navigator.userAgent)) return;
                  const el = this.component;
                  const handler = sinon.spy();
                  el.addEventListener('alert-after-show', handler);
                  await el.show();
                  // Simulate transitionend
                  el.dispatchEvent(
                    new TransitionEvent('transitionend', { bubbles: true, cancelable: true, propertyName: 'opacity' })
                  );
                  await waitUntil(() => handler.called);
                },
              },
              hide: {
                description: 'should fire the hide event',
                test: async () => {
                  const el = this.component;
                  const handler = sinon.spy();
                  el.addEventListener('alert-hide', handler);
                  await el.show();
                  await el.hide();
                  expect(handler.calledOnce).to.be.true;
                },
              },
            },
          },

          // interaction tests

          interactions: {
            description: 'interactions',
            tests: {
              restoreFocus: {
                description: 'should restore focus to the original trigger when closed',
                test: async () => {
                  const el = this.component;
                  el.dismissible = true;
                  await el.updateComplete;
                  const trigger = document.createElement('button');
                  document.body.appendChild(trigger);
                  trigger.addEventListener('click', () => el.show());
                  trigger.focus();
                  setTimeout(() => trigger.click());
                  await oneEvent(el, 'alert-show');
                  const close = el.shadowRoot?.querySelector('.dismiss-button') as HTMLButtonElement;
                  setTimeout(() => close.click());
                  await oneEvent(el, 'alert-hide');
                  expect(document.activeElement).to.equal(trigger);
                  document.body.removeChild(trigger);
                },
              },
              focusOnContentOpen: {
                description: 'should focus on content when opened',
                test: async () => {
                  const el = this.component;
                  await el.show();
                  expect(el.shadowRoot?.activeElement).to.equal(
                    el.shadowRoot?.querySelector('.alert-message-inner-container')
                  );
                },
              },
              dismissButton: {
                description: 'should render and click dismiss button if dismissible',
                only: true,
                test: async () => {
                  const handler = sinon.spy();
                  const el = this.component;
                  el.addEventListener('alert-hide', handler);
                  el.dismissible = true;
                  await el.updateComplete;
                  await el.show();
                  const btn = el.shadowRoot?.querySelector('.dismiss-button') as HTMLButtonElement;
                  expect(btn).to.exist;
                  btn.click();
                  await waitUntil(() => handler.called);
                  expect(el.open).to.be.false;
                },
              },
              accessibility: {
                description: 'should have role="alert" and correct aria-live',
                test: async () => {
                  const el = this.component;
                  await el.show();
                  const alert = el.shadowRoot?.querySelector('.alert');
                  expect(alert?.getAttribute('role')).to.equal('alert');
                  expect(['polite', 'assertive', 'off']).to.include(alert?.getAttribute('aria-live'));
                },
              },
            },
          },
        },
      },
    });
  }
}
