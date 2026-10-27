import { aTimeout, elementUpdated, expect, fixture, html } from '@open-wc/testing';
import sinon from 'sinon';
import { sendKeys } from '@web/test-runner-commands';
import { CoreFormControlTests } from '../../base/form-control-element/charm-form-control-element.test-harness.js';
import type { CoreDatePicker } from './index.js';

export class CoreDatePickerTests<T extends CoreDatePicker> extends CoreFormControlTests<T> {
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
              bdayAutocomplete: {
                description: 'maps bday to the matching segment autocomplete tokens',
                test: async () => {
                  this.component.setAttribute('autocomplete', 'bday');
                  await elementUpdated(this.component);

                  const segments = Array.from(
                    this.component.shadowRoot?.querySelectorAll<HTMLInputElement>('.segments .segment') ?? []
                  );
                  expect(segments.map(segment => segment.getAttribute('autocomplete'))).to.deep.equal([
                    'bday-month',
                    'bday-day',
                    'bday-year',
                  ]);
                },
              },
              forwardsAutocomplete: {
                description: 'forwards other autocomplete values to every segment',
                test: async () => {
                  this.component.setAttribute('autocomplete', 'off');
                  await elementUpdated(this.component);

                  const segments = Array.from(
                    this.component.shadowRoot?.querySelectorAll<HTMLInputElement>('.segments .segment') ?? []
                  );
                  expect(segments.map(segment => segment.getAttribute('autocomplete'))).to.deep.equal([
                    'off',
                    'off',
                    'off',
                  ]);
                },
              },
              omitsAutocompleteByDefault: {
                description: 'omits autocomplete from segments when not set',
                test: async () => {
                  const segments = Array.from(
                    this.component.shadowRoot?.querySelectorAll<HTMLInputElement>('.segments .segment') ?? []
                  );
                  expect(segments.every(segment => !segment.hasAttribute('autocomplete'))).to.equal(true);
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
              segmentPlaceholdersUseShortDateTokens: {
                description: 'uses compact date tokens that fit each segment field',
                test: async () => {
                  this.component.setAttribute('lang', 'en-US');
                  await elementUpdated(this.component);
                  expect(this.segmentInput('month').placeholder).to.equal('MM');
                  expect(this.segmentInput('day').placeholder).to.equal('DD');
                  expect(this.segmentInput('year').placeholder).to.equal('YYYY');
                },
              },
              longLocalizedPlaceholderCanExpand: {
                description: 'lets a longer translated placeholder expand when field-sizing is supported',
                test: async () => {
                  const month = this.segmentInput('month');
                  const initialWidth = month.getBoundingClientRect().width;
                  const translatedPlaceholder = document.createElement('span');
                  translatedPlaceholder.slot = 'month-placeholder';
                  translatedPlaceholder.textContent = 'MONTH';
                  this.component.append(translatedPlaceholder);
                  this.component.requestUpdate();
                  await elementUpdated(this.component);
                  if (CSS.supports('field-sizing', 'content')) {
                    expect(getComputedStyle(this.segmentInput('month')).getPropertyValue('field-sizing')).to.equal(
                      'content'
                    );
                  }
                  expect(this.segmentInput('month').getBoundingClientRect().width).to.be.greaterThan(initialWidth);
                },
              },
              localizedYearPlaceholderFitsField: {
                description: 'does not clip a localized year placeholder',
                test: async () => {
                  this.component.setAttribute('lang', 'fr-FR');
                  await elementUpdated(this.component);
                  const year = this.segmentInput('year');
                  const context = document.createElement('canvas').getContext('2d');
                  if (!context) throw new Error('Expected a canvas text measurement context.');
                  context.font = getComputedStyle(year).font;
                  const textWidth = context.measureText(year.placeholder).width;
                  expect(year.getBoundingClientRect().width).to.be.at.least(textWidth);
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
              monthFieldUsesNativeTextSemantics: {
                description: 'does not set aria-valuetext on a text field',
                test: async () => {
                  this.component.setAttribute('lang', 'en-US');
                  this.component.value = '2026-08-05';
                  await elementUpdated(this.component);

                  const month = this.segmentInput('month');
                  expect(month.hasAttribute('aria-valuetext')).to.equal(false);
                },
              },
              accessibleWithValue: {
                description: 'remains accessible when a date value is present',
                test: async () => {
                  this.component.value = '2026-08-05';
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
              escapeRestoresFocusToSegment: {
                description: 'restores focus to the first date segment when Escape closes the popup',
                test: async () => {
                  this.component.show();
                  await elementUpdated(this.component);
                  await sendKeys({ press: 'Escape' });
                  await elementUpdated(this.component);
                  expect(this.component.open).to.equal(false);
                  expect(this.component.shadowRoot?.activeElement).to.equal(this.segmentInput('month'));
                },
              },
              selectingCurrentDateClosesPopup: {
                description: 'closes the popup when the already-selected date is selected',
                test: async () => {
                  this.component.value = '2025-06-15';
                  this.component.show();
                  await elementUpdated(this.component);
                  const day = this.component.shadowRoot
                    ?.querySelector('.calendar')
                    ?.shadowRoot?.querySelector<HTMLButtonElement>('[data-date="2025-06-15"]');
                  if (!day) throw new Error('Expected selected calendar date to render.');
                  day.click();
                  await elementUpdated(this.component);
                  expect(this.component.open).to.equal(false);
                },
              },
              readonlyArrowKeysDoNotChangeValue: {
                description: 'does not step a date segment with arrow keys while readonly',
                test: async () => {
                  this.component.value = '2026-08-05';
                  this.component.readonly = true;
                  await elementUpdated(this.component);
                  const month = this.segmentInput('month');
                  month.focus();
                  await sendKeys({ press: 'ArrowUp' });
                  await elementUpdated(this.component);
                  expect(this.component.value).to.equal('2026-08-05');
                },
              },
              steppingPartialDateChangesOnlyFocusedSegment: {
                description: 'steps only the focused field of a partial date',
                test: async () => {
                  const month = this.segmentInput('month');
                  month.value = '08';
                  month.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
                  await elementUpdated(this.component);
                  month.focus();
                  await sendKeys({ press: 'ArrowUp' });
                  await elementUpdated(this.component);
                  expect(this.segmentInput('month').value).to.equal('09');
                  expect(this.segmentInput('day').value).to.equal('');
                  expect(this.segmentInput('year').value).to.equal('');
                },
              },
              incompleteDateIsInvalid: {
                description: 'reports a validation error for partially entered optional dates',
                test: async () => {
                  const year = this.segmentInput('year');
                  year.value = '26';
                  year.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
                  await elementUpdated(this.component);
                  expect(this.component.value).to.equal('');
                  expect(this.component.checkValidity()).to.equal(false);
                },
              },
              invalidDigitsAreNotClamped: {
                description: 'keeps out-of-range digits and reports a validation error',
                test: async () => {
                  const month = this.segmentInput('month');
                  month.value = '13';
                  month.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
                  await elementUpdated(this.component);
                  expect(this.segmentInput('month').value).to.equal('13');
                  expect(this.component.checkValidity()).to.equal(false);
                },
              },
              nativeSegmentInputDoesNotEscape: {
                description: 'does not leak native segment input events to consumers',
                test: async () => {
                  const handler = sinon.spy();
                  this.component.addEventListener('input', handler);
                  const month = this.segmentInput('month');
                  month.value = '1';
                  month.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
                  await elementUpdated(this.component);
                  expect(handler.callCount).to.equal(0);
                },
              },
              pasteFillsTheWholeDate: {
                description: 'accepts a pasted ISO date across all segments',
                test: async () => {
                  const month = this.segmentInput('month');
                  const paste = new Event('paste', { bubbles: true }) as ClipboardEvent;
                  Object.defineProperty(paste, 'clipboardData', { value: { getData: () => '2026-08-05' } });
                  month.dispatchEvent(paste);
                  await elementUpdated(this.component);
                  expect(this.component.value).to.equal('2026-08-05');
                },
              },
              externalValueDoesNotEmitChangeOnBlur: {
                description: 'does not emit change for a programmatic value when focus leaves',
                test: async () => {
                  const change = sinon.spy();
                  this.component.addEventListener('change', change);
                  this.component.value = '2026-08-05';
                  await elementUpdated(this.component);
                  this.segmentInput('month').focus();
                  this.segmentInput('month').blur();
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
              inheritedLangChangesUpdateSegments: {
                description: 'updates segmented order when an inherited lang changes',
                test: async () => {
                  const wrapper = document.createElement('div');
                  wrapper.lang = 'en-US';
                  this.component.parentElement?.append(wrapper);
                  wrapper.append(this.component);
                  await elementUpdated(this.component);
                  wrapper.lang = 'en-GB';
                  await aTimeout(0);
                  await elementUpdated(this.component);
                  const kinds = Array.from(
                    this.component.shadowRoot?.querySelectorAll<HTMLInputElement>('.segments .segment') ?? []
                  ).map(segment => segment.dataset.segment);
                  expect(kinds).to.deep.equal(['day', 'month', 'year']);
                  wrapper.remove();
                },
              },
              formResetClearsPartiallyTypedSegments: {
                description: 'clears partial segment edits when the form resets',
                test: async () => {
                  const form = await fixture<HTMLFormElement>(html`<form>${this.component}</form>`);
                  const month = this.segmentInput('month');
                  month.value = '1';
                  month.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
                  await elementUpdated(this.component);
                  form.reset();
                  await elementUpdated(this.component);
                  expect(this.segmentInput('month').value).to.equal('');
                  expect(this.segmentInput('day').value).to.equal('');
                  expect(this.segmentInput('year').value).to.equal('');
                },
              },
              invalidProgrammaticValueIsRetained: {
                description: 'retains an out-of-bounds programmatic value while marking it invalid',
                test: async () => {
                  this.component.value = '2026-08-05';
                  this.component.max = '2026-08-04';
                  await elementUpdated(this.component);
                  expect(this.component.value).to.equal('2026-08-05');
                  expect(
                    this.component.shadowRoot?.querySelector<HTMLInputElement>('#native-input')?.validationMessage
                  ).to.equal('Date is unavailable.');
                  expect(this.component.checkValidity()).to.equal(false);
                },
              },
              formDataUsesTheDateValue: {
                description: 'submits the date value through ElementInternals',
                test: async () => {
                  this.component.name = 'date';
                  this.component.value = '2026-08-05';
                  const form = await fixture<HTMLFormElement>(html`<form>${this.component}</form>`);
                  await elementUpdated(this.component);
                  expect(new FormData(form).get('date')).to.equal('2026-08-05');
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
              calendarSelectionEmitsSingleInput: {
                description: 'emits one input event when a date is selected from the calendar',
                test: async () => {
                  const inputSpy = sinon.spy();
                  const changeSpy = sinon.spy();
                  this.component.addEventListener('input', inputSpy);
                  this.component.addEventListener('change', changeSpy);

                  this.component.open = true;
                  await elementUpdated(this.component);

                  const day = this.component.shadowRoot
                    ?.querySelector('.calendar')
                    ?.shadowRoot?.querySelector<HTMLButtonElement>('[data-date="2025-06-15"]');
                  if (!day) throw new Error('Expected calendar day button to render.');

                  day.click();
                  await elementUpdated(this.component);

                  expect(inputSpy.callCount).to.equal(1);
                  expect(changeSpy.callCount).to.equal(1);
                },
              },
              preservesPartialSegmentInput: {
                description: 'does not clear partially edited segments when the value becomes incomplete',
                test: async () => {
                  this.component.value = '2026-08-05';
                  await elementUpdated(this.component);

                  const day = this.segmentInput('day');
                  day.value = '';
                  day.dispatchEvent(new Event('input', { bubbles: true }));
                  await elementUpdated(this.component);

                  expect(day.value).to.equal('');
                  expect(this.component.value).to.equal('');
                },
              },
              popupHideSyncsOpenState: {
                description: 'closes the picker when the popup requests a close',
                test: async () => {
                  this.component.open = true;
                  await elementUpdated(this.component);

                  const popup = this.component.shadowRoot?.querySelector<HTMLElement & { hide(): void }>(
                    '[part="date-picker-popup"]'
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
                  >('[part="date-picker-popup"]');
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

                  const month = this.segmentInput('month');
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
                  this.component.value = '2025-06-15';
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
                  const month = this.segmentInput('month');
                  month.value = '08';
                  month.dispatchEvent(new Event('input', { bubbles: true }));
                  await elementUpdated(this.component);

                  const clear = this.component.shadowRoot?.querySelector<HTMLButtonElement>('.footer-clear');
                  if (!clear) throw new Error('Expected clear button to render.');
                  expect(clear.disabled).to.equal(false);

                  clear.click();
                  await elementUpdated(this.component);
                  expect(this.segmentInput('month').value).to.equal('');
                  expect(this.component.value).to.equal('');
                },
              },
              requiredShowsErrorMessageOnBlur: {
                description: 'shows the validation message after a required field is blurred',
                test: async () => {
                  this.component.required = true;
                  await elementUpdated(this.component);

                  const input = this.component.shadowRoot?.querySelector<HTMLInputElement>('#native-input');
                  if (!input) throw new Error('Expected native input to render.');
                  const reportValidity = sinon.spy(input, 'reportValidity');

                  const month = this.segmentInput('month');
                  month.focus();
                  month.blur();
                  await new Promise(resolve => requestAnimationFrame(resolve));
                  await elementUpdated(this.component);

                  const message = this.component.shadowRoot?.querySelector('.form-control-error-text-message');
                  expect(reportValidity).to.not.have.been.called;
                  expect(message?.textContent?.trim()).to.equal(input.validationMessage);
                  expect(message?.textContent?.trim()).to.not.equal('');
                },
              },
              requiredValidationFocusesVisibleSegment: {
                description: 'focuses a visible date segment when required validation is reported',
                test: async () => {
                  this.component.required = true;
                  await elementUpdated(this.component);
                  expect(this.component.reportValidity()).to.equal(false);
                  expect(this.component.shadowRoot?.activeElement).to.equal(this.segmentInput('month'));
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
