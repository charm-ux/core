import { html, type PropertyValues } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { property, query, state } from 'lit/decorators.js';
import { CharmElement, CharmFormControlElement } from '../../base/index.js';
import { keys } from '../../utilities/key-map.js';
import { CoreCalendar } from '../calendar/calendar.js';
import { CoreIcon } from '../icon/icon.js';
import { CorePopup, type PopupPlacement } from '../popup/popup.js';
import styles from './date-range-picker.styles.js';

type SegmentKind = 'day' | 'month' | 'year';
type Endpoint = 'start' | 'end';

interface DateInputSegment {
  kind: SegmentKind | 'literal';
  literal?: string;
}

interface DateParts {
  day: string;
  month: string;
  year: string;
}

interface DateRangePickerTodayEventDetail {
  value: string;
}

const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function createDate(year: number, month: number, day: number): Date {
  const date = new Date(0);
  date.setUTCFullYear(year, month, day);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

function parseIsoDate(value: string | undefined): Date | undefined {
  if (!value) return undefined;

  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) return undefined;

  const [, year, month, day] = match;
  const parsed = createDate(Number(year), Number(month) - 1, Number(day));

  return parsed.getUTCFullYear() === Number(year) &&
    parsed.getUTCMonth() === Number(month) - 1 &&
    parsed.getUTCDate() === Number(day)
    ? parsed
    : undefined;
}

function toIsoDate(date: Date): string {
  const year = date.getUTCFullYear().toString().padStart(4, '0');
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const day = date.getUTCDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function normalizeInputDigits(value: string): string {
  return value.replace(/\D/g, '');
}

function partsFromDate(date: Date): DateParts {
  return {
    day: date.getUTCDate().toString().padStart(2, '0'),
    month: (date.getUTCMonth() + 1).toString().padStart(2, '0'),
    year: date.getUTCFullYear().toString().padStart(4, '0'),
  };
}

function compareDateOnly(first: Date, second: Date): number {
  return first.getTime() - second.getTime();
}

function rangeLengthDays(first: Date, second: Date): number {
  const start = compareDateOnly(first, second) <= 0 ? first : second;
  const end = compareDateOnly(first, second) <= 0 ? second : first;
  return Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
}

function todayDate(): Date {
  const today = new Date();
  return createDate(today.getFullYear(), today.getMonth(), today.getDate());
}

/**
 * Date range picker combines segmented date entry with a popup calendar for selecting a start and end date.
 *
 * @tag ch-date-range-picker
 * @since 0.6.0
 * @status beta
 *
 * @slot label - The date range picker's label.
 * @slot help-text - Text that helps explain the expected input.
 * @slot start - Content rendered at the start of the segmented input.
 * @slot end - Content rendered at the end of the segmented input.
 * @slot footer - Content rendered below the calendar in the popup.
 * @slot toggle-label - Accessible label for the calendar toggle button.
 * @slot clear-label - Label for the clear button in the popup footer.
 * @slot today-label - Label for the today button in the popup footer.
 * @slot range-separator - Separator between start and end segment groups.
 * @slot previous-month-label - Forwarded to the nested calendar previous month control.
 * @slot next-month-label - Forwarded to the nested calendar next month control.
 * @slot month-label - Forwarded to the nested calendar month selector.
 * @slot year-label - Forwarded to the nested calendar year field.
 *
 * @event input - Emitted when the value changes during user interaction.
 * @event change - Emitted when a value change is committed.
 * @event {DateRangePickerTodayEventDetail} date-range-picker-today - Emitted when the Today action sets the range.
 *
 * @csspart date-range-picker-base - The component wrapper.
 * @csspart date-range-picker-label - The component label.
 * @csspart date-range-picker-control - The segmented input wrapper.
 * @csspart date-range-picker-group - Segment group for each endpoint.
 * @csspart date-range-picker-segment - A single editable date segment.
 * @csspart date-range-picker-literal - A literal separator between segments.
 * @csspart date-range-picker-separator - The separator between start and end groups.
 * @csspart date-range-picker-toggle - The calendar toggle button.
 * @csspart date-range-picker-today - The today button.
 * @csspart date-range-picker-popup - The popup container.
 * @csspart date-range-picker-footer - The popup footer wrapper.
 *
 * @dependency CoreCalendar
 * @dependency CoreIcon
 * @dependency CorePopup
 */
export class CoreDateRangePicker extends CharmFormControlElement {
  public static override styles = [...super.styles, styles];
  public static override baseName = 'date-range-picker';

  @property()
  public min?: string;

  @property()
  public max?: string;

  @property({ attribute: 'focus-date' })
  public focusDate?: string;

  @property({ attribute: 'disabled-dates' })
  public disabledDates = '';

  @property({ attribute: 'disabled-week-days' })
  public disabledWeekDays = '';

  @property({ attribute: 'first-day-of-week', type: Number })
  public firstDayOfWeek?: number;

  @property({ attribute: 'weekday-format' })
  public weekdayFormat: 'narrow' | 'short' | 'long' = 'short';

  /** The minimum allowed range length in days, inclusive of both start and end dates. `0` disables this constraint. */
  @property({ attribute: 'min-range', type: Number })
  public minRange = 0;

  /** The maximum allowed range length in days, inclusive of both start and end dates. `0` disables this constraint. */
  @property({ attribute: 'max-range', type: Number })
  public maxRange = 0;

  @property({ type: Boolean, reflect: true })
  public open = false;

  @property({ reflect: true })
  public placement: PopupPlacement = 'bottom-start';

  @property({ attribute: 'fixed-placement', type: Boolean, reflect: true })
  public fixedPlacement = false;

  @state()
  protected startDay = '';

  @state()
  protected startMonth = '';

  @state()
  protected startYear = '';

  @state()
  protected endDay = '';

  @state()
  protected endMonth = '';

  @state()
  protected endYear = '';

  @query('#native-input')
  protected override input?: HTMLInputElement;

  @query('.calendar')
  protected calendar?: CoreCalendar;

  protected minDate?: Date;
  protected maxDate?: Date;
  protected disabledDateSet = new Set<string>();
  protected disabledWeekDaySet = new Set<number>();
  protected suppressInputEvent = false;
  protected committedValue = '';

  public static override get dependencies(): (typeof CharmElement)[] {
    return [CoreCalendar, CoreIcon, CorePopup];
  }

  protected get currentLocale(): string {
    return this.lang || navigator.language || 'en';
  }

  protected get dateSegments(): DateInputSegment[] {
    const sample = createDate(2038, 10, 24);
    const formatter = new Intl.DateTimeFormat(this.currentLocale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'UTC',
    });

    const segments: DateInputSegment[] = [];
    for (const part of formatter.formatToParts(sample)) {
      if (part.type === 'month') segments.push({ kind: 'month' });
      if (part.type === 'day') segments.push({ kind: 'day' });
      if (part.type === 'year') segments.push({ kind: 'year' });
      if (part.type === 'literal' && part.value) segments.push({ kind: 'literal', literal: part.value });
    }

    return segments;
  }

  protected get firstSegmentKind(): SegmentKind {
    const first = this.dateSegments.find(segment => segment.kind !== 'literal');
    return (first?.kind as SegmentKind | undefined) ?? 'month';
  }

  protected get segmentKindsInOrder(): SegmentKind[] {
    return this.dateSegments
      .filter((segment): segment is DateInputSegment & { kind: SegmentKind } => segment.kind !== 'literal')
      .map(segment => segment.kind);
  }

  protected get isRtlDirection(): boolean {
    return this.matches(':dir(rtl)');
  }

  protected get hasValue(): boolean {
    return this.value.length > 0;
  }

  protected get allSegmentsEmpty(): boolean {
    return (
      this.startDay.length === 0 &&
      this.startMonth.length === 0 &&
      this.startYear.length === 0 &&
      this.endDay.length === 0 &&
      this.endMonth.length === 0 &&
      this.endYear.length === 0
    );
  }

  protected get startComplete(): boolean {
    return this.startDay.length === 2 && this.startMonth.length === 2 && this.startYear.length === 4;
  }

  protected get endComplete(): boolean {
    return this.endDay.length === 2 && this.endMonth.length === 2 && this.endYear.length === 4;
  }

  protected get hasPartialSegments(): boolean {
    const lengths = [
      this.startDay.length,
      this.startMonth.length,
      this.startYear.length,
      this.endDay.length,
      this.endMonth.length,
      this.endYear.length,
    ];
    return lengths.some(length => length > 0) && !this.startComplete && !this.endComplete;
  }

  public override get value(): string {
    return this._value ?? this.defaultValue ?? '';
  }

  public override set value(val: string) {
    if (this._value === val) return;
    this._value = val;
    this.requestUpdate('value');
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('pointerdown', this.handleDocumentPointerDown);
  }

  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('pointerdown', this.handleDocumentPointerDown);
  }

  protected override firstUpdated(): void {
    super.firstUpdated();
    this.committedValue = this.value;
  }

  public show(): void {
    if (this.disabled) return;
    this.open = true;
    void this.updateComplete.then(() => this.calendar?.focus());
  }

  public hide(): void {
    if (!this.open) return;
    this.open = false;
    this.commitChange();
  }

  public clear(): void {
    if (this.disabled || this.readonly || (!this.hasValue && !this.hasPartialSegments)) return;
    this.startDay = '';
    this.startMonth = '';
    this.startYear = '';
    this.endDay = '';
    this.endMonth = '';
    this.endYear = '';
    this.value = '';
    this.open = false;
    this.updateControlFromState();
    this.emitInput();
    this.commitChange();
  }

  public override focus(options?: FocusOptions): void {
    this.segmentInput('start', 'month')?.focus(options);
  }

  protected override willUpdate(changedProperties: PropertyValues<this>): void {
    super.willUpdate(changedProperties);

    if (!this.hasUpdated || changedProperties.has('min')) this.minDate = parseIsoDate(this.min);
    if (!this.hasUpdated || changedProperties.has('max')) this.maxDate = parseIsoDate(this.max);
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

    if (!this.hasUpdated || changedProperties.has('value')) {
      this.syncSegmentsFromValue();
    }
  }

  protected override updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);

    if (
      changedProperties.has('value') ||
      changedProperties.has('required') ||
      changedProperties.has('min') ||
      changedProperties.has('max') ||
      changedProperties.has('disabledDates') ||
      changedProperties.has('disabledWeekDays') ||
      changedProperties.has('minRange') ||
      changedProperties.has('maxRange') ||
      changedProperties.has('disabled') ||
      changedProperties.has('readonly')
    ) {
      this.updateControlFromState();
    }

    if (changedProperties.has('open') && !this.open && changedProperties.get('open') === true) {
      this.commitChange();
    }
  }

  protected override render() {
    return html`
      <div
        class=${classMap({
          'form-control': true,
          'form-control-has-error': this.invalid,
          'form-control-has-interaction': this.hadFocus,
          'form-control-has-help-text': this.hasHelpText,
          'form-control-has-label': this.hasLabel,
        })}
        part="date-range-picker-base"
      >
        ${this.labelTemplate()} ${this.helpTextTemplate()} ${this.controlTemplate()} ${this.errorMessageTemplate()}
      </div>
    `;
  }

  protected labelTemplate() {
    return this.html`
        <label
          aria-hidden=${!this.hasLabel}
        class=${classMap({
          'form-control-label': true,
          'visually-hidden': this.hideLabel,
        })}
        for=${`segment-start-${this.firstSegmentKind}`}
        part="date-range-picker-label"
      >
        ${this.labelContentTemplate()}
      </label>
    `;
  }

  protected controlTemplate() {
    return this.html`
      <scoped-popup
        class="popup"
        part="date-range-picker-popup"
        placement=${this.placement}
        strategy=${this.fixedPlacement ? 'fixed' : 'absolute'}
        ?open=${this.open}
        flip
        shift
        auto-size="vertical"
      >
        <div
          class="form-control-input"
          part="date-range-picker-control"
          slot="anchor"
          @pointerdown=${this.handleControlPointerDown}
          @click=${this.handleControlClick}
        >
          <div class="entry">
            ${this.startTemplate()}
            <div class="range-input" @keydown=${this.handleSegmentsKeyDown}>
              <div class="segment-group" part="date-range-picker-group">
                ${this.dateSegments.map(segment => this.renderSegment('start', segment))}
              </div>
              <span class="range-separator" part="date-range-picker-separator" aria-hidden="true"
                ><slot name="range-separator">-</slot></span
              >
              <div class="segment-group" part="date-range-picker-group">
                ${this.dateSegments.map(segment => this.renderSegment('end', segment))}
              </div>
            </div>
            ${this.endTemplate()}
          </div>
          <button
            type="button"
            class="action"
            part="date-range-picker-toggle"
            aria-label="Open calendar"
            aria-haspopup="dialog"
            aria-expanded=${this.open}
            ?disabled=${this.disabled}
            @click=${this.handleToggleClick}
          >
            <scoped-icon name="calendar"></scoped-icon>
            <span class="visually-hidden"><slot name="toggle-label">Open calendar</slot></span>
          </button>
          <input
            id="native-input"
            class="native-input"
            type="text"
            name=${ifDefined(this.name)}
            .value=${this.value}
            ?disabled=${this.disabled}
            ?required=${this.required}
            aria-hidden="true"
            tabindex="-1"
          />
        </div>

        <div>
          <scoped-calendar
            class="calendar"
            selection-mode="range"
            .value=${this.calendarValue()}
            .focusDate=${this.focusDate || this.rangeDates()[0] || undefined}
            .min=${this.min}
            .max=${this.max}
            .disabledDates=${this.disabledDates}
            .disabledWeekDays=${this.disabledWeekDays}
            .lang=${this.currentLocale}
            .firstDayOfWeek=${this.firstDayOfWeek}
            .weekdayFormat=${this.weekdayFormat}
            .minRange=${this.minRange}
            .maxRange=${this.maxRange}
            .disabled=${this.disabled}
            .readOnly=${this.readonly}
            @input=${this.handleCalendarInput}
            @change=${this.handleCalendarChange}
          >
            <slot name="previous-month-label" slot="previous-month-label"></slot>
            <slot name="next-month-label" slot="next-month-label"></slot>
            <slot name="month-label" slot="month-label"></slot>
            <slot name="year-label" slot="year-label"></slot>
          </scoped-calendar>
          <div class="footer" part="date-range-picker-footer">
            <button
              type="button"
              class="footer-button footer-clear"
              ?disabled=${this.disabled || this.readonly || !this.hasValue}
              @click=${this.handleClearClick}
            >
              <slot name="clear-label">Clear</slot>
            </button>
            <button
              type="button"
              class="footer-button footer-today"
              part="date-range-picker-today"
              ?disabled=${this.disabled || this.readonly || this.todayUnavailable}
              @click=${this.handleTodayClick}
            >
              <slot name="today-label">Today</slot>
            </button>
            <slot name="footer"></slot>
          </div>
        </div>
      </scoped-popup>
    `;
  }

  protected startTemplate() {
    return this.html`<span class="start" part="start"><slot name="start"></slot></span>`;
  }

  protected endTemplate() {
    return this.html`<span class="end" part="end"><slot name="end"></slot></span>`;
  }

  protected renderSegment(endpoint: Endpoint, segment: DateInputSegment) {
    if (segment.kind === 'literal') {
      return html`<span class="segment-literal" part="date-range-picker-literal" aria-hidden="true"
        >${segment.literal}</span
      >`;
    }

    const segmentValue = this.segmentValue(endpoint, segment.kind);
    const placeholder = segment.kind === 'year' ? 'yyyy' : segment.kind === 'month' ? 'mm' : 'dd';
    const maxLength = segment.kind === 'year' ? 4 : 2;

    return html`
      <span class="segment-wrap">
        <label class="visually-hidden" for=${`segment-${endpoint}-${segment.kind}`}>${endpoint} ${segment.kind}</label>
        <input
          id=${`segment-${endpoint}-${segment.kind}`}
          class="segment"
          part="date-range-picker-segment"
          data-endpoint=${endpoint}
          data-segment=${segment.kind}
          inputmode="numeric"
          maxlength=${maxLength}
          aria-describedby=${ifDefined(this.describedBy)}
          aria-errormessage=${ifDefined(this.invalid ? 'error-text' : undefined)}
          aria-invalid=${this.invalid}
          aria-valuetext=${ifDefined(this.segmentAriaValueText(endpoint, segment.kind))}
          ?required=${this.required}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          .value=${segmentValue}
          placeholder=${placeholder}
          @focus=${this.handleSegmentFocus}
          @click=${this.handleSegmentClick}
          @input=${this.handleSegmentInput}
          @blur=${this.handleSegmentBlur}
        />
      </span>
    `;
  }

  protected segmentInput(endpoint: Endpoint, kind: SegmentKind): HTMLInputElement | null {
    return this.shadowRoot?.querySelector<HTMLInputElement>(`#segment-${endpoint}-${kind}`) ?? null;
  }

  protected segmentValue(endpoint: Endpoint, kind: SegmentKind): string {
    if (endpoint === 'start') {
      if (kind === 'day') return this.startDay;
      if (kind === 'month') return this.startMonth;
      return this.startYear;
    }

    if (kind === 'day') return this.endDay;
    if (kind === 'month') return this.endMonth;
    return this.endYear;
  }

  protected segmentAriaValueText(endpoint: Endpoint, kind: SegmentKind): string | undefined {
    if (kind !== 'month') return undefined;

    const value = Number(this.segmentValue(endpoint, 'month'));
    if (!Number.isInteger(value) || value < 1 || value > 12) return undefined;

    const formatter = new Intl.DateTimeFormat(this.currentLocale, { month: 'long', timeZone: 'UTC' });
    return formatter.format(createDate(2000, value - 1, 1));
  }

  protected setSegmentValue(endpoint: Endpoint, kind: SegmentKind, value: string): void {
    if (endpoint === 'start') {
      if (kind === 'day') this.startDay = value;
      if (kind === 'month') this.startMonth = value;
      if (kind === 'year') this.startYear = value;
      return;
    }

    if (kind === 'day') this.endDay = value;
    if (kind === 'month') this.endMonth = value;
    if (kind === 'year') this.endYear = value;
  }

  protected endpointDate(endpoint: Endpoint): Date | undefined {
    const month = Number(this.segmentValue(endpoint, 'month'));
    const day = Number(this.segmentValue(endpoint, 'day'));
    const year = Number(this.segmentValue(endpoint, 'year'));

    const complete = endpoint === 'start' ? this.startComplete : this.endComplete;
    if (!complete) return undefined;
    if (!Number.isInteger(month) || !Number.isInteger(day) || !Number.isInteger(year)) return undefined;
    if (year < 1 || year > 9999) return undefined;

    const parsed = createDate(year, month - 1, day);
    if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) {
      return undefined;
    }

    return parsed;
  }

  protected syncSegmentsFromValue(): void {
    const [start, end] = this.rangeDates();

    if (!start) {
      this.startDay = '';
      this.startMonth = '';
      this.startYear = '';
    } else {
      const parts = partsFromDate(start);
      this.startDay = parts.day;
      this.startMonth = parts.month;
      this.startYear = parts.year;
    }

    if (!end) {
      this.endDay = '';
      this.endMonth = '';
      this.endYear = '';
    } else {
      const parts = partsFromDate(end);
      this.endDay = parts.day;
      this.endMonth = parts.month;
      this.endYear = parts.year;
    }
  }

  protected rangeDates(): [Date | undefined, Date | undefined] {
    const [rawStart, rawEnd] = this.value.split('/');
    const start = parseIsoDate(rawStart);
    const end = parseIsoDate(rawEnd);
    return [start, end];
  }

  protected calendarValue(): string[] | undefined {
    const [start, end] = this.rangeDates();
    if (!start && !end) return undefined;
    if (start && end) return [toIsoDate(start), toIsoDate(end)];
    if (start) return [toIsoDate(start)];
    return undefined;
  }

  protected isUnavailableDate(date: Date): boolean {
    const isoDate = toIsoDate(date);
    return (
      (this.minDate !== undefined && compareDateOnly(date, this.minDate) < 0) ||
      (this.maxDate !== undefined && compareDateOnly(date, this.maxDate) > 0) ||
      this.disabledDateSet.has(isoDate) ||
      this.disabledWeekDaySet.has(date.getUTCDay())
    );
  }

  protected get todayUnavailable(): boolean {
    const today = todayDate();
    return this.isUnavailableDate(today) || !this.isRangeLengthValid(today, today);
  }

  protected updateControlFromState(): void {
    const start = this.endpointDate('start');
    const end = this.endpointDate('end');
    const hasValidRangeLength = start && end ? this.isRangeLengthValid(start, end) : false;

    let nextValue = '';
    if (start && end && hasValidRangeLength && !this.isUnavailableDate(start) && !this.isUnavailableDate(end)) {
      const sorted = compareDateOnly(start, end) <= 0 ? [start, end] : [end, start];
      nextValue = `${toIsoDate(sorted[0])}/${toIsoDate(sorted[1])}`;
    }

    if (this.value !== nextValue) {
      this.suppressInputEvent = true;
      this.value = nextValue;
      this.suppressInputEvent = false;
      if (nextValue) this.syncSegmentsFromValue();
    }

    if (this.input) {
      this.input.value = this.value;
      this.input.required = this.required;
      this.input.disabled = this.disabled;
    }

    if (!this.customErrorMessage && this.input) {
      const incomplete =
        (this.startDay || this.startMonth || this.startYear || this.endDay || this.endMonth || this.endYear) &&
        !(this.startComplete && this.endComplete);

      if (incomplete) {
        this.input.setCustomValidity('Enter both start and end dates.');
      } else if ((this.startComplete && !start) || (this.endComplete && !end)) {
        this.input.setCustomValidity('Enter a valid date range.');
      } else if (start && end && !hasValidRangeLength) {
        this.input.setCustomValidity(this.rangeLengthMessage(start, end));
      } else if ((start && this.isUnavailableDate(start)) || (end && this.isUnavailableDate(end))) {
        this.input.setCustomValidity('Date range includes an unavailable date.');
      } else {
        this.input.setCustomValidity('');
      }
    }

    this.internals.setFormValue(this.value || null);
    this.updateValidity();
  }

  protected updateFromSegmentInput(target: HTMLInputElement): void {
    const endpoint = target.dataset.endpoint as Endpoint;
    const kind = target.dataset.segment as SegmentKind;
    const maxLength = kind === 'year' ? 4 : 2;
    let digits = normalizeInputDigits(target.value).slice(0, maxLength);
    let shouldAdvance = false;
    let nextTarget: { endpoint: Endpoint; kind: SegmentKind } | undefined;

    if (kind !== 'year' && digits.length === 1) {
      const numeric = Number(digits);
      const maxValue = kind === 'month' ? 12 : 31;
      if (Number.isInteger(numeric) && numeric > 0 && numeric * 10 > maxValue) {
        digits = numeric.toString().padStart(2, '0');
        shouldAdvance = true;
      }
    }

    if (digits.length === maxLength) {
      if (kind === 'month') {
        const numeric = Math.min(Math.max(Number(digits), 1), 12);
        digits = numeric.toString().padStart(2, '0');
      }

      if (kind === 'day') {
        const numeric = Math.min(Math.max(Number(digits), 1), 31);
        digits = numeric.toString().padStart(2, '0');
      }

      if (kind === 'year') {
        const numeric = Math.min(Math.max(Number(digits), 1), 9999);
        digits = numeric.toString().padStart(4, '0');
      }

      shouldAdvance = true;
    }

    this.setSegmentValue(endpoint, kind, digits);
    target.value = digits;

    if (shouldAdvance) {
      const orderedKinds = this.segmentKindsInOrder;
      const index = orderedKinds.indexOf(kind);
      const nextInEndpoint = index >= 0 ? orderedKinds[index + 1] : undefined;
      if (nextInEndpoint) {
        nextTarget = { endpoint, kind: nextInEndpoint };
      } else if (endpoint === 'start') {
        const first = orderedKinds[0];
        if (first) nextTarget = { endpoint: 'end', kind: first };
      }
    }

    const previous = this.value;
    this.updateControlFromState();

    if (nextTarget) {
      this.updateComplete.then(() => {
        const nextInput = this.segmentInput(nextTarget!.endpoint, nextTarget!.kind);
        nextInput?.focus();
        nextInput?.select();
      });
    }

    if (!this.suppressInputEvent && previous !== this.value) this.emitInput();
  }

  protected focusNextSegment(endpoint: Endpoint, kind: SegmentKind): void {
    const orderedKinds = this.segmentKindsInOrder;
    const index = orderedKinds.indexOf(kind);
    const nextInEndpoint = index >= 0 ? orderedKinds[index + 1] : undefined;
    if (nextInEndpoint) {
      this.segmentInput(endpoint, nextInEndpoint)?.focus();
      this.segmentInput(endpoint, nextInEndpoint)?.select();
      return;
    }

    if (endpoint === 'start') {
      const first = orderedKinds[0];
      if (!first) return;
      this.segmentInput('end', first)?.focus();
      this.segmentInput('end', first)?.select();
    }
  }

  protected focusPreviousSegment(endpoint: Endpoint, kind: SegmentKind): void {
    const orderedKinds = this.segmentKindsInOrder;
    const index = orderedKinds.indexOf(kind);
    const previousInEndpoint = index > 0 ? orderedKinds[index - 1] : undefined;
    if (previousInEndpoint) {
      this.segmentInput(endpoint, previousInEndpoint)?.focus();
      this.segmentInput(endpoint, previousInEndpoint)?.select();
      return;
    }

    if (endpoint === 'end') {
      const last = orderedKinds[orderedKinds.length - 1];
      if (!last) return;
      this.segmentInput('start', last)?.focus();
      this.segmentInput('start', last)?.select();
    }
  }

  protected stepSegment(endpoint: Endpoint, kind: SegmentKind, direction: 1 | -1): void {
    const parsed = this.endpointDate(endpoint) ?? parseIsoDate(this.focusDate) ?? todayDate();
    let nextDate: Date;

    if (kind === 'day') {
      nextDate = createDate(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate() + direction);
    } else if (kind === 'month') {
      nextDate = createDate(parsed.getUTCFullYear(), parsed.getUTCMonth() + direction, parsed.getUTCDate());
    } else {
      nextDate = createDate(parsed.getUTCFullYear() + direction, parsed.getUTCMonth(), parsed.getUTCDate());
    }

    if (this.minDate && compareDateOnly(nextDate, this.minDate) < 0) nextDate = this.minDate;
    if (this.maxDate && compareDateOnly(nextDate, this.maxDate) > 0) nextDate = this.maxDate;

    let attempts = 0;
    while (this.isUnavailableDate(nextDate) && attempts < 366) {
      nextDate = createDate(nextDate.getUTCFullYear(), nextDate.getUTCMonth(), nextDate.getUTCDate() + direction);
      if (this.minDate && compareDateOnly(nextDate, this.minDate) < 0) return;
      if (this.maxDate && compareDateOnly(nextDate, this.maxDate) > 0) return;
      attempts += 1;
    }

    if (this.isUnavailableDate(nextDate)) return;

    const parts = partsFromDate(nextDate);
    this.setSegmentValue(endpoint, 'day', parts.day);
    this.setSegmentValue(endpoint, 'month', parts.month);
    this.setSegmentValue(endpoint, 'year', parts.year);

    const previous = this.value;
    this.updateControlFromState();
    if (!this.suppressInputEvent && previous !== this.value) this.emitInput();
  }

  protected handleControlClick(event: MouseEvent): void {
    if (event.defaultPrevented) return;
    const target = event.composedPath()[0] as HTMLElement;
    if (target.closest('.action')) return;
    if (target.closest('.segment')) return;

    const firstInput = this.segmentInput('start', this.firstSegmentKind);
    firstInput?.focus();
    if (this.allSegmentsEmpty) firstInput?.select();
  }

  protected handleControlPointerDown(event: PointerEvent): void {
    if (event.button !== 0) return;
    const target = event.composedPath()[0] as HTMLElement;
    if (target.closest('.action')) return;
    if (target.closest('.segment')) return;

    event.preventDefault();
    const firstInput = this.segmentInput('start', this.firstSegmentKind);
    firstInput?.focus();
    if (this.allSegmentsEmpty) firstInput?.select();
  }

  protected handleToggleClick(event: Event): void {
    event.preventDefault();
    if (this.disabled) return;
    this.open = !this.open;
    if (!this.open) this.commitChange();
  }

  protected handleClearClick(event: Event): void {
    event.preventDefault();
    this.clear();
    this.segmentInput('start', this.firstSegmentKind)?.focus();
  }

  protected handleTodayClick = (event: Event): void => {
    event.preventDefault();
    if (this.disabled || this.readonly || this.todayUnavailable) return;

    const today = todayDate();
    const isoDate = toIsoDate(today);
    const parts = partsFromDate(today);
    this.startDay = parts.day;
    this.startMonth = parts.month;
    this.startYear = parts.year;
    this.endDay = this.startDay;
    this.endMonth = this.startMonth;
    this.endYear = this.startYear;

    this.value = `${isoDate}/${isoDate}`;
    this.updateControlFromState();
    this.emitInput();
    this.commitChange();
    this.emit('date-range-picker-today', { detail: { value: this.value } satisfies DateRangePickerTodayEventDetail });
  };

  protected handleSegmentFocus = (): void => {
    this.handleFocus();
    this.hadFocus = true;
  };

  protected handleSegmentClick = (event: MouseEvent): void => {
    const input = event.currentTarget;
    if (!(input instanceof HTMLInputElement)) return;
    input.select();
  };

  protected handleSegmentBlur = (): void => {
    requestAnimationFrame(() => {
      const active = this.shadowRoot?.activeElement;
      if (active instanceof HTMLInputElement && active.classList.contains('segment')) return;
      this.handleBlur();
      if (!this.open) this.commitChange();
    });
  };

  protected handleSegmentInput(event: Event): void {
    if (this.disabled || this.readonly) return;
    this.updateFromSegmentInput(event.currentTarget as HTMLInputElement);
  }

  protected handleSegmentsKeyDown(event: KeyboardEvent): void {
    const target = event.target as HTMLInputElement;
    const endpoint = target.dataset.endpoint as Endpoint;
    const kind = target.dataset.segment as SegmentKind;
    if (!endpoint || !kind) return;

    const isModifier = event.metaKey || event.ctrlKey;

    if (!isModifier && event.altKey && event.key === keys.ArrowDown) {
      event.preventDefault();
      this.show();
      return;
    }

    if (!isModifier && (event.key === keys.Backspace || event.key === keys.Delete) && target.value.length === 0) {
      event.preventDefault();
      this.focusPreviousSegment(endpoint, kind);
      return;
    }

    if (!isModifier && event.key === keys.ArrowRight) {
      event.preventDefault();
      this.isRtlDirection ? this.focusPreviousSegment(endpoint, kind) : this.focusNextSegment(endpoint, kind);
      return;
    }

    if (!isModifier && event.key === keys.ArrowLeft) {
      event.preventDefault();
      this.isRtlDirection ? this.focusNextSegment(endpoint, kind) : this.focusPreviousSegment(endpoint, kind);
      return;
    }

    if (!isModifier && event.key === keys.ArrowUp) {
      event.preventDefault();
      this.stepSegment(endpoint, kind, 1);
      return;
    }

    if (!isModifier && event.key === keys.ArrowDown) {
      event.preventDefault();
      this.stepSegment(endpoint, kind, -1);
      return;
    }

    if (!isModifier && event.key === keys.Enter) {
      event.preventDefault();
      this.open ? this.hide() : this.show();
      return;
    }

    if (!isModifier && event.key === keys.Escape && this.open) {
      event.preventDefault();
      this.hide();
    }
  }

  protected handleCalendarInput = (): void => {
    if (!this.calendar) return;
    const raw = this.calendar.value;
    const values = Array.isArray(raw)
      ? raw
      : typeof raw === 'string' && raw.includes('/')
        ? raw.split('/')
        : typeof raw === 'string'
          ? [raw]
          : [];

    const start = parseIsoDate(values[0]);
    const end = parseIsoDate(values[1]);

    if (start) {
      const parts = partsFromDate(start);
      this.startDay = parts.day;
      this.startMonth = parts.month;
      this.startYear = parts.year;
    } else {
      this.startDay = '';
      this.startMonth = '';
      this.startYear = '';
    }

    if (end) {
      const parts = partsFromDate(end);
      this.endDay = parts.day;
      this.endMonth = parts.month;
      this.endYear = parts.year;
    } else {
      this.endDay = '';
      this.endMonth = '';
      this.endYear = '';
    }

    this.updateControlFromState();
    this.emitInput();
  };

  protected isRangeLengthValid(start: Date, end: Date): boolean {
    const length = rangeLengthDays(start, end);
    const minRange = Number.isFinite(this.minRange) && this.minRange > 0 ? this.minRange : 0;
    const maxRange = Number.isFinite(this.maxRange) && this.maxRange > 0 ? this.maxRange : 0;

    if (minRange > 0 && length < minRange) return false;
    if (maxRange > 0 && length > maxRange) return false;
    return true;
  }

  protected rangeLengthMessage(start: Date, end: Date): string {
    const length = rangeLengthDays(start, end);
    const minRange = Number.isFinite(this.minRange) && this.minRange > 0 ? this.minRange : 0;
    const maxRange = Number.isFinite(this.maxRange) && this.maxRange > 0 ? this.maxRange : 0;

    if (minRange > 0 && length < minRange) {
      return `Select at least ${minRange} day${minRange === 1 ? '' : 's'} in the range.`;
    }

    if (maxRange > 0 && length > maxRange) {
      return `Select no more than ${maxRange} day${maxRange === 1 ? '' : 's'} in the range.`;
    }

    return 'Enter a valid date range.';
  }

  protected handleCalendarChange = (): void => {
    this.handleCalendarInput();
    this.open = false;
    this.commitChange();
    this.segmentInput('start', this.firstSegmentKind)?.focus();
  };

  protected handleDocumentPointerDown = (event: PointerEvent): void => {
    if (!this.open) return;
    if (event.composedPath().includes(this)) return;
    this.hide();
  };

  protected commitChange(): void {
    if (this.committedValue === this.value) return;
    this.committedValue = this.value;
    this.emitChange();
  }
}

export default CoreDateRangePicker;
