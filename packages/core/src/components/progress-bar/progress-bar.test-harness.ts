import { elementUpdated, expect } from '@open-wc/testing';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import type { CoreProgressBar } from './index.js';

export class CoreProgressBarTests<T extends CoreProgressBar> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      progressBar: {
        description: 'progressBar',
        tests: {
          indeterminate: {
            description: 'when provided an indeterminate parameter',
            tests: {
              accessible: {
                description: 'should pass accessibility tests',
                test: async () => {
                  this.component.indeterminate = true;
                  await elementUpdated(this.component);
                  expect(this.component).to.be.accessible();
                },
              },
            },
          },
          properties: {
            description: 'properties',
            tests: {
              value: {
                description: 'uses the value parameter on the base, as aria-valuenow',
                test: async () => {
                  const el = this.component;
                  el.value = 25;
                  await elementUpdated(el);

                  expect(el.shadowRoot?.querySelector('[part="progress-bar-track"]')).attribute('aria-valuenow', '25');
                },
              },
              width: {
                description: 'should update the --progress-percent based on the value',
                test: async () => {
                  const el = this.component;
                  el.value = 25;
                  await elementUpdated(el);
                  const componentStyle = window.getComputedStyle(el);
                  expect(componentStyle.getPropertyValue('--progress-percent')).to.equal('25%');
                },
              },
              max: {
                description: 'should update the --progress-percent based when the `max` is changed',
                test: async () => {
                  this.component.value = 10;
                  await elementUpdated(this.component);
                  const componentStyle = window.getComputedStyle(this.component);
                  expect(componentStyle.getPropertyValue('--progress-percent')).to.equal('10%');

                  this.component.max = 200;
                  await elementUpdated(this.component);
                  expect(componentStyle.getPropertyValue('--progress-percent')).to.equal('5%');
                },
              },
              hideLabel: {
                description: 'should hide the label when the `hide-label` attribute is set',
                test: async () => {
                  const el = this.component;
                  el.hideLabel = true;
                  await elementUpdated(el);
                  expect(el.shadowRoot?.querySelector('.progress-bar-label')).to.have.class('visually-hidden');
                },
              },
            },
          },
        },
      },
    });
  }
}
