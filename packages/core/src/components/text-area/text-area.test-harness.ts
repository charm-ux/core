import { expect } from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import sinon from 'sinon';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import type { CoreTextArea } from './index.js';

export class CoreTextAreaTests<T extends CoreTextArea> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.tests = {
      ...this.tests,
      ...{
        TextArea: {
          description: 'TextArea',
          tests: {
            slots: {
              description: 'slots',
              tests: {
                defaultSlot: {
                  description: 'place children in the default slot',
                  test: async () => {
                    const el = this.component;
                    const defaultSlot = el.shadowRoot?.querySelector('slot:not(name)') as HTMLSlotElement;
                    expect(defaultSlot).to.not.be.undefined;
                  },
                },
                error: {
                  description: 'should display the error message when it is set',
                  test: async () => {
                    const el = this.component;
                    const errorMessage = 'Error message';
                    el.errorMessage = errorMessage;
                    await el.updateComplete;

                    const displayedErrorMessage = el.shadowRoot?.querySelector('.form-control-error-text');
                    expect(displayedErrorMessage).to.exist;
                    expect(displayedErrorMessage?.textContent).to.include(errorMessage);
                  },
                },
              },
            },
            events: {
              description: 'events',
              tests: {
                change: {
                  description: 'emits a change event when text is typed and focus is lost',
                  test: async () => {
                    const el = this.component;
                    const textarea = el.shadowRoot?.querySelector('textarea') as HTMLTextAreaElement;
                    expect(textarea).to.exist;

                    const changeSpy = sinon.spy();
                    el.addEventListener('change', changeSpy);

                    el.focus();

                    await sendKeys({ press: 'N' });
                    el.updateComplete;

                    el.blur();
                    el.updateComplete;

                    expect(changeSpy.called).to.be.true;
                  },
                },
                input: {
                  description: 'emits an input event and updates the value on input',
                  test: async () => {
                    const el = this.component;
                    const textarea = el.shadowRoot?.querySelector('textarea') as HTMLTextAreaElement;
                    expect(textarea).to.exist;

                    let inputEventEmitted = false;
                    textarea.addEventListener('input', () => {
                      inputEventEmitted = true;
                    });

                    textarea.focus();

                    // Simulate typing into the textarea
                    await sendKeys({ press: 'N' });
                    await sendKeys({ press: 'e' });
                    await sendKeys({ press: 'w' });
                    await sendKeys({ press: ' ' });
                    await sendKeys({ press: 'v' });
                    await sendKeys({ press: 'a' });
                    await sendKeys({ press: 'l' });
                    await sendKeys({ press: 'u' });
                    await sendKeys({ press: 'e' });

                    await el.updateComplete;

                    expect(inputEventEmitted).to.be.true;
                    expect(textarea.value).to.equal('New value');
                  },
                },
              },
            },
            properties: {
              description: 'properties',
              tests: {
                label: {
                  description: 'renders the label',
                  test: async () => {
                    const el = this.component;
                    const label = 'Test Label';

                    el.label = label;
                    await this.component.updateComplete;
                    const labelElement = el.shadowRoot?.querySelector('label') as HTMLLabelElement;

                    expect(labelElement).to.exist;
                    expect(labelElement?.textContent?.trim()).to.equal(label);
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
