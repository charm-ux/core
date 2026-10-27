/**
 * @internal Shared civil-date helpers for date components. All dates are UTC-midnight so
 * comparisons and arithmetic are independent of the host time zone and DST.
 */

export type DateSegmentKind = 'day' | 'month' | 'year';

export interface DateInputSegment {
  kind: DateSegmentKind | 'literal';
  literal?: string;
}

export interface DateParts {
  day: string;
  month: string;
  year: string;
}

export interface DateInputLayout {
  readonly segments: readonly DateInputSegment[];
  readonly order: readonly DateSegmentKind[];
  readonly first: DateSegmentKind;
}

export interface DateConstraints {
  readonly minDate?: Date;
  readonly maxDate?: Date;
  readonly disabledDates: ReadonlySet<string>;
  readonly disabledWeekDays: ReadonlySet<number>;
}

export interface DayRangeBounds {
  readonly min: number;
  readonly max: number;
}

interface WeekdayName {
  label: string;
  fullLabel: string;
}

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const DISABLED_DATE_SEPARATOR = /[\s,]+/;
const SEGMENT_SAMPLE = createUtcDate(2038, 10, 24);
const WEEK_START_SAMPLE = createUtcDate(2024, 0, 7);
const MONTH_SAMPLE_YEAR = 2000;

export const DAYS_IN_WEEK = 7;

const MS_PER_DAY = 86_400_000;

const monthYearOptions: Intl.DateTimeFormatOptions = {
  calendar: 'gregory',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
};
const monthOptions: Intl.DateTimeFormatOptions = { calendar: 'gregory', month: 'long', timeZone: 'UTC' };
const fullDateOptions: Intl.DateTimeFormatOptions = { calendar: 'gregory', dateStyle: 'full', timeZone: 'UTC' };
const segmentOptions: Intl.DateTimeFormatOptions = {
  calendar: 'gregory',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
};

const formatterCache = new Map<string, Intl.DateTimeFormat>();
const monthNameCache = new Map<string, readonly string[]>();
const weekdayNameCache = new Map<string, readonly WeekdayName[]>();
const dateInputLayoutCache = new Map<string, DateInputLayout>();
const dateSegmentPlaceholderCache = new Map<string, Readonly<Record<DateSegmentKind, string>>>();
const firstWeekdayCache = new Map<string, number>();

function getFormatter(locale: string, key: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const cacheKey = `${locale}|${key}`;
  let formatter = formatterCache.get(cacheKey);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options);
    formatterCache.set(cacheKey, formatter);
  }
  return formatter;
}

/** Creates a UTC-midnight date without the two-digit-year coercion of `Date.UTC`. */
export function createUtcDate(year: number, month: number, day: number): Date {
  const date = new Date(0);
  date.setUTCFullYear(year, month, day);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

/** Creates a local-midnight `Date` for APIs that accept a Date as a local civil day. */
export function createLocalDate(year: number, month: number, day: number): Date {
  const date = new Date(0);
  date.setFullYear(year, month, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

/** Formats a Date argument as its local civil day in `YYYY-MM-DD` form. */
export function toIsoLocalDate(date: Date): string {
  return toIsoDate(createUtcDate(date.getFullYear(), date.getMonth(), date.getDate()));
}

/** Parses a strict `YYYY-MM-DD` civil date, rejecting normalized values such as `2026-02-31`. */
export function parseIsoDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;

  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) return undefined;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  if (year < 1) return undefined;

  const date = createUtcDate(year, month, day);
  return date.getUTCFullYear() === year && date.getUTCMonth() === month && date.getUTCDate() === day ? date : undefined;
}

/** Formats a date as a `YYYY-MM-DD` civil date. */
export function toIsoDate(date: Date): string {
  const year = date.getUTCFullYear().toString().padStart(4, '0');
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Splits a date into zero-padded segment strings. */
export function partsFromDate(date: Date): DateParts {
  return {
    day: date.getUTCDate().toString().padStart(2, '0'),
    month: (date.getUTCMonth() + 1).toString().padStart(2, '0'),
    year: date.getUTCFullYear().toString().padStart(4, '0'),
  };
}

/** Parses segment strings into a civil date, rejecting impossible dates. */
export function dateFromParts(day: string, month: string, year: string): Date | undefined {
  if (!day || !month || !year) return undefined;

  const dayValue = Number(day);
  const monthValue = Number(month);
  const yearValue = Number(year);
  if (
    !Number.isInteger(dayValue) ||
    !Number.isInteger(monthValue) ||
    !Number.isInteger(yearValue) ||
    yearValue < 1 ||
    yearValue > 9999
  ) {
    return undefined;
  }

  const date = createUtcDate(yearValue, monthValue - 1, dayValue);
  return date.getUTCFullYear() === yearValue && date.getUTCMonth() === monthValue - 1 && date.getUTCDate() === dayValue
    ? date
    : undefined;
}

export function compareDates(first: Date, second: Date): number {
  return first.getTime() - second.getTime();
}

export function startOfMonth(date: Date): Date {
  return createUtcDate(date.getUTCFullYear(), date.getUTCMonth(), 1);
}

export function daysInMonth(date: Date): number {
  return createUtcDate(date.getUTCFullYear(), date.getUTCMonth() + 1, 0).getUTCDate();
}

export function addDays(date: Date, amount: number): Date {
  return createUtcDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + amount);
}

/** Adds months, returning the first day of the resulting month. */
export function addMonths(date: Date, amount: number): Date {
  return createUtcDate(date.getUTCFullYear(), date.getUTCMonth() + amount, 1);
}

/** Adds months while clamping the day to the target month (Jan 31 + 1 month → Feb 28/29). */
export function addMonthsClamped(date: Date, amount: number): Date {
  const targetMonth = addMonths(date, amount);
  return createUtcDate(
    targetMonth.getUTCFullYear(),
    targetMonth.getUTCMonth(),
    Math.min(date.getUTCDate(), daysInMonth(targetMonth))
  );
}

/** Shifts one date segment, clamping day-of-month and leap-day overflow. */
export function shiftDatePart(date: Date, kind: DateSegmentKind, amount: number): Date {
  if (kind === 'day') return addDays(date, amount);
  return addMonthsClamped(date, kind === 'month' ? amount : amount * 12);
}

/** The current local civil date, represented at UTC midnight. */
export function todayDate(): Date {
  const today = new Date();
  return createUtcDate(today.getFullYear(), today.getMonth(), today.getDate());
}

/** Inclusive number of days between two dates. */
export function rangeLengthDays(first: Date, second: Date): number {
  const start = compareDates(first, second) <= 0 ? first : second;
  const end = compareDates(first, second) <= 0 ? second : first;
  return Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY) + 1;
}

/** Clamps a date to the constraint bounds. */
export function clampDate(date: Date, constraints: DateConstraints): Date {
  if (constraints.minDate && compareDates(date, constraints.minDate) < 0) return constraints.minDate;
  if (constraints.maxDate && compareDates(date, constraints.maxDate) > 0) return constraints.maxDate;
  return date;
}

/** Normalizes `min-range`/`max-range` values, treating non-positive or invalid values as disabled. */
export function normalizeRangeBounds(minRange: number, maxRange: number): DayRangeBounds {
  return {
    min: Number.isFinite(minRange) && minRange > 0 ? minRange : 0,
    max: Number.isFinite(maxRange) && maxRange > 0 ? maxRange : 0,
  };
}

export function normalizeInputDigits(value: string): string {
  return value
    .normalize('NFKC')
    .replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 0x660))
    .replace(/[۰-۹]/g, digit => String(digit.charCodeAt(0) - 0x6f0))
    .replace(/\D/g, '');
}

/** Normalizes one segmented date field without silently replacing out-of-range digits. */
export function normalizeDateSegmentInput(
  value: string,
  kind: DateSegmentKind
): { digits: string; shouldAdvance: boolean } {
  const maxLength = kind === 'year' ? 4 : 2;
  let digits = normalizeInputDigits(value).slice(0, maxLength);
  let shouldAdvance = false;

  if (kind !== 'year' && digits.length === 1) {
    const numeric = Number(digits);
    const maxValue = kind === 'month' ? 12 : 31;
    if (Number.isInteger(numeric) && numeric > 0 && numeric * 10 > maxValue) {
      digits = numeric.toString().padStart(2, '0');
      shouldAdvance = true;
    }
  }

  if (digits.length === maxLength) shouldAdvance = true;
  return { digits, shouldAdvance };
}

/** Steps one incomplete segment without replacing the other typed fields. */
export function stepDateSegmentValue(
  value: string,
  kind: DateSegmentKind,
  direction: 1 | -1,
  fallbackDate: Date
): string {
  const fallback = partsFromDate(fallbackDate)[kind];
  const current = value && Number.isInteger(Number(value)) ? Number(value) : Number(fallback);
  const maximum = kind === 'day' ? 31 : kind === 'month' ? 12 : 9999;
  const next = Math.min(maximum, Math.max(1, current + direction));
  return next.toString().padStart(kind === 'year' ? 4 : 2, '0');
}

/** Parses an ISO date or three localized numeric fields in the provided segment order. */
export function parsePastedDate(value: string, order: readonly DateSegmentKind[]): Date | undefined {
  const text = value.trim();
  const isoDate = parseIsoDate(text);
  if (isoDate) return isoDate;

  const values = text.split(/[^\p{Nd}]+/u).filter(Boolean);
  if (values.length !== order.length || order.length !== 3) return undefined;

  const parts = new Map(order.map((kind, index) => [kind, normalizeInputDigits(values[index]!)]));
  return dateFromParts(parts.get('day') ?? '', parts.get('month') ?? '', parts.get('year') ?? '');
}

/** Parses the `disabled-dates` attribute into an ISO-date set. */
export function parseDisabledDates(value: string): Set<string> {
  return new Set(value.split(DISABLED_DATE_SEPARATOR).filter(Boolean));
}

/** Parses the `disabled-week-days` attribute into an integer weekday set (0–6). */
export function parseDisabledWeekDays(value: string): Set<number> {
  return new Set(
    value
      .split(DISABLED_DATE_SEPARATOR)
      .filter(Boolean)
      .map(Number)
      .filter(day => Number.isInteger(day) && day >= 0 && day <= DAYS_IN_WEEK - 1)
  );
}

export function createDateConstraints(
  min?: string,
  max?: string,
  disabledDates = '',
  disabledWeekDays = ''
): DateConstraints {
  return {
    minDate: parseIsoDate(min) ?? createUtcDate(1, 0, 1),
    maxDate: parseIsoDate(max) ?? createUtcDate(9999, 11, 31),
    disabledDates: parseDisabledDates(disabledDates),
    disabledWeekDays: parseDisabledWeekDays(disabledWeekDays),
  };
}

/** Whether a date is outside the min/max bounds or explicitly disabled. */
export function isDateUnavailable(date: Date, constraints: DateConstraints): boolean {
  return (
    (constraints.minDate !== undefined && compareDates(date, constraints.minDate) < 0) ||
    (constraints.maxDate !== undefined && compareDates(date, constraints.maxDate) > 0) ||
    constraints.disabledDates.has(toIsoDate(date)) ||
    constraints.disabledWeekDays.has(date.getUTCDay())
  );
}

/** Returns the locale's first weekday, from 0 (Sunday) to 6 (Saturday). Cached per locale. */
export function getLocaleFirstDay(locale: string): number {
  const cached = firstWeekdayCache.get(locale);
  if (cached !== undefined) return cached;

  let firstDay = 0;
  try {
    const localeInfo = new Intl.Locale(locale) as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number };
      weekInfo?: { firstDay: number };
    };
    const value = localeInfo.getWeekInfo?.().firstDay ?? localeInfo.weekInfo?.firstDay;
    if (value !== undefined) firstDay = value % DAYS_IN_WEEK;
  } catch {
    firstDay = 0;
  }

  firstWeekdayCache.set(locale, firstDay);
  return firstDay;
}

export function formatMonthYear(locale: string, date: Date): string {
  return getFormatter(locale, 'month-year', monthYearOptions).format(date);
}

export function getMonthNames(locale: string): readonly string[] {
  let names = monthNameCache.get(locale);
  if (!names) {
    const formatter = getFormatter(locale, 'month', monthOptions);
    names = Array.from({ length: 12 }, (_, month) => formatter.format(createUtcDate(MONTH_SAMPLE_YEAR, month, 1)));
    monthNameCache.set(locale, names);
  }
  return names;
}

/** Localized month name for a zero-based month index. */
export function getMonthName(locale: string, month: number): string {
  return getMonthNames(locale)[month] ?? '';
}

/** Localized date-pattern token for a segment; callers may override it with a slot. */
export function getDateSegmentPlaceholder(locale: string, kind: DateSegmentKind): string {
  let placeholders = dateSegmentPlaceholderCache.get(locale);
  if (!placeholders) {
    const fallbackInitial: Record<DateSegmentKind, string> = { day: 'D', month: 'M', year: 'Y' };
    const fallbackPattern: Record<DateSegmentKind, string> = { day: 'DD', month: 'MM', year: 'YYYY' };
    try {
      const names = new Intl.DisplayNames(locale, { type: 'dateTimeField', style: 'long' });
      const initial = (field: DateSegmentKind): string => {
        const label = names.of(field)?.trim();
        const firstLetter = label ? Array.from(label)[0] : fallbackInitial[field];
        return Array.from(firstLetter!.toLocaleUpperCase(locale))[0] ?? fallbackInitial[field];
      };
      placeholders = {
        day: initial('day').repeat(2),
        month: initial('month').repeat(2),
        year: initial('year').repeat(4),
      };
    } catch {
      placeholders = fallbackPattern;
    }
    dateSegmentPlaceholderCache.set(locale, placeholders);
  }

  return placeholders[kind];
}

/** Weekday names starting on Sunday, cached per locale and format. */
export function getWeekdayNames(locale: string, format: 'narrow' | 'short' | 'long'): readonly WeekdayName[] {
  const cacheKey = `${locale}|${format}`;
  let names = weekdayNameCache.get(cacheKey);
  if (!names) {
    const labelFormatter = getFormatter(locale, `weekday-${format}`, {
      calendar: 'gregory',
      weekday: format,
      timeZone: 'UTC',
    });
    const fullFormatter = getFormatter(locale, 'weekday-long', {
      calendar: 'gregory',
      weekday: 'long',
      timeZone: 'UTC',
    });
    names = Array.from({ length: DAYS_IN_WEEK }, (_, index) => {
      const date = addDays(WEEK_START_SAMPLE, index);
      return { label: labelFormatter.format(date), fullLabel: fullFormatter.format(date) };
    });
    weekdayNameCache.set(cacheKey, names);
  }
  return names;
}

export function getFullDateFormatter(locale: string): Intl.DateTimeFormat {
  return getFormatter(locale, 'full-date', fullDateOptions);
}

/** Cached localized segment order for a locale, used by the segmented date inputs. */
export function getDateInputLayout(locale: string): DateInputLayout {
  let layout = dateInputLayoutCache.get(locale);
  if (layout) return layout;

  const segments: DateInputSegment[] = [];
  for (const part of getFormatter(locale, 'segments', segmentOptions).formatToParts(SEGMENT_SAMPLE)) {
    if (part.type === 'month' || part.type === 'day' || part.type === 'year') {
      segments.push({ kind: part.type });
    } else if (part.type === 'literal' && part.value) {
      segments.push({ kind: 'literal', literal: part.value });
    }
  }

  const order = segments
    .filter((segment): segment is { kind: DateSegmentKind } => segment.kind !== 'literal')
    .map(segment => segment.kind);

  layout = { segments, order, first: order[0] ?? 'month' };
  dateInputLayoutCache.set(locale, layout);
  return layout;
}
