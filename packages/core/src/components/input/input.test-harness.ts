import { aTimeout, elementUpdated, expect, fixture, waitUntil } from '@open-wc/testing';
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
                  expect(this.component.value).to.equal('test');
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
              numberMinAndEmptyValue: {
                description: 'preserves entered values and an empty value instead of clamping to min',
                test: async () => {
                  const el = this.component;
                  el.type = 'number';
                  el.min = 10;
                  el.max = 20;
                  el.value = '';
                  await elementUpdated(el);
                  expect(el.value).to.equal('');
                  el.value = '5';
                  await elementUpdated(el);
                  expect(el.value).to.equal('5');
                  el.min = 0;
                  el.value = '0';
                  await elementUpdated(el);
                  expect(el.value).to.equal('0');
                },
              },
              controlledNumberValue: {
                description: 'keeps a newly assigned number value instead of restoring the previous DOM value',
                test: async () => {
                  const el = this.component;
                  el.type = 'number';
                  el.value = '1';
                  await elementUpdated(el);
                  el.value = '2';
                  await elementUpdated(el);
                  expect(el.value).to.equal('2');
                  expect(el.shadowRoot?.querySelector<HTMLInputElement>('input')?.value).to.equal('2');
                },
              },
              datalistOptionEdits: {
                description: 'keeps datalist option labels and disabled state in sync with slotted options',
                test: async () => {
                  const el = this.component;
                  el.innerHTML = '<option value="one">One</option>';
                  await aTimeout(0);
                  await elementUpdated(el);
                  const option = el.querySelector<HTMLOptionElement>('option')!;
                  option.disabled = true;
                  option.label = 'First option';
                  await waitUntil(() => {
                    const rendered = el.shadowRoot?.querySelector<HTMLOptionElement>('datalist option');
                    return rendered?.disabled === true && rendered.label === 'First option';
                  });
                  option.remove();
                  await waitUntil(() => !el.shadowRoot?.querySelector('datalist'));
                },
              },
              autocomplete: {
                description: 'forwards autocomplete to password inputs',
                test: async () => {
                  this.component.type = 'password';
                  this.component.autocomplete = 'current-password';
                  await elementUpdated(this.component);
                  expect(this.component.shadowRoot?.querySelector('input')).attribute(
                    'autocomplete',
                    'current-password'
                  );
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
              clearButtonKeyboard: {
                description: 'allows the clear button to be activated from the keyboard',
                test: async () => {
                  const el = this.component;
                  el.withClear = true;
                  el.value = 'clear me';
                  await elementUpdated(el);
                  const button = el.shadowRoot?.querySelector<HTMLButtonElement>('.form-control-clear');
                  expect(button?.tabIndex).not.to.equal(-1);
                  button?.focus();
                  await sendKeys({ press: 'Enter' });
                  await elementUpdated(el);
                  expect(el.value).to.equal('');
                },
              },
              clearedValueNotSubmitted: {
                description: 'does not submit a value after it is cleared',
                test: async () => {
                  const el = this.component;
                  el.name = 'field';
                  el.value = 'abc';
                  const form = await fixture<HTMLFormElement>(html`<form>${el}</form>`);
                  await elementUpdated(el);
                  expect(new FormData(form).get('field')).to.equal('abc');

                  el.value = '';
                  await elementUpdated(el);
                  expect(new FormData(form).has('field')).to.be.false;
                },
              },
              clearButtonRemovesSubmittedValue: {
                description: 'removes the submitted value when the clear button is activated',
                test: async () => {
                  const el = this.component;
                  el.withClear = true;
                  el.name = 'field';
                  el.value = 'abc';
                  const form = await fixture<HTMLFormElement>(html`<form>${el}</form>`);
                  await elementUpdated(el);
                  expect(new FormData(form).get('field')).to.equal('abc');

                  el.shadowRoot?.querySelector<HTMLButtonElement>('.form-control-clear')?.click();
                  await elementUpdated(el);
                  expect(new FormData(form).has('field')).to.be.false;
                },
              },
              movingPreservesResetValue: {
                description: 'preserves the original reset value when moved within the document',
                test: async () => {
                  const el = this.component;
                  const form = await fixture<HTMLFormElement>(html`<form>${el}</form>`);
                  const staging = document.createElement('div');
                  el.value = 'changed';
                  await elementUpdated(el);
                  staging.append(el);
                  form.append(el);
                  await elementUpdated(el);

                  form.reset();
                  await elementUpdated(el);
                  expect(el.value).to.equal('test');
                },
                config: { value: 'test' },
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
              passwordToggleKeyboard: {
                description: 'allows the password visibility button to be activated from the keyboard',
                test: async () => {
                  const el = this.component;
                  el.type = 'password';
                  el.passwordToggle = true;
                  await elementUpdated(el);
                  const toggle = el.shadowRoot?.querySelector<HTMLButtonElement>('.form-control-password-toggle');
                  expect(toggle?.getAttribute('aria-pressed')).to.equal('false');
                  toggle?.focus();
                  await sendKeys({ press: 'Enter' });
                  await elementUpdated(el);
                  expect(el.passwordVisible).to.be.true;
                  expect(toggle?.getAttribute('aria-pressed')).to.equal('true');
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
                  expect(getInput()?.getAttribute('aria-describedby')).to.equal('error-text');

                  this.component.errorMessage = '';
                  await elementUpdated(this.component);
                  expect(getInput()?.getAttribute('aria-invalid')).to.equal('false');
                  expect(getInput()?.getAttribute('aria-errormessage')).to.be.null;
                },
              },
              pristineRequired: {
                description: 'does not announce a pristine required input as invalid until it is reported',
                test: async () => {
                  const el = this.component;
                  const getInput = () => el.shadowRoot?.querySelector('input');
                  el.required = true;
                  await elementUpdated(el);
                  expect(el.checkValidity()).to.be.false;
                  expect(getInput()?.getAttribute('aria-invalid')).to.equal('false');
                  expect(getInput()?.getAttribute('aria-describedby') ?? '').to.not.contain('error-text');

                  el.reportValidity();
                  await elementUpdated(el);
                  expect(getInput()?.getAttribute('aria-invalid')).to.equal('true');
                  expect(getInput()?.getAttribute('aria-describedby')).to.contain('error-text');
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
              requiredAddedAfterMount: {
                description: 'revalidates when required is enabled after mounting',
                test: async () => {
                  const el = this.component;
                  el.value = '';
                  await elementUpdated(el);
                  expect(el.checkValidity()).to.be.true;

                  el.required = true;
                  await elementUpdated(el);
                  await Promise.resolve();
                  expect(el.checkValidity()).to.be.false;
                  expect(el.invalid).to.be.true;
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
              enterKeySubmits: {
                description: 'submits a valid form on Enter using its enabled default submitter',
                test: async () => {
                  const tag = project.scope.tagName('input');
                  const form = await fixture<HTMLFormElement>(html`
                    <form>
                      <${unsafeStatic(tag)} value="ready"></${unsafeStatic(tag)}>
                      <button type="submit">Submit</button>
                    </form>
                  `);
                  const submitSpy = sinon.spy((event: Event) => event.preventDefault());
                  form.addEventListener('submit', submitSpy);
                  const innerInput = form.querySelector(tag)?.shadowRoot?.querySelector('input') as HTMLInputElement;
                  innerInput.focus();
                  await sendKeys({ press: 'Enter' });
                  await aTimeout(20);
                  expect(submitSpy).to.have.been.calledOnce;
                },
              },
              enterKeyImplicitSubmission: {
                description: 'implicitly submits on Enter when the only blocking field is an untyped input',
                test: async () => {
                  const tag = project.scope.tagName('input');
                  // A lone untyped input defaults to `text`; textareas never block implicit submission.
                  for (const template of [
                    html`<form><${unsafeStatic(tag)} value="ready"></${unsafeStatic(tag)}></form>`,
                    html`<form><${unsafeStatic(tag)} type="text" value="ready"></${unsafeStatic(tag)}><textarea></textarea></form>`,
                  ]) {
                    const form = await fixture<HTMLFormElement>(template);
                    const submitSpy = sinon.spy((event: Event) => event.preventDefault());
                    form.addEventListener('submit', submitSpy);
                    const innerInput = form.querySelector(tag)?.shadowRoot?.querySelector('input') as HTMLInputElement;
                    innerInput.focus();
                    await sendKeys({ press: 'Enter' });
                    await aTimeout(20);
                    expect(submitSpy).to.have.been.calledOnce;
                  }
                },
              },
              readonlyRangeTab: {
                description: 'allows Tab to leave a readonly range input',
                test: async () => {
                  const el = this.component;
                  el.type = 'range';
                  el.readonly = true;
                  const container = await fixture(html`<div>${el}<button id="next">Next</button></div>`);
                  await elementUpdated(el);
                  el.focus();
                  await sendKeys({ press: 'Tab' });
                  expect(document.activeElement).to.equal(container.querySelector('#next'));
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
                  expect(el.checkValidity()).to.be.false;
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
