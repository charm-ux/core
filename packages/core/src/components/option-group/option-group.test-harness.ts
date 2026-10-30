import { aTimeout, elementUpdated, expect } from '@open-wc/testing';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import type { CoreOption } from '../option/index.js';
import type { CoreOptionGroup } from './index.js';

export class CoreOptionGroupTests<T extends CoreOptionGroup> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      base: {
        description: 'base',
        tests: {
          accessibility: {
            description: 'should be accessible',
            // Options need a listbox parent, so the check places the group in one.
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
      optionGroup: {
        description: 'option group',
        tests: {
          properties: {
            description: 'properties',
            tests: {
              reflectsLabel: {
                description: 'reflects the group label to the label attribute',
                test: async () => {
                  const el = this.component;
                  el.label = 'Vegetables';
                  await elementUpdated(el);

                  expect(el.getAttribute('label')).to.equal('Vegetables');
                },
              },
              labelsFromLightDom: {
                description: 'uses a light-DOM label reference instead of aria-label',
                test: async () => {
                  const el = this.component;
                  el.label = undefined;
                  const label = document.createElement('span');
                  label.slot = 'label';
                  label.textContent = 'Translated fruits';
                  el.prepend(label);
                  await elementUpdated(el);

                  const labelledBy = el.getAttribute('aria-labelledby');
                  expect(el.hasAttribute('aria-label')).to.be.false;
                  expect(labelledBy).to.equal(label.id);
                  expect(el.querySelector(`#${labelledBy}`)?.textContent).to.equal('Translated fruits');
                },
              },
              reflectsDisabled: {
                description: 'reflects the disabled state to the disabled attribute',
                test: async () => {
                  const el = this.component;
                  el.disabled = true;
                  await elementUpdated(el);

                  expect(el.hasAttribute('disabled')).to.be.true;

                  el.disabled = false;
                  await elementUpdated(el);

                  expect(el.hasAttribute('disabled')).to.be.false;
                },
              },
              containsOptions: {
                description: 'keeps its option children in the light DOM',
                test: async () => {
                  const el = this.component;
                  const options = Array.from(el.querySelectorAll<CoreOption>('ch-option'));

                  expect(options).to.have.length(2);
                  expect(options.map(option => option.value)).to.deep.equal(['apple', 'banana']);
                },
              },
            },
          },
        },
      },
    });
  }
}
