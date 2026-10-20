import { html, type PropertyValues } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { property, query, state } from 'lit/decorators.js';
import { CharmElement, CharmFormControlElement } from '../../base/index.js';
import { keys } from '../../utilities/key-map.js';
import { normalizeLocale } from '../../utilities/locale.js';
import { CoreCalendar } from '../calendar/calendar.js';
import { CoreIcon } from '../icon/icon.js';
import { CorePopup, type PopupPlacement } from '../popup/popup.js';
import styles from './date-picker.styles.js';

interface DateInputSegment {
  kind: 'day' | 'month' | 'year' | 'literal';
  literal?: string;
}

interface DateParts {
  day: string;
  month: string;
  year: string;
}

interface DatePickerTodayEventDetail {
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

function todayDate(): Date {
  const today = new Date();
  return createDate(today.getFullYear(), today.getMonth(), today.getDate());
}

/**
 * Date picker combines segmented date entry with a popup calendar for selecting a single date.
 *
 * @tag ch-date-picker
 * @since 0.6.0
 * @status beta
 *
 * @slot label - The date picker's label.
 * @slot help-text - Text that helps explain the expected input.
 * @slot start - Content rendered at the start of the segmented input.
 * @slot end - Content rendered at the end of the segmented input.
 * @slot footer - Content rendered below the calendar in the popup.
 * @slot toggle-label - Accessible label for the calendar toggle button.
 * @slot clear-label - Label for the clear button in the popup footer.
 * @slot today-label - Label for the today button in the popup footer.
 * @slot previous-month-label - Forwarded to the nested calendar previous month control.
 * @slot next-month-label - Forwarded to the nested calendar next month control.
 * @slot month-label - Forwarded to the nested calendar month selector.
 * @slot year-label - Forwarded to the nested calendar year field.
 *
 * @event input - Emitted when the value changes during user interaction.
 * @event change - Emitted when a value change is committed.
 * @event {DatePickerTodayEventDetail} date-picker-today - Emitted when the Today action sets the value.
 *
 * @csspart date-picker-base - The component wrapper.
 * @csspart date-picker-label - The component label.
 * @csspart date-picker-control - The segmented input wrapper.
 * @csspart date-picker-segments - Container for date segments.
 * @csspart date-picker-segment - A single editable date segment.
 * @csspart date-picker-literal - A literal separator between segments.
 * @csspart date-picker-toggle - The calendar toggle button.
 * @csspart date-picker-today - The today button.
 * @csspart date-picker-popup - The popup container.
 * @csspart date-picker-footer - The popup footer wrapper.
 *
 * @dependency CoreCalendar
 * @dependency CoreIcon
 * @dependency CorePopup
 */
export class CoreDatePicker extends CharmFormControlElement {
  public static override styles = [...super.styles, styles];
  public static override baseName = 'date-picker';

  /** The earliest selectable date, in `YYYY-MM-DD` format. */
  @property()
  public min?: string;

  /** The latest selectable date, in `YYYY-MM-DD` format. */
  @property()
  public max?: string;

  /** The date initially focused when there is no selected value. */
  @property({ attribute: 'focus-date' })
  public focusDate?: string;

  /** A comma- or whitespace-separated list of unavailable dates in `YYYY-MM-DD` format. */
  @property({ attribute: 'disabled-dates' })
  public disabledDates = '';

  /** A comma- or whitespace-separated list of unavailable weekdays, from 0 (Sunday) to 6 (Saturday). */
  @property({ attribute: 'disabled-week-days' })
  public disabledWeekDays = '';

  /** The first weekday, from 0 (Sunday) to 6 (Saturday), forwarded to the nested calendar. */
  @property({ attribute: 'first-day-of-week', type: Number })
  public firstDayOfWeek?: number;

  /** The visible format for calendar weekday headings. */
  @property({ attribute: 'weekday-format' })
  public weekdayFormat: 'narrow' | 'short' | 'long' = 'short';

  /** Whether the popup calendar is open. */
  @property({ type: Boolean, reflect: true })
  public open = false;

  /** Preferred popup placement relative to the segmented input. */
  @property({ reflect: true })
  public placement: PopupPlacement = 'bottom-start';

  /** Enables fixed positioning for the popup calendar. */
  @property({ attribute: 'fixed-placement', type: Boolean, reflect: true })
  public fixedPlacement = false;

  @state()
  protected day = '';

  @state()
  protected month = '';

  @state()
  protected year = '';

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

  public override get value(): string {
    return this._value ?? this.defaultValue ?? '';
  }

  /** Gets or sets the current value as a `Date` object. */
  public get valueAsDate(): Date | null {
    return parseIsoDate(this.value) ?? null;
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

  protected get firstSegmentKind(): 'day' | 'month' | 'year' {
    const first = this.dateSegments.find(
      (segment): segment is DateInputSegment & { kind: 'day' | 'month' | 'year' } => segment.kind !== 'literal'
    );
    return first?.kind ?? 'month';
  }

  protected get segmentKindsInOrder(): ('day' | 'month' | 'year')[] {
    return this.dateSegments
      .filter((segment): segment is { kind: 'day' | 'month' | 'year' } => segment.kind !== 'literal')
      .map(segment => segment.kind);
  }

  protected get isRtlDirection(): boolean {
    return this.matches(':dir(rtl)');
  }

  protected get currentLocale(): string {
    return normalizeLocale(this.lang || navigator.language || 'en');
  }

  protected get hasCompleteSegments(): boolean {
    return this.day.length === 2 && this.month.length === 2 && this.year.length === 4;
  }

  protected get allSegmentsEmpty(): boolean {
    return this.day.length === 0 && this.month.length === 0 && this.year.length === 0;
  }

  protected get hasValue(): boolean {
    return this.value.length > 0;
  }

  protected get todayUnavailable(): boolean {
    return this.isUnavailableDate(todayDate());
  }

  public override set value(val: string) {
    if (this._value === val) return;
    this._value = val;
    this.requestUpdate('value');
  }

  public set valueAsDate(newValue: Date | null) {
    this.value = newValue ? toIsoDate(newValue) : '';
  }

  public override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('pointerdown', this.handleDocumentPointerDown);
  }

  public override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('pointerdown', this.handleDocumentPointerDown);
  }

  /** Opens the popup calendar. */
  public show(): void {
    if (this.disabled) return;
    this.open = true;
    void this.updateComplete.then(() => this.calendar?.focus());
  }

  /** Closes the popup calendar and commits pending changes. */
  public hide(): void {
    if (!this.open) return;
    this.open = false;
    this.commitChange();
  }

  /** Clears the current value and emits `input` and `change`. */
  public clear(): void {
    if (this.disabled || this.readonly || (!this.hasValue && !this.hasCompleteSegments)) return;
    this.day = '';
    this.month = '';
    this.year = '';
    this.value = '';
    this.open = false;
    this.updateControlFromState();
    this.emitInput();
    this.commitChange();
  }

  /** Focuses the first segment. */
  public override focus(options?: FocusOptions): void {
    this.segmentInput('month')?.focus(options);
  }

  protected override firstUpdated(): void {
    super.firstUpdated();
    this.committedValue = this.value;
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
        part="date-picker-base"
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
        for=${`segment-${this.firstSegmentKind}`}
        part="date-picker-label"
      >
        ${this.labelContentTemplate()}
      </label>
    `;
  }

  protected controlTemplate() {
    return this.html`
      <scoped-popup
        class="popup"
        part="date-picker-popup"
        placement=${this.placement}
        strategy=${this.fixedPlacement ? 'fixed' : 'absolute'}
        ?open=${this.open}
        flip
        shift
        auto-size="vertical"
      >
        <div
          class="form-control-input"
          part="date-picker-control"
          slot="anchor"
          @pointerdown=${this.handleControlPointerDown}
          @click=${this.handleControlClick}
        >
          <div class="entry">
            ${this.startTemplate()}
            <div class="segments" part="date-picker-segments" @keydown=${this.handleSegmentsKeyDown}>
              ${this.dateSegments.map(segment => this.renderSegment(segment))}
            </div>
            ${this.endTemplate()}
          </div>
          <button
            type="button"
            class="action"
            part="date-picker-toggle"
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
            min=${ifDefined(this.min)}
            max=${ifDefined(this.max)}
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
            .value=${this.value || undefined}
            .focusDate=${this.focusDate || this.value || undefined}
            .min=${this.min}
            .max=${this.max}
            .disabledDates=${this.disabledDates}
            .disabledWeekDays=${this.disabledWeekDays}
            .lang=${this.currentLocale}
            .firstDayOfWeek=${this.firstDayOfWeek}
            .weekdayFormat=${this.weekdayFormat}
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
          <div class="footer" part="date-picker-footer">
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
              part="date-picker-today"
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

  protected renderSegment(segment: DateInputSegment) {
    if (segment.kind === 'literal') {
      return html`<span class="segment-literal" part="date-picker-literal" aria-hidden="true"
        >${segment.literal}</span
      >`;
    }

    const segmentValue = this.segmentValue(segment.kind);
    const placeholder = segment.kind === 'year' ? 'yyyy' : segment.kind === 'month' ? 'mm' : 'dd';
    const maxLength = segment.kind === 'year' ? 4 : 2;

    return html`
      <span class="segment-wrap">
        <label class="visually-hidden" for=${`segment-${segment.kind}`}>${segment.kind}</label>
        <input
          id=${`segment-${segment.kind}`}
          class="segment"
          part="date-picker-segment"
          data-segment=${segment.kind}
          inputmode="numeric"
          maxlength=${maxLength}
          aria-describedby=${ifDefined(this.describedBy)}
          aria-errormessage=${ifDefined(this.invalid ? 'error-text' : undefined)}
          aria-invalid=${this.invalid}
          aria-valuetext=${ifDefined(this.segmentAriaValueText(segment.kind))}
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

  protected segmentValue(kind: 'day' | 'month' | 'year'): string {
    if (kind === 'day') return this.day;
    if (kind === 'month') return this.month;
    return this.year;
  }

  protected setSegmentValue(kind: 'day' | 'month' | 'year', value: string): void {
    if (kind === 'day') this.day = value;
    if (kind === 'month') this.month = value;
    if (kind === 'year') this.year = value;
  }

  protected segmentInput(kind: 'day' | 'month' | 'year'): HTMLInputElement | null {
    return this.shadowRoot?.querySelector<HTMLInputElement>(`#segment-${kind}`) ?? null;
  }

  protected segmentAriaValueText(kind: 'day' | 'month' | 'year'): string | undefined {
    if (kind !== 'month') return undefined;

    const value = Number(this.month);
    if (!Number.isInteger(value) || value < 1 || value > 12) return undefined;

    const formatter = new Intl.DateTimeFormat(this.currentLocale, { month: 'long', timeZone: 'UTC' });
    return formatter.format(createDate(2000, value - 1, 1));
  }

  protected syncSegmentsFromValue(): void {
    const parsed = parseIsoDate(this.value);
    if (!parsed) {
      this.day = '';
      this.month = '';
      this.year = '';
      return;
    }

    const parts = partsFromDate(parsed);
    this.day = parts.day;
    this.month = parts.month;
    this.year = parts.year;
  }

  protected parsedSegmentsDate(): Date | undefined {
    if (!this.hasCompleteSegments) return undefined;
    const month = Number(this.month);
    const day = Number(this.day);
    const year = Number(this.year);

    if (!Number.isInteger(month) || !Number.isInteger(day) || !Number.isInteger(year)) return undefined;
    if (year < 1 || year > 9999) return undefined;

    const parsed = createDate(year, month - 1, day);
    if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) {
      return undefined;
    }

    return parsed;
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

  protected updateControlFromState(): void {
    const parsed = this.parsedSegmentsDate();
    const nextValue = parsed && !this.isUnavailableDate(parsed) ? toIsoDate(parsed) : '';

    if (this.value !== nextValue) {
      this.suppressInputEvent = true;
      this.value = nextValue;
      this.suppressInputEvent = false;
    }

    if (this.input) {
      this.input.value = this.value;
      this.input.min = this.min ?? '';
      this.input.max = this.max ?? '';
      this.input.required = this.required;
      this.input.disabled = this.disabled;
    }

    if (!this.customErrorMessage && this.input) {
      if (this.hasCompleteSegments && !parsed) {
        this.input.setCustomValidity('Enter a valid date.');
      } else if (parsed && this.isUnavailableDate(parsed)) {
        this.input.setCustomValidity('Date is unavailable.');
      } else {
        this.input.setCustomValidity('');
      }
    }

    this.internals.setFormValue(this.value || null);
    this.updateValidity();
  }

  protected updateFromSegmentInput(target: HTMLInputElement): void {
    const kind = target.dataset.segment as 'day' | 'month' | 'year';
    const maxLength = kind === 'year' ? 4 : 2;
    let digits = normalizeInputDigits(target.value).slice(0, maxLength);
    let shouldAdvance = false;
    let nextKind: 'day' | 'month' | 'year' | undefined;

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

    this.setSegmentValue(kind, digits);
    target.value = digits;

    if (shouldAdvance) {
      const orderedKinds = this.segmentKindsInOrder;
      const index = orderedKinds.indexOf(kind);
      nextKind = index >= 0 ? orderedKinds[index + 1] : undefined;
    }

    const previous = this.value;
    this.updateControlFromState();

    if (nextKind) {
      this.updateComplete.then(() => {
        const nextInput = this.segmentInput(nextKind!);
        nextInput?.focus();
        nextInput?.select();
      });
    }

    if (!this.suppressInputEvent && previous !== this.value) this.emitInput();
  }

  protected focusNextSegment(kind: 'day' | 'month' | 'year'): void {
    const orderedKinds = this.segmentKindsInOrder;
    const index = orderedKinds.indexOf(kind);
    const next = index >= 0 ? orderedKinds[index + 1] : undefined;
    if (!next) return;
    this.segmentInput(next)?.focus();
    this.segmentInput(next)?.select();
  }

  protected focusPreviousSegment(kind: 'day' | 'month' | 'year'): void {
    const orderedKinds = this.segmentKindsInOrder;
    const index = orderedKinds.indexOf(kind);
    const previous = index > 0 ? orderedKinds[index - 1] : undefined;
    if (!previous) return;
    this.segmentInput(previous)?.focus();
    this.segmentInput(previous)?.select();
  }

  protected stepSegment(kind: 'day' | 'month' | 'year', direction: 1 | -1): void {
    const parsed = this.parsedSegmentsDate() ?? parseIsoDate(this.value) ?? parseIsoDate(this.focusDate) ?? todayDate();
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
    this.day = parts.day;
    this.month = parts.month;
    this.year = parts.year;

    const previous = this.value;
    this.updateControlFromState();
    if (!this.suppressInputEvent && previous !== this.value) this.emitInput();
  }

  protected handleControlClick(event: MouseEvent): void {
    if (event.defaultPrevented) return;
    const target = event.composedPath()[0] as HTMLElement;
    if (target.closest('.action')) return;
    if (target.closest('.segment')) return;

    const firstInput = this.segmentInput(this.firstSegmentKind);
    firstInput?.focus();
    if (this.allSegmentsEmpty) firstInput?.select();
  }

  protected handleControlPointerDown(event: PointerEvent): void {
    if (event.button !== 0) return;
    const target = event.composedPath()[0] as HTMLElement;
    if (target.closest('.action')) return;
    if (target.closest('.segment')) return;

    event.preventDefault();
    const firstInput = this.segmentInput(this.firstSegmentKind);
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
    this.segmentInput(this.firstSegmentKind)?.focus();
  }

  protected handleTodayClick = (event: Event): void => {
    event.preventDefault();
    if (this.disabled || this.readonly || this.todayUnavailable) return;

    const today = todayDate();
    const isoDate = toIsoDate(today);
    this.value = isoDate;
    this.syncSegmentsFromValue();
    this.updateControlFromState();
    this.emitInput();
    this.commitChange();
    this.emit('date-picker-today', { detail: { value: isoDate } satisfies DatePickerTodayEventDetail });
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
    const kind = target.dataset.segment as 'day' | 'month' | 'year';
    if (!kind) return;

    const isModifier = event.metaKey || event.ctrlKey;

    if (!isModifier && event.altKey && event.key === keys.ArrowDown) {
      event.preventDefault();
      this.show();
      return;
    }

    if (!isModifier && (event.key === keys.Backspace || event.key === keys.Delete) && target.value.length === 0) {
      event.preventDefault();
      this.focusPreviousSegment(kind);
      return;
    }

    if (!isModifier && event.key === keys.ArrowRight) {
      event.preventDefault();
      this.isRtlDirection ? this.focusPreviousSegment(kind) : this.focusNextSegment(kind);
      return;
    }

    if (!isModifier && event.key === keys.ArrowLeft) {
      event.preventDefault();
      this.isRtlDirection ? this.focusNextSegment(kind) : this.focusPreviousSegment(kind);
      return;
    }

    if (!isModifier && event.key === keys.ArrowUp) {
      event.preventDefault();
      this.stepSegment(kind, 1);
      return;
    }

    if (!isModifier && event.key === keys.ArrowDown) {
      event.preventDefault();
      this.stepSegment(kind, -1);
      return;
    }

    if (!isModifier && event.key === keys.Enter) {
      event.preventDefault();
      this.open ? this.hide() : this.show();
      return;
    }

    if (!isModifier && event.key === keys.Space) {
      event.preventDefault();
      if (!this.open) this.show();
      return;
    }

    if (!isModifier && event.key === keys.Escape) {
      if (this.open) {
        event.preventDefault();
        this.hide();
      }
      return;
    }
  }

  protected handleCalendarInput = (): void => {
    if (!this.calendar) return;
    const next = Array.isArray(this.calendar.value) ? this.calendar.value[0] : this.calendar.value;
    if (!next || typeof next !== 'string') return;
    this.value = next;
    this.syncSegmentsFromValue();
    this.updateControlFromState();
    this.emitInput();
  };

  protected handleCalendarChange = (): void => {
    this.handleCalendarInput();
    this.open = false;
    this.commitChange();
    this.segmentInput(this.firstSegmentKind)?.focus();
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

export default CoreDatePicker;
