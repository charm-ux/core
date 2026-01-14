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
                  await waitUntil(() => spy.calledOnce);

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
            tests: {},
          },
        },
      },
    });
  }
}
