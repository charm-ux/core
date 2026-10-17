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
                  expect(group.valueAsArray).to.deep.equal(['birds']);

                  checkboxes[1].click();
                  await elementUpdated(group);
                  expect(group.valueAsArray).to.deep.equal(['birds', 'cats']);

                  checkboxes[0].click();
                  await elementUpdated(group);
                  expect(group.valueAsArray).to.deep.equal(['cats']);
                },
              },
              controlledValue: {
                description: 'synchronizes checkbox checked state from the valueAsArray property',
                test: async () => {
                  const group = this.component;
                  const checkboxes = [...group.children] as CoreCheckbox[];

                  group.valueAsArray = ['cats', 'dogs'];
                  await elementUpdated(group);
                  await waitUntil(() => checkboxes[1].checked && checkboxes[2].checked);

                  expect(checkboxes[0].checked).to.be.false;
                  expect(checkboxes[1].checked).to.be.true;
                  expect(checkboxes[2].checked).to.be.true;
                },
              },
              commaSeparatedValue: {
                description: 'parses comma-separated value strings and serializes valueAsArray changes',
                test: async () => {
                  const group = this.component;
                  const checkboxes = [...group.children] as CoreCheckbox[];

                  group.setAttribute('value', 'cats, dogs');
                  await elementUpdated(group);
                  await waitUntil(() => checkboxes[1].checked && checkboxes[2].checked);

                  expect(group.valueAsArray).to.deep.equal(['cats', 'dogs']);
                  expect(group.value).to.equal('cats,dogs');
                  expect(group.getAttribute('value')).to.equal('cats, dogs');

                  group.valueAsArray = ['birds', 'dogs'];
                  await elementUpdated(group);
                  await waitUntil(() => checkboxes[0].checked && checkboxes[2].checked);

                  expect(group.value).to.equal('birds,dogs');
                  expect(group.getAttribute('value')).to.equal('birds,dogs');
                },
              },
              valueDelimiterAttribute: {
                description: 'uses value-delimiter to parse and serialize value strings',
                test: async () => {
                  const group = this.component;
                  const checkboxes = [...group.children] as CoreCheckbox[];

                  group.setAttribute('value', 'cats|dogs');
                  group.setAttribute('value-delimiter', '|');
                  await elementUpdated(group);
                  await waitUntil(() => checkboxes[1].checked && checkboxes[2].checked);

                  expect(group.valueDelimiter).to.equal('|');
                  expect(group.valueAsArray).to.deep.equal(['cats', 'dogs']);
                  expect(group.value).to.equal('cats|dogs');

                  group.valueDelimiter = ';';
                  await elementUpdated(group);
                  expect(group.value).to.equal('cats;dogs');
                  expect(group.getAttribute('value')).to.equal('cats;dogs');
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
                  expect(group.valueAsArray).to.deep.equal([]);
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

                  group.valueAsArray = ['birds'];
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
                  group.valueAsArray = ['birds', 'dogs'];
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
