import { elementUpdated, expect } from '@open-wc/testing';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import type { CoreTab } from './index.js';

export class CoreTabTests<T extends CoreTab> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      base: {
        description: 'base',
        tests: {
          accessibility: {
            description: 'tab accessibility requires a parent with the correct role. This is covered via tabs',
            test: async () => {},
          },
        },
      },
      tab: {
        description: 'Tab',
        tests: {
          slots: {
            description: 'slots',
            tests: {
              defaultSlot: {
                description: 'place children in the default slot',
                test: async () => {
                  const el = this.component;
                  const defaultSlot = el.shadowRoot?.querySelector('slot:not(name)') as HTMLSlotElement;
                  expect(defaultSlot).to.not.be.undefined;
                },
              },
              startSlot: {
                description: 'has a start slot',
                test: async () => {
                  const el = this.component;
                  el.innerHTML = '<span slot="start">start</span>';
                  await elementUpdated(this.component);
                  const startSlot = el.shadowRoot?.querySelector('slot[name="start"]') as HTMLSlotElement;
                  const [span] = startSlot.assignedNodes();
                  expect(span?.textContent).to.equal('start');
                },
              },
              endSlot: {
                description: 'has an end slot',
                test: async () => {
                  const el = this.component;
                  el.innerHTML = '<span slot="end">end</span>';
                  await elementUpdated(this.component);
                  const endSlot = el.shadowRoot?.querySelector('slot[name="end"]') as HTMLSlotElement;
                  const [span] = endSlot.assignedNodes();
                  expect(span?.textContent).to.equal('end');
                },
              },
            },
          },
          accessibility: {
            description: 'accessibility',
            tests: {
              ariaSelected: {
                description: 'has aria-selected when selected',
                test: async () => {
                  const el = this.component;
                  el.selected = true;
                  await elementUpdated(el);
                  expect(el.getAttribute('aria-selected')).to.equal('true');
                },
              },
              ariaDisabled: {
                description: 'has aria-disabled when disabled',
                test: async () => {
                  const el = this.component;
                  el.disabled = true;
                  await elementUpdated(el);
                  expect(el.getAttribute('aria-disabled')).to.equal('true');
                },
              },
            },
          },
        },
      },
    });
  }
}
