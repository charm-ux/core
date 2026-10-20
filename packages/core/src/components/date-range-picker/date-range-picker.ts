import { html, nothing, type PropertyValues } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { property, query, state } from 'lit/decorators.js';
import { CharmElement, CharmFormControlElement } from '../../base/index.js';
import {
  addDays,
  clampDate,
  compareDates,
  createDateConstraints,
  dateFromParts,
  getDateInputLayout,
  getMonthName,
  isDateUnavailable,
  normalizeInputDigits,
  normalizeRangeBounds,
  parseIsoDate,
  partsFromDate,
  rangeLengthDays,
  shiftDatePart,
  todayDate,
  toIsoDate,
} from '../../internal/date.js';
import { keys } from '../../utilities/key-map.js';
import { normalizeLocale } from '../../utilities/locale.js';
import { CoreCalendar } from '../calendar/calendar.js';
import { CoreIcon } from '../icon/icon.js';
import { CorePopup, type PopupPlacement } from '../popup/popup.js';
import styles from './date-range-picker.styles.js';
import type { CalendarChangeEventDetail } from '../calendar/calendar.js';
import type { DateConstraints, DateInputSegment } from '../../internal/date.js';

type SegmentKind = 'day' | 'month' | 'year';
type Endpoint = 'start' | 'end';

interface DateRangePickerTodayEventDetail {
  value: string;
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

  protected constraints: DateConstraints = createDateConstraints();
  protected suppressInputEvent = false;
  protected suppressSegmentSync = false;
  protected committedValue = '';
  protected calendarDraftValue?: string[];
  protected hasOpened = false;

  public static override get dependencies(): (typeof CharmElement)[] {
    return [CoreCalendar, CoreIcon, CorePopup];
  }

  public override get value(): string {
    return this._value ?? this.defaultValue ?? '';
  }

  protected get currentLocale(): string {
    return normalizeLocale(this.lang || navigator.language || 'en');
  }

  protected get dateSegments(): readonly DateInputSegment[] {
    return getDateInputLayout(this.currentLocale).segments;
  }

  protected get firstSegmentKind(): SegmentKind {
    return getDateInputLayout(this.currentLocale).first;
  }

  protected get segmentKindsInOrder(): readonly SegmentKind[] {
    return getDateInputLayout(this.currentLocale).order;
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

  protected get todayUnavailable(): boolean {
    const today = todayDate();
    return this.isUnavailableDate(today) || !this.isRangeLengthValid(today, today);
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

  public show(): void {
    if (this.disabled) return;
    this.calendarDraftValue = this.committedCalendarValue();
    this.open = true;
    void this.updateComplete.then(() => this.calendar?.focus());
  }

  public hide(): void {
    if (!this.open) return;
    this.open = false;
    this.calendarDraftValue = undefined;
    this.commitChange();
  }

  public clear(): void {
    if (this.disabled || this.readonly || (this.allSegmentsEmpty && !this.hasValue)) return;
    this.startDay = '';
    this.startMonth = '';
    this.startYear = '';
    this.endDay = '';
    this.endMonth = '';
    this.endYear = '';
    this.value = '';
    this.calendarDraftValue = undefined;
    this.open = false;
    this.updateControlFromState();
    this.emitInput();
    this.commitChange();
  }

  public override focus(options?: FocusOptions): void {
    this.segmentInput('start', this.firstSegmentKind)?.focus(options);
  }

  protected override firstUpdated(): void {
    super.firstUpdated();
    this.committedValue = this.value;
  }

  protected override willUpdate(changedProperties: PropertyValues<this>): void {
    super.willUpdate(changedProperties);

    if (
      !this.hasUpdated ||
      changedProperties.has('min') ||
      changedProperties.has('max') ||
      changedProperties.has('disabledDates') ||
      changedProperties.has('disabledWeekDays')
    ) {
      this.constraints = createDateConstraints(this.min, this.max, this.disabledDates, this.disabledWeekDays);
    }

    if (this.open) this.hasOpened = true;

    const shouldSyncSegments = changedProperties.has('value') && !this.suppressSegmentSync;
    this.suppressSegmentSync = false;
    if (!this.hasUpdated || shouldSyncSegments) this.syncSegmentsFromValue();
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
        content-role="dialog"
        focus-trap
        @popup-hide=${this.handlePopupHide}
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
          ${this.hasOpened ? this.calendarTemplate() : nothing}
          <div class="footer" part="date-range-picker-footer">
            <button
              type="button"
              class="footer-button footer-clear"
              ?disabled=${this.disabled || this.readonly || (this.allSegmentsEmpty && !this.hasValue)}
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

  protected calendarTemplate() {
    return this.html`
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

    return getMonthName(this.currentLocale, value - 1);
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
    const complete = endpoint === 'start' ? this.startComplete : this.endComplete;
    if (!complete) return undefined;

    return dateFromParts(
      this.segmentValue(endpoint, 'day'),
      this.segmentValue(endpoint, 'month'),
      this.segmentValue(endpoint, 'year')
    );
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
    if (this.open && this.calendarDraftValue?.length) {
      return [...this.calendarDraftValue];
    }

    return this.committedCalendarValue();
  }

  protected committedCalendarValue(): string[] | undefined {
    const [start, end] = this.rangeDates();
    if (!start && !end) return undefined;
    if (start && end) return [toIsoDate(start), toIsoDate(end)];
    if (start) return [toIsoDate(start)];
    return undefined;
  }

  protected isUnavailableDate(date: Date): boolean {
    return isDateUnavailable(date, this.constraints);
  }

  protected updateControlFromState(): void {
    const start = this.endpointDate('start');
    const end = this.endpointDate('end');
    const hasValidRangeLength = start && end ? this.isRangeLengthValid(start, end) : false;

    let nextValue = '';
    if (start && end && hasValidRangeLength && !this.isUnavailableDate(start) && !this.isUnavailableDate(end)) {
      const sorted = compareDates(start, end) <= 0 ? [start, end] : [end, start];
      nextValue = `${toIsoDate(sorted[0]!)}/${toIsoDate(sorted[1]!)}`;
    }

    if (this.value !== nextValue) {
      this.suppressInputEvent = true;
      this.suppressSegmentSync = true;
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
    let nextDate = clampDate(shiftDatePart(parsed, kind, direction), this.constraints);

    let attempts = 0;
    while (this.isUnavailableDate(nextDate) && attempts < 366) {
      nextDate = addDays(nextDate, direction);
      if (this.constraints.minDate && compareDates(nextDate, this.constraints.minDate) < 0) return;
      if (this.constraints.maxDate && compareDates(nextDate, this.constraints.maxDate) > 0) return;
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
      this.resolvedDir === 'rtl' ? this.focusPreviousSegment(endpoint, kind) : this.focusNextSegment(endpoint, kind);
      return;
    }

    if (!isModifier && event.key === keys.ArrowLeft) {
      event.preventDefault();
      this.resolvedDir === 'rtl' ? this.focusNextSegment(endpoint, kind) : this.focusPreviousSegment(endpoint, kind);
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

    if (!isModifier && event.key === keys.Space) {
      event.preventDefault();
      if (!this.open) this.show();
      return;
    }

    if (!isModifier && event.key === keys.Escape && this.open) {
      event.preventDefault();
      this.hide();
    }
  }

  protected applyCalendarValue(detail: CalendarChangeEventDetail): void {
    const raw = detail.value;
    const values = Array.isArray(raw)
      ? raw
      : typeof raw === 'string' && raw.includes('/')
        ? raw.split('/')
        : typeof raw === 'string'
          ? [raw]
          : [];

    const start = parseIsoDate(values[0]);
    const end = parseIsoDate(values[1]);
    const pendingRangeEnd = Boolean(start) && !end;
    this.calendarDraftValue = [start, end]
      .filter((date): date is Date => date !== undefined)
      .map(date => toIsoDate(date));

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

    if (this.open && pendingRangeEnd) {
      void this.updateComplete.then(() => this.calendar?.focus());
    }
  }

  protected handleCalendarInput = (event: CustomEvent<CalendarChangeEventDetail>): void => {
    event.stopPropagation();
    this.applyCalendarValue(event.detail);
    this.emitInput();
  };

  protected isRangeLengthValid(start: Date, end: Date): boolean {
    const length = rangeLengthDays(start, end);
    const { min, max } = normalizeRangeBounds(this.minRange, this.maxRange);

    if (min > 0 && length < min) return false;
    if (max > 0 && length > max) return false;
    return true;
  }

  protected rangeLengthMessage(start: Date, end: Date): string {
    const length = rangeLengthDays(start, end);
    const { min, max } = normalizeRangeBounds(this.minRange, this.maxRange);

    if (min > 0 && length < min) {
      return `Select at least ${min} day${min === 1 ? '' : 's'} in the range.`;
    }

    if (max > 0 && length > max) {
      return `Select no more than ${max} day${max === 1 ? '' : 's'} in the range.`;
    }

    return 'Enter a valid date range.';
  }

  protected handleCalendarChange = (event: CustomEvent<CalendarChangeEventDetail>): void => {
    event.stopPropagation();
    this.applyCalendarValue(event.detail);
    this.open = false;
    this.calendarDraftValue = undefined;
    this.commitChange();
    this.segmentInput('start', this.firstSegmentKind)?.focus();
  };

  protected handlePopupHide = (): void => {
    if (!this.open) return;
    this.open = false;
    this.calendarDraftValue = undefined;
    this.commitChange();
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
