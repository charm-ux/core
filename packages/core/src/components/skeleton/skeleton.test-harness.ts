import { expect } from '@open-wc/testing';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import type { CoreSkeleton } from './index.js';

export class CoreSkeletonTests<T extends CoreSkeleton> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      skeleton: {
        description: 'skeleton',
        tests: {
          properties: {
            description: 'animation',
            tests: {
              wave: {
                description: 'should be accessible with wave animation',
                test: async () => {
                  this.component.animation = 'wave';
                  await expect(this.component).to.be.accessible();
                },
              },
              pulse: {
                description: 'should be accessible with pulse animation',
                test: async () => {
                  this.component.animation = 'pulse';
                  await expect(this.component).to.be.accessible();
                },
              },
            },
          },
          slots: {
            description: 'slots',
            tests: {},
          },
        },
      },
    });
  }
}
