import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import sinon from 'sinon';
import { FocusableElementTests } from '../focusable-element/focusable-element.test-harness.js';
import CharmFormControlElement from './charm-form-control-element.js';

export class CoreFormControlTests<T extends CharmFormControlElement> extends FocusableElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      formControl: {
        description: 'form-control',
        tests: {
          // event tests
          events: {
            description: 'events',
            tests: {},
          },

          // property and attribute tests
          properties: {
            description: 'from control properties',
            tests: {
              label: {
                description: 'shows label when label property is provided',
                test: async () => {
                  const label = 'First Name';
                  this.component.label = label;
                  await elementUpdated(this.component);
                  expect(this.component.shadowRoot?.querySelector('label')?.textContent?.trim()).to.equal(label);
                },
              },
              disabled: {
                description: 'attaches the disabled attribute to the input',
                test: async () => {
                  const getInput = () => this.component.shadowRoot?.querySelector('input');

                  this.component.disabled = true;
                  await elementUpdated(this.component);
                  expect(getInput()).to.have.attribute('disabled');

                  this.component.disabled = false;
                  await elementUpdated(this.component);
                  expect(getInput()).to.not.have.attribute('disabled');
                },
              },
              errorMessage: {
                description: 'shows error text if present',
                test: async () => {
                  const errorMessage = 'test';
                  const getErrorText = () =>
                    this.component.shadowRoot?.querySelector('.form-control-error-text')?.textContent?.trim();

                  this.component.errorMessage = errorMessage;
                  await elementUpdated(this.component);
                  expect(getErrorText()).to.equal(errorMessage);

                  this.component.errorMessage = '';
                  await elementUpdated(this.component);
                  expect(getErrorText()).to.equal('');
                },
              },
              required: {
                description: 'attaches the required attribute to the input',
                test: async () => {
                  const getRequiredIndicator = () => this.component.shadowRoot?.querySelector('.required-indicator');
                  const getInput = () => this.component.shadowRoot?.querySelector('input');

                  this.component.required = true;
                  await elementUpdated(this.component);

                  expect(getInput()).to.have.attribute('required');
                  expect(getRequiredIndicator()).to.not.be.null;

                  this.component.required = false;
                  await elementUpdated(this.component);
                  expect(getInput()).to.not.have.attribute('required');
                  expect(getRequiredIndicator()).to.be.null;
                },
              },
            },
          },

          // slot tests
          slots: {
            description: 'form control slots',
            tests: {
              label: {
                description: 'shows label when label property is provided',
                test: async () => {
                  this.component.removeAttribute('label');
                  this.component.innerHTML = '<span slot="label">Label</span>';
                  await elementUpdated(this.component);
                  const labelSlot = this.component.shadowRoot?.querySelector('slot[name="label"]') as HTMLSlotElement;
                  const [span] = labelSlot.assignedNodes();
                  expect(span.textContent).to.equal('Label');
                },
              },
            },
          },

          // interaction tests
          interactions: {
            description: 'interactions',
            tests: {
              focusDelegation: {
                description: 'focuses the input when clicking on the label',
                test: async () => {
                  const inputHandler = sinon.spy();
                  this.component.addEventListener('focus', inputHandler);
                  this.component.shadowRoot?.querySelector('label')?.click();
                  await elementUpdated(this.component);

                  expect(inputHandler).to.have.been.callCount(1);
                },
              },

              formReset: {
                description: 'resets the form control when the form is reset',
                test: async () => {
                  const form = await fixture<HTMLFormElement>(html`<form>${this.component}</form>`);
                  const input = form.children[0] as CharmFormControlElement;

                  input.value = 'test123';
                  await elementUpdated(input);

                  form.reset();
                  await elementUpdated(input);

                  expect(input.value).to.equal('test');
                },
                config: {
                  value: 'test',
                },
              },
            },
          },

          validations: {
            description: 'validations',
            tests: {
              hideErrorMessage: {
                description: 'should hide custom validation message when `errorMessage` is set to an empty string',
                test: async () => {
                  const errorMessage = this.component.shadowRoot?.querySelector('.form-control-error-text');

                  this.component.errorMessage = 'Custom validation message';
                  await elementUpdated(this.component);

                  this.component.errorMessage = '';
                  await elementUpdated(this.component);

                  expect(this.component.invalid).to.be.false;
                  expect(this.component.checkValidity()).to.be.true;
                  expect(errorMessage?.textContent?.trim()).to.equal('');
                },
              },
              showErrorMessage: {
                description: 'should show custom validation message when `errorMessage` is set to non-empty string',
                test: async () => {
                  const el = this.component;
                  const errorMessage = el.shadowRoot?.querySelector('.form-control-error-text');
                  el.errorMessage = 'Custom validation message';
                  await elementUpdated(el);

                  expect(el.invalid).to.be.true;
                  expect(el.checkValidity()).to.be.false;
                  expect(errorMessage?.textContent?.trim()).to.equal('Custom validation message');
                },
              },
              showValidationMessage: {
                description:
                  'should show custom validation message when `setCustomValidity("Custom validation message")` is called',
                test: async () => {
                  const el = this.component;
                  el.setCustomValidity('Custom validation message');
                  await elementUpdated(el);

                  const errorMessage = el.shadowRoot?.querySelector('.form-control-error-text');
                  expect(el.invalid).to.be.true;
                  expect(errorMessage).to.be.visible;
                  expect(errorMessage?.textContent?.trim()).to.equal('Custom validation message');
                },
              },
            },
          },
        },
      },
    });
  }
}
