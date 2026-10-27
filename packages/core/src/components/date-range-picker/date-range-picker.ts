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
  getDateSegmentPlaceholder,
  isDateUnavailable,
  normalizeDateSegmentInput,
  normalizeRangeBounds,
  parseIsoDate,
  parsePastedDate,
  partsFromDate,
  rangeLengthDays,
  shiftDatePart,
  stepDateSegmentValue,
  todayDate,
  toIsoDate,
} from '../../internal/date.js';
import { keys } from '../../utilities/key-map.js';
import { normalizeLocale } from '../../utilities/locale.js';
import { endTemplate } from '../../templates/end.js';
import { startTemplate } from '../../templates/start.js';
import { CoreCalendar } from '../calendar/calendar.js';
import { CoreIcon } from '../icon/icon.js';
import { CorePopup, type PopupPlacement } from '../popup/popup.js';
import styles from './date-range-picker.styles.js';
import type { CalendarChangeEventDetail } from '../calendar/calendar.js';
import type { DateConstraints, DateInputSegment } from '../../internal/date.js';

const supportsFieldSizingContent = typeof CSS !== 'undefined' && CSS.supports('field-sizing', 'content');

type SegmentKind = 'day' | 'month' | 'year';
type Endpoint = 'start' | 'end';

export interface DateRangePickerTodayEventDetail {
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
 * @slot start-label - Accessible name for the start date segments.
 * @slot end-label - Accessible name for the end date segments.
 * @slot start-day-label - Accessible name for the start day segment.
 * @slot start-month-label - Accessible name for the start month segment.
 * @slot start-year-label - Accessible name for the start year segment.
 * @slot end-day-label - Accessible name for the end day segment.
 * @slot end-month-label - Accessible name for the end month segment.
 * @slot end-year-label - Accessible name for the end year segment.
 * @slot day-placeholder - Translated day segment placeholder.
 * @slot month-placeholder - Translated month segment placeholder.
 * @slot year-placeholder - Translated year segment placeholder.
 * @slot incomplete-range-message - Validation text for a partially entered range.
 * @slot invalid-range-message - Validation text for an impossible range.
 * @slot unavailable-range-message - Validation text when either endpoint is unavailable.
 * @slot min-range-message - Singular minimum range length message; supports `{count}`.
 * @slot min-range-message-other - Plural minimum range length message; supports `{count}`.
 * @slot max-range-message - Singular maximum range length message; supports `{count}`.
 * @slot max-range-message-other - Plural maximum range length message; supports `{count}`.
 * @slot popup-label - Accessible name for the calendar dialog when no field label is set.
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
  public static override watchedSlots = ['label', 'help-text', 'start', 'end'];

  /** The earliest selectable date, in `YYYY-MM-DD` format. */
  @property()
  public min?: string;

  /** The latest selectable date, in `YYYY-MM-DD` format. */
  @property()
  public max?: string;

  /** The date initially focused when no range value is set. */
  @property({ attribute: 'focus-date' })
  public focusDate?: string;

  /** A comma- or whitespace-separated list of unavailable ISO dates. */
  @property({ attribute: 'disabled-dates' })
  public disabledDates = '';

  /** A comma- or whitespace-separated list of unavailable weekdays (0 Sunday through 6 Saturday). */
  @property({ attribute: 'disabled-week-days' })
  public disabledWeekDays = '';

  /** The locale-first weekday override (0 Sunday through 6 Saturday). */
  @property({ attribute: 'first-day-of-week', type: Number })
  public firstDayOfWeek?: number;

  /** The visible format for calendar weekday headings. */
  @property({ attribute: 'weekday-format' })
  public weekdayFormat: 'narrow' | 'short' | 'long' = 'short';

  /** The minimum allowed range length in days, inclusive of both start and end dates. `0` disables this constraint. */
  @property({ attribute: 'min-range', type: Number })
  public minRange = 0;

  /** The maximum allowed range length in days, inclusive of both start and end dates. `0` disables this constraint. */
  @property({ attribute: 'max-range', type: Number })
  public maxRange = 0;

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
  protected suppressSegmentSync = false;
  protected preserveProgrammaticValue = false;
  protected controlUpdatePending = false;
  protected committedValue = '';
  protected calendarDraftValue?: string[];
  protected hasOpened = false;
  protected cachedCalendarValue?: string[];
  protected cachedCalendarSource = '';
  protected blurFrame?: number;
  protected wasOutsideDismiss = false;
  protected localeObserver?: MutationObserver;
  protected cachedLocale = '';

  public static override get dependencies(): (typeof CharmElement)[] {
    return [CoreCalendar, CoreIcon, CorePopup];
  }

  public override get value(): string {
    return this._value ?? this.defaultValue ?? '';
  }

  protected override get validationAnchor(): HTMLElement | undefined {
    return this.segmentInput('start', this.firstSegmentKind) ?? undefined;
  }

  protected get currentLocale(): string {
    return this.cachedLocale || this.refreshLocale(false);
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
    this.refreshLocale(false);
    this.observeLocale();
  }

  public override disconnectedCallback(): void {
    document.removeEventListener('pointerdown', this.handleDocumentPointerDown);
    this.localeObserver?.disconnect();
    this.localeObserver = undefined;
    if (this.blurFrame !== undefined) cancelAnimationFrame(this.blurFrame);
    super.disconnectedCallback();
  }

  /** Opens the calendar and starts a fresh in-progress selection from the committed value. */
  public show(): void {
    if (this.disabled) return;
    this.calendarDraftValue = this.committedCalendarValue();
    this.open = true;
    void this.updateComplete.then(() => this.focusCalendar());
  }

  /** Closes the calendar and discards any in-progress calendar selection. */
  public hide(): void {
    if (!this.open) return;
    this.wasOutsideDismiss = false;
    this.open = false;
    this.calendarDraftValue = undefined;
    this.commitChange();
  }

  /** Clears both endpoints and emits `input` and `change`. */
  public clear(): void {
    if (this.disabled || this.readonly || (this.allSegmentsEmpty && !this.hasValue)) return;
    this.startDay = '';
    this.startMonth = '';
    this.startYear = '';
    this.endDay = '';
    this.endMonth = '';
    this.endYear = '';
    this.suppressSegmentSync = true;
    this.value = '';
    this.calendarDraftValue = undefined;
    this.open = false;
    this.updateControlFromState();
    this.emitInput();
    this.commitChange();
  }

  /** Focuses the first segment of the start date. */
  public override focus(options?: FocusOptions): void {
    this.segmentInput('start', this.firstSegmentKind)?.focus(options);
  }

  protected observeLocale(): void {
    this.localeObserver?.disconnect();
    this.localeObserver = new MutationObserver(() => this.refreshLocale());
    this.localeObserver.observe(this, { attributes: true, attributeFilter: ['lang'] });
    const inheritedLanguage = this.parentElement?.closest('[lang]') ?? document.documentElement;
    if (inheritedLanguage !== this) {
      this.localeObserver.observe(inheritedLanguage, { attributes: true, attributeFilter: ['lang'] });
    }
  }

  protected async focusCalendar(): Promise<void> {
    const calendar = this.calendar;
    if (!calendar) return;
    await calendar.updateComplete;
    calendar.focus();
  }

  protected refreshLocale(requestUpdate = true): string {
    this.cachedLocale = normalizeLocale(this.closest('[lang]')?.getAttribute('lang') || navigator.language || 'en');
    if (requestUpdate && this.isConnected && !this.isUpdatePending) this.requestUpdate('lang');
    return this.cachedLocale;
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
      if (this.value) this.preserveProgrammaticValue = true;
    }

    if ((changedProperties.has('minRange') || changedProperties.has('maxRange')) && this.value) {
      this.preserveProgrammaticValue = true;
    }

    if (this.open) this.hasOpened = true;

    const shouldSyncSegments = changedProperties.has('value') && !this.suppressSegmentSync;
    if (shouldSyncSegments) this.preserveProgrammaticValue = true;
    if (shouldSyncSegments && this.hasUpdated) this.committedValue = this.value;
    this.suppressSegmentSync = false;
    if (!this.hasUpdated || shouldSyncSegments) this.syncSegmentsFromValue();
  }

  protected override updated(changedProperties: Map<string | number | symbol, unknown>): void {
    super.updated(changedProperties);

    if (changedProperties.has('open')) {
      if (this.open) {
        document.addEventListener('pointerdown', this.handleDocumentPointerDown);
        this.wasOutsideDismiss = false;
      } else {
        document.removeEventListener('pointerdown', this.handleDocumentPointerDown);
        if (this.wasOutsideDismiss) this.wasOutsideDismiss = false;
        else if (changedProperties.get('open') === true) void this.updateComplete.then(() => this.focus());
      }
    }

    const shouldUpdateControl =
      changedProperties.has('value') ||
      changedProperties.has('required') ||
      changedProperties.has('min') ||
      changedProperties.has('max') ||
      changedProperties.has('disabledDates') ||
      changedProperties.has('disabledWeekDays') ||
      changedProperties.has('minRange') ||
      changedProperties.has('maxRange') ||
      changedProperties.has('disabled') ||
      changedProperties.has('readonly');
    if (this.controlUpdatePending) {
      this.controlUpdatePending = false;
    } else if (shouldUpdateControl) {
      this.updateControlFromState();
      this.controlUpdatePending = false;
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
          id="date-range-picker-label"
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
        label=${this.popupLabel()}
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
            <div
              class="range-input"
              role="group"
              aria-labelledby=${ifDefined(this.hasLabel ? 'date-range-picker-label' : undefined)}
              @keydown=${this.handleSegmentsKeyDown}
            >
              <div class="segment-group" part="date-range-picker-group" role="group" aria-labelledby="start-date-label">
                <span id="start-date-label" class="visually-hidden"><slot name="start-label">Start date</slot></span>
                ${this.dateSegments.map(segment => this.renderSegment('start', segment))}
              </div>
              <span class="range-separator" part="date-range-picker-separator" aria-hidden="true"
                ><slot name="range-separator">-</slot></span
              >
              <div class="segment-group" part="date-range-picker-group" role="group" aria-labelledby="end-date-label">
                <span id="end-date-label" class="visually-hidden"><slot name="end-label">End date</slot></span>
                ${this.dateSegments.map(segment => this.renderSegment('end', segment))}
              </div>
            </div>
            ${this.endTemplate()}
          </div>
          <button
            type="button"
            class="action"
            part="date-range-picker-toggle"
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
        <span hidden>
          <slot name="incomplete-range-message">Enter both start and end dates.</slot>
          <slot name="invalid-range-message">Enter a valid date range.</slot>
          <slot name="unavailable-range-message">One or both dates are unavailable.</slot>
          <slot name="min-range-message">Select at least {count} day.</slot>
          <slot name="min-range-message-other">Select at least {count} days.</slot>
          <slot name="max-range-message">Select no more than {count} day.</slot>
          <slot name="max-range-message-other">Select no more than {count} days.</slot>
          <slot name="popup-label">Calendar</slot>
          <slot name="day-placeholder">DD</slot>
          <slot name="month-placeholder">MM</slot>
          <slot name="year-placeholder">YYYY</slot>
        </span>
      </scoped-popup>
    `;
  }

  protected calendarTemplate() {
    return this.html`
      <scoped-calendar
        class="calendar"
        selection-mode="range"
        .value=${this.calendarValue()}
        .focusDate=${this.focusDate || (this.rangeDates()[0] ? toIsoDate(this.rangeDates()[0]!) : undefined)}
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
        <slot name="previous-month-label" slot="previous-month-label">Previous month</slot>
        <slot name="next-month-label" slot="next-month-label">Next month</slot>
        <slot name="month-label" slot="month-label">Month</slot>
        <slot name="year-label" slot="year-label">Year</slot>
      </scoped-calendar>
    `;
  }

  protected startTemplate() {
    return this.hasNamedSlot('start') ? startTemplate() : nothing;
  }

  protected endTemplate() {
    return this.hasNamedSlot('end') ? endTemplate() : nothing;
  }

  protected renderSegment(endpoint: Endpoint, segment: DateInputSegment) {
    if (segment.kind === 'literal') {
      return html`<span class="segment-literal" part="date-range-picker-literal" aria-hidden="true"
        >${segment.literal}</span
      >`;
    }

    const segmentValue = this.segmentValue(endpoint, segment.kind);
    const placeholder = this.messageText(
      `${segment.kind}-placeholder`,
      getDateSegmentPlaceholder(this.currentLocale, segment.kind)
    );
    const maxLength = segment.kind === 'year' ? 4 : 2;
    const placeholderSize = supportsFieldSizingContent
      ? maxLength
      : Math.max(maxLength, Array.from(placeholder).length * 2);

    return html`
      <span class="segment-wrap">
        <label class="visually-hidden" for=${`segment-${endpoint}-${segment.kind}`}>
          <slot name="${endpoint}-${segment.kind}-label"
            >${endpoint === 'start' ? 'Start' : 'End'} ${segment.kind}</slot
          >
        </label>
        <input
          id=${`segment-${endpoint}-${segment.kind}`}
          class="segment"
          part="date-range-picker-segment"
          data-endpoint=${endpoint}
          data-segment=${segment.kind}
          inputmode="numeric"
          maxlength=${maxLength}
          size=${placeholderSize}
          aria-describedby=${ifDefined(this.describedBy)}
          aria-errormessage=${ifDefined(this.invalid ? 'error-text' : undefined)}
          aria-invalid=${this.invalid}
          ?required=${this.required}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          .value=${segmentValue}
          placeholder=${placeholder}
          @focus=${this.handleSegmentFocus}
          @click=${this.handleSegmentClick}
          @input=${this.handleSegmentInput}
          @paste=${this.handleSegmentPaste}
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
      return this.calendarDraftValue;
    }

    return this.committedCalendarValue();
  }

  protected committedCalendarValue(): string[] | undefined {
    if (this.cachedCalendarSource === this.value) return this.cachedCalendarValue;
    const [start, end] = this.rangeDates();
    this.cachedCalendarSource = this.value;
    this.cachedCalendarValue =
      !start && !end
        ? undefined
        : start && end
          ? [toIsoDate(start), toIsoDate(end)]
          : start
            ? [toIsoDate(start)]
            : undefined;
    return this.cachedCalendarValue;
  }

  protected isUnavailableDate(date: Date): boolean {
    return isDateUnavailable(date, this.constraints);
  }

  protected updateControlFromState(): void {
    this.controlUpdatePending = true;
    const start = this.endpointDate('start');
    const end = this.endpointDate('end');
    const hasValidRangeLength = start && end ? this.isRangeLengthValid(start, end) : false;

    let nextValue = this.preserveProgrammaticValue ? this.value : '';
    if (start && end && hasValidRangeLength && !this.isUnavailableDate(start) && !this.isUnavailableDate(end)) {
      const sorted = compareDates(start, end) <= 0 ? [start, end] : [end, start];
      nextValue = `${toIsoDate(sorted[0]!)}/${toIsoDate(sorted[1]!)}`;
    }

    if (this.value !== nextValue) {
      this.suppressSegmentSync = true;
      this.value = nextValue;
      if (nextValue) this.syncSegmentsFromValue();
    }

    if (this.input) {
      this.input.value = this.value;
    }

    if (!this.customErrorMessage && this.input) {
      const incomplete =
        (this.startDay || this.startMonth || this.startYear || this.endDay || this.endMonth || this.endYear) &&
        !(this.startComplete && this.endComplete);

      if (incomplete) {
        this.input.setCustomValidity(this.messageText('incomplete-range-message', 'Enter both start and end dates.'));
      } else if (
        (this.startComplete && !start) ||
        (this.endComplete && !end) ||
        (this.value && this.allSegmentsEmpty && !start && !end)
      ) {
        this.input.setCustomValidity(this.messageText('invalid-range-message', 'Enter a valid date range.'));
      } else if (start && end && !hasValidRangeLength) {
        this.input.setCustomValidity(this.rangeLengthMessage(start, end));
      } else if ((start && this.isUnavailableDate(start)) || (end && this.isUnavailableDate(end))) {
        this.input.setCustomValidity(
          this.messageText('unavailable-range-message', 'One or both dates are unavailable.')
        );
      } else {
        this.input.setCustomValidity('');
      }
    }

    this.internals.setFormValue(this.value || null);
    this.updateValidity();
  }

  protected updateFromSegmentInput(target: HTMLInputElement): void {
    this.preserveProgrammaticValue = false;
    const endpoint = target.dataset.endpoint as Endpoint;
    const kind = target.dataset.segment as SegmentKind;
    const { digits, shouldAdvance } = normalizeDateSegmentInput(target.value, kind);
    let nextTarget: { endpoint: Endpoint; kind: SegmentKind } | undefined;

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

    if (previous !== this.value) this.emitInput();
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
    if (this.readonly || this.disabled) return;
    this.preserveProgrammaticValue = false;
    const parsed = this.endpointDate(endpoint);
    if (!parsed) {
      const [rangeStart, rangeEnd] = this.rangeDates();
      const fallback =
        (endpoint === 'start' ? (rangeStart ?? rangeEnd) : (rangeEnd ?? rangeStart)) ??
        parseIsoDate(this.focusDate) ??
        todayDate();
      this.setSegmentValue(
        endpoint,
        kind,
        stepDateSegmentValue(this.segmentValue(endpoint, kind), kind, direction, fallback)
      );
      const previous = this.value;
      this.updateControlFromState();
      if (previous !== this.value) this.emitInput();
      return;
    }

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
    if (previous !== this.value) this.emitInput();
  }

  protected handleControlClick(event: MouseEvent): void {
    if (event.defaultPrevented) return;
    const target = event.composedPath()[0] as HTMLElement;
    if (target.closest('.action')) return;
    if (target.closest('.segment')) return;
    if (target.closest('button, input, select, textarea, a[href], [contenteditable="true"]')) return;

    const firstInput = this.segmentInput('start', this.firstSegmentKind);
    firstInput?.focus();
    if (this.allSegmentsEmpty) firstInput?.select();
  }

  protected handleControlPointerDown(event: PointerEvent): void {
    if (event.button !== 0) return;
    const target = event.composedPath()[0] as HTMLElement;
    if (target.closest('.action')) return;
    if (target.closest('.segment')) return;
    if (target.closest('button, input, select, textarea, a[href], [contenteditable="true"]')) return;

    event.preventDefault();
    const firstInput = this.segmentInput('start', this.firstSegmentKind);
    firstInput?.focus();
    if (this.allSegmentsEmpty) firstInput?.select();
  }

  protected handleToggleClick(event: Event): void {
    event.preventDefault();
    if (this.disabled) return;
    this.open ? this.hide() : this.show();
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

    this.calendarDraftValue = undefined;
    this.suppressSegmentSync = true;
    this.value = `${isoDate}/${isoDate}`;
    this.updateControlFromState();
    this.emitInput();
    this.commitChange();
    this.emitDateRangePickerToday(this.value);
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
    if (this.blurFrame !== undefined) cancelAnimationFrame(this.blurFrame);
    this.blurFrame = requestAnimationFrame(() => {
      this.blurFrame = undefined;
      const active = this.shadowRoot?.activeElement;
      if (
        (active instanceof HTMLInputElement && active.classList.contains('segment')) ||
        this.open ||
        this.contains(document.activeElement)
      )
        return;
      this.handleBlur();
      this.commitChange();
    });
  };

  protected handleSegmentInput(event: Event): void {
    event.stopPropagation();
    if (this.disabled || this.readonly) return;
    this.updateFromSegmentInput(event.currentTarget as HTMLInputElement);
  }

  protected handleSegmentPaste(event: ClipboardEvent): void {
    if (this.disabled || this.readonly) return;
    const target = event.currentTarget;
    if (!(target instanceof HTMLInputElement)) return;
    const endpoint = target.dataset.endpoint as Endpoint;
    const text = event.clipboardData?.getData('text')?.trim();
    if (!text || !endpoint) return;

    const date = parsePastedDate(text, this.segmentKindsInOrder);
    if (!date) return;

    event.preventDefault();
    this.preserveProgrammaticValue = false;
    const parts = partsFromDate(date);
    this.setSegmentValue(endpoint, 'day', parts.day);
    this.setSegmentValue(endpoint, 'month', parts.month);
    this.setSegmentValue(endpoint, 'year', parts.year);
    this.updateControlFromState();
    this.emitInput();
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

    if (!isModifier && (event.key === keys.ArrowUp || event.key === keys.ArrowDown) && this.readonly) return;

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

    if (pendingRangeEnd) {
      if (this.open) void this.updateComplete.then(() => this.focusCalendar());
      return;
    }

    this.preserveProgrammaticValue = false;

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
  }

  protected handleCalendarInput = (event: CustomEvent<CalendarChangeEventDetail>): void => {
    if (!(event instanceof CustomEvent)) return;
    event.stopPropagation();
    const previous = this.value;
    this.applyCalendarValue(event.detail);
    if (this.value !== previous) this.emitInput();
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
      const category = new Intl.PluralRules(this.currentLocale).select(min);
      const slot = category === 'one' ? 'min-range-message' : 'min-range-message-other';
      const fallback = category === 'one' ? 'Select at least {count} day.' : 'Select at least {count} days.';
      return this.messageText(slot, fallback).replace(
        /\{count\}/g,
        new Intl.NumberFormat(this.currentLocale).format(min)
      );
    }

    if (max > 0 && length > max) {
      const category = new Intl.PluralRules(this.currentLocale).select(max);
      const slot = category === 'one' ? 'max-range-message' : 'max-range-message-other';
      const fallback = category === 'one' ? 'Select no more than {count} day.' : 'Select no more than {count} days.';
      return this.messageText(slot, fallback).replace(
        /\{count\}/g,
        new Intl.NumberFormat(this.currentLocale).format(max)
      );
    }

    return this.messageText('invalid-range-message', 'Enter a valid date range.');
  }

  protected handleCalendarChange = (event: CustomEvent<CalendarChangeEventDetail>): void => {
    if (!(event instanceof CustomEvent)) return;
    event.stopPropagation();
    this.applyCalendarValue(event.detail);
    this.open = false;
    this.calendarDraftValue = undefined;
    this.commitChange();
    this.segmentInput('start', this.firstSegmentKind)?.focus();
  };

  protected handlePopupHide = (): void => {
    if (!this.open) return;
    this.wasOutsideDismiss = false;
    this.open = false;
    this.calendarDraftValue = undefined;
    this.commitChange();
  };

  protected handleDocumentPointerDown = (event: PointerEvent): void => {
    if (!this.open) return;
    if (event.composedPath().includes(this)) return;
    this.wasOutsideDismiss = true;
    this.open = false;
    this.calendarDraftValue = undefined;
    this.commitChange();
  };

  protected popupLabel(): string {
    const label = this.label || this.querySelector('[slot="label"]')?.textContent?.trim();
    return label || this.messageText('popup-label', 'Calendar');
  }

  protected messageText(slotName: string, fallback: string): string {
    return this.querySelector<HTMLElement>(`[slot="${slotName}"]`)?.textContent?.trim() || fallback;
  }

  protected override formResetCallback(): void {
    super.formResetCallback();
    this.syncSegmentsFromValue();
    this.committedValue = this.value;
    this.calendarDraftValue = undefined;
    this.open = false;
    this.updateControlFromState();
  }

  protected emitDateRangePickerToday(value: string): void {
    this.emit('date-range-picker-today', { detail: { value } satisfies DateRangePickerTodayEventDetail });
  }

  protected commitChange(): void {
    if (this.committedValue === this.value) return;
    this.committedValue = this.value;
    this.emitChange();
  }
}

export default CoreDateRangePicker;
