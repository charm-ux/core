import { elementUpdated, expect } from '@open-wc/testing';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import type { CoreDisclosure } from './index.js';

export class CoreDisclosureTests<T extends CoreDisclosure> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      disclosure: {
        description: 'disclosure',
        tests: {
          properties: {
            description: 'properties',
            tests: {
              renderBasePartAttributes: {
                description: 'renders part attributes using baseName',
                test: async () => {
                  const element = this.component;

                  const regionPart = element.shadowRoot?.querySelector('[part="disclosure-content"]');
                  const basePart = element.shadowRoot?.querySelector('[part="disclosure-base"]');

                  expect(regionPart).to.be.not.null;
                  expect(basePart).to.be.not.null;
                },
              },
              expanded: {
                description: 'toggles "expanded" property when not disabled',
                test: async () => {
                  const el = this.component;
                  const initialExpandedValue = el.open;
                  const slot = el.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="trigger"]');
                  const buttonElement = slot?.assignedNodes()[0] as HTMLButtonElement;
                  // el.disabled = false;

                  buttonElement?.click();
                  await elementUpdated(el);

                  expect(el.open).to.not.equal(initialExpandedValue);
                },
              },
              expandedWhenDisabled: {
                description: 'does not toggle "expanded" property when disabled',
                test: async () => {
                  const el = this.component;
                  await elementUpdated(el);
                  const initialExpandedValue = el.open;
                  const slot = el.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="trigger"]');
                  const buttonElement = slot?.assignedNodes()[0] as HTMLButtonElement;
                  buttonElement.disabled = true;

                  // el.disabled = true;

                  buttonElement?.click();
                  await elementUpdated(el);

                  expect(el.open).to.equal(initialExpandedValue);
                },
              },
            },
          },
          slots: {
            description: 'slots',
            tests: {
              defaultSlot: {
                description: 'places children in the default slot',
                test: async () => {
                  const el = this.component;
                  el.innerHTML = 'Content Expand Panel';
                  const defaultSlot = el.shadowRoot?.querySelector('slot:not(name)') as HTMLSlotElement;

                  expect(defaultSlot).to.not.be.undefined;
                },
              },
            },
          },

          accessibility: {
            description: 'accessibility',
            tests: {
              ariaExpanded: {
                description: 'sets aria-expanded to true when the content expand is clicked and expanded',
                test: async () => {
                  const el = this.component;
                  const slot = el.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="trigger"]');
                  const buttonElement = slot?.assignedNodes()[0] as HTMLButtonElement;

                  buttonElement?.click();
                  await elementUpdated(el);

                  expect(buttonElement.getAttribute('aria-expanded')).to.equal('true');
                },
              },
              ariaExpandedFalse: {
                description:
                  'sets aria-expanded to false and removes expanded attribute when the content expand is clicked and collapsed',
                test: async () => {
                  const el = this.component;
                  el.open = true;
                  await elementUpdated(el);
                  const slot = el.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="trigger"]');
                  const buttonElement = slot?.assignedNodes()[0] as HTMLButtonElement;

                  el.setAttribute('open', '');
                  buttonElement.setAttribute('aria-expanded', 'true');

                  await elementUpdated(el);

                  expect(buttonElement.getAttribute('aria-expanded')).to.equal('true');
                  expect(el.hasAttribute('open')).to.be.true;

                  buttonElement.click();
                  await elementUpdated(el);

                  expect(buttonElement.getAttribute('aria-expanded')).to.equal('false');
                  expect(el.hasAttribute('open')).to.be.false;
                },
              },
            },
          },
          customMaxHeightClosed: {
            description: 'respects custom max-height CSS variable when closed',
            test: async () => {
              const el = this.component;
              el.style.setProperty('--disclosure-closed-max-height', '500px');
              await elementUpdated(el);

              const region = el.shadowRoot?.querySelector('.disclosure-content') as HTMLElement;
              const computedStyle = window.getComputedStyle(region);

              // Check if custom max-height is applied
              expect(computedStyle.maxHeight).to.equal('500px');
            },
          },
          customMaxHeightOpened: {
            description: 'respects custom max-height CSS variable when opened',
            test: async () => {
              const el = this.component;
              el.style.setProperty('--disclosure-opened-max-height', '500px');
              await elementUpdated(el);
              el.open = true;
              await elementUpdated(el);
              const region = el.shadowRoot?.querySelector('.disclosure-content') as HTMLElement;
              const computedStyle = window.getComputedStyle(region);

              // Check if custom max-height is applied
              expect(computedStyle.maxHeight).to.equal('500px');
            },
          },
        },
      },
    });
  }
}
