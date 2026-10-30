import { elementUpdated, expect, waitUntil } from '@open-wc/testing';
import sinon from 'sinon';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import type { CorePushPane } from './index.js';

export class CorePushPaneTests<T extends CorePushPane> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      pushPane: {
        description: 'push pane',
        tests: {
          properties: {
            description: 'properties',
            tests: {
              hideCloseButton: {
                description: 'should hide the close button',
                test: async () => {
                  const button = this.component.shadowRoot!.querySelector('.close-button')!;
                  expect(getComputedStyle(button).display).to.equal('block');
                  this.component.hideCloseButton = true;
                  await elementUpdated(this.component);
                  expect(getComputedStyle(button).display).to.equal('');
                },
              },
              inertWhenClosed: {
                description: 'makes the pane inert when closed',
                test: async () => {
                  const el = this.component;
                  const base = el.shadowRoot?.querySelector('[part="push-pane-base"]') as HTMLElement;
                  expect(base.inert).to.be.true;
                  el.show();
                  await elementUpdated(el);
                  expect(base.inert).to.be.false;
                },
              },
              hiddenHeadingKeepsAccessibleName: {
                description: 'keeps the pane heading available as its accessible name when hidden',
                test: async () => {
                  const el = this.component;
                  el.innerHTML = '<span slot="heading">Translated pane title</span>';
                  el.noHeader = true;
                  el.open = true;
                  await elementUpdated(el);

                  const pane = el.shadowRoot?.querySelector('[part="push-pane-base"]');
                  const heading = el.shadowRoot?.querySelector('#push-pane-heading');
                  expect(pane?.getAttribute('aria-labelledby')).to.equal('push-pane-heading');
                  expect(pane?.hasAttribute('aria-label')).to.be.false;
                  expect(heading?.classList.contains('visually-hidden')).to.be.true;
                  const slot = heading?.querySelector<HTMLSlotElement>('slot[name="heading"]');
                  expect(
                    slot
                      ?.assignedNodes()
                      .map(node => node.textContent)
                      .join('')
                  ).to.contain('Translated pane title');
                  await expect(el).to.be.accessible();
                },
              },
              lateHeadingSlotLabelsPane: {
                description: 'labels the pane when slotted heading content is added later',
                test: async () => {
                  const el = this.component;
                  const pane = el.shadowRoot?.querySelector('[part="push-pane-base"]');
                  expect(pane?.hasAttribute('aria-labelledby')).to.be.false;

                  const heading = document.createElement('span');
                  heading.slot = 'heading';
                  heading.textContent = 'Late title';
                  el.append(heading);
                  await waitUntil(() => pane?.getAttribute('aria-labelledby') === 'push-pane-heading');
                },
              },
            },
          },

          // method tests
          methods: {
            description: 'methods',
            tests: {
              show: {
                description: 'should open the pane',
                test: async () => {
                  this.component.show();
                  await elementUpdated(this.component);
                  expect(this.component.open).to.be.true;
                },
              },
              hide: {
                description: 'should close the pane',
                test: async () => {
                  this.component.show();
                  await elementUpdated(this.component);
                  this.component.open = false;
                  await elementUpdated(this.component);
                  expect(this.component.open).to.be.false;
                },
              },
            },
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
              emitShow: {
                description: 'should emit "push-pane-show',
                test: async () => {
                  const spy = sinon.spy();
                  this.component.addEventListener('push-pane-show', spy);
                  this.component.show();
                  await elementUpdated(this.component);
                  expect(this.component.open).to.be.true;
                  expect(spy).to.have.been.calledOnce;
                },
              },
              emitHide: {
                description: 'should emit "push-pane-hide"',
                test: async () => {
                  const spy = sinon.spy();
                  this.component.addEventListener('push-pane-hide', spy);
                  this.component.show();

                  await elementUpdated(this.component);
                  this.component.hide();
                  await elementUpdated(this.component);

                  await waitUntil(() => spy.calledOnce);

                  expect(this.component.open).to.be.false;
                  expect(spy).to.have.been.calledOnce;
                },
              },
              emitAfterShow: {
                description: 'should emit "push-pane-after-show" after it is shown',
                test: async () => {
                  const spy = sinon.spy();
                  this.component.addEventListener('push-pane-after-show', spy);
                  this.component.show();
                  await waitUntil(() => spy.calledOnce, 'push-pane-after-show should fire', {
                    timeout: 2500,
                  });

                  expect(spy).to.have.been.calledOnce;
                },
              },
              emitAfterHide: {
                description: 'should emit "push-pane-after-hide" after it is hidden',
                test: async () => {
                  const spy = sinon.spy();
                  this.component.addEventListener('push-pane-after-hide', spy);
                  this.component.show();

                  await elementUpdated(this.component);
                  setTimeout(() => this.component.hide(), 200);
                  await waitUntil(() => spy.calledOnce);

                  expect(this.component.open).to.be.false;
                  expect(spy).to.have.been.calledOnce;
                },
              },
            },
          },

          // interaction tests
          interactions: {
            description: 'interactions',
            tests: {
              restoresFocusToOpener: {
                description: 'returns focus to the element that opened the pane',
                test: async () => {
                  const el = this.component;
                  const opener = document.createElement('button');
                  el.before(opener);
                  opener.focus();
                  el.open = true;
                  await elementUpdated(el);

                  const closeButton = el.shadowRoot?.querySelector<HTMLElement>('.close-button');
                  if (!closeButton) throw new Error('Expected the pane close button.');
                  closeButton.focus();
                  el.hide();
                  await elementUpdated(el);

                  expect(document.activeElement).to.equal(opener);
                  opener.remove();
                },
              },
            },
          },
        },
      },
    });
  }
}
