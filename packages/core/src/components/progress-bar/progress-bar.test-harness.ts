import { elementUpdated, expect } from '@open-wc/testing';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import type { CoreProgressBar } from './index.js';

/** Resolves after the next animation frame, allowing the deferred width sync to run. */
const waitForFrame = () => new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

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
                  await waitForFrame();
                  const componentStyle = window.getComputedStyle(el);
                  expect(componentStyle.getPropertyValue('--progress-percent')).to.equal('25%');
                },
              },
              max: {
                description: 'should update the --progress-percent based when the `max` is changed',
                test: async () => {
                  this.component.value = 10;
                  await elementUpdated(this.component);
                  await waitForFrame();
                  const componentStyle = window.getComputedStyle(this.component);
                  expect(componentStyle.getPropertyValue('--progress-percent')).to.equal('10%');

                  this.component.max = 200;
                  await elementUpdated(this.component);
                  await waitForFrame();
                  expect(componentStyle.getPropertyValue('--progress-percent')).to.equal('5%');
                },
              },
              clampsOutOfRange: {
                description: 'clamps the indicator to 100% when the value exceeds the max',
                test: async () => {
                  const el = this.component;
                  el.value = 150;
                  await elementUpdated(el);
                  await waitForFrame();
                  const componentStyle = window.getComputedStyle(el);
                  expect(componentStyle.getPropertyValue('--progress-percent')).to.equal('100%');
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
              meter: {
                description: 'reflects the meter attribute and uses the meter role',
                test: async () => {
                  const el = this.component;
                  el.meter = true;
                  await elementUpdated(el);
                  expect(el.hasAttribute('meter')).to.be.true;
                  expect(el.shadowRoot?.querySelector('[part="progress-bar-track"]')?.getAttribute('role')).to.equal(
                    'meter'
                  );
                },
              },
              indeterminateOmitsAriaValueNow: {
                description: 'omits aria-valuenow when indeterminate',
                test: async () => {
                  const el = this.component;
                  el.indeterminate = true;
                  await elementUpdated(el);
                  expect(el.shadowRoot?.querySelector('[part="progress-bar-track"]')?.hasAttribute('aria-valuenow')).to
                    .be.false;
                },
              },
              labelledByWiredToLabel: {
                description: 'keeps aria-labelledby wired to the label even when no label text is provided',
                test: async () => {
                  const el = this.component;
                  const track = el.shadowRoot?.querySelector('[part="progress-bar-track"]');
                  expect(track?.getAttribute('aria-labelledby')).to.equal('label');
                  el.removeAttribute('label');
                  el.innerHTML = '';
                  await elementUpdated(el);
                  expect(track?.getAttribute('aria-labelledby')).to.equal('label');
                },
              },
              defaultLabel: {
                description: 'names the bar with fallback text when no label is provided',
                test: async () => {
                  const el = this.component;
                  el.removeAttribute('label');
                  el.innerHTML = '';
                  await elementUpdated(el);
                  const label = el.shadowRoot?.querySelector('#label');
                  expect(label?.textContent?.trim()).to.equal('Progress');
                  expect(label).to.have.class('visually-hidden');
                },
              },
            },
          },
        },
      },
    });
  }
}
