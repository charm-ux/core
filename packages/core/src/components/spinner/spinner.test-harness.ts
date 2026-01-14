import { expect } from '@open-wc/testing';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import type { CoreSpinner } from './index.js';

export class CoreSpinnerTests<T extends CoreSpinner> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      spinner: {
        description: 'spinner',
        tests: {
          // attribute and property tests
          accessible: {
            description: 'accessible',
            tests: {
              label: {
                description: 'should be accessible when using label attribute',
                test: async () => {
                  this.component.label = 'Loading...';
                  await this.component.updateComplete;
                  await expect(this.component).to.be.accessible();
                },
              },
              defaultSlot: {
                description: 'should be accessible when using default slot',
                test: async () => {
                  this.component.innerHTML = 'Loading...';
                  await this.component.updateComplete;
                  await expect(this.component).to.be.accessible();
                },
              },
            },
          },
        },
      },
    });
  }
}
