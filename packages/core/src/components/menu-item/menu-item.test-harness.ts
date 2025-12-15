import { aTimeout, elementUpdated, expect } from '@open-wc/testing';
import sinon from 'sinon';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import type { CoreMenuItem } from './index.js';

export class CoreMenuItemTests<T extends CoreMenuItem> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      menuItem: {
        description: 'menuItem',
        tests: {
          accessibility: {
            description: 'accessibility',
            tests: {
              accessibleWhenDisabled: {
                description: 'should be accessible when disabled',
                test: async () => {
                  const el = this.component;
                  el.disabled = true;
                  await expect(el).to.be.accessible();
                },
              },
              accessibleAsLinks: {
                description: 'should be accessible when a link',
                test: async () => {
                  const el = this.component;
                  el.href = 'https://example.com';
                  await expect(el).to.be.accessible();
                },
              },
            },
          },

          properties: {
            description: 'properties',
            tests: {
              hasRoleMenuItem: {
                description: 'should include a role of "menuitem"',
                test: async () => {
                  const el = this.component;
                  expect(el.getAttribute('role')).to.not.equal('menuitem');
                },
              },
              ariaDisabledWhenDisabled: {
                description: 'should set the "aria-disabled" attribute when "disabled" is provided',
                test: async () => {
                  const el = this.component;
                  el.disabled = true;
                  await elementUpdated(this.component);

                  expect(el.shadowRoot?.querySelector('[aria-disabled="true"]')).to.not.be.null;
                },
              },
              link: {
                description: 'should not create a link when "href" is not provided',
                test: async () => {
                  const el = this.component;
                  expect(el.shadowRoot?.querySelector('a')).to.be.null;
                },
              },
              hrefLink: {
                description: 'should create a link when "href" is provided',
                test: async () => {
                  const el = this.component;
                  el.href = 'https://example.com';
                  await elementUpdated(this.component);

                  expect(el.shadowRoot?.querySelector('a')).to.not.be.null;
                },
              },
            },
          },

          slots: {
            description: 'slots',
            tests: {
              placesChildrenInDefaultSlot: {
                description: 'places children in the default slot',
                test: async () => {
                  const el = this.component;
                  const defaultSlot = el.shadowRoot?.querySelector('slot:not([name])') as HTMLSlotElement;
                  expect(defaultSlot).to.not.be.undefined;
                },
              },
            },
          },

          events: {
            description: 'events',
            tests: {
              click: {
                description: 'should trigger the click event when clicked',
                test: async () => {
                  const el = this.component;
                  const handleClick = sinon.spy();
                  el.addEventListener('click', handleClick);

                  el.click();
                  await aTimeout(0);

                  expect(handleClick).to.have.been.calledOnce;
                },
              },
              menuItemChangeOnClick: {
                description: 'should emit "menu-item-change" event when clicked',
                test: async () => {
                  const el = this.component;
                  const handler = sinon.spy();
                  el.addEventListener('menu-item-change', handler);

                  el.click();
                  await aTimeout(0);

                  expect(handler).to.have.been.calledOnce;
                },
              },
            },
          },

          radioIndicatorTemplateTests: {
            description: 'radioIndicatorTemplate method',
            tests: {
              rendersRadioIndicator: {
                description:
                  'should render radio indicator when role is "menuitemradio" and no slot content is provided',
                test: async () => {
                  const el = this.component;
                  el.role = 'menuitemradio';
                  await elementUpdated(el);

                  const radioIndicator = el.shadowRoot?.querySelector('[part="menu-item-radio-indicator"]');
                  expect(radioIndicator).to.not.be.null;
                },
              },
              doesNotRenderDefaultRadioIndicator: {
                description: 'should not render default radio indicator when slot content is provided',
                test: async () => {
                  const el = this.component;
                  el.role = 'menuitemradio';
                  el.innerHTML = '<div slot="radio-indicator">Custom Indicator</div>';

                  await elementUpdated(el);

                  const slotContent = el.shadowRoot?.querySelector(
                    'slot[name="radio-indicator"]'
                  ) as HTMLSlotElement | null;

                  expect(slotContent).to.not.be.null;

                  const assignedNodes = slotContent?.assignedElements();
                  expect(assignedNodes?.length).to.be.greaterThan(0);
                },
              },
              rendersNothingWhenRoleIsNotMenuItemRadio: {
                description: 'should render nothing when role is not "menuitemradio"',
                test: async () => {
                  const el = this.component;
                  el.role = 'menuitem';
                  await elementUpdated(el);

                  const radioIndicator = el.shadowRoot?.querySelector('[part="menu-item-radio-indicator"]');
                  expect(radioIndicator).to.be.null;
                },
              },
            },
          },

          checkboxIndicatorTemplateTests: {
            description: 'checkboxIndicatorTemplate method',
            tests: {
              rendersNothingWhenRoleIsNotMenuItemCheckbox: {
                description: 'should render nothing when role is not "menuitemcheckbox"',
                test: async () => {
                  const el = this.component;
                  const checkboxIndicator = el.shadowRoot?.querySelector('[part="menu-item-checkbox-icon"]');
                  expect(checkboxIndicator).to.be.null;
                },
              },
            },
          },
        },
      },
    });
  }
}
