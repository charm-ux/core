import { aTimeout, elementUpdated, expect } from '@open-wc/testing';
import sinon from 'sinon';
import { CharmElementTests } from '../../base/charm-element/charm-element.test-harness.js';
import type { CoreDatePicker } from './index.js';

export class CoreDatePickerTests<T extends CoreDatePicker> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.updateTests({
      datePicker: {
        description: 'date-picker',
        tests: {
          interactions: {
            description: 'interactions',
            tests: {
              toggle: {
                description: 'opens and closes the popup from the toggle button',
                test: async () => {
                  const toggle =
                    this.component.shadowRoot?.querySelector<HTMLButtonElement>('[part="date-picker-toggle"]');
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
                  const month = this.segmentInput('month');
                  month.focus();
                  month.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true }));
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
                    this.component.shadowRoot?.querySelectorAll<HTMLInputElement>('.segments .segment') ?? []
                  ).map(segment => segment.dataset.segment);
                  expect(kinds).to.deep.equal(['month', 'day', 'year']);
                },
              },
              segmentInput: {
                description: 'builds an ISO value from segmented input',
                test: async () => {
                  const month = this.segmentInput('month');
                  const day = this.segmentInput('day');
                  const year = this.segmentInput('year');

                  month.value = '08';
                  month.dispatchEvent(new Event('input', { bubbles: true }));
                  day.value = '05';
                  day.dispatchEvent(new Event('input', { bubbles: true }));
                  year.value = '2026';
                  year.dispatchEvent(new Event('input', { bubbles: true }));
                  await elementUpdated(this.component);

                  expect(this.component.value).to.equal('2026-08-05');
                },
              },
              localeFirstSegmentFocus: {
                description: 'focuses the locale-first segment on control click when segments are empty',
                test: async () => {
                  const control = this.component.shadowRoot?.querySelector<HTMLElement>('[part="date-picker-control"]');
                  if (!control) throw new Error('Expected date-picker control to render.');

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
                    `segment-${firstSegmentFor('en-GB')}`
                  );

                  this.component.setAttribute('lang', 'en-US');
                  this.component.requestUpdate();
                  await elementUpdated(this.component);
                  control.click();
                  await elementUpdated(this.component);
                  expect((this.component.shadowRoot?.activeElement as HTMLElement | null)?.id).to.equal(
                    `segment-${firstSegmentFor('en-US')}`
                  );
                },
              },
              noAutoFocusWhenNotEmpty: {
                description: 'focuses first segment when control is clicked and segments are filled',
                test: async () => {
                  const control = this.component.shadowRoot?.querySelector<HTMLElement>('[part="date-picker-control"]');
                  if (!control) throw new Error('Expected date-picker control to render.');

                  this.component.value = '2026-08-05';
                  await elementUpdated(this.component);

                  control.click();
                  await elementUpdated(this.component);

                  expect((this.component.shadowRoot?.activeElement as HTMLElement | null)?.id).to.equal(
                    'segment-month'
                  );
                },
              },
              focusesFirstEmptySegment: {
                description: 'focuses first segment when control is clicked and partially filled',
                test: async () => {
                  const control = this.component.shadowRoot?.querySelector<HTMLElement>('[part="date-picker-control"]');
                  if (!control) throw new Error('Expected date-picker control to render.');

                  const month = this.segmentInput('month');
                  month.value = '08';
                  month.dispatchEvent(new Event('input', { bubbles: true }));
                  await elementUpdated(this.component);

                  control.click();
                  await elementUpdated(this.component);

                  expect((this.component.shadowRoot?.activeElement as HTMLElement | null)?.id).to.equal(
                    'segment-month'
                  );
                },
              },
              segmentClickSelectsText: {
                description: 'selects segment text on click',
                test: async () => {
                  const month = this.segmentInput('month');
                  month.value = '08';
                  await elementUpdated(this.component);

                  month.click();
                  await elementUpdated(this.component);

                  expect(month.selectionStart).to.equal(0);
                  expect(month.selectionEnd).to.equal(month.value.length);
                },
              },
              monthAriaValueText: {
                description: 'sets localized month aria-valuetext when month is set',
                test: async () => {
                  this.component.setAttribute('lang', 'en-US');
                  this.component.value = '2026-08-05';
                  await elementUpdated(this.component);

                  const month = this.segmentInput('month');
                  expect(month.getAttribute('aria-valuetext')).to.equal('August');
                },
              },
              rtlArrowNavigation: {
                description: 'reverses left and right segment navigation in rtl',
                test: async () => {
                  this.component.setAttribute('dir', 'rtl');
                  this.component.requestUpdate();
                  await elementUpdated(this.component);

                  const day = this.segmentInput('day');
                  day.focus();
                  day.dispatchEvent(
                    new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })
                  );
                  await elementUpdated(this.component);
                  expect((this.component.shadowRoot?.activeElement as HTMLElement | null)?.id).to.equal(
                    'segment-month'
                  );

                  const dayAgain = this.segmentInput('day');
                  dayAgain.focus();
                  dayAgain.dispatchEvent(
                    new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true })
                  );
                  await elementUpdated(this.component);
                  expect((this.component.shadowRoot?.activeElement as HTMLElement | null)?.id).to.equal('segment-year');
                },
              },
              singleDigitAutoAdvance: {
                description: 'pads single digit month and advances when unambiguous',
                test: async () => {
                  this.component.setAttribute('lang', 'en-US');
                  this.component.requestUpdate();
                  await elementUpdated(this.component);

                  const month = this.segmentInput('month');
                  month.focus();
                  month.value = '9';
                  month.dispatchEvent(new Event('input', { bubbles: true }));
                  await elementUpdated(this.component);
                  await aTimeout(0);

                  expect(month.value).to.equal('09');
                  expect((this.component.shadowRoot?.activeElement as HTMLElement | null)?.id).to.equal('segment-day');
                },
              },
              backspaceMovesToPreviousSegment: {
                description: 'moves to previous segment on backspace when segment is empty',
                test: async () => {
                  this.component.value = '2026-08-05';
                  await elementUpdated(this.component);

                  const month = this.segmentInput('month');
                  const day = this.segmentInput('day');
                  day.value = '';
                  day.focus();
                  day.dispatchEvent(
                    new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true })
                  );
                  await elementUpdated(this.component);

                  expect((this.component.shadowRoot?.activeElement as HTMLElement | null)?.id).to.equal(
                    'segment-month'
                  );
                  expect(month.selectionStart).to.equal(0);
                  expect(month.selectionEnd).to.equal(month.value.length);
                },
              },
              calendarSelection: {
                description: 'selects a date from the calendar and emits change',
                test: async () => {
                  const changeSpy = sinon.spy();
                  this.component.addEventListener('change', changeSpy);

                  this.component.open = true;
                  await elementUpdated(this.component);

                  const day = this.component.shadowRoot
                    ?.querySelector('.calendar')
                    ?.shadowRoot?.querySelector<HTMLButtonElement>('[data-date="2025-06-15"]');
                  if (!day) throw new Error('Expected calendar day button to render.');

                  day.click();
                  await elementUpdated(this.component);

                  expect(this.component.value).to.equal('2025-06-15');
                  expect(this.component.open).to.equal(false);
                  expect(changeSpy).to.have.been.called;
                },
              },
              clear: {
                description: 'clears value with the footer clear button',
                test: async () => {
                  this.component.value = '2025-06-15';
                  await elementUpdated(this.component);

                  const clear = this.component.shadowRoot?.querySelector<HTMLButtonElement>('.footer-clear');
                  if (!clear) throw new Error('Expected clear button to render.');

                  clear.click();
                  await elementUpdated(this.component);
                  expect(this.component.value).to.equal('');
                },
              },
              today: {
                description: 'sets today from the footer action',
                test: async () => {
                  this.component.open = true;
                  await elementUpdated(this.component);

                  const today = new Date();
                  const expected = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
                    today.getDate()
                  ).padStart(2, '0')}`;
                  const todayButton = this.component.shadowRoot?.querySelector<HTMLButtonElement>('.footer-today');
                  if (!todayButton) throw new Error('Expected today button to render.');

                  todayButton.click();
                  await elementUpdated(this.component);
                  expect(this.component.value).to.equal(expected);
                },
              },
            },
          },
        },
      },
    });
  }

  protected segmentInput(kind: 'day' | 'month' | 'year'): HTMLInputElement {
    const input = this.component.shadowRoot?.querySelector<HTMLInputElement>(`#segment-${kind}`);
    if (!input) throw new Error(`Expected segment input "${kind}" to render.`);
    return input;
  }
}
