import { elementUpdated, expect, oneEvent } from '@open-wc/testing';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import { setComponentVar } from '../../test/themeVar.js';
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
                  const buttonElement =
                    (slot?.assignedElements()[0] as HTMLElement)?.querySelector('button') ??
                    (slot?.assignedElements()[0] as HTMLButtonElement);
                  // el.disabled = false;

                  buttonElement?.click();
                  await elementUpdated(el);

                  expect(el.open).to.not.equal(initialExpandedValue);
                },
              },
              expandedWhenDisabled: {
                description: 'does not toggle when the native trigger button is disabled',
                test: async () => {
                  const el = this.component;
                  await elementUpdated(el);
                  const initialExpandedValue = el.open;
                  const slot = el.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="trigger"]');
                  const buttonElement = slot?.assignedElements()[0] as HTMLButtonElement;
                  buttonElement.disabled = true;

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
                  const buttonElement = slot?.assignedElements()[0] as HTMLButtonElement;

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
                  const buttonElement = slot?.assignedElements()[0] as HTMLButtonElement;

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
              noCrossShadowControlReference: {
                description: 'does not emit an aria-controls ID reference across the shadow boundary',
                test: async () => {
                  const el = this.component;
                  const slot = el.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="trigger"]');
                  const buttonElement = slot?.assignedElements()[0] as HTMLButtonElement;
                  expect(buttonElement.getAttribute('aria-expanded')).to.equal('false');
                  expect(buttonElement.hasAttribute('aria-controls')).to.be.false;
                },
              },
              inertWhenClosed: {
                description: 'makes the content region inert when closed',
                test: async () => {
                  const el = this.component;
                  const content = el.shadowRoot?.querySelector('.disclosure-content') as HTMLElement;

                  expect(content.inert).to.be.true;

                  el.open = true;
                  await elementUpdated(el);

                  expect(content.inert).to.be.false;
                },
              },
              triggerCanVetoClose: {
                description: 'allows consumers to cancel a trigger close request',
                test: async () => {
                  const el = this.component;
                  const button = el.querySelector<HTMLButtonElement>('[slot="trigger"]')!;
                  el.open = true;
                  await elementUpdated(el);
                  el.addEventListener('disclosure-request-close', event => event.preventDefault(), { once: true });
                  button.click();
                  await elementUpdated(el);
                  expect(el.open).to.be.true;
                },
              },
              removesTriggerListenerWhenSlotEmpties: {
                description: 'removes the previous trigger listener when the trigger slot is emptied',
                test: async () => {
                  const el = this.component;
                  const trigger = el.querySelector<HTMLButtonElement>('[slot="trigger"]')!;
                  const slot = el.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="trigger"]');
                  if (!slot) throw new Error('Expected trigger slot');
                  const slotChange = oneEvent(slot, 'slotchange');
                  trigger.remove();
                  await slotChange;

                  trigger.click();
                  expect(el.open).to.be.false;

                  const replacement = document.createElement('button');
                  replacement.slot = 'trigger';
                  replacement.textContent = 'Replacement trigger';
                  const replacementSlotChange = oneEvent(slot, 'slotchange');
                  el.append(replacement);
                  await replacementSlotChange;
                  replacement.click();
                  expect(el.open).to.be.true;
                },
              },
              restoresFocusWhenHidingFocusedContent: {
                description: 'returns focus to the trigger when hiding focused content',
                test: async () => {
                  const el = this.component;
                  const button = el.querySelector<HTMLButtonElement>('[slot="trigger"]')!;
                  const contentButton = document.createElement('button');
                  contentButton.textContent = 'Focusable content';
                  el.append(contentButton);
                  el.open = true;
                  await elementUpdated(el);
                  contentButton.focus();
                  el.hide();
                  expect(document.activeElement).to.equal(button);
                },
              },
              contentBelowIsBoolean: {
                description: 'reflects content-below as a boolean attribute',
                test: async () => {
                  const el = this.component;
                  el.contentBelow = false;
                  await elementUpdated(el);
                  expect(el.hasAttribute('content-below')).to.be.false;
                  el.contentBelow = true;
                  await elementUpdated(el);
                  expect(el.getAttribute('content-below')).to.equal('');
                },
              },
            },
          },
          customMaxHeightClosed: {
            description: 'respects custom max-height CSS variable when closed',
            test: async () => {
              const el = this.component;
              const varName = setComponentVar(el, 'disclosure', 'closedMaxHeight', '500px');
              await elementUpdated(el);

              const hostStyles = window.getComputedStyle(el);

              expect(hostStyles.getPropertyValue(varName).trim()).to.equal('500px');
              expect(el.open).to.equal(false);
            },
          },
          customMaxHeightOpened: {
            description: 'respects custom max-height CSS variable when opened',
            test: async () => {
              const el = this.component;
              el.innerHTML = 'Disclosure content';
              const varName = setComponentVar(el, 'disclosure', 'openedMaxHeight', '500px');
              await elementUpdated(el);
              const afterShow = oneEvent(el, 'disclosure-after-show');
              el.open = true;
              await elementUpdated(el);
              await afterShow;
              const region = el.shadowRoot?.querySelector('.disclosure-content') as HTMLElement;
              const hostStyles = window.getComputedStyle(el);
              const computedStyle = window.getComputedStyle(region);

              expect(hostStyles.getPropertyValue(varName).trim()).to.equal('500px');
              expect(computedStyle.maxHeight).to.equal('500px');
            },
          },
        },
      },
    });
  }
}
