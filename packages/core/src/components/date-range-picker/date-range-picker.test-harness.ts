import { aTimeout, elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import sinon from 'sinon';
import { CoreFormControlTests } from '../../base/form-control-element/charm-form-control-element.test-harness.js';
import type { CoreDateRangePicker } from './index.js';
import type { CoreCalendar } from '../calendar/index.js';

export class CoreDateRangePickerTests<T extends CoreDateRangePicker> extends CoreFormControlTests<T> {
  public constructor() {
    super();

    this.updateTests({
      dateRangePicker: {
        description: 'date-range-picker',
        tests: {
          interactions: {
            description: 'interactions',
            tests: {
              toggle: {
                description: 'opens and closes the popup from the toggle button',
                test: async () => {
                  const toggle = this.component.shadowRoot?.querySelector<HTMLButtonElement>(
                    '[part="date-range-picker-toggle"]'
                  );
                  if (!toggle) throw new Error('Expected toggle button to render.');

                  expect(this.component.open).to.equal(false);
                  toggle.click();
                  await elementUpdated(this.component);
                  expect(this.component.open).to.equal(true);

                  toggle.click();
                  await elementUpdated(this.component);
                  expect(this.component.open).to.equal(false);
                },
              },
              spaceOpensCalendar: {
                description: 'opens the popup when space is pressed on a segment',
                test: async () => {
                  const startMonth = this.segmentInput('start', 'month');
                  startMonth.focus();
                  startMonth.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));
                  await elementUpdated(this.component);

                  expect(this.component.open).to.equal(true);
                },
              },
              normalizesPosixLocaleSuffix: {
                description: 'normalizes a POSIX locale suffix before formatting segments',
                test: async () => {
                  this.component.setAttribute('lang', 'en-US@posix');
                  this.component.requestUpdate();
                  await elementUpdated(this.component);

                  const kinds = Array.from(
                    this.component.shadowRoot?.querySelectorAll<HTMLInputElement>('.range-input .segment') ?? []
                  ).map(segment => segment.dataset.segment);
                  expect(kinds.slice(0, 3)).to.deep.equal(['month', 'day', 'year']);
                },
              },
              segmentInput: {
                description: 'builds an ISO range value from segmented input',
                test: async () => {
                  this.segmentInput('start', 'month').value = '08';
                  this.segmentInput('start', 'month').dispatchEvent(new Event('input', { bubbles: true }));
                  this.segmentInput('start', 'day').value = '05';
                  this.segmentInput('start', 'day').dispatchEvent(new Event('input', { bubbles: true }));
                  this.segmentInput('start', 'year').value = '2026';
                  this.segmentInput('start', 'year').dispatchEvent(new Event('input', { bubbles: true }));

                  this.segmentInput('end', 'month').value = '08';
                  this.segmentInput('end', 'month').dispatchEvent(new Event('input', { bubbles: true }));
                  this.segmentInput('end', 'day').value = '10';
                  this.segmentInput('end', 'day').dispatchEvent(new Event('input', { bubbles: true }));
                  this.segmentInput('end', 'year').value = '2026';
                  this.segmentInput('end', 'year').dispatchEvent(new Event('input', { bubbles: true }));

                  await elementUpdated(this.component);
                  expect(this.component.value).to.equal('2026-08-05/2026-08-10');
                },
              },
              segmentPlaceholdersUseShortDateTokens: {
                description: 'uses compact date tokens that fit each endpoint segment',
                test: async () => {
                  this.component.setAttribute('lang', 'en-US');
                  await elementUpdated(this.component);
                  for (const endpoint of ['start', 'end'] as const) {
                    expect(this.segmentInput(endpoint, 'month').placeholder).to.equal('MM');
                    expect(this.segmentInput(endpoint, 'day').placeholder).to.equal('DD');
                    expect(this.segmentInput(endpoint, 'year').placeholder).to.equal('YYYY');
                  }
                },
              },
              longLocalizedPlaceholderCanExpand: {
                description: 'lets a longer translated placeholder expand in a range endpoint',
                test: async () => {
                  const month = this.segmentInput('start', 'month');
                  const initialWidth = month.getBoundingClientRect().width;
                  const translatedPlaceholder = document.createElement('span');
                  translatedPlaceholder.slot = 'month-placeholder';
                  translatedPlaceholder.textContent = 'MONTH';
                  this.component.append(translatedPlaceholder);
                  this.component.requestUpdate();
                  await elementUpdated(this.component);
                  if (CSS.supports('field-sizing', 'content')) {
                    expect(
                      getComputedStyle(this.segmentInput('start', 'month')).getPropertyValue('field-sizing')
                    ).to.equal('content');
                  }
                  expect(this.segmentInput('start', 'month').getBoundingClientRect().width).to.be.greaterThan(
                    initialWidth
                  );
                },
              },
              localeFirstSegmentFocus: {
                description: 'focuses the locale-first start segment on control click when segments are empty',
                test: async () => {
                  const control = this.component.shadowRoot?.querySelector<HTMLElement>(
                    '[part="date-range-picker-control"]'
                  );
                  if (!control) throw new Error('Expected date-range-picker control to render.');

                  const firstSegmentFor = (locale: string): 'day' | 'month' | 'year' => {
                    const sample = new Date(Date.UTC(2038, 10, 24));
                    const formatter = new Intl.DateTimeFormat(locale, {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      timeZone: 'UTC',
                    });
                    const first = formatter
                      .formatToParts(sample)
                      .map(part => part.type)
                      .find(type => type === 'day' || type === 'month' || type === 'year');
                    return (first as 'day' | 'month' | 'year' | undefined) ?? 'month';
                  };

                  this.component.setAttribute('lang', 'en-GB');
                  this.component.requestUpdate();
                  await elementUpdated(this.component);
                  control.click();
                  await elementUpdated(this.component);
                  expect((this.component.shadowRoot?.activeElement as HTMLElement | null)?.id).to.equal(
                    `segment-start-${firstSegmentFor('en-GB')}`
                  );

                  this.component.setAttribute('lang', 'en-US');
                  this.component.requestUpdate();
                  await elementUpdated(this.component);
                  control.click();
                  await elementUpdated(this.component);
                  expect((this.component.shadowRoot?.activeElement as HTMLElement | null)?.id).to.equal(
                    `segment-start-${firstSegmentFor('en-US')}`
                  );
                },
              },
              noAutoFocusWhenNotEmpty: {
                description: 'focuses first start segment when control is clicked and segments are filled',
                test: async () => {
                  const control = this.component.shadowRoot?.querySelector<HTMLElement>(
                    '[part="date-range-picker-control"]'
                  );
                  if (!control) throw new Error('Expected date-range-picker control to render.');

                  this.component.value = '2026-08-05/2026-08-10';
                  await elementUpdated(this.component);

                  control.click();
                  await elementUpdated(this.component);

                  expect((this.component.shadowRoot?.activeElement as HTMLElement | null)?.id).to.equal(
                    'segment-start-month'
                  );
                },
              },
              focusesFirstEmptySegment: {
                description: 'focuses first start segment when control is clicked and partially filled',
                test: async () => {
                  const control = this.component.shadowRoot?.querySelector<HTMLElement>(
                    '[part="date-range-picker-control"]'
                  );
                  if (!control) throw new Error('Expected date-range-picker control to render.');

                  const startMonth = this.segmentInput('start', 'month');
                  startMonth.value = '08';
                  startMonth.dispatchEvent(new Event('input', { bubbles: true }));
                  await elementUpdated(this.component);

                  control.click();
                  await elementUpdated(this.component);

                  expect((this.component.shadowRoot?.activeElement as HTMLElement | null)?.id).to.equal(
                    'segment-start-month'
                  );
                },
              },
              segmentClickSelectsText: {
                description: 'selects segment text on click',
                test: async () => {
                  const startMonth = this.segmentInput('start', 'month');
                  startMonth.value = '08';
                  await elementUpdated(this.component);

                  startMonth.click();
                  await elementUpdated(this.component);

                  expect(startMonth.selectionStart).to.equal(0);
                  expect(startMonth.selectionEnd).to.equal(startMonth.value.length);
                },
              },
              monthFieldUsesNativeTextSemantics: {
                description: 'does not set aria-valuetext on a text field',
                test: async () => {
                  this.component.setAttribute('lang', 'en-US');
                  this.component.value = '2026-08-05/2026-08-10';
                  await elementUpdated(this.component);

                  const startMonth = this.segmentInput('start', 'month');
                  const endMonth = this.segmentInput('end', 'month');
                  expect(startMonth.hasAttribute('aria-valuetext')).to.equal(false);
                  expect(endMonth.hasAttribute('aria-valuetext')).to.equal(false);
                },
              },
              accessibleWithValue: {
                description: 'remains accessible when a range value is present',
                test: async () => {
                  this.component.value = '2026-08-05/2026-08-10';
                  await elementUpdated(this.component);
                  await expect(this.component).to.be.accessible();
                },
              },
              rtlArrowNavigation: {
                description: 'reverses left and right segment navigation in rtl',
                test: async () => {
                  this.component.setAttribute('dir', 'rtl');
                  this.component.requestUpdate();
                  await elementUpdated(this.component);

                  const startDay = this.segmentInput('start', 'day');
                  startDay.focus();
                  startDay.dispatchEvent(
                    new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })
                  );
                  await elementUpdated(this.component);
                  expect((this.component.shadowRoot?.activeElement as HTMLElement | null)?.id).to.equal(
                    'segment-start-month'
                  );

                  const startDayAgain = this.segmentInput('start', 'day');
                  startDayAgain.focus();
                  startDayAgain.dispatchEvent(
                    new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true })
                  );
                  await elementUpdated(this.component);
                  expect((this.component.shadowRoot?.activeElement as HTMLElement | null)?.id).to.equal(
                    'segment-start-year'
                  );
                },
              },
              singleDigitAutoAdvance: {
                description: 'pads single digit month and advances when unambiguous',
                test: async () => {
                  this.component.setAttribute('lang', 'en-US');
                  this.component.requestUpdate();
                  await elementUpdated(this.component);

                  const startMonth = this.segmentInput('start', 'month');
                  startMonth.focus();
                  startMonth.value = '9';
                  startMonth.dispatchEvent(new Event('input', { bubbles: true }));
                  await elementUpdated(this.component);
                  await aTimeout(0);

                  expect(startMonth.value).to.equal('09');
                  expect((this.component.shadowRoot?.activeElement as HTMLElement | null)?.id).to.equal(
                    'segment-start-day'
                  );
                },
              },
              backspaceMovesToPreviousSegment: {
                description: 'moves to previous segment on backspace when segment is empty',
                test: async () => {
                  this.component.value = '2026-08-05/2026-08-10';
                  await elementUpdated(this.component);

                  const startMonth = this.segmentInput('start', 'month');
                  const startDay = this.segmentInput('start', 'day');
                  startDay.value = '';
                  startDay.focus();
                  startDay.dispatchEvent(
                    new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true })
                  );
                  await elementUpdated(this.component);

                  expect((this.component.shadowRoot?.activeElement as HTMLElement | null)?.id).to.equal(
                    'segment-start-month'
                  );
                  expect(startMonth.selectionStart).to.equal(0);
                  expect(startMonth.selectionEnd).to.equal(startMonth.value.length);
                },
              },
              minRangeConstraint: {
                description: 'rejects typed ranges shorter than min-range',
                test: async () => {
                  this.component.minRange = 3;
                  await elementUpdated(this.component);

                  this.fillDate('start', '2026', '08', '05');
                  this.fillDate('end', '2026', '08', '06');
                  await elementUpdated(this.component);

                  expect(this.component.value).to.equal('');
                  expect(this.component.checkValidity()).to.equal(false);
                },
              },
              maxRangeConstraint: {
                description: 'rejects typed ranges longer than max-range',
                test: async () => {
                  this.component.maxRange = 3;
                  await elementUpdated(this.component);

                  this.fillDate('start', '2026', '08', '05');
                  this.fillDate('end', '2026', '08', '10');
                  await elementUpdated(this.component);

                  expect(this.component.value).to.equal('');
                  expect(this.component.checkValidity()).to.equal(false);
                },
              },
              calendarSelection: {
                description: 'selects a range from the calendar and emits change',
                test: async () => {
                  const changeSpy = sinon.spy();
                  this.component.addEventListener('change', changeSpy);

                  this.component.open = true;
                  await elementUpdated(this.component);

                  const calendarRoot = this.component.shadowRoot?.querySelector('.calendar')?.shadowRoot;
                  const start = calendarRoot?.querySelector<HTMLButtonElement>('[data-date="2025-06-10"]');
                  const end = calendarRoot?.querySelector<HTMLButtonElement>('[data-date="2025-06-15"]');
                  if (!start || !end) throw new Error('Expected calendar day buttons to render.');

                  start.click();
                  await elementUpdated(this.component);
                  end.click();
                  await elementUpdated(this.component);

                  expect(this.component.value).to.equal('2025-06-10/2025-06-15');
                  expect(this.component.open).to.equal(false);
                  expect(changeSpy).to.have.been.called;
                },
              },
              calendarKeepsFocusAfterFirstRangeSelection: {
                description: 'keeps focus in calendar after selecting range start',
                test: async () => {
                  this.component.open = true;
                  await elementUpdated(this.component);

                  const start = this.component.shadowRoot
                    ?.querySelector('.calendar')
                    ?.shadowRoot?.querySelector<HTMLButtonElement>('[data-date="2025-06-10"]');
                  if (!start) throw new Error('Expected calendar day button to render.');

                  start.click();
                  await elementUpdated(this.component);

                  const active = this.component.shadowRoot?.querySelector('.calendar')?.shadowRoot
                    ?.activeElement as HTMLElement | null;
                  expect(active?.matches('[data-date]') ?? false).to.equal(true);
                  expect(this.component.open).to.equal(true);
                },
              },
              calendarMountedLazily: {
                description: 'mounts the calendar only after the popup is first opened',
                test: async () => {
                  expect(this.component.shadowRoot?.querySelector('.calendar')).to.equal(null);

                  this.component.open = true;
                  await elementUpdated(this.component);
                  expect(this.component.shadowRoot?.querySelector('.calendar')).to.not.equal(null);

                  this.component.open = false;
                  await elementUpdated(this.component);
                  expect(this.component.shadowRoot?.querySelector('.calendar')).to.not.equal(null);
                },
              },
              calendarSelectionEmitsSingleInputPerStep: {
                description: 'emits input only after a complete range is selected',
                test: async () => {
                  const inputSpy = sinon.spy();
                  const changeSpy = sinon.spy();
                  this.component.addEventListener('input', inputSpy);
                  this.component.addEventListener('change', changeSpy);

                  this.component.open = true;
                  await elementUpdated(this.component);

                  const calendarRoot = this.component.shadowRoot?.querySelector('.calendar')?.shadowRoot;
                  const start = calendarRoot?.querySelector<HTMLButtonElement>('[data-date="2025-06-10"]');
                  const end = calendarRoot?.querySelector<HTMLButtonElement>('[data-date="2025-06-15"]');
                  if (!start || !end) throw new Error('Expected calendar day buttons to render.');

                  start.click();
                  await elementUpdated(this.component);
                  expect(inputSpy.callCount).to.equal(0);

                  end.click();
                  await elementUpdated(this.component);
                  expect(inputSpy.callCount).to.equal(1);
                  expect(changeSpy.callCount).to.equal(1);
                },
              },
              cancellingDraftPreservesSavedRange: {
                description: 'discards a half-selected range when the popup is cancelled',
                test: async () => {
                  const saved = '2025-06-10/2025-06-15';
                  this.component.value = saved;
                  this.component.show();
                  await elementUpdated(this.component);
                  const calendar = this.component.shadowRoot?.querySelector('.calendar')?.shadowRoot;
                  const start = calendar?.querySelector<HTMLButtonElement>('[data-date="2025-06-20"]');
                  if (!start) throw new Error('Expected calendar day button to render.');
                  start.click();
                  await elementUpdated(this.component);
                  expect(this.component.value).to.equal(saved);
                  this.component.hide();
                  await elementUpdated(this.component);
                  expect(this.component.value).to.equal(saved);
                  this.component.show();
                  await elementUpdated(this.component);
                  expect(this.component.shadowRoot?.querySelector<CoreCalendar>('.calendar')?.value).to.deep.equal([
                    '2025-06-10',
                    '2025-06-15',
                  ]);
                },
              },
              changingMonthPreservesSavedRange: {
                description: 'does not alter a saved range or emit input while navigating calendar months',
                test: async () => {
                  const saved = '2025-06-10/2025-06-15';
                  const inputSpy = sinon.spy();
                  this.component.value = saved;
                  this.component.addEventListener('input', inputSpy);
                  this.component.show();
                  await elementUpdated(this.component);
                  const calendar = this.component.shadowRoot?.querySelector('.calendar');
                  const next = calendar?.shadowRoot?.querySelector<HTMLButtonElement>('.navigation-button.next');
                  if (!next) throw new Error('Expected next-month button to render.');
                  next.click();
                  await elementUpdated(this.component);
                  await elementUpdated(calendar!);
                  expect(this.component.value).to.equal(saved);
                  expect(inputSpy.callCount).to.equal(0);
                  expect(calendar?.shadowRoot?.querySelector('#calendar-heading')?.textContent?.trim()).to.equal(
                    'July 2025'
                  );
                },
              },
              escapeRestoresFocusToSegment: {
                description: 'restores focus to the first segment when Escape closes the popup',
                test: async () => {
                  this.component.show();
                  await elementUpdated(this.component);
                  await sendKeys({ press: 'Escape' });
                  await elementUpdated(this.component);
                  expect(this.component.open).to.equal(false);
                  expect(this.component.shadowRoot?.activeElement).to.equal(this.segmentInput('start', 'month'));
                },
              },
              readonlyArrowKeysDoNotChangeValue: {
                description: 'does not step date segments with arrow keys while readonly',
                test: async () => {
                  this.component.value = '2026-08-05/2026-08-10';
                  this.component.readonly = true;
                  await elementUpdated(this.component);
                  const month = this.segmentInput('start', 'month');
                  month.focus();
                  await sendKeys({ press: 'ArrowDown' });
                  await elementUpdated(this.component);
                  expect(this.component.value).to.equal('2026-08-05/2026-08-10');
                },
              },
              steppingPartialRangeChangesOnlyFocusedSegment: {
                description: 'steps only the focused field of a partial range endpoint',
                test: async () => {
                  const month = this.segmentInput('start', 'month');
                  month.value = '08';
                  month.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
                  await elementUpdated(this.component);
                  month.focus();
                  await sendKeys({ press: 'ArrowUp' });
                  await elementUpdated(this.component);
                  expect(this.segmentInput('start', 'month').value).to.equal('09');
                  expect(this.segmentInput('start', 'day').value).to.equal('');
                  expect(this.segmentInput('start', 'year').value).to.equal('');
                },
              },
              nativeSegmentInputDoesNotEscape: {
                description: 'does not leak native segment input events to consumers',
                test: async () => {
                  const handler = sinon.spy();
                  this.component.addEventListener('input', handler);
                  const month = this.segmentInput('start', 'month');
                  month.value = '1';
                  month.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
                  await elementUpdated(this.component);
                  expect(handler.callCount).to.equal(0);
                },
              },
              pasteFillsOneRangeEndpoint: {
                description: 'accepts a pasted ISO date into the focused range endpoint',
                test: async () => {
                  const month = this.segmentInput('start', 'month');
                  const paste = new Event('paste', { bubbles: true }) as ClipboardEvent;
                  Object.defineProperty(paste, 'clipboardData', { value: { getData: () => '2026-08-05' } });
                  month.dispatchEvent(paste);
                  await elementUpdated(this.component);
                  expect(this.segmentInput('start', 'year').value).to.equal('2026');
                  expect(this.component.value).to.equal('');
                },
              },
              formDataUsesOneStartEndValue: {
                description: 'submits the range as one slash-separated form value',
                test: async () => {
                  this.component.name = 'range';
                  this.component.value = '2026-08-05/2026-08-10';
                  const form = await fixture<HTMLFormElement>(html`<form>${this.component}</form>`);
                  await elementUpdated(this.component);
                  expect(new FormData(form).get('range')).to.equal('2026-08-05/2026-08-10');
                },
              },
              invalidProgrammaticRangeIsRetained: {
                description: 'retains an out-of-bounds programmatic range while marking it invalid',
                test: async () => {
                  const saved = '2026-08-05/2026-08-10';
                  this.component.value = saved;
                  this.component.max = '2026-08-04';
                  await elementUpdated(this.component);
                  expect(this.component.value).to.equal(saved);
                  expect(this.component.checkValidity()).to.equal(false);
                },
              },
              narrowingRangeConstraintRetainsValue: {
                description: 'retains a set range when a later min-range change makes it invalid',
                test: async () => {
                  const saved = '2026-08-05/2026-08-10';
                  this.component.value = saved;
                  this.component.minRange = 7;
                  await elementUpdated(this.component);
                  expect(this.component.value).to.equal(saved);
                  expect(this.component.checkValidity()).to.equal(false);
                },
              },
              unavailableMiddleDatesRemainAllowed: {
                description: 'allows unavailable dates between available range endpoints',
                test: async () => {
                  this.component.disabledDates = '2026-08-07';
                  this.component.value = '2026-08-05/2026-08-10';
                  await elementUpdated(this.component);
                  expect(this.component.value).to.equal('2026-08-05/2026-08-10');
                  expect(this.component.checkValidity()).to.equal(true);
                },
              },
              externalValueDoesNotEmitChangeOnBlur: {
                description: 'does not emit change for a programmatic range when focus leaves',
                test: async () => {
                  const change = sinon.spy();
                  this.component.addEventListener('change', change);
                  this.component.value = '2026-08-05/2026-08-10';
                  await elementUpdated(this.component);
                  this.segmentInput('start', 'month').focus();
                  this.segmentInput('start', 'month').blur();
                  await new Promise(resolve => requestAnimationFrame(resolve));
                  await elementUpdated(this.component);
                  expect(change.callCount).to.equal(0);
                },
              },
              outsideDismissKeepsClickedFocus: {
                description: 'does not restore focus after an outside-pointer dismissal',
                test: async () => {
                  const outside = document.createElement('button');
                  document.body.append(outside);
                  this.component.show();
                  await elementUpdated(this.component);
                  outside.focus();
                  outside.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
                  await elementUpdated(this.component);
                  expect(this.component.open).to.equal(false);
                  expect(document.activeElement).to.equal(outside);
                  outside.remove();
                },
              },
              formResetClearsPartiallyTypedSegments: {
                description: 'clears partial range edits when the form resets',
                test: async () => {
                  const form = await fixture<HTMLFormElement>(html`<form>${this.component}</form>`);
                  const month = this.segmentInput('start', 'month');
                  month.value = '1';
                  month.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
                  await elementUpdated(this.component);
                  form.reset();
                  await elementUpdated(this.component);
                  expect(this.segmentInput('start', 'month').value).to.equal('');
                  expect(this.segmentInput('end', 'month').value).to.equal('');
                },
              },
              wrapsAtNarrowWidthWithLargeText: {
                description: 'keeps all range fields visible at a narrow width with enlarged text',
                test: async () => {
                  this.component.style.width = '320px';
                  this.component.style.fontSize = '200%';
                  await elementUpdated(this.component);
                  const entry = this.component.shadowRoot?.querySelector<HTMLElement>('.entry');
                  if (!entry) throw new Error('Expected range input entry to render.');
                  expect(entry.scrollWidth).to.be.at.most(entry.clientWidth + 1);
                },
              },
              preservesPartialSegmentInput: {
                description: 'does not clear partially edited segments when the value becomes incomplete',
                test: async () => {
                  this.component.value = '2026-08-05/2026-08-10';
                  await elementUpdated(this.component);

                  const endDay = this.segmentInput('end', 'day');
                  endDay.value = '';
                  endDay.dispatchEvent(new Event('input', { bubbles: true }));
                  await elementUpdated(this.component);

                  expect(endDay.value).to.equal('');
                  expect(this.component.value).to.equal('');
                },
              },
              popupHideSyncsOpenState: {
                description: 'closes the picker when the popup requests a close',
                test: async () => {
                  this.component.open = true;
                  await elementUpdated(this.component);

                  const popup = this.component.shadowRoot?.querySelector<HTMLElement & { hide(): void }>(
                    '[part="date-range-picker-popup"]'
                  );
                  if (!popup) throw new Error('Expected popup to render.');

                  popup.hide();
                  await elementUpdated(this.component);

                  expect(this.component.open).to.equal(false);
                },
              },
              calendarPopupIsFocusTrappedDialog: {
                description: 'traps focus within the popup dialog content, excluding the input controls',
                test: async () => {
                  this.component.open = true;
                  await elementUpdated(this.component);

                  const popup = this.component.shadowRoot?.querySelector<
                    HTMLElement & { focusTrap?: boolean; shadowRoot: ShadowRoot | null }
                  >('[part="date-range-picker-popup"]');
                  if (!popup) throw new Error('Expected popup to render.');

                  expect(popup.focusTrap).to.equal(true);
                  expect(popup.shadowRoot?.querySelector('dialog')?.getAttribute('role')).to.equal('dialog');

                  const today = this.component.shadowRoot?.querySelector<HTMLButtonElement>('.footer-today');
                  if (!today) throw new Error('Expected today button to render.');

                  const calendar = this.component.shadowRoot?.querySelector<HTMLElement>('.calendar');
                  if (!calendar?.shadowRoot) throw new Error('Expected calendar to render.');

                  const previous = calendar.shadowRoot.querySelector<HTMLButtonElement>('.navigation-button.previous');
                  if (!previous) throw new Error('Expected previous month button to render.');

                  today.focus();
                  today.dispatchEvent(
                    new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, composed: true, cancelable: true })
                  );
                  await elementUpdated(this.component);
                  expect(this.component.open).to.equal(true);
                  expect(calendar.shadowRoot.activeElement).to.equal(previous);

                  const month = this.segmentInput('start', 'month');
                  month.focus();
                  month.dispatchEvent(
                    new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, composed: true, cancelable: true })
                  );
                  await elementUpdated(this.component);
                  expect(this.component.open).to.equal(true);
                  expect(calendar.shadowRoot.activeElement).to.equal(previous);

                  month.focus();
                  month.dispatchEvent(
                    new KeyboardEvent('keydown', {
                      key: 'Tab',
                      shiftKey: true,
                      bubbles: true,
                      composed: true,
                      cancelable: true,
                    })
                  );
                  await elementUpdated(this.component);
                  expect(this.component.open).to.equal(true);
                  expect(this.component.shadowRoot?.activeElement).to.equal(today);

                  previous.focus();
                  previous.dispatchEvent(
                    new KeyboardEvent('keydown', {
                      key: 'Tab',
                      shiftKey: true,
                      bubbles: true,
                      composed: true,
                      cancelable: true,
                    })
                  );
                  await elementUpdated(this.component);
                  expect(this.component.open).to.equal(true);
                  expect(this.component.shadowRoot?.activeElement).to.equal(today);
                },
              },
              clear: {
                description: 'clears value with the footer clear button',
                test: async () => {
                  this.component.value = '2025-06-10/2025-06-15';
                  await elementUpdated(this.component);

                  const clear = this.component.shadowRoot?.querySelector<HTMLButtonElement>('.footer-clear');
                  if (!clear) throw new Error('Expected clear button to render.');

                  clear.click();
                  await elementUpdated(this.component);
                  expect(this.component.value).to.equal('');
                },
              },
              clearPartialInput: {
                description: 'clears partially entered segments with the footer clear button',
                test: async () => {
                  this.fillDate('start', '2026', '08', '05');
                  await elementUpdated(this.component);

                  const clear = this.component.shadowRoot?.querySelector<HTMLButtonElement>('.footer-clear');
                  if (!clear) throw new Error('Expected clear button to render.');
                  expect(clear.disabled).to.equal(false);

                  clear.click();
                  await elementUpdated(this.component);
                  expect(this.segmentInput('start', 'year').value).to.equal('');
                  expect(this.segmentInput('end', 'year').value).to.equal('');
                  expect(this.component.value).to.equal('');
                },
              },
              requiredShowsErrorMessageOnBlur: {
                description: 'shows the validation message after a required field is blurred',
                test: async () => {
                  this.component.required = true;
                  await elementUpdated(this.component);

                  const month = this.segmentInput('start', 'month');
                  month.focus();
                  month.blur();
                  await new Promise(resolve => requestAnimationFrame(resolve));
                  await elementUpdated(this.component);

                  const input = this.component.shadowRoot?.querySelector<HTMLInputElement>('#native-input');
                  const message = this.component.shadowRoot?.querySelector('.form-control-error-text-message');
                  expect(message?.textContent?.trim()).to.equal(input?.validationMessage);
                  expect(message?.textContent?.trim()).to.not.equal('');
                },
              },
              requiredValidationFocusesVisibleSegment: {
                description: 'focuses a visible start segment when required validation is reported',
                test: async () => {
                  this.component.required = true;
                  await elementUpdated(this.component);
                  expect(this.component.reportValidity()).to.equal(false);
                  expect(this.component.shadowRoot?.activeElement).to.equal(this.segmentInput('start', 'month'));
                },
              },
              today: {
                description: 'sets a single-day range for today from the footer action',
                test: async () => {
                  this.component.open = true;
                  await elementUpdated(this.component);

                  const today = new Date();
                  const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
                    today.getDate()
                  ).padStart(2, '0')}`;
                  const todayButton = this.component.shadowRoot?.querySelector<HTMLButtonElement>('.footer-today');
                  if (!todayButton) throw new Error('Expected today button to render.');

                  todayButton.click();
                  await elementUpdated(this.component);
                  expect(this.component.value).to.equal(`${iso}/${iso}`);
                },
              },
            },
          },
        },
      },
    });
  }

  protected segmentInput(endpoint: 'start' | 'end', kind: 'day' | 'month' | 'year'): HTMLInputElement {
    const input = this.component.shadowRoot?.querySelector<HTMLInputElement>(`#segment-${endpoint}-${kind}`);
    if (!input) throw new Error(`Expected segment input "${endpoint}-${kind}" to render.`);
    return input;
  }

  protected fillDate(endpoint: 'start' | 'end', year: string, month: string, day: string): void {
    this.segmentInput(endpoint, 'month').value = month;
    this.segmentInput(endpoint, 'month').dispatchEvent(new Event('input', { bubbles: true }));
    this.segmentInput(endpoint, 'day').value = day;
    this.segmentInput(endpoint, 'day').dispatchEvent(new Event('input', { bubbles: true }));
    this.segmentInput(endpoint, 'year').value = year;
    this.segmentInput(endpoint, 'year').dispatchEvent(new Event('input', { bubbles: true }));
  }
}
