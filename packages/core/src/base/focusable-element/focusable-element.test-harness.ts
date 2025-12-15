import { elementUpdated, expect } from '@open-wc/testing';
import sinon from 'sinon';
import { CharmElementTests } from '../charm-element/charm-element.test-harness.js';
import FocusableElement from './charm-focusable-element.js';

export class FocusableElementTests<T extends FocusableElement> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      focusableElement: {
        description: `"${this.component.tagName.toLowerCase()}" focusable-element`,
        tests: {
          properties: {
            description: 'properties',
            tests: {
              focusableAttribute: {
                description: 'element should have `focusable` attribute',
                test: async () => {
                  await elementUpdated(this.component);

                  expect(this.component.hasAttribute('focusable')).to.be.true;
                },
              },
            },
          },
          events: {
            description: 'events',
            tests: {
              focus: {
                description: 'emits a `focus` event when focused',
                test: async () => {
                  const focusHandler = sinon.spy();
                  this.component.addEventListener('focus', focusHandler);
                  this.component.focus();
                  await elementUpdated(this.component);

                  expect(focusHandler).to.have.been.callCount(1);
                },
              },
              blur: {
                description: 'emits a `blur` event when blurred',
                test: async () => {
                  const blurHandler = sinon.spy();
                  this.component.addEventListener('blur', blurHandler);

                  this.component.focus();
                  this.component.blur();
                  await elementUpdated(this.component);

                  expect(blurHandler).to.have.been.callCount(1);
                },
              },
            },
          },
        },
      },
    });
  }
}
