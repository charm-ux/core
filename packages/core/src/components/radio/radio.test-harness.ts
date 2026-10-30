import { expect, fixture, html } from '@open-wc/testing';
import sinon from 'sinon';
import { sendKeys } from '@web/test-runner-commands';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import type { CoreRadio } from './index.js';

const getInternals = (radio: CoreRadio): ElementInternals =>
  (radio as unknown as { internals: ElementInternals }).internals;

export class CoreRadioTests<T extends CoreRadio> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.tests = {
      ...this.tests, // adds inherited tests
      ...{
        radio: {
          description: 'radio',
          tests: {
            properties: {
              description: 'properties',
              tests: {
                checked: {
                  description: 'should be accessible when checked',
                  test: async () => {
                    this.component.checked = true;
                    await this.component.updateComplete;
                    expect(getInternals(this.component).role).to.equal('radio');
                    expect(getInternals(this.component).ariaChecked).to.equal('true');
                    await expect(this.component).to.be.accessible();
                  },
                },
                disabled: {
                  description: 'should not be focusable when disabled',
                  test: async () => {
                    this.component.disabled = true;
                    await this.component.updateComplete;
                    expect(this.component.getAttribute('tabindex')).to.equal('-1');
                  },
                },
                standaloneFormGroup: {
                  description: 'supports same-name standalone radios and submits only the selected value',
                  test: async () => {
                    const first = document.createElement('ch-radio') as CoreRadio;
                    const second = document.createElement('ch-radio') as CoreRadio;
                    first.name = second.name = 'choice';
                    first.value = 'first';
                    second.value = 'second';
                    const form = await fixture<HTMLFormElement>(html`<form>${first}${second}</form>`);
                    second.click();
                    await Promise.all([first.updateComplete, second.updateComplete]);
                    expect(first.checked).to.be.false;
                    expect(second.checked).to.be.true;
                    expect(new FormData(form).get('choice')).to.equal('second');
                    form.reset();
                    await Promise.all([first.updateComplete, second.updateComplete]);
                    expect(second.checked).to.be.false;
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
              tests: {},
            },

            // event tests
            events: {
              description: 'events',
              tests: {
                clicked: {
                  description: 'should emit `selected` event when clicked',
                  test: async () => {
                    const handler = sinon.spy();

                    this.component.addEventListener('selected', handler);
                    this.component.click();
                    await this.component.updateComplete;

                    expect(handler).to.have.been.calledOnce;
                  },
                },
                key: {
                  description: 'should emit `selected` event when selected by keyboard',
                  test: async () => {
                    const handler = sinon.spy();

                    this.component.addEventListener('selected', handler);
                    this.component.focus();
                    await sendKeys({ press: ' ' });
                    await this.component.updateComplete;

                    expect(this.component.checked).to.be.true;
                    expect(handler).to.have.been.calledOnce;
                  },
                },
              },
            },

            // interaction tests
            interactions: {
              description: 'interactions',
              tests: {
                disabled: {
                  description: 'should not emit `selected` event when selecting a disabled radio by keyboard',
                  test: async () => {
                    const handler = sinon.spy();

                    this.component.disabled = true;
                    this.component.addEventListener('selected', handler);
                    this.component.focus();
                    await sendKeys({ press: ' ' });
                    await this.component.updateComplete;

                    expect(this.component.checked).to.not.be.true;
                    expect(handler).to.not.have.been.calledOnce;
                  },
                },
                forceDisabled: {
                  description: 'should reflect disabled styling and block selection when force-disabled',
                  test: async () => {
                    const handler = sinon.spy();

                    this.component.forceDisabled = true;
                    this.component.addEventListener('selected', handler);
                    await this.component.updateComplete;

                    expect(getInternals(this.component).ariaDisabled).to.equal('true');
                    expect(this.component.hasAttribute('force-disabled')).to.be.true;
                    expect(this.component.getAttribute('tabindex')).to.equal('-1');

                    this.component.click();
                    await this.component.updateComplete;

                    expect(this.component.checked).to.not.be.true;
                    expect(handler).to.not.have.been.called;
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
