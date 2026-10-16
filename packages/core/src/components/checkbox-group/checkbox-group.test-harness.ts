import { elementUpdated, expect, fixture, html, oneEvent, waitUntil } from '@open-wc/testing';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import type { CoreCheckbox } from '../checkbox/index.js';
import type { CoreCheckboxGroup } from './index.js';

export class CoreCheckboxGroupTests<T extends CoreCheckboxGroup> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      checkboxGroup: {
        description: 'checkbox group',
        tests: {
          interactions: {
            description: 'interactions',
            tests: {
              togglesMultipleValues: {
                description: 'tracks multiple checkbox selections independently',
                test: async () => {
                  const group = this.component;
                  const checkboxes = [...group.children] as CoreCheckbox[];
                  const changeEvent = oneEvent(group, 'change');

                  checkboxes[0].click();
                  const event = await changeEvent;
                  await elementUpdated(group);

                  expect(event.target).to.equal(group);
                  expect(group.selectedValues).to.deep.equal(['birds']);

                  checkboxes[1].click();
                  await elementUpdated(group);
                  expect(group.selectedValues).to.deep.equal(['birds', 'cats']);

                  checkboxes[0].click();
                  await elementUpdated(group);
                  expect(group.selectedValues).to.deep.equal(['cats']);
                },
              },
              controlledValue: {
                description: 'synchronizes checkbox checked state from the value property',
                test: async () => {
                  const group = this.component;
                  const checkboxes = [...group.children] as CoreCheckbox[];

                  group.selectedValues = ['cats', 'dogs'];
                  await elementUpdated(group);
                  await waitUntil(() => checkboxes[1].checked && checkboxes[2].checked);

                  expect(checkboxes[0].checked).to.be.false;
                  expect(checkboxes[1].checked).to.be.true;
                  expect(checkboxes[2].checked).to.be.true;
                },
              },
              disabledGroup: {
                description: 'disables its checkboxes without changing their own disabled attributes',
                test: async () => {
                  const group = this.component;
                  const checkboxes = [...group.children] as CoreCheckbox[];
                  group.disabled = true;
                  await elementUpdated(group);
                  await waitUntil(() => checkboxes.every(checkbox => checkbox.forceDisabled));

                  expect(checkboxes[0].hasAttribute('disabled')).to.be.false;
                  expect(checkboxes[0].shadowRoot?.querySelector('input')?.disabled).to.be.true;
                  checkboxes[0].click();
                  expect(group.selectedValues).to.deep.equal([]);
                },
              },
            },
          },
          validation: {
            description: 'validation',
            tests: {
              requiredSelection: {
                description: 'requires at least one checked checkbox',
                test: async () => {
                  const group = this.component;
                  group.required = true;
                  await elementUpdated(group);
                  expect(group.reportValidity()).to.be.false;

                  group.selectedValues = ['birds'];
                  await elementUpdated(group);
                  expect(group.reportValidity()).to.be.true;
                },
              },
            },
          },
          forms: {
            description: 'form association',
            tests: {
              submitsEachSelectedValue: {
                description: "submits every selected value under the group's name",
                test: async () => {
                  const group = this.component;
                  group.selectedValues = ['birds', 'dogs'];
                  await elementUpdated(group);
                  const form = await fixture<HTMLFormElement>(html`<form>${group}</form>`);

                  expect(new FormData(form).getAll('options')).to.deep.equal(['birds', 'dogs']);
                },
              },
            },
          },
        },
      },
    });
  }
}
