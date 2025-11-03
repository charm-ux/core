import { aTimeout, elementUpdated, expect, oneEvent } from '@open-wc/testing';
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
                      'error-message'
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
              },
            },
          },
        },
      },
    };
  }
}
