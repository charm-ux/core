import { aTimeout, elementUpdated, expect, fixture, html, oneEvent, waitUntil } from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import sinon from 'sinon';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import type { CoreOption } from '../option/index.js';
import type { CoreCombobox } from './index.js';

const getInput = (el: CoreCombobox) =>
  el.shadowRoot?.querySelector<HTMLInputElement>('.combobox-input') as HTMLInputElement;

const getOptions = (el: CoreCombobox) => Array.from(el.querySelectorAll<CoreOption>('ch-option'));

const getRows = (el: CoreCombobox) => (el.open ? getOptions(el).filter(option => !option.hidden) : []);

const activeRow = (el: CoreCombobox) => getRows(el).findIndex(option => option.hasAttribute('current'));

const settle = async (el: CoreCombobox) => {
  await aTimeout(0);
  await elementUpdated(el);
};

const openCombobox = async (el: CoreCombobox) => {
  el.open = true;
  await elementUpdated(el);
};

const focusInput = (el: CoreCombobox) => {
  getInput(el).focus();
};

interface Announcer {
  ariaNotify(message: string): void;
}

const spyOnAnnouncements = (el: Element) => sinon.spy(el as unknown as Announcer, 'ariaNotify');

export class CoreComboboxTests<T extends CoreCombobox> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      combobox: {
        description: 'combobox',
        tests: {
          properties: {
            description: 'properties',
            tests: {
              labelAssociation: {
                description: 'associates the label with the text input',
                test: async () => {
                  const el = this.component;
                  const input = getInput(el);
                  const label = el.shadowRoot?.querySelector('label');

                  expect(label?.getAttribute('for')).to.equal(input.id);
                  expect(input.id).to.not.equal('');
                },
              },
              selectedOptionValue: {
                description: 'uses the selected option for the value and input text',
                test: async () => {
                  const el = this.component;
                  el.value = 'banana';
                  await elementUpdated(el);

                  expect(el.value).to.equal('banana');
                  expect(getInput(el).value).to.equal('Banana');
                  expect(getOptions(el)[1].hasAttribute('selected')).to.be.true;
                },
              },
              valueFromSelectedAttribute: {
                description: 'reads an initially selected option',
                test: async () => {
                  const el = this.component;
                  el.innerHTML = `
                    <ch-option value="apple">Apple</ch-option>
                    <ch-option value="banana" selected>Banana</ch-option>
                  `;
                  await settle(el);

                  expect(el.value).to.equal('banana');
                  expect(getInput(el).value).to.equal('Banana');
                },
              },
              valueAsArray: {
                description: 'exposes multiple selected values as an array and as delimited text',
                test: async () => {
                  const el = this.component;
                  el.multiple = true;
                  el.valueAsArray = ['apple', 'cherry'];
                  await elementUpdated(el);

                  expect(el.valueAsArray).to.deep.equal(['apple', 'cherry']);
                  expect(el.value).to.equal('apple,cherry');
                  expect(getInput(el).value).to.equal('');

                  const tags = el.shadowRoot?.querySelectorAll('.combobox-tag') ?? [];
                  expect(tags).to.have.length(2);
                  expect(tags[0].textContent).to.include('Apple');
                  expect(tags[1].textContent).to.include('Cherry');
                },
              },
              valueDelimiter: {
                description: 'parses and serializes multiple values with a custom delimiter',
                test: async () => {
                  const el = this.component;
                  el.multiple = true;
                  el.valueDelimiter = '|';
                  el.value = 'apple|banana';
                  await elementUpdated(el);

                  expect(el.valueAsArray).to.deep.equal(['apple', 'banana']);
                  expect(el.value).to.equal('apple|banana');

                  el.valueDelimiter = ';';
                  await elementUpdated(el);

                  expect(el.value).to.equal('apple;banana');
                },
              },
              defaultAutocompleteMode: {
                description: 'defaults to both list and inline autocomplete',
                test: async () => {
                  const el = this.component;
                  expect(el.mode).to.equal('both');
                  expect(el.getAttribute('mode')).to.equal('both');
                  expect(getInput(el).getAttribute('aria-autocomplete')).to.equal('both');
                },
              },
              multipleToSingle: {
                description: 'keeps only the first value when multiple selection is turned off',
                test: async () => {
                  const el = this.component;
                  el.multiple = true;
                  el.valueAsArray = ['apple', 'banana'];
                  await elementUpdated(el);

                  el.multiple = false;
                  await elementUpdated(el);

                  expect(el.valueAsArray).to.deep.equal(['apple']);
                  expect(el.value).to.equal('apple');
                  expect(getInput(el).value).to.equal('Apple');
                },
              },
              selectOnlySemantics: {
                description: 'uses a readonly combobox input without autocomplete semantics',
                test: async () => {
                  const el = this.component;
                  el.mode = 'select-only';
                  await elementUpdated(el);

                  const input = getInput(el);
                  const toggle = el.shadowRoot?.querySelector<HTMLButtonElement>('.combobox-chevron');
                  expect(el.mode).to.equal('select-only');
                  expect(input.readOnly).to.be.true;
                  expect(input.getAttribute('inputmode')).to.equal('none');
                  expect(input.getAttribute('role')).to.equal('combobox');
                  expect(input).to.not.have.attribute('aria-autocomplete');
                  expect(toggle?.tagName).to.equal('BUTTON');
                  expect(toggle).to.have.attribute('tabindex', '-1');
                  expect(toggle).to.have.attribute(
                    'aria-controls',
                    el.shadowRoot?.querySelector('[role="listbox"]')?.id
                  );
                  expect(toggle).to.have.attribute('aria-expanded', 'false');
                  expect(toggle?.textContent).to.include('Options');
                  await expect(el).to.be.accessible();
                },
              },
              richOptionContent: {
                description: 'renders the markup of option content',
                test: async () => {
                  const el = this.component;
                  el.innerHTML = '<ch-option value="rich"><strong>Rich</strong> option</ch-option>';
                  await settle(el);
                  await openCombobox(el);

                  expect(getRows(el)[0].querySelector('strong')?.textContent).to.equal('Rich');
                },
              },
              startAndEndContent: {
                description: 'renders start and end slotted content around the label',
                test: async () => {
                  const el = this.component;
                  el.innerHTML = `
                    <ch-option value="apple"><span slot="start" class="lead">★</span>Apple<span slot="end" class="trail">↗</span></ch-option>
                  `;
                  await settle(el);
                  await openCombobox(el);

                  const row = getRows(el)[0];
                  const startSlot = row.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="start"]');
                  const endSlot = row.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="end"]');
                  expect(startSlot?.assignedElements()[0]?.classList.contains('lead')).to.be.true;
                  expect(endSlot?.assignedElements()[0]?.classList.contains('trail')).to.be.true;
                  expect(row.textLabel).to.equal('Apple');
                  expect(startSlot?.hasAttribute('aria-hidden')).to.be.false;
                  expect(endSlot?.hasAttribute('aria-hidden')).to.be.false;
                },
              },
              slottedTextIgnoredForFiltering: {
                description: 'filters options by their label, not by start or end content',
                test: async () => {
                  const el = this.component;
                  el.innerHTML = `
                    <ch-option value="apple"><span slot="start">Star</span>Apple</ch-option>
                  `;
                  await settle(el);
                  await openCombobox(el);
                  focusInput(el);
                  await sendKeys({ type: 'star' });
                  await elementUpdated(el);

                  expect(getRows(el)).to.have.length(0);
                },
              },
              slottedContentUpdates: {
                description: 'updates the row when slotted content changes',
                test: async () => {
                  const el = this.component;
                  el.innerHTML = `
                    <ch-option value="apple"><span slot="end">old</span>Apple</ch-option>
                  `;
                  await settle(el);
                  await openCombobox(el);

                  const lightEndSlot = el.querySelector('[slot="end"]') as HTMLElement;
                  lightEndSlot.textContent = 'new';
                  await settle(el);

                  const shadowEndSlot = getRows(el)[0].shadowRoot?.querySelector<HTMLSlotElement>('slot[name="end"]');
                  expect(shadowEndSlot?.assignedElements()[0]?.textContent).to.equal('new');
                },
              },
              disabledOption: {
                description: 'reflects disabled options in the listbox',
                test: async () => {
                  const el = this.component;
                  getOptions(el)[1].disabled = true;
                  await settle(el);
                  await openCombobox(el);

                  const rows = getRows(el);
                  expect(rows[1].getAttribute('aria-disabled')).to.equal('true');
                  expect(rows[0].getAttribute('aria-disabled')).to.equal('false');
                },
              },
            },
          },

          filtering: {
            description: 'filtering',
            tests: {
              filtersByLabel: {
                description: 'filters options by their label while typing',
                test: async () => {
                  const el = this.component;
                  await openCombobox(el);
                  focusInput(el);
                  await sendKeys({ type: 'ban' });
                  await elementUpdated(el);

                  const rows = getRows(el);
                  expect(rows).to.have.length(1);
                  expect(rows[0].textContent).to.include('Banana');
                },
              },
              listModeFiltersWithoutInlineCompletion: {
                description: 'shows filtered options without completing the input in list mode',
                test: async () => {
                  const el = this.component;
                  el.mode = 'list';
                  await elementUpdated(el);
                  focusInput(el);
                  await sendKeys({ type: 'ban' });
                  await elementUpdated(el);

                  expect(el.open).to.be.true;
                  expect(getRows(el)).to.have.length(1);
                  expect(getInput(el).value).to.equal('ban');
                  expect(getInput(el).getAttribute('aria-autocomplete')).to.equal('list');
                },
              },
              listModeMatchesOptionPrefixes: {
                description: 'filters default list suggestions from the beginning of option labels',
                test: async () => {
                  const el = this.component;
                  el.mode = 'list';
                  el.menuTrigger = 'manual';
                  el.allowsEmptyCollection = true;
                  await elementUpdated(el);
                  focusInput(el);
                  await sendKeys({ type: 'ana' });
                  await elementUpdated(el);

                  expect(el.open).to.be.false;
                  el.show();
                  await elementUpdated(el);
                  expect(getRows(el)).to.have.length(0);
                },
              },
              listModeTabCommitsActiveOption: {
                description: 'commits the active list suggestion when focus leaves with Tab',
                test: async () => {
                  const el = this.component;
                  el.mode = 'list';
                  await elementUpdated(el);
                  focusInput(el);
                  await sendKeys({ type: 'ban' });
                  await elementUpdated(el);
                  await sendKeys({ press: 'ArrowDown' });
                  await elementUpdated(el);

                  expect(activeRow(el)).to.equal(0);
                  await sendKeys({ press: 'Tab' });
                  await aTimeout(0);
                  await elementUpdated(el);

                  expect(el.value).to.equal('banana');
                  expect(el.open).to.be.false;
                },
              },
              inlineModeCompletesWithoutOpening: {
                description: 'completes the input inline without opening the list in inline mode',
                test: async () => {
                  const el = this.component;
                  el.mode = 'inline';
                  await elementUpdated(el);
                  focusInput(el);
                  await sendKeys({ type: 'ban' });
                  await elementUpdated(el);

                  expect(el.open).to.be.false;
                  expect(getInput(el).value).to.equal('Banana');
                  expect(getInput(el).selectionStart).to.equal(3);
                  expect(getInput(el).selectionEnd).to.equal(6);
                  expect(getInput(el).getAttribute('aria-autocomplete')).to.equal('inline');

                  await sendKeys({ press: 'Enter' });
                  await elementUpdated(el);
                  expect(el.value).to.equal('banana');

                  await sendKeys({ type: 'ch' });
                  await elementUpdated(el);
                  expect(getInput(el).value).to.equal('Cherry');
                  await sendKeys({ press: 'Escape' });
                  await elementUpdated(el);
                  expect(el.value).to.equal('banana');
                  expect(getInput(el).value).to.equal('Banana');
                },
              },
              noneModeOpensUnfilteredOptions: {
                description: 'opens the unfiltered options while keeping typed text in none mode',
                test: async () => {
                  const el = this.component;
                  el.mode = 'none';
                  await elementUpdated(el);
                  focusInput(el);
                  await sendKeys({ type: 'ban' });
                  await elementUpdated(el);

                  expect(el.open).to.be.true;
                  expect(getInput(el).value).to.equal('ban');
                  expect(getInput(el).getAttribute('aria-autocomplete')).to.equal('none');
                  expect(getRows(el)).to.have.length(3);
                },
              },
              bothModeCompletesAndFilters: {
                description: 'shows filtered suggestions and inline completion in both mode',
                test: async () => {
                  const el = this.component;
                  await elementUpdated(el);
                  focusInput(el);
                  await sendKeys({ type: 'ban' });
                  await elementUpdated(el);

                  expect(el.open).to.be.true;
                  expect(getRows(el)).to.have.length(1);
                  expect(getInput(el).value).to.equal('Banana');
                  expect(getInput(el).selectionStart).to.equal(3);
                  expect(getInput(el).selectionEnd).to.equal(6);
                  expect(activeRow(el)).to.equal(0);
                  expect(getRows(el)[0].getAttribute('aria-selected')).to.equal('false');
                },
              },
              bothModeCompletionTracksActiveOption: {
                description: 'updates inline completion when keyboard focus moves between suggestions',
                test: async () => {
                  const el = this.component;
                  el.innerHTML = `
                    <ch-option value="banana">Banana</ch-option>
                    <ch-option value="bandana">Bandana</ch-option>
                  `;
                  await settle(el);
                  focusInput(el);
                  await sendKeys({ type: 'ba' });
                  await elementUpdated(el);
                  expect(getInput(el).value).to.equal('Banana');

                  await sendKeys({ press: 'ArrowDown' });
                  await elementUpdated(el);

                  expect(getInput(el).value).to.equal('Bandana');
                  expect(getInput(el).selectionStart).to.equal(2);
                  expect(getInput(el).selectionEnd).to.equal(7);
                  expect(activeRow(el)).to.equal(1);
                },
              },
              bothModeCommitsInlineSuggestionOnBlur: {
                description: 'commits the inline suggestion when focus leaves in both mode',
                test: async () => {
                  const el = this.component;
                  await elementUpdated(el);
                  focusInput(el);
                  await sendKeys({ type: 'ban' });
                  await elementUpdated(el);

                  getInput(el).blur();
                  await aTimeout(0);
                  await elementUpdated(el);

                  expect(el.value).to.equal('banana');
                  expect(el.open).to.be.false;
                },
              },
              customFilter: {
                description: 'uses a custom filter function',
                test: async () => {
                  const el = this.component;
                  el.filter = option => option.resolvedValue.startsWith('ch');
                  await openCombobox(el);
                  focusInput(el);
                  await sendKeys({ type: 'ch' });
                  await elementUpdated(el);

                  const rows = getRows(el);
                  expect(rows).to.have.length(1);
                  expect(rows[0].textContent).to.include('Cherry');
                },
              },
              noResults: {
                description: 'shows the empty state when no options match',
                test: async () => {
                  const el = this.component;
                  el.allowsEmptyCollection = true;
                  await openCombobox(el);
                  focusInput(el);
                  await sendKeys({ type: 'zzz' });
                  await elementUpdated(el);

                  expect(el.open).to.be.true;
                  expect(getRows(el)).to.have.length(0);
                  expect(el.shadowRoot?.querySelector('.combobox-empty')).to.not.be.null;
                },
              },
              closesWithoutMatches: {
                description: 'does not open when no options match and empty collections are not allowed',
                test: async () => {
                  const el = this.component;
                  focusInput(el);
                  await sendKeys({ type: 'zzz' });
                  await elementUpdated(el);

                  expect(el.open).to.be.false;
                },
              },
              manualTrigger: {
                description: 'does not open while typing when the trigger is manual',
                test: async () => {
                  const el = this.component;
                  el.menuTrigger = 'manual';
                  await elementUpdated(el);
                  focusInput(el);
                  await sendKeys({ type: 'ban' });
                  await elementUpdated(el);

                  expect(el.open).to.be.false;

                  el.show();
                  await elementUpdated(el);
                  expect(el.open).to.be.true;
                  expect(getRows(el)).to.have.length(1);
                  expect(getRows(el)[0].textContent).to.include('Banana');
                },
              },
              announcesResultCount: {
                description: 'announces the result count while filtering',
                test: async () => {
                  const el = this.component;
                  const announcements = spyOnAnnouncements(el);
                  focusInput(el);
                  await sendKeys({ type: 'a' });
                  await elementUpdated(el);

                  expect(announcements.calledWith('1 result available')).to.be.true;
                },
              },
              announcesNoResults: {
                description: 'announces when filtering leaves no results',
                test: async () => {
                  const el = this.component;
                  el.allowsEmptyCollection = true;
                  const announcements = spyOnAnnouncements(el);
                  focusInput(el);
                  await sendKeys({ type: 'z' });
                  await elementUpdated(el);

                  expect(announcements.calledWith('No results')).to.be.true;
                },
              },
              announcesActiveOption: {
                description: 'announces the active option and its position when the keyboard moves it',
                test: async () => {
                  const el = this.component;
                  await openCombobox(el);
                  const announcements = spyOnAnnouncements(getOptions(el)[0]);
                  focusInput(el);
                  await sendKeys({ press: 'ArrowDown' });
                  await elementUpdated(el);

                  expect(activeRow(el)).to.equal(0);
                  expect(announcements.calledWith('Apple, 1 of 3')).to.be.true;
                },
              },
              doesNotRepeatResultCount: {
                description: 'does not re-announce when typing leaves the result count unchanged',
                test: async () => {
                  const el = this.component;
                  const announcements = spyOnAnnouncements(el);
                  focusInput(el);
                  await sendKeys({ type: 'a' });
                  await elementUpdated(el);
                  await sendKeys({ type: 'p' });
                  await elementUpdated(el);

                  expect(announcements.callCount).to.equal(1);
                },
              },
              focusTrigger: {
                description: 'opens when the input receives focus',
                test: async () => {
                  const el = this.component;
                  el.menuTrigger = 'focus';
                  await elementUpdated(el);
                  focusInput(el);
                  await elementUpdated(el);

                  expect(el.open).to.be.true;
                },
              },
            },
          },

          groups: {
            description: 'groups',
            tests: {
              rendersGroups: {
                description: 'renders grouped options with labels',
                test: async () => {
                  const el = this.component;
                  el.innerHTML = `
                    <ch-option-group label="Fruits">
                      <ch-option value="apple">Apple</ch-option>
                      <ch-option value="banana">Banana</ch-option>
                    </ch-option-group>
                    <ch-option-group label="Vegetables">
                      <ch-option value="carrot">Carrot</ch-option>
                    </ch-option-group>
                  `;
                  await settle(el);
                  await openCombobox(el);

                  const groups = Array.from(el.querySelectorAll('[role="group"]'));
                  expect(groups).to.have.length(2);
                  expect(groups[0].getAttribute('aria-labelledby')).to.not.be.null;
                  expect(el.querySelector(`#${groups[0].getAttribute('aria-labelledby')}`)?.textContent).to.equal(
                    'Fruits'
                  );
                  expect(groups[1].getAttribute('aria-labelledby')).to.not.be.null;
                  expect(el.querySelector(`#${groups[1].getAttribute('aria-labelledby')}`)?.textContent).to.equal(
                    'Vegetables'
                  );
                  expect(getRows(el)).to.have.length(3);
                },
              },
              disablesGroupOptions: {
                description: 'disables every option in a disabled group',
                test: async () => {
                  const el = this.component;
                  el.innerHTML = `
                    <ch-option-group label="Fruits" disabled>
                      <ch-option value="apple">Apple</ch-option>
                      <ch-option value="banana">Banana</ch-option>
                    </ch-option-group>
                  `;
                  await settle(el);
                  await openCombobox(el);

                  const rows = getRows(el);
                  expect(rows.map(row => row.getAttribute('aria-disabled'))).to.deep.equal(['true', 'true']);
                },
              },
            },
          },

          interactions: {
            description: 'interactions',
            tests: {
              opensAndCloses: {
                description: 'emits show and hide events',
                test: async () => {
                  const el = this.component;
                  const showSpy = sinon.spy();
                  const hideSpy = sinon.spy();
                  el.addEventListener('combobox-show', showSpy);
                  el.addEventListener('combobox-hide', hideSpy);

                  el.show();
                  await elementUpdated(el);
                  expect(showSpy).to.have.been.calledOnce;
                  expect(el.open).to.be.true;

                  el.hide();
                  await elementUpdated(el);
                  expect(hideSpy).to.have.been.calledOnce;
                  expect(el.open).to.be.false;
                },
              },
              chevronTogglesPopupVisibility: {
                description: 'hides the popup dialog when the chevron closes the listbox',
                test: async () => {
                  const el = this.component;
                  const popup = el.shadowRoot?.querySelector<HTMLElement>('[part="combobox-popup"]');
                  const dialog = popup?.shadowRoot?.querySelector<HTMLDialogElement>('.popup');
                  const chevron = el.shadowRoot?.querySelector<HTMLElement>('.combobox-chevron');
                  expect(popup).to.not.be.undefined;
                  expect(dialog).to.not.be.undefined;
                  expect(dialog?.hidden).to.be.true;

                  chevron?.click();
                  await elementUpdated(el);
                  await elementUpdated(popup!);
                  expect(el.open).to.be.true;
                  expect(dialog?.hidden).to.be.false;

                  chevron?.click();
                  await elementUpdated(el);
                  await elementUpdated(popup!);
                  await aTimeout(250);

                  expect(el.open).to.be.false;
                  expect(dialog?.hidden).to.be.true;
                },
              },
              selectsWithPointer: {
                description: 'selects an option when its row is clicked',
                test: async () => {
                  const el = this.component;
                  await openCombobox(el);
                  const changeEvent = oneEvent(el, 'change');

                  getRows(el)[1].click();
                  await changeEvent;
                  await elementUpdated(el);

                  expect(el.value).to.equal('banana');
                  expect(el.open).to.be.false;
                  expect(getInput(el).value).to.equal('Banana');
                },
              },
              ignoresDisabledOptionClick: {
                description: 'does not select a disabled option',
                test: async () => {
                  const el = this.component;
                  getOptions(el)[1].disabled = true;
                  await settle(el);
                  await openCombobox(el);

                  getRows(el)[1].click();
                  await elementUpdated(el);

                  expect(el.value).to.equal('');
                },
              },
              togglesMultipleOptions: {
                description: 'toggles options in a multiple combobox',
                test: async () => {
                  const el = this.component;
                  el.multiple = true;
                  await elementUpdated(el);
                  await openCombobox(el);

                  getRows(el)[0].click();
                  await elementUpdated(el);
                  getRows(el)[2].click();
                  await elementUpdated(el);

                  expect(el.valueAsArray).to.deep.equal(['apple', 'cherry']);
                  expect(el.open).to.be.true;

                  getRows(el)[0].click();
                  await elementUpdated(el);
                  expect(el.valueAsArray).to.deep.equal(['cherry']);
                },
              },
              multipleBlurKeepsSelection: {
                description: 'keeps a multiple selection when focus leaves after an option is clicked',
                test: async () => {
                  const el = this.component;
                  el.multiple = true;
                  await elementUpdated(el);
                  await openCombobox(el);
                  focusInput(el);

                  getRows(el)[0].click();
                  await elementUpdated(el);
                  getInput(el).blur();
                  await aTimeout(0);
                  await elementUpdated(el);

                  expect(el.valueAsArray).to.deep.equal(['apple']);
                },
              },
              rendersRowsOnlyWhileOpen: {
                description: 'keeps options in the DOM and lists them only while the listbox is open',
                test: async () => {
                  const el = this.component;
                  expect(el.shadowRoot?.querySelector('[role="listbox"]')).to.not.be.null;
                  expect(getOptions(el)).to.have.length(3);
                  expect(getRows(el)).to.have.length(0);

                  await openCombobox(el);
                  expect(getRows(el)).to.have.length(3);

                  el.hide();
                  await elementUpdated(el);
                  expect(getRows(el)).to.have.length(0);
                },
              },
              hoverDoesNotScroll: {
                description: 'does not scroll the listbox when the pointer highlights an option',
                test: async () => {
                  const el = this.component;
                  await openCombobox(el);
                  focusInput(el);
                  const rows = getRows(el);
                  const pointerSpy = sinon.spy(rows[2], 'scrollIntoView');
                  const keyboardSpy = sinon.spy(rows[1], 'scrollIntoView');

                  rows[2].dispatchEvent(new MouseEvent('mousemove', { bubbles: true, composed: true }));
                  await elementUpdated(el);
                  expect(activeRow(el)).to.equal(2);
                  expect(pointerSpy.callCount).to.equal(0);

                  await sendKeys({ press: 'ArrowUp' });
                  await elementUpdated(el);
                  expect(keyboardSpy.callCount).to.equal(1);
                },
              },
              removesTag: {
                description: 'removes a value when its tag is clicked',
                test: async () => {
                  const el = this.component;
                  el.multiple = true;
                  el.valueAsArray = ['apple', 'banana'];
                  await elementUpdated(el);

                  const removeButtons =
                    el.shadowRoot?.querySelectorAll<HTMLButtonElement>('.combobox-tag-remove') ?? [];
                  removeButtons[0].click();
                  await elementUpdated(el);

                  expect(el.valueAsArray).to.deep.equal(['banana']);
                },
              },
              clears: {
                description: 'clears the selection and input text',
                test: async () => {
                  const el = this.component;
                  el.withClear = true;
                  el.value = 'banana';
                  await elementUpdated(el);

                  const clearButton = el.shadowRoot?.querySelector<HTMLButtonElement>('.combobox-clear');
                  clearButton?.click();
                  await elementUpdated(el);

                  expect(el.value).to.equal('');
                  expect(getInput(el).value).to.equal('');
                },
              },
              updatesOptions: {
                description: 'recollects options when the light DOM changes',
                test: async () => {
                  const el = this.component;
                  await openCombobox(el);
                  expect(getRows(el)).to.have.length(3);

                  const option = document.createElement('ch-option') as CoreOption;
                  option.value = 'date';
                  option.textContent = 'Date';
                  el.append(option);
                  await settle(el);
                  expect(getRows(el)).to.have.length(4);

                  option.textContent = 'Durian';
                  await settle(el);
                  expect(getRows(el)[3].textContent).to.include('Durian');

                  option.remove();
                  await settle(el);
                  expect(getRows(el)).to.have.length(3);
                },
              },
            },
          },

          keyboard: {
            description: 'keyboard',
            tests: {
              navigatesOptions: {
                description: 'moves the active option with the arrow, home, end, and page keys',
                test: async () => {
                  const el = this.component;
                  await openCombobox(el);
                  focusInput(el);

                  await sendKeys({ press: 'ArrowDown' });
                  await elementUpdated(el);
                  expect(activeRow(el)).to.equal(0);

                  await sendKeys({ press: 'ArrowDown' });
                  await elementUpdated(el);
                  expect(activeRow(el)).to.equal(1);

                  await sendKeys({ press: 'ArrowUp' });
                  await elementUpdated(el);
                  expect(activeRow(el)).to.equal(0);

                  await sendKeys({ press: 'End' });
                  await elementUpdated(el);
                  expect(activeRow(el)).to.equal(2);

                  await sendKeys({ press: 'Home' });
                  await elementUpdated(el);
                  expect(activeRow(el)).to.equal(0);

                  await sendKeys({ press: 'PageDown' });
                  await elementUpdated(el);
                  expect(activeRow(el)).to.equal(2);

                  await sendKeys({ press: 'PageUp' });
                  await elementUpdated(el);
                  expect(activeRow(el)).to.equal(0);
                },
              },
              skipsDisabledOptions: {
                description: 'skips disabled options while navigating',
                test: async () => {
                  const el = this.component;
                  getOptions(el)[1].disabled = true;
                  await settle(el);
                  await openCombobox(el);
                  focusInput(el);

                  await sendKeys({ press: 'ArrowDown' });
                  await elementUpdated(el);
                  await sendKeys({ press: 'ArrowDown' });
                  await elementUpdated(el);

                  expect(activeRow(el)).to.equal(2);
                },
              },
              handlesAllDisabledOptions: {
                description: 'does not loop when every option is disabled',
                test: async () => {
                  const el = this.component;
                  getOptions(el).forEach(option => {
                    option.disabled = true;
                  });
                  el.shouldFocusWrap = true;
                  await settle(el);
                  await openCombobox(el);
                  focusInput(el);

                  await sendKeys({ press: 'PageDown' });
                  await elementUpdated(el);

                  expect(el.open).to.be.true;
                  expect(activeRow(el)).to.equal(-1);
                },
              },
              opensWithArrowDown: {
                description: 'opens and highlights the first option with ArrowDown',
                test: async () => {
                  const el = this.component;
                  focusInput(el);
                  await sendKeys({ press: 'ArrowDown' });
                  await elementUpdated(el);

                  expect(el.open).to.be.true;
                  expect(activeRow(el)).to.equal(0);
                },
              },
              commitsWithEnter: {
                description: 'commits the active option with Enter',
                test: async () => {
                  const el = this.component;
                  await openCombobox(el);
                  focusInput(el);
                  await sendKeys({ press: 'ArrowDown' });
                  await elementUpdated(el);

                  const changeEvent = oneEvent(el, 'change');
                  await sendKeys({ press: 'Enter' });
                  await changeEvent;
                  await elementUpdated(el);

                  expect(el.value).to.equal('apple');
                  expect(el.open).to.be.false;
                },
              },
              closesWithEscape: {
                description: 'closes the listbox with Escape',
                test: async () => {
                  const el = this.component;
                  await openCombobox(el);
                  focusInput(el);

                  await sendKeys({ press: 'Escape' });
                  await elementUpdated(el);

                  expect(el.open).to.be.false;
                },
              },
              removesLastValueWithBackspace: {
                description: 'removes the last selected value with Backspace',
                test: async () => {
                  const el = this.component;
                  el.multiple = true;
                  el.valueAsArray = ['apple', 'banana'];
                  await elementUpdated(el);
                  focusInput(el);

                  await sendKeys({ press: 'Backspace' });
                  await elementUpdated(el);

                  expect(el.valueAsArray).to.deep.equal(['apple']);
                },
              },
              commitsCustomValue: {
                description: 'commits typed text when custom values are allowed',
                test: async () => {
                  const el = this.component;
                  el.allowsCustomValue = true;
                  await elementUpdated(el);
                  focusInput(el);
                  await sendKeys({ type: 'mango' });
                  await elementUpdated(el);

                  const changeEvent = oneEvent(el, 'change');
                  await sendKeys({ press: 'Enter' });
                  await changeEvent;
                  await elementUpdated(el);

                  expect(el.value).to.equal('mango');
                  expect(getInput(el).value).to.equal('mango');
                  expect(el.open).to.be.false;
                },
              },
              selectOnlyTypeahead: {
                description: 'uses printable keys to find options without editing the input',
                test: async () => {
                  const el = this.component;
                  el.mode = 'select-only';
                  await elementUpdated(el);
                  focusInput(el);
                  await sendKeys({ type: 'ch' });
                  await elementUpdated(el);

                  expect(el.open).to.be.true;
                  expect(getInput(el).value).to.equal('');
                  expect(activeRow(el)).to.equal(2);

                  await sendKeys({ press: 'Enter' });
                  await elementUpdated(el);

                  expect(el.value).to.equal('cherry');
                  expect(getInput(el).value).to.equal('Cherry');
                  expect(el.open).to.be.false;
                },
              },
              selectOnlyInputClickToggles: {
                description: 'opens and closes by clicking the select-only control',
                test: async () => {
                  const el = this.component;
                  el.mode = 'select-only';
                  await elementUpdated(el);
                  const input = getInput(el);

                  input.click();
                  await elementUpdated(el);
                  expect(el.open).to.be.true;

                  input.click();
                  await elementUpdated(el);
                  expect(el.open).to.be.false;
                },
              },
              selectOnlyArrowUpOpensAtFirstOption: {
                description: 'opens and highlights the first option with ArrowUp when closed',
                test: async () => {
                  const el = this.component;
                  el.mode = 'select-only';
                  await elementUpdated(el);
                  focusInput(el);
                  await sendKeys({ press: 'ArrowUp' });
                  await elementUpdated(el);

                  expect(el.open).to.be.true;
                  expect(activeRow(el)).to.equal(0);
                },
              },
              selectOnlySpaceOpensAndCommits: {
                description: 'opens with Space and commits the active option with Space',
                test: async () => {
                  const el = this.component;
                  el.mode = 'select-only';
                  await elementUpdated(el);
                  focusInput(el);

                  await sendKeys({ press: 'Space' });
                  await elementUpdated(el);
                  expect(el.open).to.be.true;
                  expect(el.value).to.equal('');

                  await sendKeys({ press: 'Space' });
                  await elementUpdated(el);
                  expect(el.value).to.equal('apple');
                  expect(el.open).to.be.false;
                },
              },
              selectOnlyEscapeAndCollapseRetainSelection: {
                description: 'retains the committed value when Escape or the chevron collapses the listbox',
                test: async () => {
                  const el = this.component;
                  el.mode = 'select-only';
                  el.value = 'apple';
                  await elementUpdated(el);
                  focusInput(el);
                  el.show();
                  await elementUpdated(el);
                  await sendKeys({ press: 'ArrowDown' });
                  await elementUpdated(el);
                  expect(activeRow(el)).to.equal(1);

                  await sendKeys({ press: 'Escape' });
                  await elementUpdated(el);
                  expect(el.value).to.equal('apple');
                  expect(el.open).to.be.false;

                  el.show();
                  await elementUpdated(el);
                  await sendKeys({ press: 'ArrowDown' });
                  await elementUpdated(el);
                  el.shadowRoot?.querySelector<HTMLElement>('.combobox-chevron')?.click();
                  await elementUpdated(el);
                  expect(el.value).to.equal('apple');
                  expect(el.open).to.be.false;
                },
              },
              selectOnlyTabCommitsActiveOption: {
                description: 'commits the active option when focus leaves with Tab',
                test: async () => {
                  const el = this.component;
                  el.mode = 'select-only';
                  el.value = 'apple';
                  await elementUpdated(el);
                  focusInput(el);
                  el.show();
                  await elementUpdated(el);
                  await sendKeys({ press: 'ArrowDown' });
                  await elementUpdated(el);
                  await sendKeys({ press: 'Tab' });
                  await aTimeout(0);
                  await elementUpdated(el);

                  expect(el.value).to.equal('banana');
                  expect(el.open).to.be.false;
                  expect(document.activeElement).to.not.equal(getInput(el));
                },
              },
              customValueTabReleasesFocus: {
                description: 'does not return focus to the input when Tab commits a custom value',
                test: async () => {
                  const el = this.component;
                  el.allowsCustomValue = true;
                  await elementUpdated(el);
                  focusInput(el);
                  await sendKeys({ type: 'mango' });
                  await elementUpdated(el);

                  await sendKeys({ press: 'Tab' });
                  await aTimeout(0);
                  await elementUpdated(el);

                  expect(el.value).to.equal('mango');
                  expect(el.shadowRoot?.activeElement === getInput(el)).to.be.false;
                },
              },
            },
          },

          validation: {
            description: 'validation',
            tests: {
              required: {
                description: 'requires at least one selected value',
                test: async () => {
                  const el = this.component;
                  el.required = true;
                  await elementUpdated(el);

                  expect(el.checkValidity()).to.be.false;
                  expect(el.reportValidity()).to.be.false;

                  el.value = 'apple';
                  await elementUpdated(el);

                  expect(el.checkValidity()).to.be.true;
                  expect(el.reportValidity()).to.be.true;
                },
              },
              customValidity: {
                description: 'reports a custom validation message',
                test: async () => {
                  const el = this.component;
                  el.setCustomValidity('Pick a different fruit');
                  await elementUpdated(el);

                  expect(el.validity.customError).to.be.true;
                  expect(el.validationMessage).to.equal('Pick a different fruit');
                  expect(el.checkValidity()).to.be.false;

                  el.setCustomValidity();
                  await elementUpdated(el);
                  expect(el.checkValidity()).to.be.true;
                },
              },
            },
          },

          forms: {
            description: 'form association',
            tests: {
              submitsSingleValue: {
                description: 'submits the selected value under the name',
                test: async () => {
                  const el = this.component;
                  el.name = 'fruit';
                  el.value = 'banana';
                  await elementUpdated(el);
                  const form = await fixture<HTMLFormElement>(html`<form>${el}</form>`);

                  expect(new FormData(form).get('fruit')).to.equal('banana');
                },
              },
              submitsMultipleValues: {
                description: 'submits every selected value under the name',
                test: async () => {
                  const el = this.component;
                  el.name = 'fruit';
                  el.multiple = true;
                  el.valueAsArray = ['apple', 'cherry'];
                  await elementUpdated(el);
                  const form = await fixture<HTMLFormElement>(html`<form>${el}</form>`);

                  expect(new FormData(form).getAll('fruit')).to.deep.equal(['apple', 'cherry']);
                },
              },
              resynchronizesAfterNameAndMultipleChanges: {
                description: 'updates form entries when name or multiple changes',
                test: async () => {
                  const el = this.component;
                  el.multiple = true;
                  el.valueAsArray = ['apple', 'banana'];
                  await elementUpdated(el);
                  const form = await fixture<HTMLFormElement>(html`<form>${el}</form>`);

                  el.name = 'fruit';
                  await elementUpdated(el);
                  expect(new FormData(form).getAll('fruit')).to.deep.equal(['apple', 'banana']);

                  el.multiple = false;
                  await elementUpdated(el);
                  expect(new FormData(form).getAll('fruit')).to.deep.equal(['apple']);
                },
              },
              updatesRequiredValidity: {
                description: 'updates form validity when required changes after connection',
                test: async () => {
                  const el = this.component;
                  const form = await fixture<HTMLFormElement>(html`<form>${el}</form>`);

                  expect(form.checkValidity()).to.be.true;

                  el.required = true;
                  await elementUpdated(el);
                  expect(form.checkValidity()).to.be.false;

                  el.value = 'apple';
                  await elementUpdated(el);
                  expect(form.checkValidity()).to.be.true;
                },
              },
              resetsToInitialSelection: {
                description: 'restores an initially selected option on form reset',
                test: async () => {
                  const form = await fixture<HTMLFormElement>(html`
                    <form>
                      <ch-combobox name="fruit" label="Fruit">
                        <ch-option value="apple">Apple</ch-option>
                        <ch-option value="banana" selected>Banana</ch-option>
                      </ch-combobox>
                    </form>
                  `);
                  const el = form.querySelector('ch-combobox') as CoreCombobox;
                  await elementUpdated(el);

                  expect(el.value).to.equal('banana');

                  el.value = 'apple';
                  await elementUpdated(el);

                  form.reset();
                  await elementUpdated(el);

                  expect(el.value).to.equal('banana');
                  expect(el.querySelector('ch-option[value="banana"]')?.hasAttribute('selected')).to.be.true;
                },
              },
              resetsToValueAttribute: {
                description: 'restores the value attribute on form reset',
                test: async () => {
                  const form = await fixture<HTMLFormElement>(html`
                    <form>
                      <ch-combobox name="fruit" label="Fruit" value="cherry">
                        <ch-option value="apple">Apple</ch-option>
                        <ch-option value="banana">Banana</ch-option>
                        <ch-option value="cherry">Cherry</ch-option>
                      </ch-combobox>
                    </form>
                  `);
                  const el = form.querySelector('ch-combobox') as CoreCombobox;
                  await elementUpdated(el);

                  expect(el.value).to.equal('cherry');

                  el.value = 'apple';
                  await elementUpdated(el);

                  form.reset();
                  await elementUpdated(el);

                  expect(el.value).to.equal('cherry');
                },
              },
            },
          },

          loading: {
            description: 'loading',
            tests: {
              showsSpinner: {
                description: 'shows the loading state while options are loading',
                test: async () => {
                  const el = this.component;
                  el.loading = true;
                  await elementUpdated(el);
                  await openCombobox(el);

                  expect(el.shadowRoot?.querySelector('.combobox-loading')).to.not.be.null;
                  expect(el.shadowRoot?.querySelector('ch-spinner')).to.not.be.null;
                },
              },
              announcesLoading: {
                description: 'announces when options start loading',
                test: async () => {
                  const el = this.component;
                  const announcements = spyOnAnnouncements(el);
                  el.loading = true;
                  await openCombobox(el);

                  expect(announcements.calledWith('Loading options')).to.be.true;
                },
              },
            },
          },

          slots: {
            description: 'slots',
            tests: {
              noResultsSlot: {
                description: 'renders slotted no-results content',
                test: async () => {
                  const el = this.component;
                  el.allowsEmptyCollection = true;
                  el.innerHTML = `${el.innerHTML}<span slot="no-results">Nothing here</span>`;
                  await settle(el);
                  await openCombobox(el);
                  focusInput(el);
                  await sendKeys({ type: 'zzz' });
                  await waitUntil(() => !getRows(el).length);
                  await elementUpdated(el);

                  const slot = el.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="no-results"]');
                  expect(slot?.assignedElements()[0]?.textContent).to.include('Nothing here');
                },
              },
            },
          },
        },
      },
    });
  }
}
