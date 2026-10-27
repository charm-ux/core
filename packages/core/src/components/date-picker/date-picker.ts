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
  createLocalDate,
  dateFromParts,
  getDateInputLayout,
  getDateSegmentPlaceholder,
  isDateUnavailable,
  normalizeDateSegmentInput,
  parseIsoDate,
  parsePastedDate,
  partsFromDate,
  shiftDatePart,
  stepDateSegmentValue,
  todayDate,
  toIsoDate,
  toIsoLocalDate,
} from '../../internal/date.js';
import { keys } from '../../utilities/key-map.js';
import { normalizeLocale } from '../../utilities/locale.js';
import { endTemplate } from '../../templates/end.js';
import { startTemplate } from '../../templates/start.js';
import { CoreCalendar } from '../calendar/calendar.js';
import { CoreIcon } from '../icon/icon.js';
import { CorePopup, type PopupPlacement } from '../popup/popup.js';
import styles from './date-picker.styles.js';
import type { CalendarChangeEventDetail } from '../calendar/calendar.js';
import type { DateConstraints, DateInputSegment } from '../../internal/date.js';

const supportsFieldSizingContent = typeof CSS !== 'undefined' && CSS.supports('field-sizing', 'content');

export interface DatePickerTodayEventDetail {
  value: string;
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
 * @slot day-segment-label - Accessible name for the day segment.
 * @slot month-segment-label - Accessible name for the month segment.
 * @slot year-segment-label - Accessible name for the year segment.
 * @slot day-placeholder - Translated day segment placeholder.
 * @slot month-placeholder - Translated month segment placeholder.
 * @slot year-placeholder - Translated year segment placeholder.
 * @slot incomplete-date-message - Validation text for a partially entered date; translated consumers may provide it here.
 * @slot invalid-date-message - Validation text for an impossible date.
 * @slot unavailable-date-message - Validation text for a date outside the available dates.
 * @slot popup-label - Accessible name for the calendar dialog when no field label is set.
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
  public static override watchedSlots = ['label', 'help-text', 'start', 'end'];

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

  /** Autofill hint for the date segments. Set to `bday` to autofill a birthday. */
  @property()
  public autocomplete?: string;

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

  protected constraints: DateConstraints = createDateConstraints();
  protected suppressSegmentSync = false;
  protected preserveProgrammaticValue = false;
  protected controlUpdatePending = false;
  protected committedValue = '';
  protected hasOpened = false;
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

  /** Gets or sets the value as a `Date` at local midnight; the Date's local calendar day is used. */
  public get valueAsDate(): Date | null {
    const civil = parseIsoDate(this.value);
    return civil ? createLocalDate(civil.getUTCFullYear(), civil.getUTCMonth(), civil.getUTCDate()) : null;
  }

  protected override get validationAnchor(): HTMLElement | undefined {
    return this.segmentInput(this.firstSegmentKind) ?? undefined;
  }

  protected get dateSegments(): readonly DateInputSegment[] {
    return getDateInputLayout(this.currentLocale).segments;
  }

  protected get firstSegmentKind(): 'day' | 'month' | 'year' {
    return getDateInputLayout(this.currentLocale).first;
  }

  protected get segmentKindsInOrder(): readonly ('day' | 'month' | 'year')[] {
    return getDateInputLayout(this.currentLocale).order;
  }

  protected get currentLocale(): string {
    return this.cachedLocale || this.refreshLocale(false);
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
    this.value = newValue ? toIsoLocalDate(newValue) : '';
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

  /** Opens the popup calendar. */
  public show(): void {
    if (this.disabled) return;
    this.open = true;
    void this.updateComplete.then(() => this.focusCalendar());
  }

  /** Closes the popup calendar and commits pending changes. */
  public hide(): void {
    if (!this.open) return;
    this.wasOutsideDismiss = false;
    this.open = false;
    this.commitChange();
  }

  /** Clears the current value and emits `input` and `change`. */
  public clear(): void {
    if (this.disabled || this.readonly || (this.allSegmentsEmpty && !this.hasValue)) return;
    this.day = '';
    this.month = '';
    this.year = '';
    this.suppressSegmentSync = true;
    this.value = '';
    this.open = false;
    this.updateControlFromState();
    this.emitInput();
    this.commitChange();
  }

  /** Focuses the first segment. */
  public override focus(options?: FocusOptions): void {
    this.segmentInput(this.firstSegmentKind)?.focus(options);
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
        part="date-picker-base"
      >
        ${this.labelTemplate()} ${this.helpTextTemplate()} ${this.controlTemplate()} ${this.errorMessageTemplate()}
      </div>
    `;
  }

  protected labelTemplate() {
    return this.html`
        <label
          id="date-picker-label"
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
        content-role="dialog"
        label=${this.popupLabel()}
        focus-trap
        @popup-hide=${this.handlePopupHide}
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
            <div
              class="segments"
              part="date-picker-segments"
              role="group"
              aria-labelledby=${ifDefined(this.hasLabel ? 'date-picker-label' : undefined)}
              @keydown=${this.handleSegmentsKeyDown}
            >
              ${this.dateSegments.map(segment => this.renderSegment(segment))}
            </div>
            ${this.endTemplate()}
          </div>
          <button
            type="button"
            class="action"
            part="date-picker-toggle"
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
          <div class="footer" part="date-picker-footer">
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
              part="date-picker-today"
              ?disabled=${this.disabled || this.readonly || this.todayUnavailable}
              @click=${this.handleTodayClick}
            >
              <slot name="today-label">Today</slot>
            </button>
            <slot name="footer"></slot>
          </div>
        </div>
        <span hidden>
          <slot name="incomplete-date-message">Enter a complete date.</slot>
          <slot name="invalid-date-message">Enter a valid date.</slot>
          <slot name="unavailable-date-message">Date is unavailable.</slot>
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
        @click=${this.handleCalendarClick}
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

  protected renderSegment(segment: DateInputSegment) {
    if (segment.kind === 'literal') {
      return html`<span class="segment-literal" part="date-picker-literal" aria-hidden="true"
        >${segment.literal}</span
      >`;
    }

    const segmentValue = this.segmentValue(segment.kind);
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
        <label class="visually-hidden" for=${`segment-${segment.kind}`}>
          <slot name="${segment.kind}-segment-label">${segment.kind[0]!.toUpperCase()}${segment.kind.slice(1)}</slot>
        </label>
        <input
          id=${`segment-${segment.kind}`}
          class="segment"
          part="date-picker-segment"
          data-segment=${segment.kind}
          inputmode="numeric"
          maxlength=${maxLength}
          size=${placeholderSize}
          autocomplete=${ifDefined(this.segmentAutocomplete(segment.kind))}
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

  protected segmentAutocomplete(kind: 'day' | 'month' | 'year'): string | undefined {
    if (!this.autocomplete) return undefined;
    if (this.autocomplete === 'bday') return `bday-${kind}`;
    return this.autocomplete;
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
    return dateFromParts(this.day, this.month, this.year);
  }

  protected isUnavailableDate(date: Date): boolean {
    return isDateUnavailable(date, this.constraints);
  }

  protected updateControlFromState(): void {
    this.controlUpdatePending = true;
    const parsed = this.parsedSegmentsDate();
    const nextValue =
      parsed && !this.isUnavailableDate(parsed) ? toIsoDate(parsed) : this.preserveProgrammaticValue ? this.value : '';

    if (this.value !== nextValue) {
      this.suppressSegmentSync = true;
      this.value = nextValue;
    }

    if (this.input) {
      this.input.value = this.value;
    }

    if (!this.customErrorMessage && this.input) {
      if (!this.allSegmentsEmpty && !this.hasCompleteSegments) {
        this.input.setCustomValidity(this.messageText('incomplete-date-message', 'Enter a complete date.'));
      } else if ((this.hasCompleteSegments && !parsed) || (this.value && this.allSegmentsEmpty && !parsed)) {
        this.input.setCustomValidity(this.messageText('invalid-date-message', 'Enter a valid date.'));
      } else if (parsed && this.isUnavailableDate(parsed)) {
        this.input.setCustomValidity(this.messageText('unavailable-date-message', 'Date is unavailable.'));
      } else {
        this.input.setCustomValidity('');
      }
    }

    this.internals.setFormValue(this.value || null);
    this.updateValidity();
  }

  protected updateFromSegmentInput(target: HTMLInputElement): void {
    this.preserveProgrammaticValue = false;
    const kind = target.dataset.segment as 'day' | 'month' | 'year';
    const { digits, shouldAdvance } = normalizeDateSegmentInput(target.value, kind);
    let nextKind: 'day' | 'month' | 'year' | undefined;

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

    if (previous !== this.value) this.emitInput();
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
    if (this.readonly || this.disabled) return;
    this.preserveProgrammaticValue = false;
    const parsed = this.parsedSegmentsDate();
    if (!parsed) {
      const fallback = parseIsoDate(this.value) ?? parseIsoDate(this.focusDate) ?? todayDate();
      this.setSegmentValue(kind, stepDateSegmentValue(this.segmentValue(kind), kind, direction, fallback));
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
    this.day = parts.day;
    this.month = parts.month;
    this.year = parts.year;

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

    const firstInput = this.segmentInput(this.firstSegmentKind);
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
    const firstInput = this.segmentInput(this.firstSegmentKind);
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
    this.segmentInput(this.firstSegmentKind)?.focus();
  }

  protected handleTodayClick = (event: Event): void => {
    event.preventDefault();
    if (this.disabled || this.readonly || this.todayUnavailable) return;

    const today = todayDate();
    const isoDate = toIsoDate(today);
    this.suppressSegmentSync = true;
    this.value = isoDate;
    this.syncSegmentsFromValue();
    this.updateControlFromState();
    this.emitInput();
    this.commitChange();
    this.emitDatePickerToday(isoDate);
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
    const text = event.clipboardData?.getData('text')?.trim();
    if (!text) return;

    const date = parsePastedDate(text, this.segmentKindsInOrder);
    if (!date) return;

    event.preventDefault();
    this.preserveProgrammaticValue = false;
    const parts = partsFromDate(date);
    this.day = parts.day;
    this.month = parts.month;
    this.year = parts.year;
    this.updateControlFromState();
    this.emitInput();
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
      this.resolvedDir === 'rtl' ? this.focusPreviousSegment(kind) : this.focusNextSegment(kind);
      return;
    }

    if (!isModifier && event.key === keys.ArrowLeft) {
      event.preventDefault();
      this.resolvedDir === 'rtl' ? this.focusNextSegment(kind) : this.focusPreviousSegment(kind);
      return;
    }

    if (!isModifier && (event.key === keys.ArrowUp || event.key === keys.ArrowDown) && this.readonly) return;

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

  protected applyCalendarValue(detail: CalendarChangeEventDetail): void {
    const next = Array.isArray(detail.value) ? detail.value[0] : detail.value;
    if (!next || typeof next !== 'string') return;
    this.suppressSegmentSync = true;
    this.value = next;
    this.syncSegmentsFromValue();
    this.updateControlFromState();
  }

  protected handleCalendarInput = (event: CustomEvent<CalendarChangeEventDetail>): void => {
    if (!(event instanceof CustomEvent)) return;
    event.stopPropagation();
    this.applyCalendarValue(event.detail);
    this.emitInput();
  };

  protected handleCalendarChange = (event: CustomEvent<CalendarChangeEventDetail>): void => {
    if (!(event instanceof CustomEvent)) return;
    event.stopPropagation();
    this.applyCalendarValue(event.detail);
    this.open = false;
    this.commitChange();
    this.segmentInput(this.firstSegmentKind)?.focus();
  };

  protected handleCalendarClick = (event: MouseEvent): void => {
    const dateButton = event
      .composedPath()
      .find((node): node is HTMLElement => node instanceof HTMLElement && node.dataset.date !== undefined);
    if (dateButton?.dataset.date === this.value) this.hide();
  };

  protected handlePopupHide = (): void => {
    if (!this.open) return;
    this.wasOutsideDismiss = false;
    this.open = false;
    this.commitChange();
  };

  protected handleDocumentPointerDown = (event: PointerEvent): void => {
    if (!this.open) return;
    if (event.composedPath().includes(this)) return;
    this.wasOutsideDismiss = true;
    this.open = false;
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
    this.open = false;
    this.updateControlFromState();
  }

  protected emitDatePickerToday(value: string): void {
    this.emit('date-picker-today', { detail: { value } satisfies DatePickerTodayEventDetail });
  }

  protected commitChange(): void {
    if (this.committedValue === this.value) return;
    this.committedValue = this.value;
    this.emitChange();
  }
}

export default CoreDatePicker;
