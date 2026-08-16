import { aTimeout, elementUpdated, expect, fixture, html, oneEvent, waitUntil } from '@open-wc/testing';
import sinon from 'sinon';
import { sendKeys } from '@web/test-runner-commands';
import { project } from '../../utilities/index.js';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import { CoreButton } from '../button/index.js';
import type { CoreRadioGroup } from './index.js';
import type { CoreRadio } from '../radio/index.js';

export class CoreRadioGroupTests<T extends CoreRadioGroup> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.tests = {
      ...this.tests, // adds inherited tests
      ...{
        radioGroup: {
          description: 'radioGroup',
          tests: {
            interactions: {
              description: 'interactions',
              tests: {
                focus: {
                  description: 'should have first radio be focusable when no value is selected',
                  test: async () => {
                    const el = this.component;
                    const radios = [...el.querySelectorAll(project.scope.tagName('radio'))] as CoreRadio[];
                    await expect(radios[0].tabIndex).to.equal(0);
                    await expect(radios[1].tabIndex).to.equal(-1);
                    await expect(radios[2].tabIndex).to.equal(-1);
                  },
                },
                focusSelectedRadio: {
                  description: 'moves focus to the selected radio when the group is focused',
                  test: async () => {
                    const el = this.component;
                    const radios = [...el.querySelectorAll(project.scope.tagName('radio'))] as CoreRadio[];
                    el.value = '2';
                    await elementUpdated(el);
                    el.focus();
                    await elementUpdated(el);
                    expect(document.activeElement).to.equal(radios[1]);
                  },
                },
                disabledGroupKeepsChecked: {
                  description: 'keeps the selected radio checked when the group is disabled and re-enabled',
                  test: async () => {
                    const el = this.component;
                    const radios = [...el.querySelectorAll(project.scope.tagName('radio'))] as CoreRadio[];
                    el.value = '2';
                    await elementUpdated(el);
                    expect(radios[1].checked).to.be.true;

                    el.disabled = true;
                    await elementUpdated(el);
                    await aTimeout(100);
                    expect(radios[1].checked).to.be.true;
                    expect(radios[1].hasAttribute('disabled')).to.be.false;
                    expect(radios[1].getAttribute('aria-disabled')).to.equal('true');
                    expect(radios[1].hasAttribute('force-disabled')).to.be.true;
                    expect(radios[1].tabIndex).to.equal(-1);

                    el.disabled = false;
                    await elementUpdated(el);
                    await aTimeout(100);
                    expect(radios[1].checked).to.be.true;
                    expect(radios[1].hasAttribute('disabled')).to.be.false;
                    expect(radios[1].getAttribute('aria-disabled')).to.equal('false');
                    expect(radios[1].hasAttribute('force-disabled')).to.be.false;
                    expect(radios[1].tabIndex).to.equal(0);
                  },
                },
                independentlyDisabledRadioStaysDisabled: {
                  description: 'keeps an independently disabled radio disabled when the group is re-enabled',
                  test: async () => {
                    const el = this.component;
                    const radios = [...el.querySelectorAll(project.scope.tagName('radio'))] as CoreRadio[];
                    radios[0].disabled = true;
                    await elementUpdated(radios[0]);

                    el.disabled = true;
                    await elementUpdated(el);
                    await aTimeout(100);
                    expect(radios[0].disabled).to.be.true;

                    el.disabled = false;
                    await elementUpdated(el);
                    await aTimeout(100);
                    expect(radios[0].hasAttribute('disabled')).to.be.true;
                    expect(radios[0].tabIndex).to.equal(-1);
                  },
                },
                ariaOrientation: {
                  description: 'reflects the layout through aria-orientation',
                  test: async () => {
                    const el = this.component;
                    el.layout = 'vertical';
                    await elementUpdated(el);
                    expect(el.shadowRoot?.querySelector('fieldset')?.getAttribute('aria-orientation')).to.equal(
                      'vertical'
                    );
                    el.layout = 'horizontal';
                    await elementUpdated(el);
                    expect(el.shadowRoot?.querySelector('fieldset')?.getAttribute('aria-orientation')).to.equal(
                      'horizontal'
                    );
                  },
                },
              },
            },
            validation: {
              description: 'validation',
              tests: {
                requiredChecked: {
                  description: 'should be valid when required and one radio is checked',
                  test: async () => {
                    const el = this.component;
                    el.required = true;
                    el.value = '1';
                    await elementUpdated(el);
                    expect(el.reportValidity()).to.be.true;
                  },
                },
                requiredNoChecked: {
                  description: 'should be invalid when required and no radio is checked',
                  test: async () => {
                    const el = this.component;
                    el.required = true;
                    await elementUpdated(el);
                    expect(el.reportValidity()).to.be.false;
                  },
                },
                customValidity: {
                  description: 'should be invalid when custom validity is set',
                  test: async () => {
                    const el = this.component;
                    el.setCustomValidity('Error');
                    expect(el.reportValidity()).to.be.false;
                  },
                },
                setCustomValidity: {
                  description: 'should show a constraint validation error when setCustomValidity() is called',
                  test: async () => {
                    const form = document.createElement('form');
                    const button = document.createElement(project.scope.tagName('button')) as CoreButton;
                    button.type = 'submit';
                    button.innerHTML = 'Submit';
                    form.appendChild(button);
                    form.appendChild(this.component);

                    const submitHandler = sinon.spy((event: SubmitEvent) => event.preventDefault());

                    // Submitting the form after setting custom validity should not trigger the handler
                    this.component.setCustomValidity('Invalid selection');
                    form.addEventListener('submit', submitHandler);
                    button.click();

                    await aTimeout(100);

                    expect(submitHandler).to.not.have.been.called;
                  },
                },

                setCustomValidityMessage: {
                  description:
                    'Should show custom validation message when `setCustomValidity("Custom validation message")` is called',
                  test: async () => {
                    const el = this.component;
                    el.required = true;

                    el.setCustomValidity('Custom validation message');

                    await elementUpdated(el);

                    const errorMessage = el.shadowRoot?.querySelector('.form-control-error-text');

                    expect(el.invalid).to.be.true;
                    expect(errorMessage?.textContent?.trim()).to.equal('Custom validation message');
                  },
                },

                setCustomValidityEmptyMessage: {
                  description:
                    'Should hide custom validation message when `setCustomValidity("")` is called after being set',
                  test: async () => {
                    const el = this.component;
                    el.required = true;
                    el.setCustomValidity('Custom validation message');
                    await elementUpdated(el);

                    el.setCustomValidity('');
                    await elementUpdated(el);

                    const errorMessage = el.shadowRoot?.querySelector('.form-control-error-text') as HTMLElement;

                    expect(el.invalid).to.be.false;
                    expect(errorMessage?.textContent?.trim()).to.equal('');
                  },
                },

                errorMessageEmpty: {
                  description: 'Should show custom validation message when `errorMessage` is set to non-empty string',
                  test: async () => {
                    const el = this.component;
                    el.required = true;
                    el.errorMessage = 'Custom validation message';
                    await elementUpdated(el);
                    const errorMessage = el.shadowRoot?.querySelector('.form-control-error-text');

                    expect(el.invalid).to.be.true;
                    expect(errorMessage).to.be.visible;
                    expect(errorMessage?.textContent?.trim()).to.equal('Custom validation message');
                  },
                },

                setCustomValidityEmptyMessageHide: {
                  description: 'Should hide custom validation message when `errorMessage` is set to an empty string',
                  test: async () => {
                    const el = this.component;
                    el.required = true;

                    el.errorMessage = 'Custom validation message';

                    await elementUpdated(el);

                    el.errorMessage = '';

                    await elementUpdated(el);

                    expect(el.invalid).to.be.false;
                    expect(el.shadowRoot?.querySelector('.form-control-error-text')?.textContent?.trim()).to.equal('');
                  },
                },

                reportValidity: {
                  description: 'should show error message and set aria-errormessage when `reportValidity()` is called',
                  test: async () => {
                    const el = this.component;
                    el.required = true;
                    await elementUpdated(el);

                    expect(el.shadowRoot?.querySelector('fieldset')?.hasAttribute('aria-errormessage')).to.be.false;
                    expect(el.shadowRoot?.querySelector('.form-control-error-text')?.textContent?.trim()).to.equal('');

                    const reportValidity = el.reportValidity();
                    await elementUpdated(el);

                    expect(reportValidity).to.be.false;
                    expect(el.invalid).to.be.true;
                    expect(el.shadowRoot?.querySelector('.form-control-error-text')?.textContent?.trim()).to.not.equal(
                      ''
                    );
                    expect(el.shadowRoot?.querySelector('fieldset')?.getAttribute('aria-errormessage')).to.equal(
                      'error-text'
                    );

                    el.value = '1';
                    await elementUpdated(el);
                    el.reportValidity();
                    await elementUpdated(el);

                    expect(el.shadowRoot?.querySelector('fieldset')?.hasAttribute('aria-errormessage')).to.be.false;
                    expect(el.invalid).to.be.false;
                  },
                },
              },
            },
            events: {
              description: 'change event',
              tests: {
                click: {
                  description: 'should fire change when clicked',
                  test: async () => {
                    const radioGroup = this.component;
                    const handler = sinon.spy();
                    radioGroup.addEventListener('change', handler);
                    const radio = radioGroup.querySelector<CoreRadio>('#radio1')!;
                    radio.click();
                    await elementUpdated(radio);
                    await elementUpdated(radioGroup);
                    expect(handler).to.have.been.calledOnce;
                    expect(radioGroup.value).to.equal('1');
                  },
                },
                clickInputEvent: {
                  description: 'should fire input when a radio is clicked',
                  test: async () => {
                    const el = this.component;
                    const inputHandler = sinon.spy();
                    const changeHandler = sinon.spy();
                    el.addEventListener('input', inputHandler);
                    el.addEventListener('change', changeHandler);
                    const radio = el.querySelector<CoreRadio>('#radio1')!;
                    radio.click();
                    await elementUpdated(radio);
                    await elementUpdated(el);
                    expect(inputHandler).to.have.been.calledOnce;
                    expect(changeHandler).to.have.been.calledOnce;
                  },
                },
                keyboard_arrow_keys: {
                  description: 'should fire change when toggled via keyboard - arrow key',
                  test: async () => {
                    const el = this.component;
                    const spy = sinon.spy();
                    document.addEventListener('change', spy);
                    expect(el.value).to.equal('');
                    await elementUpdated(el);
                    const radios = [...el.querySelectorAll(project.scope.tagName('radio'))] as CoreRadio[];
                    radios[0].click();
                    await elementUpdated(el);
                    await sendKeys({ press: 'ArrowRight' });
                    await aTimeout(100);
                    expect(spy).to.have.been.calledOnce;
                  },
                },
                keyboard_space: {
                  description: 'should fire change when toggled via keyboard - space',
                  test: async () => {
                    const el = this.component;
                    const spy = sinon.spy();
                    document.addEventListener('change', spy);
                    expect(el.value).to.equal('');
                    await elementUpdated(el);
                    const radios = [...el.querySelectorAll(project.scope.tagName('radio'))] as CoreRadio[];
                    radios[0].focus();
                    await elementUpdated(el);
                    setTimeout(() => sendKeys({ press: ' ' }));
                    const event = (await oneEvent(el, 'change')) as CustomEvent;
                    expect(event.target).to.equal(el);
                    expect(el.value).to.equal('1');
                  },
                },
                formValue: {
                  description: 'submits the selected radio value in a form',
                  test: async () => {
                    const el = this.component;
                    el.value = '2';
                    await elementUpdated(el);
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
                    expect(formData!.get('radio-group')).to.equal('2');
                  },
                },
                formValueWhenNoneSelected: {
                  description: 'does not submit a value when no radio is selected',
                  test: async () => {
                    const el = this.component;
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
                    expect(formData!.get('radio-group')).to.be.null;
                  },
                },
              },
            },
          },
        },
      },
    };
  }
}
