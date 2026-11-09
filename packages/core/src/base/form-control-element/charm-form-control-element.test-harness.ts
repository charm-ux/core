import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import sinon from 'sinon';
import { CharmElementTests } from '../charm-element/charm-element.test-harness.js';
import { focusableElementTestGroup } from '../focusable-element/focusable-element.test-harness.js';
import { formControlAccessibilityStates } from '../../internal/testing/accessibility-states.js';
import CharmFormControlElement from './charm-form-control-element.js';

/**
 * Tests every `CharmFormControlElement` must pass, regardless of how it renders: single native inputs, groups without an
 * inner input (checkbox-group, radio-group), and host-based controls (radio). Covers the shared accessibility states
 * (invalid, disabled, readonly, required), fieldset disabling, and custom validity.
 *
 * Controls that render a native field with a `<label>` and the shared error text should extend `CoreFormControlTests`,
 * which adds the input-based tests on top of these.
 */
export class FormControlTests<T extends CharmFormControlElement> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.addAccessibilityStates(formControlAccessibilityStates());

    this.updateTests({
      formControlBase: {
        description: 'form-control base',
        tests: {
          interactions: {
            description: 'interactions',
            tests: {
              fieldsetDisabledReset: {
                description: 'restores enabled state when the containing fieldset is enabled again',
                test: async () => {
                  const el = this.component;
                  const form = await fixture<HTMLFormElement>(html`<form><fieldset>${el}</fieldset></form>`);
                  const fieldset = form.querySelector('fieldset')!;
                  fieldset.disabled = true;
                  await elementUpdated(el);
                  expect(el.disabled).to.be.true;

                  fieldset.disabled = false;
                  await elementUpdated(el);
                  expect(el.disabled).to.be.false;
                  expect(el.hasAttribute('disabled')).to.be.false;
                },
              },
            },
          },

          validations: {
            description: 'validations',
            tests: {
              customValidityInvalidates: {
                description: 'marks the control invalid when `setCustomValidity` is called with a message',
                test: async () => {
                  const el = this.component;
                  el.setCustomValidity('Custom validation message');
                  await elementUpdated(el);

                  expect(el.invalid).to.be.true;
                  expect(el.checkValidity()).to.be.false;

                  el.setCustomValidity('');
                  await elementUpdated(el);

                  expect(el.invalid).to.be.false;
                  expect(el.checkValidity()).to.be.true;
                },
              },
              preRenderCustomErrorBlocksSubmit: {
                description: 'reflects an error-message attribute set before rendering to form validity',
                test: async () => {
                  const element = document.createElement(this.component.tagName.toLowerCase()) as T;
                  element.setAttribute('error-message', 'Taken');
                  const form = await fixture<HTMLFormElement>(html`<form>${element}</form>`);
                  await elementUpdated(element);

                  expect(form.checkValidity()).to.be.false;
                  expect(element.checkValidity()).to.be.false;
                },
              },
            },
          },
        },
      },
    });
  }
}

/**
 * Tests for form controls that render a native field (`<input>`, `<select>`, `<textarea>`) with a `<label>`, the shared
 * error text, and focus delegation. Builds on `FormControlTests`.
 */
export class CoreFormControlTests<T extends CharmFormControlElement> extends FormControlTests<T> {
  public constructor() {
    super();

    this.updateTests({ focusableElement: focusableElementTestGroup(() => this.component) });

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
                  const getInput = () => this.nativeField;

                  this.component.disabled = true;
                  await elementUpdated(this.component);
                  expect(getInput()?.hasAttribute('disabled')).to.be.true;

                  this.component.disabled = false;
                  await elementUpdated(this.component);
                  expect(getInput()?.hasAttribute('disabled')).to.be.false;
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
              errorIcon: {
                description: 'renders the error icon only when an interacted control is invalid',
                test: async () => {
                  const el = this.component;
                  const getError = () => el.shadowRoot?.querySelector('.form-control-error-text');
                  const getIcon = () => getError()?.querySelector('[part="form-control-error-text-icon"]');

                  expect(getError()).to.not.be.null;
                  expect(getError()?.getAttribute('role')).to.be.null;
                  expect(getError()?.getAttribute('aria-live')).to.equal('polite');
                  expect(getIcon()).to.be.null;
                  await expect(el).to.be.accessible({ ignoredRules: ['aria-allowed-role'] });

                  el.setCustomValidity('Invalid value');
                  await elementUpdated(el);

                  expect(el.invalid).to.be.true;
                  expect(getError()).to.not.be.null;
                  expect(getIcon()).to.not.be.null;
                  await expect(el).to.be.accessible({ ignoredRules: ['aria-allowed-role'] });

                  el.setCustomValidity('');
                  await elementUpdated(el);

                  expect(el.invalid).to.be.false;
                  expect(getError()).to.not.be.null;
                  expect(getIcon()).to.be.null;
                  await expect(el).to.be.accessible({ ignoredRules: ['aria-allowed-role'] });
                },
              },
              required: {
                description: 'attaches the required attribute to the input',
                test: async () => {
                  const getRequiredIndicator = () => this.component.shadowRoot?.querySelector('.required-indicator');
                  const getInput = () => this.nativeField;

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
                  const form = await fixture<HTMLFormElement>(html`<form>${el}</form>`);
                  expect(el.invalid).to.be.true;
                  expect(el.checkValidity()).to.be.false;
                  expect(form.checkValidity()).to.be.false;
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

  /** The native field the control renders. Override for controls whose field isn't the first `<input>`. */
  protected get nativeField(): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null | undefined {
    return this.component.shadowRoot?.querySelector('input, select, textarea');
  }
}
