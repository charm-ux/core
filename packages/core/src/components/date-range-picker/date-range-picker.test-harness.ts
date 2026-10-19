import { aTimeout, elementUpdated, expect } from '@open-wc/testing';
import sinon from 'sinon';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import type { CoreDateRangePicker } from './index.js';

export class CoreDateRangePickerTests<T extends CoreDateRangePicker> extends CharmElementTests<T> {
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
              monthAriaValueText: {
                description: 'sets localized month aria-valuetext when month is set',
                test: async () => {
                  this.component.setAttribute('lang', 'en-US');
                  this.component.value = '2026-08-05/2026-08-10';
                  await elementUpdated(this.component);

                  const startMonth = this.segmentInput('start', 'month');
                  const endMonth = this.segmentInput('end', 'month');
                  expect(startMonth.getAttribute('aria-valuetext')).to.equal('August');
                  expect(endMonth.getAttribute('aria-valuetext')).to.equal('August');
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
