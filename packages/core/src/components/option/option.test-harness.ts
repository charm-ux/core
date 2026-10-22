import { aTimeout, elementUpdated, expect } from '@open-wc/testing';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import type { CoreOption } from './index.js';

export class CoreOptionTests<T extends CoreOption> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      base: {
        description: 'base',
        tests: {
          accessibility: {
            description: 'should be accessible',
            // An option needs a listbox parent, so the check places it in one.
            test: async () => {
              const el = this.component;
              const listbox = document.createElement('div');
              listbox.setAttribute('role', 'listbox');
              el.before(listbox);
              listbox.append(el);

              await aTimeout(500);
              await expect(el).to.be.accessible({ ignoredRules: ['aria-allowed-role'] });
            },
          },
        },
      },
      option: {
        description: 'option',
        tests: {
          properties: {
            description: 'properties',
            tests: {
              textLabel: {
                description: 'uses the trimmed text content as the text label',
                test: async () => {
                  const el = this.component;
                  el.textContent = '  Apple  ';
                  await elementUpdated(el);

                  expect(el.textLabel).to.equal('Apple');
                },
              },
              resolvedValue: {
                description: 'falls back from value to label to text content',
                test: async () => {
                  const el = this.component;

                  expect(el.resolvedValue).to.equal('apple');

                  el.removeAttribute('value');
                  el.label = 'Apple label';
                  await elementUpdated(el);
                  expect(el.resolvedValue).to.equal('Apple label');

                  el.removeAttribute('label');
                  await elementUpdated(el);
                  expect(el.resolvedValue).to.equal('Apple');
                },
              },
              reflectsState: {
                description: 'reflects disabled and selected state to attributes',
                test: async () => {
                  const el = this.component;
                  el.disabled = true;
                  el.selected = true;
                  await elementUpdated(el);

                  expect(el.hasAttribute('disabled')).to.be.true;
                  expect(el.hasAttribute('selected')).to.be.true;

                  el.disabled = false;
                  el.selected = false;
                  await elementUpdated(el);

                  expect(el.hasAttribute('disabled')).to.be.false;
                  expect(el.hasAttribute('selected')).to.be.false;
                },
              },
            },
          },
        },
      },
    });
  }
}
