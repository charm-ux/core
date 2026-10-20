import { html, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import CharmFocusableElement from '../../base/focusable-element/charm-focusable-element.js';
import { keys } from '../../utilities/key-map.js';
import { normalizeLocale } from '../../utilities/locale.js';
import CoreIcon from '../icon/icon.js';
import styles from './calendar.styles.js';
import type { CharmElement } from '../../base/charm-element/charm-element.js';

export type CalendarSelectionMode = 'single' | 'range' | 'multiple';
export type CalendarValue = string | string[];

export interface CalendarChangeEventDetail {
  /** The selected date or dates, in `YYYY-MM-DD` format. */
  value: CalendarValue | undefined;
  /** The current selection mode. */
  selectionMode: CalendarSelectionMode;
}

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAYS_IN_WEEK = 7;

function createDate(year: number, month: number, day: number): Date {
  const date = new Date(0);
  date.setUTCFullYear(year, month, day);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

function parseDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;

  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) return undefined;

  const [, year, month, day] = match;
  const date = createDate(Number(year), Number(month) - 1, Number(day));

  return Number(year) > 0 &&
    date.getUTCFullYear() === Number(year) &&
    date.getUTCMonth() === Number(month) - 1 &&
    date.getUTCDate() === Number(day)
    ? date
    : undefined;
}

function toIsoDate(date: Date): string {
  const year = date.getUTCFullYear().toString().padStart(4, '0');
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function startOfMonth(date: Date): Date {
  return createDate(date.getUTCFullYear(), date.getUTCMonth(), 1);
}

function daysInMonth(date: Date): number {
  return createDate(date.getUTCFullYear(), date.getUTCMonth() + 1, 0).getUTCDate();
}

function addDays(date: Date, amount: number): Date {
  return createDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + amount);
}

function addMonths(date: Date, amount: number): Date {
  return createDate(date.getUTCFullYear(), date.getUTCMonth() + amount, 1);
}

function compareDates(first: Date, second: Date): number {
  return first.getTime() - second.getTime();
}

function rangeLengthDays(first: Date, second: Date): number {
  const start = compareDates(first, second) <= 0 ? first : second;
  const end = compareDates(first, second) <= 0 ? second : first;
  return Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
}

function todayDate(): Date {
  const today = new Date();
  return createDate(today.getFullYear(), today.getMonth(), today.getDate());
}

function localeFirstDay(locale: string): number {
  try {
    const localeInfo = new Intl.Locale(locale) as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number };
    };
    const firstDay = localeInfo.getWeekInfo?.().firstDay;
    return firstDay === undefined ? 0 : firstDay % DAYS_IN_WEEK;
  } catch {
    return 0;
  }
}

/**
 * An accessible calendar grid for selecting a date, a date range, or multiple separate dates.
 * The calendar is designed to work inline in forms and as the calendar surface inside a date-picker input.
 *
 * @tag ch-calendar
 * @since 0.6.0
 * @status beta
 *
 * @slot previous-month-label - Translated accessible name for the previous-month button.
 * @slot next-month-label - Translated accessible name for the next-month button.
 * @slot month-label - Translated label for the month selector.
 * @slot year-label - Translated label for the year field.
 * @slot day-YYYY-MM-DD - Optional content rendered inside a matching date cell.
 *
 * @event {CalendarChangeEventDetail} input - Emitted when a selection changes during interaction.
 * @event {CalendarChangeEventDetail} change - Emitted when a selection is committed. In range mode, this fires after the second date is selected.
 *
 * @csspart calendar-base - The calendar wrapper.
 * @csspart header - The month/year controls and navigation buttons.
 * @csspart previous - The previous-month button.
 * @csspart next - The next-month button.
 * @csspart month-select - The month selector.
 * @csspart year-input - The year input.
 * @csspart grid - The date grid.
 * @csspart weekday - A weekday heading.
 * @csspart day - A date button.
 * @csspart day-selected - A selected date or range endpoint.
 * @csspart day-range-inner - A date inside a selected range.
 * @csspart day-today - Today's date.
 * @csspart day-disabled - A disabled date.
 *
 * @cssprop --charm-calendar-day-fg-color - The default text color for day buttons.
 * @cssprop --charm-calendar-day-hover-bg-color - The background color of hovered, unselected day buttons.
 * @cssprop --charm-calendar-day-hover-fg-color - The text color of hovered, unselected day buttons.
 * @cssprop --charm-calendar-day-active-bg-color - The background color of pressed, unselected day buttons.
 * @cssprop --charm-calendar-day-active-fg-color - The text color of pressed, unselected day buttons.
 * @cssprop --charm-calendar-day-selected-bg-color - The background color of selected day buttons.
 * @cssprop --charm-calendar-day-selected-border-color - The border color of selected day buttons.
 * @cssprop --charm-calendar-day-selected-fg-color - The text color of selected day buttons.
 * @cssprop --charm-calendar-day-selected-hover-bg-color - The background color of hovered selected day buttons.
 * @cssprop --charm-calendar-day-selected-hover-border-color - The border color of hovered selected day buttons.
 * @cssprop --charm-calendar-day-selected-hover-fg-color - The text color of hovered selected day buttons.
 * @cssprop --charm-calendar-day-selected-active-bg-color - The background color of pressed selected day buttons.
 * @cssprop --charm-calendar-day-selected-active-border-color - The border color of pressed selected day buttons.
 * @cssprop --charm-calendar-day-selected-active-fg-color - The text color of pressed selected day buttons.
 * @cssprop --charm-calendar-day-range-bg-color - The background color of day buttons inside a selected range.
 * @cssprop --charm-calendar-day-range-fg-color - The text color of day buttons inside a selected range.
 * @cssprop --charm-calendar-day-today-border-color - The border color for today's day button.
 * @cssprop --charm-calendar-day-disabled-bg-color - The background color of unavailable day buttons.
 * @cssprop --charm-calendar-day-disabled-fg-color - The text color for unavailable day buttons.
 * @cssprop --charm-calendar-day-disabled-cursor - The cursor for unavailable day buttons.
 * @cssprop --charm-calendar-weekday-fg-color - The text color for weekday headings.
 * @cssprop --charm-calendar-weekday-font-size - The weekday heading font size.
 * @cssprop --charm-calendar-heading-navigation-fg-color - The text color for previous/next month buttons.
 * @cssprop --charm-calendar-heading-navigation-font-size - The month navigation button font size.
 * @cssprop --charm-calendar-heading-navigation-border-radius - The border radius of previous/next month buttons.
 * @cssprop --charm-calendar-heading-navigation-hover-bg-color - The hover background color for previous/next month buttons.
 * @cssprop --charm-calendar-heading-navigation-hover-fg-color - The hover text color for previous/next month buttons.
 * @cssprop --charm-calendar-heading-navigation-active-bg-color - The active background color for previous/next month buttons.
 * @cssprop --charm-calendar-heading-navigation-active-fg-color - The active text color for previous/next month buttons.
 * @cssprop --charm-calendar-heading-navigation-disabled-bg-color - The disabled background color for previous/next month buttons.
 * @cssprop --charm-calendar-heading-navigation-disabled-fg-color - The disabled text color for previous/next month buttons.
 * @cssprop --charm-calendar-heading-navigation-disabled-cursor - The disabled cursor for previous/next month buttons.
 * @cssprop --charm-calendar-heading-fg-color - The text color for the month/year controls.
 * @cssprop --charm-calendar-heading-font-size - The month/year heading font size.
 * @cssprop --charm-calendar-heading-disabled-bg-color - The disabled background color for month/year inputs.
 * @cssprop --charm-calendar-heading-disabled-fg-color - The disabled text color for month/year inputs.
 * @cssprop --charm-calendar-heading-disabled-cursor - The disabled cursor for month/year inputs.
 * @cssprop --charm-calendar-day-border-radius - The day button border radius.
 * @cssprop --charm-calendar-day-size - The inline and block size of day buttons.
 * @cssprop --charm-calendar-day-row-size - The block size of a calendar week row.
 * @cssprop --charm-calendar-day-font-size - The day button font size.
 *
 * @dependency CoreIcon
 */
export class CoreCalendar extends CharmFocusableElement {
  public static override styles = [...super.styles, styles];
  public static override baseName = 'calendar';

  /** Whether the calendar selects one date, a continuous range, or separate dates. */
  @property({ reflect: true, attribute: 'selection-mode' })
  public selectionMode: CalendarSelectionMode = 'single';

  /** The selected date (`YYYY-MM-DD`) or date list. Range values contain the start and end dates. */
  @property()
  public value?: CalendarValue;

  /** The date initially focused when the calendar has no selected value. */
  @property({ attribute: 'focus-date' })
  public focusDate?: string;

  /** The earliest selectable date, in `YYYY-MM-DD` format. */
  @property()
  public min?: string;

  /** The latest selectable date, in `YYYY-MM-DD` format. */
  @property()
  public max?: string;

  /** A comma- or whitespace-separated list of unavailable dates in `YYYY-MM-DD` format. */
  @property({ attribute: 'disabled-dates' })
  public disabledDates = '';

  /** A comma- or whitespace-separated list of unavailable weekdays, from 0 (Sunday) to 6 (Saturday). */
  @property({ attribute: 'disabled-week-days' })
  public disabledWeekDays = '';

  /** The first weekday, from 0 (Sunday) to 6 (Saturday). Defaults to the locale's first weekday. */
  @property({ attribute: 'first-day-of-week', type: Number })
  public firstDayOfWeek?: number;

  /** The visible format for weekday headings. */
  @property({ attribute: 'weekday-format' })
  public weekdayFormat: 'narrow' | 'short' | 'long' = 'short';

  /** The minimum allowed range length in days, inclusive of both start and end dates. `0` disables this constraint. */
  @property({ attribute: 'min-range', type: Number })
  public minRange = 0;

  /** The maximum allowed range length in days, inclusive of both start and end dates. `0` disables this constraint. */
  @property({ attribute: 'max-range', type: Number })
  public maxRange = 0;

  /** Prevents date selection and calendar navigation. */
  @property({ type: Boolean, reflect: true })
  public disabled = false;

  /** Prevents date selection while allowing navigation. */
  @property({ type: Boolean, reflect: true, attribute: 'readonly' })
  public readOnly = false;

  @state()
  private focusedDate = '';

  @state()
  private currentMonth = startOfMonth(todayDate());

  private minDate?: Date;

  private maxDate?: Date;

  private disabledDateSet = new Set<string>();

  private disabledWeekDaySet = new Set<number>();

  private skipValueFocusSync = false;

  public static override get dependencies(): (typeof CharmElement)[] {
    return [CoreIcon];
  }

  private get currentLocale(): string {
    return normalizeLocale(this.lang || navigator.language || 'en');
  }

  private get firstWeekday(): number {
    if (this.firstDayOfWeek !== undefined && this.firstDayOfWeek >= 0 && this.firstDayOfWeek <= 6) {
      return this.firstDayOfWeek;
    }
    return localeFirstDay(this.currentLocale);
  }

  private get focusedDateButton(): HTMLButtonElement | null {
    return this.shadowRoot?.querySelector<HTMLButtonElement>(`[data-date="${this.focusedDate}"]`) ?? null;
  }

  private get selectedDates(): Date[] {
    const values = Array.isArray(this.value)
      ? this.value
      : typeof this.value === 'string'
        ? this.selectionMode === 'range'
          ? this.value.split('/')
          : this.selectionMode === 'multiple'
            ? this.value.split(/[\s,]+/)
            : [this.value]
        : [];

    const dates = values.map(parseDate).filter((date): date is Date => date !== undefined);
    return this.selectionMode === 'multiple'
      ? [...new Set(dates.map(toIsoDate))].sort().map(value => parseDate(value)!)
      : dates;
  }

  private get monthLabel(): string {
    return new Intl.DateTimeFormat(this.currentLocale, {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(this.currentMonth);
  }

  private get monthOptions(): { value: number; label: string }[] {
    const formatter = new Intl.DateTimeFormat(this.currentLocale, { month: 'long', timeZone: 'UTC' });
    return Array.from({ length: 12 }, (_, month) => ({
      value: month,
      label: formatter.format(createDate(this.currentMonth.getUTCFullYear(), month, 1)),
    }));
  }

  private get weekdayOptions(): { label: string; fullLabel: string }[] {
    const start = createDate(2024, 0, 7 + this.firstWeekday);
    const formatter = new Intl.DateTimeFormat(this.currentLocale, { weekday: this.weekdayFormat, timeZone: 'UTC' });
    const fullFormatter = new Intl.DateTimeFormat(this.currentLocale, { weekday: 'long', timeZone: 'UTC' });

    return Array.from({ length: DAYS_IN_WEEK }, (_, index) => {
      const date = addDays(start, index);
      return { label: formatter.format(date), fullLabel: fullFormatter.format(date) };
    });
  }

  private get calendarDays(): (Date | undefined)[] {
    const first = startOfMonth(this.currentMonth);
    const offset = (first.getUTCDay() - this.firstWeekday + DAYS_IN_WEEK) % DAYS_IN_WEEK;
    const days = daysInMonth(first);
    const cellCount = Math.ceil((offset + days) / DAYS_IN_WEEK) * DAYS_IN_WEEK;

    return Array.from({ length: cellCount }, (_, index) => {
      const day = index - offset + 1;
      return day < 1 || day > days ? undefined : createDate(first.getUTCFullYear(), first.getUTCMonth(), day);
    });
  }

  private get changeEventDetail(): CalendarChangeEventDetail {
    return {
      value: Array.isArray(this.value) ? [...this.value] : this.value,
      selectionMode: this.selectionMode,
    };
  }

  /** Moves the visible calendar and keyboard focus to a date without selecting it. */
  public goToDate(value: string | Date): void {
    const date =
      typeof value === 'string' ? parseDate(value) : createDate(value.getFullYear(), value.getMonth(), value.getDate());
    if (date) this.setFocusedDate(date);
  }

  /** Focuses the currently active date in the grid. */
  public override focus(options?: FocusOptions): void {
    const activeDate = this.focusedDateButton;
    if (activeDate) {
      activeDate.focus(options);
    } else {
      super.focus(options);
    }
  }

  protected override willUpdate(changedProperties: PropertyValues<this>): void {
    super.willUpdate(changedProperties);
    if (!this.hasUpdated || changedProperties.has('disabled')) {
      this.setAttribute('aria-disabled', String(this.disabled));
    }

    if (!this.hasUpdated || changedProperties.has('min')) this.minDate = parseDate(this.min);
    if (!this.hasUpdated || changedProperties.has('max')) this.maxDate = parseDate(this.max);
    if (!this.hasUpdated || changedProperties.has('disabledDates')) {
      this.disabledDateSet = new Set(this.disabledDates.split(/[\s,]+/).filter(Boolean));
    }
    if (!this.hasUpdated || changedProperties.has('disabledWeekDays')) {
      this.disabledWeekDaySet = new Set(
        this.disabledWeekDays
          .split(/[\s,]+/)
          .filter(Boolean)
          .map(Number)
          .filter(day => Number.isInteger(day) && day >= 0 && day <= 6)
      );
    }

    const shouldSyncFromValue = changedProperties.has('value') && !this.skipValueFocusSync;
    const shouldInitialize =
      !this.hasUpdated ||
      changedProperties.has('focusDate') ||
      changedProperties.has('selectionMode') ||
      changedProperties.has('min') ||
      changedProperties.has('max') ||
      changedProperties.has('disabled') ||
      changedProperties.has('disabledDates') ||
      changedProperties.has('disabledWeekDays');

    if (shouldSyncFromValue || shouldInitialize) this.initializeFocusedDate(shouldSyncFromValue);
    this.skipValueFocusSync = false;
  }

  /** Generates the month and year controls. */
  protected headerTemplate() {
    const previousMonth = addMonths(this.currentMonth, -1);
    const nextMonth = addMonths(this.currentMonth, 1);

    return this.html`
      <div class="header" part="header">
        <button
          type="button"
          class="navigation-button previous"
          part="previous"
          ?disabled=${this.disabled || this.isMonthOutsideRange(previousMonth)}
          @click=${this.handlePreviousMonth}
        >
          <scoped-icon name="chevron-left"></scoped-icon>
          <span class="visually-hidden"><slot name="previous-month-label">Previous month</slot></span>
        </button>
        <div class="date-controls">
          <label class="visually-hidden" for="month-select"><slot name="month-label">Month</slot></label>
          <select
            id="month-select"
            part="month-select"
            .value=${this.currentMonth.getUTCMonth().toString()}
            ?disabled=${this.disabled}
            @change=${this.handleMonthChange}
          >
            ${this.monthOptions.map(option => html`<option value=${option.value}>${option.label}</option>`)}
          </select>
          <label class="visually-hidden" for="year-input"><slot name="year-label">Year</slot></label>
          <input
            id="year-input"
            part="year-input"
            type="number"
            min="1"
            max="9999"
            .value=${this.currentMonth.getUTCFullYear().toString()}
            ?disabled=${this.disabled}
            @change=${this.handleYearChange}
          />
        </div>
        <button
          type="button"
          class="navigation-button next"
          part="next"
          ?disabled=${this.disabled || this.isMonthOutsideRange(nextMonth)}
          @click=${this.handleNextMonth}
        >
          <scoped-icon name="chevron-right"></scoped-icon>
          <span class="visually-hidden"><slot name="next-month-label">Next month</slot></span>
        </button>
      </div>
    `;
  }

  /** Generates the weekday headings and month-sized date grid. */
  protected gridTemplate() {
    const monthLabel = this.monthLabel;
    const calendarDays = this.calendarDays;
    const selectedDates = this.selectedDates;
    const todayValue = toIsoDate(todayDate());
    const dateFormatter = new Intl.DateTimeFormat(this.currentLocale, { dateStyle: 'full', timeZone: 'UTC' });

    return html`
      <h2 id="calendar-heading" class="visually-hidden">${monthLabel}</h2>
      <table class="grid" part="grid" role="grid" aria-labelledby="calendar-heading" aria-readonly=${this.readOnly}>
        <thead role="rowgroup">
          <tr role="row">
            ${this.weekdayOptions.map(
              weekday => html`
                <th role="columnheader" scope="col" part="weekday" aria-label=${weekday.fullLabel}>${weekday.label}</th>
              `
            )}
          </tr>
        </thead>
        <tbody role="rowgroup">
          ${Array.from({ length: calendarDays.length / DAYS_IN_WEEK }, (_, week) => {
            const days = calendarDays.slice(week * DAYS_IN_WEEK, (week + 1) * DAYS_IN_WEEK);
            return html`<tr role="row">
              ${days.map(date => this.dayTemplate(date, selectedDates, todayValue, dateFormatter))}
            </tr>`;
          })}
        </tbody>
      </table>
    `;
  }

  /** Generates one date cell. */
  protected dayTemplate(
    date: Date | undefined,
    selectedDates: Date[],
    todayValue: string,
    dateFormatter: Intl.DateTimeFormat
  ) {
    if (!date) return html`<td role="gridcell"></td>`;

    const isoDate = toIsoDate(date);
    const selected = this.isSelected(date, selectedDates);
    const isToday = isoDate === todayValue;
    const isDisabled = this.isDateDisabled(date, selectedDates);
    const rangePart = this.rangePart(date, selectedDates);
    const parts = [
      'day',
      selected ? 'day-selected' : '',
      rangePart,
      isToday ? 'day-today' : '',
      isDisabled ? 'day-disabled' : '',
    ]
      .filter(Boolean)
      .join(' ');
    const label = dateFormatter.format(date);
    const hasRange =
      this.selectionMode === 'range' &&
      selectedDates.length > 1 &&
      toIsoDate(selectedDates[0]!) !== toIsoDate(selectedDates[1]!);
    const weekColumn = (date.getUTCDay() - this.firstWeekday + DAYS_IN_WEEK) % DAYS_IN_WEEK;
    const startsRow = weekColumn === 0 || date.getUTCDate() === 1;
    const endsRow = weekColumn === DAYS_IN_WEEK - 1 || date.getUTCDate() === daysInMonth(date);

    return html`
      <td
        class=${classMap({
          'range-inner-cell': hasRange && rangePart === 'day-range-inner',
          'range-start-cell': hasRange && rangePart === 'day-range-start',
          'range-end-cell': hasRange && rangePart === 'day-range-end',
          'range-row-start': hasRange && startsRow,
          'range-row-end': hasRange && endsRow,
        })}
        role="gridcell"
        aria-selected=${selected}
        aria-current=${ifDefined(isToday ? 'date' : undefined)}
      >
        <button
          type="button"
          part=${parts}
          class=${classMap({
            day: true,
            selected,
            'range-inner': hasRange && rangePart === 'day-range-inner',
            'range-start': hasRange && rangePart === 'day-range-start',
            'range-end': hasRange && rangePart === 'day-range-end',
            today: isToday,
            disabled: isDisabled,
          })}
          data-date=${isoDate}
          aria-label=${label}
          aria-pressed=${ifDefined(this.selectionMode === 'multiple' ? String(selected) : undefined)}
          tabindex=${this.focusedDate === isoDate && !isDisabled ? 0 : -1}
          ?disabled=${isDisabled}
          @click=${() => this.handleDayClick(date)}
          @keydown=${(event: KeyboardEvent) => this.handleDayKeyDown(date, event)}
        >
          <slot name=${`day-${isoDate}`}>${date.getUTCDate()}</slot>
        </button>
      </td>
    `;
  }

  /** Generates the calendar wrapper. */
  protected calendarTemplate() {
    return html`<div class="calendar-base" part="calendar-base" lang=${this.currentLocale}>
      ${this.headerTemplate()} ${this.gridTemplate()}
    </div>`;
  }

  protected override render() {
    return this.calendarTemplate();
  }

  private initializeFocusedDate(preferValue: boolean): void {
    const selectedDate = preferValue ? this.selectedDates[0] : undefined;
    const initialDate =
      (preferValue ? selectedDate : undefined) ?? parseDate(this.focusDate) ?? selectedDate ?? todayDate();

    this.setFocusedDate(initialDate);
  }

  private isDateDisabled(date: Date, selected = this.selectedDates): boolean {
    if (this.disabled) return true;

    const isoDate = toIsoDate(date);

    const blockedByBaseRules =
      (this.minDate !== undefined && compareDates(date, this.minDate) < 0) ||
      (this.maxDate !== undefined && compareDates(date, this.maxDate) > 0) ||
      this.disabledDateSet.has(isoDate) ||
      this.disabledWeekDaySet.has(date.getUTCDay());

    if (blockedByBaseRules) return true;

    if (this.selectionMode !== 'range' || selected.length !== 1) return false;

    const anchor = selected[0]!;
    if (toIsoDate(anchor) === isoDate) return false;

    const length = rangeLengthDays(anchor, date);
    const minRange = Number.isFinite(this.minRange) && this.minRange > 0 ? this.minRange : 0;
    const maxRange = Number.isFinite(this.maxRange) && this.maxRange > 0 ? this.maxRange : 0;

    if (minRange > 0 && length < minRange) return true;
    if (maxRange > 0 && length > maxRange) return true;

    return false;
  }

  private setFocusedDate(date: Date): void {
    let nextDate = date;

    if (this.minDate && compareDates(nextDate, this.minDate) < 0) nextDate = this.minDate;
    if (this.maxDate && compareDates(nextDate, this.maxDate) > 0) nextDate = this.maxDate;

    let attempts = 0;
    while (this.isDateDisabled(nextDate) && attempts < 366) {
      nextDate = addDays(nextDate, 1);
      if (this.maxDate && compareDates(nextDate, this.maxDate) > 0) return;
      attempts++;
    }

    if (this.isDateDisabled(nextDate)) return;

    this.focusedDate = toIsoDate(nextDate);
    this.currentMonth = startOfMonth(nextDate);
  }

  private isMonthOutsideRange(month: Date): boolean {
    const first = startOfMonth(month);
    const last = createDate(first.getUTCFullYear(), first.getUTCMonth() + 1, 0);
    return Boolean(
      (this.minDate && compareDates(last, this.minDate) < 0) || (this.maxDate && compareDates(first, this.maxDate) > 0)
    );
  }

  private isSelected(date: Date, selected = this.selectedDates): boolean {
    const isoDate = toIsoDate(date);

    if (this.selectionMode === 'single' || this.selectionMode === 'multiple') {
      return selected.some(item => toIsoDate(item) === isoDate);
    }

    if (selected.length === 1) return toIsoDate(selected[0]!) === isoDate;
    if (selected.length < 2) return false;

    const start = selected[0]!;
    const end = selected[1]!;
    return compareDates(date, start) >= 0 && compareDates(date, end) <= 0;
  }

  private rangePart(date: Date, selected: Date[]): string {
    if (this.selectionMode !== 'range') return '';

    if (selected.length === 0) return '';

    const isoDate = toIsoDate(date);
    if (isoDate === toIsoDate(selected[0]!)) return 'day-range-start';
    if (selected.length > 1 && isoDate === toIsoDate(selected[1]!)) return 'day-range-end';
    return selected.length > 1 && this.isSelected(date, selected) ? 'day-range-inner' : '';
  }

  private handleMonthChange(event: Event): void {
    const month = Number((event.currentTarget as HTMLSelectElement).value);
    const day = this.focusedDate ? (parseDate(this.focusedDate)?.getUTCDate() ?? 1) : 1;
    const selectedMonth = createDate(this.currentMonth.getUTCFullYear(), month, 1);
    this.setFocusedDate(createDate(selectedMonth.getUTCFullYear(), month, Math.min(day, daysInMonth(selectedMonth))));
  }

  private handleYearChange(event: Event): void {
    const yearInput = event.currentTarget as HTMLInputElement;
    const year = Number(yearInput.value);
    if (!Number.isInteger(year) || year < 1 || year > 9999) {
      yearInput.value = this.currentMonth.getUTCFullYear().toString();
      return;
    }

    const day = this.focusedDate ? (parseDate(this.focusedDate)?.getUTCDate() ?? 1) : 1;
    const selectedMonth = createDate(year, this.currentMonth.getUTCMonth(), 1);
    this.setFocusedDate(createDate(year, selectedMonth.getUTCMonth(), Math.min(day, daysInMonth(selectedMonth))));
  }

  private handlePreviousMonth(): void {
    this.changeMonth(-1);
  }

  private handleNextMonth(): void {
    this.changeMonth(1);
  }

  private changeMonth(amount: number): void {
    const targetMonth = addMonths(this.currentMonth, amount);
    if (this.disabled || this.isMonthOutsideRange(targetMonth)) return;

    const focused = parseDate(this.focusedDate) ?? this.currentMonth;
    const day = Math.min(focused.getUTCDate(), daysInMonth(targetMonth));
    this.setFocusedDate(createDate(targetMonth.getUTCFullYear(), targetMonth.getUTCMonth(), day));
  }

  private handleDayKeyDown(date: Date, event: KeyboardEvent): void {
    if (this.disabled) return;

    const dateValue = parseDate(toIsoDate(date));
    if (!dateValue) return;

    let target: Date;
    const horizontalStep = this.resolvedDir === 'rtl' ? -1 : 1;

    switch (event.key) {
      case keys.ArrowRight:
        target = addDays(dateValue, horizontalStep);
        break;
      case keys.ArrowLeft:
        target = addDays(dateValue, -horizontalStep);
        break;
      case keys.ArrowDown:
        target = addDays(dateValue, DAYS_IN_WEEK);
        break;
      case keys.ArrowUp:
        target = addDays(dateValue, -DAYS_IN_WEEK);
        break;
      case keys.Home: {
        const offset = (dateValue.getUTCDay() - this.firstWeekday + DAYS_IN_WEEK) % DAYS_IN_WEEK;
        target = addDays(dateValue, -offset);
        break;
      }
      case keys.End: {
        const offset = (dateValue.getUTCDay() - this.firstWeekday + DAYS_IN_WEEK) % DAYS_IN_WEEK;
        target = addDays(dateValue, DAYS_IN_WEEK - offset - 1);
        break;
      }
      case keys.PageUp:
        target = this.pageDate(dateValue, event.shiftKey ? -12 : -1);
        break;
      case keys.PageDown:
        target = this.pageDate(dateValue, event.shiftKey ? 12 : 1);
        break;
      default:
        return;
    }

    event.preventDefault();
    const step = compareDates(target, dateValue) >= 0 ? 1 : -1;
    let attempts = 0;
    while (this.isDateDisabled(target, this.selectedDates) && attempts < 366) {
      target = addDays(target, step);
      attempts++;
    }

    if (this.isDateDisabled(target, this.selectedDates)) return;
    this.setFocusedDate(target);
    void this.updateComplete.then(() => this.focusedDateButton?.focus());
  }

  private pageDate(date: Date, amount: number): Date {
    const targetMonth = addMonths(date, amount);
    return createDate(
      targetMonth.getUTCFullYear(),
      targetMonth.getUTCMonth(),
      Math.min(date.getUTCDate(), daysInMonth(targetMonth))
    );
  }

  private handleDayClick(date: Date): void {
    if (this.disabled || this.readOnly || this.isDateDisabled(date, this.selectedDates)) return;

    const isoDate = toIsoDate(date);
    const selected = this.selectedDates.map(toIsoDate);
    let nextValue: CalendarValue;
    let isSelectionComplete = true;

    if (this.selectionMode === 'multiple') {
      const nextDates = new Set(selected);
      if (nextDates.has(isoDate)) {
        nextDates.delete(isoDate);
      } else {
        nextDates.add(isoDate);
      }
      nextValue = [...nextDates].sort();
    } else if (this.selectionMode === 'range') {
      if (selected.length === 1) {
        nextValue = [selected[0]!, isoDate].sort();
      } else {
        nextValue = [isoDate];
        isSelectionComplete = false;
      }
    } else {
      if (selected[0] === isoDate) return;
      nextValue = isoDate;
    }

    this.skipValueFocusSync = true;
    this.value = nextValue;
    this.focusedDate = isoDate;
    this.currentMonth = startOfMonth(date);
    this.emitInput();
    if (isSelectionComplete) this.emitChange();
  }

  private emitInput(): void {
    this.emit('input', { detail: this.changeEventDetail });
  }

  private emitChange(): void {
    this.emit('change', { detail: this.changeEventDetail });
  }
}

export default CoreCalendar;
