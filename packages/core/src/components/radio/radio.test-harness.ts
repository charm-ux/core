import { expect } from '@open-wc/testing';
import sinon from 'sinon';
import { sendKeys } from '@web/test-runner-commands';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import type { CoreRadio } from './index.js';

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
              },
            },
          },
        },
      },
    };
  }
}
