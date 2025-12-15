import { elementUpdated, expect, fixture } from '@open-wc/testing';
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
