import { elementUpdated, expect } from '@open-wc/testing';
import sinon from 'sinon';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import type { CoreSelect } from './index.js';

export class CoreSelectTests<T extends CoreSelect> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      select: {
        description: 'select',
        tests: {
          accessibility: {
            description: 'accessible when disabled',
            test: async () => {
              const el = this.component;
              el.disabled = true;

              await elementUpdated(el);
              await expect(el).to.be.accessible();
            },
          },
          // attribute and property tests
          properties: {
            description: 'properties',
            tests: {
              value: {
                description: 'value is assigned when option has selected attribute',
                test: async () => {
                  const el = this.component;
                  el.innerHTML = `
                    <option value="1">Option One</option>
                    <option value="2">Option Two</option>
                    <option value="3" selected>Option Three</option>
                  `;
                  await elementUpdated(el);
                  expect(el.value).to.equal('3');
                },
              },
              attributeValue: {
                description: 'selected attribute is set when value is assigned',
                config: {
                  value: '2',
                },
                test: async () => {
                  const el = this.component;
                  el.innerHTML = `
                    <option value="1">Option One</option>
                    <option value="2">Option Two</option>
                    <option value="3">Option Three</option>
                  `;
                  await elementUpdated(el);
                  const selectedOption = document.querySelector('[selected]') as HTMLOptionElement;
                  expect(selectedOption.value).to.equal('2');
                },
              },
              valueAfterUpdate: {
                description: 'keeps value in sync when internal select updates',
                test: async () => {
                  const el = this.component;
                  el.innerHTML = `
                    <option value="1">Option One</option>
                    <option value="2">Option Two</option>
                    <option value="3" selected>Option Three</option>
                  `;

                  await elementUpdated(el);

                  const select = await el.shadowRoot?.querySelector('select');

                  select!.value = select!.options[1].value;
                  select!.dispatchEvent(new Event('change'));

                  expect(el.value).to.equal(select!.options[1].value);
                },
              },
              label: {
                description: 'label attribute sets the component label',
                test: async () => {
                  const el = this.component;
                  el.label = 'TEST LABEL';
                  await elementUpdated(el);

                  const label = el.shadowRoot?.querySelector('label');

                  expect(label?.textContent?.trim()).to.include('TEST LABEL');
                },
              },
              ariaLabel: {
                description: 'renders the aria-label provided for the select',
                test: async () => {
                  const el = this.component;
                  el.label = 'TEST LABEL';
                  await elementUpdated(el);

                  const select = await el.shadowRoot?.querySelector('select');

                  expect(select?.getAttribute('aria-label')).to.equal('TEST LABEL');
                },
              },
              invalid: {
                description: 'should show an error when invalid control',
                test: async () => {
                  const el = this.component;

                  el.invalid = true;

                  await elementUpdated(el);

                  const hasError = await Boolean(el.shadowRoot?.querySelector('.form-control-has-error'));

                  expect(hasError).to.be.true;
                },
              },
              multiple: {
                description: 'should not show an icon when multiple attribute is true',
                test: async () => {
                  const el = this.component;
                  el.multiple = true;

                  const icon = await el.shadowRoot?.querySelector('.chevron');

                  const isIconShowing = window.getComputedStyle(icon!, null).display !== 'none';

                  expect(isIconShowing).to.be.false;
                },
              },
              disabledOption: {
                description: 'disabled option renders correctly',
                test: async () => {
                  const el = this.component;
                  el.innerHTML = `
                    <option value="1">Enabled</option>
                    <option value="2" disabled>Disabled</option>
                    <option value="3">Also Enabled</option>
                  `;
                  await elementUpdated(el);

                  const select = el.shadowRoot?.querySelector('select');
                  if (!(select instanceof HTMLSelectElement)) {
                    throw new Error('Select element not found or is not an HTMLSelectElement');
                  }

                  const options = select.querySelectorAll('option');

                  expect(options.length).to.equal(3);
                  expect(options[1].disabled).to.be.true;
                  expect(options[1].value).to.equal('2');
                  expect(options[1].textContent?.trim()).to.equal('Disabled');
                },
              },
            },
          },

          // method tests
          methods: {
            description: 'methods',
            tests: {},
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
              change: {
                description: 'emits change',
                test: async () => {
                  const el = this.component;

                  const changeSpy = sinon.spy();
                  const select = await el.shadowRoot?.querySelector('select');

                  el.addEventListener('change', changeSpy);
                  select!.dispatchEvent(new Event('change'));

                  expect(changeSpy).to.have.been.calledOnce;
                },
              },
              input: {
                description: 'emits input',
                test: async () => {
                  const el = this.component;

                  const inputSpy = sinon.spy();
                  const select = await el.shadowRoot?.querySelector('select');

                  el.addEventListener('input', inputSpy);
                  select!.dispatchEvent(new Event('input'));

                  expect(inputSpy).to.have.been.calledOnce;
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
