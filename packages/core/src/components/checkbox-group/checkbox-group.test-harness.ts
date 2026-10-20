import { elementUpdated, expect, fixture, html, oneEvent, waitUntil } from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import sinon from 'sinon';
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
              valueAsArrayNormalization: {
                description: 'normalizes valueAsArray by trimming empty entries and removing duplicates',
                test: async () => {
                  const group = this.component;
                  const checkboxes = [...group.children] as CoreCheckbox[];

                  group.valueAsArray = [' birds ', 'cats', 'birds', '', 'cats', 'dogs'];
                  await elementUpdated(group);
                  await waitUntil(() => checkboxes[0].checked && checkboxes[1].checked && checkboxes[2].checked);

                  expect(group.valueAsArray).to.deep.equal(['birds', 'cats', 'dogs']);
                  expect(group.value).to.equal('birds,cats,dogs');
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
              listboxSemantics: {
                description: 'exposes checkbox choices as options with one listbox tab stop',
                test: async () => {
                  const group = this.component;
                  const options = [...group.children] as CoreCheckbox[];
                  group.listbox = true;
                  await elementUpdated(group);
                  await waitUntil(() => options.every(option => option.getAttribute('role') === 'option'));

                  expect(group.getAttribute('role')).to.equal('listbox');
                  expect(group.getAttribute('aria-multiselectable')).to.equal('true');
                  expect(group.tabIndex).to.equal(0);
                  expect(group.getAttribute('aria-activedescendant')).to.equal(options[0].id);
                  expect(options.map(option => option.tabIndex)).to.deep.equal([-1, -1, -1]);
                  expect(options.map(option => option.getAttribute('aria-label'))).to.deep.equal([
                    'Birds',
                    'Cats',
                    'Dogs',
                  ]);
                  expect(options[0].shadowRoot?.querySelector('input')?.getAttribute('aria-hidden')).to.equal('true');
                  expect((options[0].shadowRoot?.querySelector('input') as HTMLInputElement).disabled).to.be.true;
                  await expect(group).to.be.accessible();

                  group.listbox = false;
                  await elementUpdated(group);
                  await waitUntil(() => options.every(option => option.getAttribute('role') === null));
                  expect(options[0].shadowRoot?.querySelector('input')?.getAttribute('aria-hidden')).to.equal(null);
                  expect((options[0].shadowRoot?.querySelector('input') as HTMLInputElement).disabled).to.be.false;
                },
              },
              listboxKeyboardNavigation: {
                description: 'moves among enabled options and toggles selection immediately with Space',
                test: async () => {
                  const group = this.component;
                  const options = [...group.children] as CoreCheckbox[];
                  options[1].disabled = true;
                  group.listbox = true;
                  await elementUpdated(group);
                  await waitUntil(() => options[2].getAttribute('role') === 'option');

                  group.focus();
                  await sendKeys({ press: 'ArrowDown' });
                  await elementUpdated(group);
                  expect(group.getAttribute('aria-activedescendant')).to.equal(options[2].id);

                  const changeEvent = oneEvent(group, 'change');
                  await sendKeys({ press: 'Space' });
                  await changeEvent;
                  await elementUpdated(group);
                  await waitUntil(() => options[2].getAttribute('aria-selected') === 'true');
                  expect(group.valueAsArray).to.deep.equal(['dogs']);

                  await sendKeys({ type: 'b' });
                  await elementUpdated(group);
                  expect(group.getAttribute('aria-activedescendant')).to.equal(options[0].id);
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
              blurWithinGroup: {
                description: 'does not report validity when focus moves between checkboxes in the same group',
                test: async () => {
                  const group = this.component;
                  const checkboxes = [...group.children] as CoreCheckbox[];
                  const reportValiditySpy = sinon.spy(group, 'reportValidity');
                  const firstInput = checkboxes[0].shadowRoot?.querySelector('.input') as HTMLInputElement;
                  const secondInput = checkboxes[1].shadowRoot?.querySelector('.input') as HTMLInputElement;

                  firstInput.dispatchEvent(
                    new FocusEvent('focusout', {
                      bubbles: true,
                      composed: true,
                      relatedTarget: secondInput,
                    })
                  );

                  await elementUpdated(group);
                  expect(reportValiditySpy.called).to.be.false;

                  firstInput.dispatchEvent(
                    new FocusEvent('focusout', {
                      bubbles: true,
                      composed: true,
                    })
                  );

                  await elementUpdated(group);
                  expect(reportValiditySpy.calledOnce).to.be.true;
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
              submitsListboxOptionsThroughTheGroup: {
                description: 'submits listbox choices through the group rather than nested checkbox controls',
                test: async () => {
                  const group = this.component;
                  const options = [...group.children] as CoreCheckbox[];
                  group.listbox = true;
                  group.valueAsArray = ['birds', 'dogs'];
                  options[0].name = 'individual';
                  await Promise.all([group.updateComplete, ...options.map(option => option.updateComplete)]);
                  const form = await fixture<HTMLFormElement>(html`<form>${group}</form>`);

                  expect(new FormData(form).getAll('options')).to.deep.equal(['birds', 'dogs']);
                  expect(new FormData(form).getAll('individual')).to.deep.equal([]);
                },
              },
              restoresDelimitedStateValue: {
                description: 'restores delimited string form state using the configured parsing behavior',
                test: async () => {
                  const group = this.component;
                  const checkboxes = [...group.children] as CoreCheckbox[];

                  (
                    group as unknown as {
                      formStateRestoreCallback: (state: string | File | FormData | null) => void;
                    }
                  ).formStateRestoreCallback('birds,dogs');

                  await elementUpdated(group);
                  await waitUntil(() => checkboxes[0].checked && checkboxes[2].checked);

                  expect(group.valueAsArray).to.deep.equal(['birds', 'dogs']);
                },
              },
            },
          },
        },
      },
    });
  }
}
