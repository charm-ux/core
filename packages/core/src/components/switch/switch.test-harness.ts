import { elementUpdated, expect, fixture, html, oneEvent, waitUntil } from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import sinon from 'sinon';
import { isSafari } from '@microsoft/applicationinsights-core-js';
import { CoreFormControlTests } from '../../base/form-control-element/charm-form-control-element.test-harness.js';
import type { CoreSwitch } from './index.js';

export class CoreSwitchTests<T extends CoreSwitch> extends CoreFormControlTests<T> {
  public constructor() {
    super();

    this.updateTests({
      formControl: {
        description: 'form-control',
        tests: {
          properties: {
            description: 'from control properties',
            tests: {
              placeholder: {
                description: 'attaches the placeholder attribute to the input',
                test: async () => {},
              },
            },
          },

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
                  if (!isSafari) {
                    expect(inputHandler).to.have.been.callCount(1);
                  }
                },
              },
              formReset: {
                description: 'resets the switch to its initial state when the form is reset',
                test: async () => {
                  const el = this.component;
                  const form = await fixture<HTMLFormElement>(html`<form>${el}</form>`);
                  el.checked = true;
                  await elementUpdated(el);
                  expect(el.checked).to.be.true;
                  form.reset();
                  await elementUpdated(el);
                  expect(el.checked).to.be.false;
                },
              },
            },
          },
        },
      },
      switch: {
        description: 'switch',
        tests: {
          // attribute and property tests
          properties: {
            description: 'properties',
            tests: {
              accessibleChecked: {
                description: 'should be accessible when checked',
                test: async () => {
                  const el = this.component;
                  el.checked = true;
                  await el.updateComplete;
                  await expect(el).to.be.accessible();
                },
              },
              accessibleDisabled: {
                description: 'should be accessible when disabled',
                test: async () => {
                  const el = this.component;
                  el.disabled = true;
                  await el.updateComplete;
                  await expect(el).to.be.accessible();
                },
              },
              disabled: {
                description: 'should be disabled with the disabled attribute',
                test: async () => {
                  const el = this.component;
                  el.disabled = true;
                  await el.updateComplete;
                  const input = el.shadowRoot!.querySelector<HTMLInputElement>('input')!;
                  expect(input.disabled).to.be.true;
                  expect(input.readOnly).to.be.true;
                },
              },
              describedBy: {
                description: 'references the help text via aria-describedby when help text is present',
                test: async () => {
                  const el = this.component;
                  el.helpText = 'Helper';
                  await elementUpdated(el);
                  expect(el.shadowRoot!.querySelector('input')!.getAttribute('aria-describedby')).to.equal('help-text');
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
            tests: {
              checkedMessage: {
                description: 'checked',
                test: async () => {
                  const el = this.component;
                  el.innerHTML = '<span slot="checked-message">checked message</span>';
                  el.checked = false;
                  await elementUpdated(el);
                  const checkedSlot = el.shadowRoot?.querySelector('slot[name="checked-message"]') as HTMLSlotElement;
                  const [span] = checkedSlot.assignedNodes();
                  expect(span?.textContent).to.equal('checked message');
                  const checkedContainer = el.shadowRoot?.querySelector('.switch-checked-message');
                  expect(window.getComputedStyle(checkedContainer!).getPropertyValue('display')).to.equal('none');
                },
              },
              uncheckedMessage: {
                description: 'unchecked',
                test: async () => {
                  const el = this.component;
                  el.innerHTML = '<span slot="unchecked-message">unchecked message</span>';
                  el.checked = true;
                  await elementUpdated(el);
                  const uncheckedSlot = el.shadowRoot?.querySelector(
                    'slot[name="unchecked-message"]'
                  ) as HTMLSlotElement;
                  const [span] = uncheckedSlot.assignedNodes();
                  expect(span?.textContent).to.equal('unchecked message');
                  const uncheckedContainer = el.shadowRoot?.querySelector('.switch-unchecked-message');
                  expect(window.getComputedStyle(uncheckedContainer!).getPropertyValue('display')).to.equal('none');
                },
              },
            },
          },

          // event tests
          events: {
            description: 'change event',
            tests: {
              click: {
                description: 'should fire change when clicked',
                test: async () => {
                  const el = this.component;
                  setTimeout(() => el.shadowRoot!.querySelector('input')!.click());
                  const event = (await oneEvent(el, 'change')) as CustomEvent;
                  expect(event.target).to.equal(el);
                  expect(el.checked).to.be.true;
                },
              },
              spaceBar: {
                description: 'should fire change when toggled with spacebar',
                test: async () => {
                  const el = this.component;
                  el.focus();
                  setTimeout(() => sendKeys({ press: ' ' }));
                  const event = (await oneEvent(el, 'change')) as CustomEvent;
                  expect(event.target).to.equal(el);
                  expect(el.checked).to.be.true;
                },
              },
              rightArrow: {
                description: 'should fire change when toggled with the right arrow',
                test: async () => {
                  const el = this.component;
                  el.focus();
                  setTimeout(() => sendKeys({ press: 'ArrowRight' }));
                  const event = (await oneEvent(el, 'change')) as CustomEvent;
                  expect(event.target).to.equal(el);
                  expect(el.checked).to.be.true;
                },
              },
              leftArrow: {
                description: 'should fire change when toggled with the left arrow',
                test: async () => {
                  const el = this.component;
                  el.focus();
                  setTimeout(() => sendKeys({ press: 'ArrowLeft' }));
                  const event = (await oneEvent(el, 'change')) as CustomEvent;
                  expect(event.target).to.equal(el);
                  expect(el.checked).to.be.false;
                },
              },
              rightArrowInput: {
                description: 'should fire input when toggled with the right arrow',
                test: async () => {
                  const el = this.component;
                  el.focus();
                  setTimeout(() => sendKeys({ press: 'ArrowRight' }));
                  const event = (await oneEvent(el, 'input')) as CustomEvent;
                  expect(event.target).to.equal(el);
                  expect(el.checked).to.be.true;
                },
              },
              rightArrowRtl: {
                description: 'should uncheck with the right arrow in RTL',
                test: async () => {
                  const el = this.component;
                  el.dir = 'rtl';
                  el.checked = true;
                  await elementUpdated(el);
                  el.focus();
                  setTimeout(() => sendKeys({ press: 'ArrowRight' }));
                  const event = (await oneEvent(el, 'change')) as CustomEvent;
                  expect(event.target).to.equal(el);
                  expect(el.checked).to.be.false;
                },
              },
              leftArrowRtl: {
                description: 'should check with the left arrow in RTL',
                test: async () => {
                  const el = this.component;
                  el.dir = 'rtl';
                  await elementUpdated(el);
                  el.focus();
                  setTimeout(() => sendKeys({ press: 'ArrowLeft' }));
                  const event = (await oneEvent(el, 'change')) as CustomEvent;
                  expect(event.target).to.equal(el);
                  expect(el.checked).to.be.true;
                },
              },
              rtlThumbMirror: {
                description: 'mirrors the thumb travel direction in RTL',
                test: async () => {
                  const el = this.component;
                  el.dir = 'rtl';
                  el.style.setProperty('--charm-switch-thumb-transform', '10px');
                  el.style.setProperty('--charm-switch-thumb-transition', 'none');
                  await elementUpdated(el);
                  const thumb = el.shadowRoot?.querySelector('.switch-thumb') as HTMLElement;
                  const rtlUnchecked = getComputedStyle(thumb).transform;
                  el.checked = true;
                  await elementUpdated(el);
                  const rtlChecked = getComputedStyle(thumb).transform;
                  el.checked = false;
                  el.dir = 'ltr';
                  await elementUpdated(el);
                  const ltrUnchecked = getComputedStyle(thumb).transform;
                  el.checked = true;
                  await elementUpdated(el);
                  const ltrChecked = getComputedStyle(thumb).transform;
                  expect(rtlUnchecked).to.equal(ltrChecked);
                  expect(rtlChecked).to.equal(ltrUnchecked);
                  expect(rtlUnchecked).to.not.equal(rtlChecked);
                },
              },
              notFire: {
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
              submitFormValue: {
                description: 'submits the switch value when checked in a form',
                test: async () => {
                  const el = this.component;
                  el.name = 'switch';
                  el.value = 'yes';
                  el.checked = true;
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
                  expect(formData!.get('switch')).to.equal('yes');
                },
              },
              submitDefaultOn: {
                description: 'submits "on" when checked and no value is provided',
                test: async () => {
                  const el = this.component;
                  el.name = 'switch';
                  el.checked = true;
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
                  expect(formData!.get('switch')).to.equal('on');
                },
              },
              submitUnchecked: {
                description: 'does not submit a value when unchecked',
                test: async () => {
                  const el = this.component;
                  el.name = 'switch';
                  el.value = 'yes';
                  el.checked = false;
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
                  expect(formData!.get('switch')).to.be.null;
                },
              },
            },
          },

          // error message tests
          formControl: {
            description: 'error message',
            tests: {
              setCustomValidityNonEmpty: {
                description:
                  'Should show custom validation message when `setCustomValidity("Custom validation message")` is called',
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
              setCustomValidityEmpty: {
                description:
                  'Should hide custom validation message when `setCustomValidity("")` is called after being set',
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
              errorMessageNonEmpty: {
                description: 'Should show custom validation message when `errorMessage` is set to non-empty string',
                test: async () => {
                  const el = this.component;

                  const errorMessage = el.shadowRoot?.querySelector('.form-control-error-text');

                  el.errorMessage = 'Custom validation message';
                  await elementUpdated(el);

                  expect(el.invalid).to.be.true;
                  expect(el.checkValidity()).to.be.false;
                  expect(errorMessage).to.be.visible;
                  expect(errorMessage?.textContent?.trim()).to.equal('Custom validation message');
                },
              },

              errorMessageEmpty: {
                description: 'Should hide custom validation message when `errorMessage` is set to non-empty string',
                test: async () => {
                  const el = this.component;

                  const errorMessage = el.shadowRoot?.querySelector('.form-control-error-text');

                  el.errorMessage = 'Custom validation message';
                  await elementUpdated(el);

                  el.errorMessage = '';
                  await elementUpdated(el);

                  expect(el.invalid).to.be.false;
                  expect(el.checkValidity()).to.be.true;
                  expect(errorMessage?.textContent?.trim()).to.equal('');
                },
              },

              reportValidity: {
                description: 'should show error message when `reportValidity()` is called',
                test: async () => {
                  const el = this.component;

                  el.required = true;
                  await elementUpdated(el);
                  const errorMessage = el.shadowRoot?.querySelector('.form-control-error-text') as HTMLElement;

                  el.required = true;
                  await elementUpdated(el);
                  expect(getComputedStyle(errorMessage).display).to.equal('none');

                  const reportValidity = el.reportValidity();
                  await elementUpdated(el);

                  expect(reportValidity).to.be.false;
                  expect(el.invalid).to.be.true;
                  expect(getComputedStyle(errorMessage).display).to.not.equal('none');
                },
              },
            },
          },
          validity: {
            description: 'form control validity',
            tests: {
              default: {
                description: 'should be valid by default',
                test: async () => {
                  const el = this.component;
                  el.required = true;
                  await elementUpdated(el);
                  expect(el.invalid).to.be.false;
                },
              },
              disabled: {
                description: 'should be valid when `disabled` property is set',
                test: async () => {
                  const el = this.component;
                  el.disabled = true;
                  await elementUpdated(el);
                  expect(el.invalid).to.be.false;
                },
              },
              required: {
                description: 'should be invalid by default when `required`',
                test: async () => {
                  const el = this.component;
                  el.required = true;
                  await elementUpdated(el);
                  expect(el.invalid).to.be.false;
                },
              },
              requiredAndBlurred: {
                description: 'should show error message when `required` and element is blurred',
                test: async () => {
                  const el = this.component;
                  el.required = true;
                  await elementUpdated(el);
                  el.focus();
                  el.blur();
                  await elementUpdated(el);
                  const errorMessage = el.shadowRoot?.querySelector('.form-control-error-text');
                  expect(errorMessage).to.be.visible;
                },
              },
              invalidRequired: {
                description: 'should have `aria-invalid` set to `false` when valid',
                test: async () => {
                  const el = this.component;
                  el.required = true;
                  await elementUpdated(el);
                  const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;

                  el.focus();
                  el.checked = true;
                  el.blur();
                  await elementUpdated(el);
                  expect(el.invalid).to.be.false;

                  await elementUpdated(el);
                  expect(input.getAttribute('aria-invalid')).to.equal('false');
                },
              },
            },
          },
        },
      },
    });
  }
}
