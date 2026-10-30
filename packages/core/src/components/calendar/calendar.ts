import { html, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import CharmFocusableElement from '../../base/focusable-element/charm-focusable-element.js';
import { LocaleController } from '../../controller/locale.js';
import {
  addDays,
  addMonths,
  addMonthsClamped,
  clampDate,
  compareDates,
  createDateConstraints,
  createUtcDate,
  DAYS_IN_WEEK,
  daysInMonth,
  formatMonthYear,
  getFullDateFormatter,
  getLocaleFirstDay,
  getMonthNames,
  getWeekdayNames,
  isDateUnavailable,
  normalizeRangeBounds,
  parseIsoDate,
  rangeLengthDays,
  startOfMonth,
  todayDate,
  toIsoDate,
} from '../../internal/date.js';
import { keys } from '../../utilities/key-map.js';
import CoreIcon from '../icon/icon.js';
import styles from './calendar.styles.js';
import type { CharmElement } from '../../base/charm-element/charm-element.js';
import type { DateConstraints } from '../../internal/date.js';

export type CalendarSelectionMode = 'single' | 'range' | 'multiple';
export type CalendarValue = string | string[];

export interface CalendarChangeEventDetail {
  /** The selected date or dates, in `YYYY-MM-DD` format. */
  value: CalendarValue | undefined;
  /** The current selection mode. */
  selectionMode: CalendarSelectionMode;
}

interface CalendarDayContext {
  readonly selected: readonly Date[];
  readonly selectedIso: ReadonlySet<string>;
  readonly rangeStart?: string;
  readonly rangeEnd?: string;
  readonly today: string;
  readonly dateFormatter: Intl.DateTimeFormat;
  readonly firstWeekday: number;
  readonly hasRange: boolean;
  readonly lastDayOfMonth: number;
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

  protected currentMonth = startOfMonth(todayDate());
  protected focusedDate = '';
  protected initializingFocus = false;
  protected readonly localeController = new LocaleController(this);
  protected constraints: DateConstraints = createDateConstraints();
  protected skipValueFocusSync = false;

  public static override get dependencies(): (typeof CharmElement)[] {
    return [CoreIcon];
  }

  protected get currentLocale(): string {
    return this.localeController.locale;
  }

  protected get firstWeekday(): number {
    if (this.firstDayOfWeek !== undefined && this.firstDayOfWeek >= 0 && this.firstDayOfWeek <= 6) {
      return this.firstDayOfWeek;
    }
    return getLocaleFirstDay(this.currentLocale);
  }

  protected get focusedDateButton(): HTMLButtonElement | null {
    return this.shadowRoot?.querySelector<HTMLButtonElement>(`[data-date="${this.focusedDate}"]`) ?? null;
  }

  protected get selectedDates(): Date[] {
    const values = Array.isArray(this.value)
      ? this.value
      : typeof this.value === 'string'
        ? this.selectionMode === 'range'
          ? this.value.split('/')
          : this.selectionMode === 'multiple'
            ? this.value.split(/[\s,]+/)
            : [this.value]
        : [];

    const dates = values.map(parseIsoDate).filter((date): date is Date => date !== undefined);
    if (this.selectionMode !== 'multiple') return dates;

    const unique = new Map(dates.map(date => [date.getTime(), date]));
    return [...unique.values()].sort(compareDates);
  }

  protected get monthLabel(): string {
    return formatMonthYear(this.currentLocale, this.currentMonth);
  }

  protected get monthOptions(): { value: number; label: string }[] {
    return getMonthNames(this.currentLocale).map((label, value) => ({ value, label }));
  }

  protected get weekdayOptions(): { label: string; fullLabel: string }[] {
    const names = getWeekdayNames(this.currentLocale, this.weekdayFormat);
    const start = this.firstWeekday;
    return Array.from({ length: DAYS_IN_WEEK }, (_, index) => names[(start + index) % DAYS_IN_WEEK]!);
  }

  protected get calendarDays(): (Date | undefined)[] {
    const first = startOfMonth(this.currentMonth);
    const offset = (first.getUTCDay() - this.firstWeekday + DAYS_IN_WEEK) % DAYS_IN_WEEK;
    const days = daysInMonth(first);
    const cellCount = Math.ceil((offset + days) / DAYS_IN_WEEK) * DAYS_IN_WEEK;

    return Array.from({ length: cellCount }, (_, index) => {
      const day = index - offset + 1;
      return day < 1 || day > days ? undefined : addDays(first, day - 1);
    });
  }

  protected get changeEventDetail(): CalendarChangeEventDetail {
    return {
      value: Array.isArray(this.value) ? [...this.value] : this.value,
      selectionMode: this.selectionMode,
    };
  }

  /** Moves the visible calendar and keyboard focus to a date without selecting it. Date arguments use their local calendar day. */
  public goToDate(value: string | Date): void {
    const date =
      typeof value === 'string'
        ? parseIsoDate(value)
        : createUtcDate(value.getFullYear(), value.getMonth(), value.getDate());
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

    const constraintsChanged =
      !this.hasUpdated ||
      changedProperties.has('min') ||
      changedProperties.has('max') ||
      changedProperties.has('disabledDates') ||
      changedProperties.has('disabledWeekDays');

    if (constraintsChanged) {
      this.constraints = createDateConstraints(this.min, this.max, this.disabledDates, this.disabledWeekDays);
    }

    const shouldSyncFromValue = changedProperties.has('value') && !this.skipValueFocusSync;
    const shouldInitialize =
      !this.hasUpdated ||
      changedProperties.has('focusDate') ||
      changedProperties.has('selectionMode') ||
      constraintsChanged ||
      changedProperties.has('disabled');

    if (shouldSyncFromValue || shouldInitialize) {
      this.initializingFocus = true;
      this.initializeFocusedDate(shouldSyncFromValue);
      this.initializingFocus = false;
    }
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
            ?disabled=${this.disabled}
            @change=${this.handleMonthChange}
            @input=${this.stopNativeInput}
          >
            ${this.monthOptions.map(
              option =>
                html`<option value=${option.value} ?selected=${option.value === this.currentMonth.getUTCMonth()}>
                  ${option.label}
                </option>`
            )}
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
            @input=${this.stopNativeInput}
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
    const context = this.createDayContext();

    return html`
      <h2 id="calendar-heading" class="visually-hidden" aria-live=${this.hasUpdated ? 'polite' : 'off'}>
        ${monthLabel}
      </h2>
      <table
        class="grid"
        part="grid"
        role="grid"
        aria-labelledby="calendar-heading"
        aria-readonly=${this.readOnly}
        aria-multiselectable=${ifDefined(this.selectionMode === 'single' ? undefined : 'true')}
        @click=${this.handleGridClick}
        @keydown=${this.handleGridKeyDown}
      >
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
              ${days.map(date => this.dayTemplate(date, context))}
            </tr>`;
          })}
        </tbody>
      </table>
    `;
  }

  /** Generates one date cell. */
  protected dayTemplate(date: Date | undefined, context: CalendarDayContext) {
    if (!date) return html`<td role="gridcell"></td>`;

    const isoDate = toIsoDate(date);
    const isRange = this.selectionMode === 'range';
    const selected = isRange
      ? context.rangeStart !== undefined &&
        (isoDate === context.rangeStart ||
          (context.rangeEnd !== undefined && isoDate > context.rangeStart && isoDate <= context.rangeEnd))
      : context.selectedIso.has(isoDate);
    const rangePart =
      !isRange || context.rangeStart === undefined
        ? ''
        : isoDate === context.rangeStart
          ? 'day-range-start'
          : context.rangeEnd !== undefined && isoDate === context.rangeEnd
            ? 'day-range-end'
            : selected
              ? 'day-range-inner'
              : '';
    const isToday = isoDate === context.today;
    const isDisabled = this.isDateDisabled(date, context.selected);
    const parts = [
      'day',
      selected ? 'day-selected' : '',
      rangePart,
      isToday ? 'day-today' : '',
      isDisabled ? 'day-disabled' : '',
    ]
      .filter(Boolean)
      .join(' ');
    const weekColumn = (date.getUTCDay() - context.firstWeekday + DAYS_IN_WEEK) % DAYS_IN_WEEK;
    const startsRow = weekColumn === 0 || date.getUTCDate() === 1;
    const endsRow = weekColumn === DAYS_IN_WEEK - 1 || date.getUTCDate() === context.lastDayOfMonth;

    return html`
      <td
        class=${classMap({
          'range-inner-cell': context.hasRange && rangePart === 'day-range-inner',
          'range-start-cell': context.hasRange && rangePart === 'day-range-start',
          'range-end-cell': context.hasRange && rangePart === 'day-range-end',
          'range-row-start': context.hasRange && startsRow,
          'range-row-end': context.hasRange && endsRow,
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
            'range-inner': context.hasRange && rangePart === 'day-range-inner',
            'range-start': context.hasRange && rangePart === 'day-range-start',
            'range-end': context.hasRange && rangePart === 'day-range-end',
            today: isToday,
            disabled: isDisabled,
          })}
          data-date=${isoDate}
          aria-label=${context.dateFormatter.format(date)}
          tabindex=${this.focusedDate === isoDate && !isDisabled ? 0 : -1}
          ?disabled=${isDisabled}
        >
          <slot name=${`day-${isoDate}`}>${date.getUTCDate()}</slot>
        </button>
      </td>
    `;
  }

  /** Generates the calendar wrapper. */
  protected calendarTemplate() {
    return this.html`<div class="calendar-base" part="calendar-base" lang=${this.currentLocale}>
      ${this.headerTemplate()} ${this.gridTemplate()}
    </div>`;
  }

  protected override render() {
    return this.calendarTemplate();
  }

  protected createDayContext(): CalendarDayContext {
    const selected = this.selectedDates;
    let rangeStart: string | undefined;
    let rangeEnd: string | undefined;

    if (this.selectionMode === 'range' && selected.length > 0) {
      const isoDates = selected.slice(0, 2).map(toIsoDate).sort();
      rangeStart = isoDates[0];
      rangeEnd = isoDates[1];
    }

    return {
      selected,
      selectedIso: new Set(selected.map(toIsoDate)),
      rangeStart,
      rangeEnd,
      today: toIsoDate(todayDate()),
      dateFormatter: getFullDateFormatter(this.currentLocale),
      firstWeekday: this.firstWeekday,
      hasRange: rangeStart !== undefined && rangeEnd !== undefined && rangeStart !== rangeEnd,
      lastDayOfMonth: daysInMonth(this.currentMonth),
    };
  }

  protected initializeFocusedDate(preferValue: boolean): void {
    const selectedDate = preferValue ? this.selectedDates[0] : undefined;
    const initialDate =
      (preferValue ? selectedDate : undefined) ?? parseIsoDate(this.focusDate) ?? selectedDate ?? todayDate();

    this.setFocusedDate(initialDate);
  }

  protected isDateDisabled(date: Date, selected: readonly Date[] = this.selectedDates): boolean {
    if (this.disabled) return true;
    if (isDateUnavailable(date, this.constraints)) return true;

    if (this.selectionMode !== 'range' || selected.length !== 1) return false;

    const isoDate = toIsoDate(date);
    const anchor = selected[0]!;
    if (toIsoDate(anchor) === isoDate) return false;

    const { min, max } = normalizeRangeBounds(this.minRange, this.maxRange);
    const length = rangeLengthDays(anchor, date);

    if (min > 0 && length < min) return true;
    if (max > 0 && length > max) return true;

    return false;
  }

  protected setFocusedDate(date: Date): void {
    let nextDate = clampDate(date, this.constraints);

    if (!this.disabled) {
      const selected = this.selectedDates;
      let attempts = 0;
      while (this.isDateDisabled(nextDate, selected) && attempts < 366) {
        nextDate = addDays(nextDate, 1);
        if (compareDates(nextDate, this.constraints.maxDate) > 0) break;
        attempts++;
      }

      if (this.isDateDisabled(nextDate, selected)) {
        nextDate = clampDate(date, this.constraints);
        attempts = 0;
        while (this.isDateDisabled(nextDate, selected) && attempts < 366) {
          nextDate = addDays(nextDate, -1);
          if (compareDates(nextDate, this.constraints.minDate) < 0) return;
          attempts++;
        }
        if (this.isDateDisabled(nextDate, selected)) return;
      }
    }

    this.focusedDate = toIsoDate(nextDate);
    const nextMonth = startOfMonth(nextDate);

    if (this.currentMonth.getTime() !== nextMonth.getTime()) {
      this.currentMonth = nextMonth;
      if (!this.initializingFocus) this.requestUpdate();
    } else if (!this.isUpdatePending) {
      this.updateRovingTabIndex();
    }
  }

  protected updateRovingTabIndex(): void {
    if (!this.shadowRoot) return;

    for (const button of this.shadowRoot.querySelectorAll<HTMLButtonElement>('[data-date]')) {
      button.tabIndex = button.dataset.date === this.focusedDate && !button.disabled ? 0 : -1;
    }
  }

  protected isMonthOutsideRange(month: Date): boolean {
    const first = startOfMonth(month);
    const last = createUtcDate(first.getUTCFullYear(), first.getUTCMonth() + 1, 0);
    return compareDates(last, this.constraints.minDate) < 0 || compareDates(first, this.constraints.maxDate) > 0;
  }

  protected handleMonthChange(event: Event): void {
    const month = Number((event.currentTarget as HTMLSelectElement).value);
    const focused = parseIsoDate(this.focusedDate) ?? this.currentMonth;
    const targetMonth = createUtcDate(this.currentMonth.getUTCFullYear(), month, 1);
    this.setFocusedDate(
      createUtcDate(
        targetMonth.getUTCFullYear(),
        targetMonth.getUTCMonth(),
        Math.min(focused.getUTCDate(), daysInMonth(targetMonth))
      )
    );
  }

  protected handleYearChange(event: Event): void {
    const yearInput = event.currentTarget as HTMLInputElement;
    const year = Number(yearInput.value);
    if (!Number.isInteger(year) || year < 1 || year > 9999) {
      yearInput.value = this.currentMonth.getUTCFullYear().toString();
      return;
    }

    const focused = parseIsoDate(this.focusedDate) ?? this.currentMonth;
    const targetMonth = createUtcDate(year, this.currentMonth.getUTCMonth(), 1);
    this.setFocusedDate(
      createUtcDate(year, targetMonth.getUTCMonth(), Math.min(focused.getUTCDate(), daysInMonth(targetMonth)))
    );
  }

  protected handlePreviousMonth(): void {
    this.changeMonth(-1);
  }

  protected handleNextMonth(): void {
    this.changeMonth(1);
  }

  protected changeMonth(amount: number): void {
    const targetMonth = addMonths(this.currentMonth, amount);
    if (this.disabled || this.isMonthOutsideRange(targetMonth)) return;

    const focused = parseIsoDate(this.focusedDate) ?? this.currentMonth;
    this.setFocusedDate(addMonthsClamped(focused, amount));
  }

  protected handleDayKeyDown(date: Date, event: KeyboardEvent): void {
    if (this.disabled) return;

    let target: Date;
    const horizontalStep = this.resolvedDir === 'rtl' ? -1 : 1;

    switch (event.key) {
      case keys.ArrowRight:
        target = addDays(date, horizontalStep);
        break;
      case keys.ArrowLeft:
        target = addDays(date, -horizontalStep);
        break;
      case keys.ArrowDown:
        target = addDays(date, DAYS_IN_WEEK);
        break;
      case keys.ArrowUp:
        target = addDays(date, -DAYS_IN_WEEK);
        break;
      case keys.Home: {
        const offset = (date.getUTCDay() - this.firstWeekday + DAYS_IN_WEEK) % DAYS_IN_WEEK;
        target = addDays(date, -offset);
        break;
      }
      case keys.End: {
        const offset = (date.getUTCDay() - this.firstWeekday + DAYS_IN_WEEK) % DAYS_IN_WEEK;
        target = addDays(date, DAYS_IN_WEEK - offset - 1);
        break;
      }
      case keys.PageUp:
        target = addMonthsClamped(date, event.shiftKey ? -12 : -1);
        break;
      case keys.PageDown:
        target = addMonthsClamped(date, event.shiftKey ? 12 : 1);
        break;
      default:
        return;
    }

    event.preventDefault();
    const selected = this.selectedDates;
    const direction = compareDates(target, date) >= 0 ? 1 : -1;
    const isWeekJump = event.key === keys.Home || event.key === keys.End;
    const weekStart = addDays(date, -((date.getUTCDay() - this.firstWeekday + DAYS_IN_WEEK) % DAYS_IN_WEEK));
    const weekEnd = addDays(weekStart, DAYS_IN_WEEK - 1);
    const { minDate, maxDate } = this.constraints;
    const minBound = isWeekJump && compareDates(minDate, weekStart) <= 0 ? weekStart : minDate;
    const maxBound = isWeekJump && compareDates(maxDate, weekEnd) >= 0 ? weekEnd : maxDate;
    if (isWeekJump && compareDates(minBound, maxBound) > 0) return;

    const search = (start: Date, step: number, limit: number): Date | undefined => {
      let candidate = start;
      for (let attempt = 0; attempt < limit; attempt++) {
        if (
          compareDates(candidate, minBound) >= 0 &&
          compareDates(candidate, maxBound) <= 0 &&
          !this.isDateDisabled(candidate, selected)
        )
          return candidate;
        candidate = addDays(candidate, step);
        if (compareDates(candidate, minBound) < 0 || compareDates(candidate, maxBound) > 0) return undefined;
      }
      return undefined;
    };

    target = clampDate(target, this.constraints);
    const primaryStep = isWeekJump ? (event.key === keys.Home ? 1 : -1) : direction;
    const candidate =
      search(target, primaryStep, isWeekJump ? DAYS_IN_WEEK : 366) ??
      (isWeekJump || event.key === keys.PageUp || event.key === keys.PageDown
        ? search(target, -primaryStep, isWeekJump ? DAYS_IN_WEEK : 366)
        : undefined);
    if (!candidate) return;
    target = candidate;
    this.setFocusedDate(target);
    void this.updateComplete.then(() => this.focusedDateButton?.focus());
  }

  protected handleDayClick(date: Date): void {
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
        if (selected[0] === isoDate && normalizeRangeBounds(this.minRange, this.maxRange).min > 1) {
          nextValue = [isoDate];
          isSelectionComplete = false;
        } else {
          nextValue = [selected[0]!, isoDate].sort();
        }
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
    this.setFocusedDate(date);
    this.emitInput();
    if (isSelectionComplete) this.emitChange();
  }

  protected handleGridClick(event: MouseEvent): void {
    const date = this.dateFromEvent(event);
    if (date) this.handleDayClick(date);
  }

  protected handleGridKeyDown(event: KeyboardEvent): void {
    const date = this.dateFromEvent(event);
    if (date) this.handleDayKeyDown(date, event);
  }

  protected dateFromEvent(event: Event): Date | undefined {
    for (const node of event.composedPath()) {
      if (node instanceof HTMLElement && node.dataset.date) return parseIsoDate(node.dataset.date);
    }
    return undefined;
  }

  protected emitInput(): void {
    this.emit('input', { detail: this.changeEventDetail });
  }

  protected emitChange(): void {
    this.emit('change', { detail: this.changeEventDetail });
  }

  protected stopNativeInput(event: Event): void {
    event.stopPropagation();
  }
}

export default CoreCalendar;
