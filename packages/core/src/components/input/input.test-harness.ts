import { aTimeout, elementUpdated, expect, fixture } from '@open-wc/testing';
import { html, unsafeStatic } from 'lit/static-html.js';
import { sendKeys } from '@web/test-runner-commands';
import sinon from 'sinon';
import { project } from '../../utilities/index.js';
import { CoreFormControlTests } from '../../base/form-control-element/charm-form-control-element.test-harness.js';
import type { CoreInput } from './index.js';

export class CoreInputTests<T extends CoreInput> extends CoreFormControlTests<T> {
  public constructor() {
    super();
    this.updateTests({
      input: {
        description: 'input',
        tests: {
          events: {
            description: 'events',
            tests: {
              input: {
                description: 'emits a input event',
                test: async () => {
                  const inputHandler = sinon.spy();
                  this.component.addEventListener('input', inputHandler);

                  this.component.shadowRoot?.querySelector('input')?.focus();
                  await sendKeys({ press: 't' });
                  await sendKeys({ press: 'e' });
                  await sendKeys({ press: 's' });
                  await sendKeys({ press: 't' });
                  await elementUpdated(this.component);
                  // @ts-ignore
                  expect(this.component._value).to.equal('test');
                  expect(inputHandler).to.have.been.callCount(4);
                },
              },
              change: {
                description: 'emits a change event when typed in then blurred',
                test: async () => {
                  const inputHandler = sinon.spy();
                  this.component.addEventListener('change', inputHandler);

                  this.component.shadowRoot?.querySelector('input')?.focus();
                  await sendKeys({ press: 't' });
                  await sendKeys({ press: 'e' });
                  await sendKeys({ press: 's' });
                  await sendKeys({ press: 't' });
                  this.component.shadowRoot?.querySelector('input')?.blur();

                  expect(inputHandler).to.have.been.callCount(1);
                },
              },
            },
          },
          properties: {
            description: 'properties',
            tests: {
              type: {
                description: 'attaches the type attribute to the input',
                test: async () => {
                  this.component.type = 'password';
                  await elementUpdated(this.component);
                  expect(this.component.shadowRoot?.querySelector('input')).attribute('type', 'password');
                },
              },
              clearButton: {
                description: 'shows a clear button and clears the value when activated',
                test: async () => {
                  this.component.withClear = true;
                  this.component.value = 'test';
                  await elementUpdated(this.component);

                  const clearButton = this.component.shadowRoot?.querySelector('.form-control-clear');
                  expect(clearButton).to.not.be.null;
                  clearButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                  await elementUpdated(this.component);

                  expect(this.component.value).to.equal('');
                },
              },
              passwordToggle: {
                description: 'toggles password visibility when the password toggle is activated',
                test: async () => {
                  this.component.type = 'password';
                  this.component.passwordToggle = true;
                  await elementUpdated(this.component);

                  const toggle = this.component.shadowRoot?.querySelector('.form-control-password-toggle');
                  expect(toggle).to.not.be.null;
                  toggle?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                  await elementUpdated(this.component);

                  expect(this.component.passwordVisible).to.be.true;
                  expect(this.component.shadowRoot?.querySelector('input')?.getAttribute('type')).to.equal('text');
                },
              },
            },
          },
          accessibility: {
            description: 'accessibility',
            tests: {
              invalidState: {
                description: 'reflects invalid state via aria-invalid and errormessage',
                test: async () => {
                  const getInput = () => this.component.shadowRoot?.querySelector('input');

                  this.component.errorMessage = 'Required';
                  await elementUpdated(this.component);
                  expect(getInput()?.getAttribute('aria-invalid')).to.equal('true');
                  expect(getInput()?.getAttribute('aria-errormessage')).to.equal('error-text');
                  expect(getInput()?.getAttribute('aria-describedby')).to.be.null;

                  this.component.errorMessage = '';
                  await elementUpdated(this.component);
                  expect(getInput()?.getAttribute('aria-invalid')).to.equal('false');
                  expect(getInput()?.getAttribute('aria-errormessage')).to.be.null;
                },
              },
              helpText: {
                description: 'describes the field with the help text when present',
                test: async () => {
                  const getInput = () => this.component.shadowRoot?.querySelector('input');

                  this.component.helpText = 'Some help';
                  await elementUpdated(this.component);
                  expect(getInput()?.getAttribute('aria-describedby')).to.contain('help-text');

                  this.component.helpText = '';
                  await elementUpdated(this.component);
                  expect(getInput()?.getAttribute('aria-describedby')).to.be.null;
                },
              },
              slottedLabelName: {
                description: 'keeps a slotted label in the accessibility tree',
                test: async () => {
                  const getLabel = () => this.component.shadowRoot?.querySelector('label');

                  this.component.removeAttribute('label');
                  this.component.innerHTML = '<span slot="label">First name</span>';
                  // `aTimeout` lets the slotchange that recomputes `hasLabel` land before
                  // waiting on the render it schedules.
                  await aTimeout(0);
                  await elementUpdated(this.component);
                  // The label element is the control's only accessible name, so hiding it
                  // when the text arrives through the slot leaves the input nameless.
                  expect(getLabel()?.getAttribute('aria-hidden')).to.equal('false');

                  this.component.innerHTML = '';
                  await aTimeout(0);
                  await elementUpdated(this.component);
                  expect(getLabel()?.getAttribute('aria-hidden')).to.equal('true');
                },
              },
            },
          },
          interactions: {
            description: 'form',
            tests: {
              form: {
                description: 'should be invalid when the input is empty and form.reportValidity() is called',
                test: async () => {
                  const tag = project.scope.tagName('input');
                  const form = await fixture<HTMLFormElement>(html`
                    <form><${unsafeStatic(tag)} required value=""></${unsafeStatic(tag)}><button type="submit">Submit</button></form>
                  `);
                  expect(form.reportValidity()).to.be.false;
                },
              },
              enterKeyInvalid: {
                description: 'does not submit an invalid form when Enter is pressed',
                test: async () => {
                  const tag = project.scope.tagName('input');
                  const form = await fixture<HTMLFormElement>(html`
                    <form>
                      <${unsafeStatic(tag)} required value=""></${unsafeStatic(tag)}>
                      <button type="submit">Submit</button>
                    </form>
                  `);
                  const submitSpy = sinon.spy();
                  form.addEventListener('submit', (e: Event) => {
                    e.preventDefault();
                    submitSpy();
                  });
                  const innerInput = form.querySelector(tag)?.shadowRoot?.querySelector('input') as HTMLInputElement;
                  innerInput.focus();
                  await sendKeys({ press: 'Enter' });
                  await aTimeout(50);
                  expect(submitSpy).to.have.been.callCount(0);
                },
              },
            },
          },
          validations: {
            description: 'events',
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
