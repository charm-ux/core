import { elementUpdated, expect } from '@open-wc/testing';
import sinon from 'sinon';
import { CharmElementTests, type TestGroup } from '../charm-element/charm-element.test-harness.js';
import FocusableElement from './charm-focusable-element.js';

/**
 * The focusable-element test group. Exported so harnesses that can't extend `FocusableElementTests` (such as
 * `CoreFormControlTests`, which extends `FormControlTests`) can still run it.
 * @param getComponent returns the component under test for the current test
 */
export function focusableElementTestGroup<T extends FocusableElement>(getComponent: () => T): TestGroup {
  return {
    description: `"${getComponent().tagName.toLowerCase()}" focusable-element`,
    tests: {
      properties: {
        description: 'properties',
        tests: {
          focusableAttribute: {
            description: 'element should have `focusable` attribute',
            test: async () => {
              await elementUpdated(getComponent());

              expect(getComponent().hasAttribute('focusable')).to.be.true;
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
              const el = getComponent();
              const focusHandler = sinon.spy();
              el.addEventListener('focus', focusHandler);
              el.focus();
              await elementUpdated(el);

              expect(focusHandler).to.have.been.callCount(1);
            },
          },
          blur: {
            description: 'emits a `blur` event when blurred',
            test: async () => {
              const el = getComponent();
              const blurHandler = sinon.spy();
              el.addEventListener('blur', blurHandler);

              el.focus();
              el.blur();
              await elementUpdated(el);

              expect(blurHandler).to.have.been.callCount(1);
            },
          },
        },
      },
    },
  };
}

export class FocusableElementTests<T extends FocusableElement> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({ focusableElement: focusableElementTestGroup(() => this.component) });
  }
}
