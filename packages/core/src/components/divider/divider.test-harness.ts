import { elementUpdated, expect } from '@open-wc/testing';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import type { CoreDivider } from './index.js';

export class CoreDividerTests<T extends CoreDivider> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      divider: {
        description: 'divider',
        tests: {
          // accessibility tests
          defaultSeparator: {
            description: 'has role="separator" and aria-orientation by default',
            test: async () => {
              const el = this.component;
              expect(el.getAttribute('role')).to.equal('separator');
              expect(el.getAttribute('aria-orientation')).to.equal('horizontal');
            },
          },
          vertical: {
            description: 'should be accessible with "vertical" orientation',
            test: async () => {
              this.component.orientation = 'vertical';
              await expect(this.component).to.be.accessible();
            },
          },
          presentation: {
            description: 'should be accessible with "presentation" role',
            test: async () => {
              this.component.presentation = true;
              await expect(this.component).to.be.accessible();
            },
          },
          presentationRemovesSeparatorRole: {
            description: 'removes separator role and aria-orientation when presentation is set',
            test: async () => {
              const el = this.component;
              el.presentation = true;
              await elementUpdated(el);
              expect(el.getAttribute('role')).to.equal('presentation');
              expect(el.hasAttribute('aria-orientation')).to.be.false;
            },
          },

          slots: {
            description: 'slots',
            tests: {
              default: {
                description: 'should place children in the default slot',
                test: async () => {
                  const defaultSlot = this.component.shadowRoot?.querySelector('slot:not([name])') as HTMLSlotElement;
                  expect(defaultSlot).to.not.be.undefined;
                },
              },
            },
          },
        },
      },
    });
  }
}
