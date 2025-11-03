import { aTimeout, elementUpdated, expect, fixture, oneEvent, waitUntil } from '@open-wc/testing';
import { html, unsafeStatic } from 'lit/static-html.js';
import { sendKeys } from '@web/test-runner-commands';
import sinon from 'sinon';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import '../button/index.js';
import './index.js';
import { project } from '../../utilities/index.js';
import type { CoreCheckbox } from './index.js';

export class CoreCheckboxTests<T extends CoreCheckbox> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      checkbox: {
        description: 'checkbox',
        tests: {
          // property tests
          properties: {
            description: 'properties',
            tests: {
              hideLabel: {
                description: 'should hide the label with the hide-label attribute',
                test: async () => {
                  const el = this.component;
                  expect(el.shadowRoot?.querySelector('.label')).to.not.have.class('visually-hidden');
                  el.hideLabel = true;
                  await elementUpdated(el);
                  expect(el.shadowRoot?.querySelector('.label')).to.have.class('visually-hidden');
                },
              },
              childrenInSlot: {
                description: 'places children in the default slot',
                test: async () => {
                  const el = this.component;
                  const defaultSlot = el.shadowRoot?.querySelector('slot:not(name)') as HTMLSlotElement;
                  expect(defaultSlot).to.not.be.null;
                },
              },
              confirmDisabled: {
                description: 'should not react to user interaction with disabled property',
                test: async () => {
                  const el = this.component;
                  el.disabled = true;
                  await el.updateComplete;
                  const checkbox = el.shadowRoot!.querySelector('input')!;
                  expect(checkbox.disabled).to.be.true;
                },
              },
              defaultValid: {
                description: 'should be valid by default',
                test: async () => {
                  const el = this.component;
                  expect(el.invalid).to.be.false;
                },
              },
            },
          },
          // event tests
          events: {
            description: 'events',
            tests: {
              emitChange: {
                description: 'emits an event "change" when clicked',
                test: async () => {
                  const el = this.component;
                  setTimeout(() => el.shadowRoot!.querySelector('input')!.click());
                  const event = (await oneEvent(el, 'change')) as CustomEvent;
                  expect(event.target).to.equal(el);
                  expect(el.checked).to.be.true;
                },
              },
              noEmitWhenJSCheck: {
                description: 'should not fire change when checked is set by javascript',
                test: async () => {
                  const el = this.component;
                  el.addEventListener('change', () => expect.fail('event fired'));
                  el.checked = true;
                  await el.updateComplete;
                  el.checked = false;
                  await el.updateComplete;
                },
              },
              innerInputClick: {
                description: 'should click the inner input',
                test: async () => {
                  const el = this.component;
                  const checkbox = el.shadowRoot!.querySelector('input')!;
                  const clickSpy = sinon.spy();
                  el.addEventListener('click', clickSpy, { once: true });
                  checkbox.click();
                  await el.updateComplete;
                  expect(clickSpy.called).to.equal(true);
                  expect(el.checked).to.equal(true);
                },
              },
              click: {
                description: 'should click when using the click method',
                test: async () => {
                  const el = this.component;
                  const clickSpy = sinon.spy();
                  el.addEventListener('click', clickSpy, { once: true });
                  el.click();
                  await el.updateComplete;
                  expect(clickSpy.called).to.equal(true);
                  expect(el.checked).to.equal(true);
                },
              },
              indeterminateIcon: {
                description: 'should render indeterminate icon until checked',
                test: async () => {
                  const el = this.component;
                  el.indeterminate = true;
                  await el.updateComplete;

                  const checkbox = el.shadowRoot!.querySelector('input')!;
                  let indeterminateIcon = el.shadowRoot!.querySelector('[name="square"]')!;
                  expect(indeterminateIcon).not.to.be.null;
                  checkbox.click();
                  await el.updateComplete;
                  indeterminateIcon = el.shadowRoot!.querySelector('[name="square"]')!;
                  expect(indeterminateIcon).to.be.null;
                },
              },
              correctValueOutput: {
                description: 'when submitting a form, it should submit the correct value when a value is provided',
                test: async () => {
                  const el = this.component;
                  el.name = 'a';
                  el.value = '1';
                  const form = await fixture<HTMLFormElement>(html`
                    <form>
                      ${el}
                      <button type="submit">Submit</button>
                    </form>
                  `);
                  let formData: FormData;
                  const button = form.querySelector('button');
                  const submitHandler = sinon.spy(evt => {
                    formData = new FormData(form);
                    evt.preventDefault();
                    evt.stopImmediatePropagation();
                  });
                  form.addEventListener('click', submitHandler);
                  button?.click();
                  await waitUntil(() => submitHandler.calledOnce);
                  expect(formData!.get('a')).to.equal('1');
                },
              },
              defaultOnEmit: {
                description: 'when submitting a form, should emit "on" when no value is provided',
                test: async () => {
                  const el = this.component;
                  el.checked = true;
                  el.name = 'checkbox';
                  const form = await fixture<HTMLFormElement>(html`
                    <form>
                      ${el}
                      <button type="submit">Submit</button>
                    </form>
                  `);
                  let formData: FormData;
                  const button = form.querySelector('button');
                  const submitHandler = sinon.spy(evt => {
                    formData = new FormData(form);
                    evt.preventDefault();
                    evt.stopImmediatePropagation();
                  });
                  form.addEventListener('click', submitHandler);
                  button?.click();
                  expect(formData!.get('checkbox')).to.equal('on');
                },
              },
              constraintValidationError: {
                description:
                  'when submitting a form should show a constraint validation error when setCustomValidity() is called',
                test: async () => {
                  // Using standard HTML button, form is not checking validity; form is effectively always returning valid
                  // ch-button vs button
                  const buttonTag = project.scope.tagName('button');
                  const el = this.component;
                  el.value = '1';
                  el.checked = true;
                  el.id = 'formCheckbox';
                  await elementUpdated(el);

                  const form = await fixture<HTMLFormElement>(html`
                    <form>
                      ${el}
                      <${unsafeStatic(buttonTag)} type="submit">Submit</${unsafeStatic(buttonTag)}>
                    </form>
                  `);

                  const button = form.querySelector('button');
                  const checkbox = form.querySelector('#formCheckbox') as CoreCheckbox;
                  const submitHandler = sinon.spy((event: SubmitEvent) => event.preventDefault());

                  checkbox.setCustomValidity('Invalid selection');
                  await elementUpdated(checkbox);

                  form.addEventListener('submit', submitHandler);
                  button?.click();
                  await aTimeout(100);
                  expect(submitHandler).to.not.have.been.called;
                },
              },
              customValidationMessage: {
                description:
                  'when submitting a form it should show custom validation message when `setCustomValidity("Custom validation message")` is called',
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
              clearCustomValidationMessage: {
                description:
                  'when submitting a form it should hide custom validation message when `setCustomValidity("")` is called after being set',
                test: async () => {
                  const el = this.component;
                  el.setCustomValidity('Custom validation message');
                  await elementUpdated(el);
                  el.setCustomValidity('');
                  await elementUpdated(el);
                  const errorMessage = el.shadowRoot?.querySelector('.form-control-error-text') as HTMLElement;
                  expect(el.invalid).to.be.false;
                  expect(errorMessage?.textContent?.trim()).to.equal('');
                },
              },
              showValidationMessageOnBlur: {
                description: 'when submitting a form it should show validation message on blur',
                test: async () => {
                  const el = this.component;
                  el.required = true;
                  el.setCustomValidity('This field is required');
                  el.focus();
                  await elementUpdated(el);
                  el.blur();
                  await elementUpdated(el);
                  const formControl = el.shadowRoot?.querySelector('.form-control');
                  expect(formControl?.classList.contains('form-control-has-error')).to.be.true;
                },
              },
            },
          },
          // keyboard tests
          keyboard: {
            description: 'keyboard',
            tests: {
              emitChangeKeyboard: {
                description: 'should fire change when toggled via keyboard',
                test: async () => {
                  const el = this.component;
                  const input = el.shadowRoot!.querySelector('input')!;
                  input.focus();
                  setTimeout(() => sendKeys({ press: ' ' }));
                  const event = (await oneEvent(el, 'change')) as CustomEvent;
                  expect(event.target).to.equal(el);
                  expect(el.checked).to.be.true;
                },
              },
            },
          },
        },
      },
    });
  }
}
