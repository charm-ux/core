import { css } from 'lit';
import { component, primitive } from '../../utilities/theme.js';

export default css`
  :host {
    display: inline-block;
    max-inline-size: 100%;
  }

  .calendar-base {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    max-inline-size: 100%;
    inline-size: 100%;
  }

  .header {
    align-items: center;
    display: grid;
    gap: ${primitive('spacing', 'xs')};
    grid-template-columns:
      ${component('calendar', 'day', 'size')} minmax(0, 1fr)
      ${component('calendar', 'day', 'size')};
    margin-block-end: ${primitive('spacing', '2xl')};
  }

  .navigation-button {
    align-items: center;
    background-color: transparent;
    border: ${primitive('borderWidth', 'thin')} solid transparent;
    border-radius: ${component('calendar', 'heading', 'navigation', 'borderRadius')};
    block-size: ${component('calendar', 'day', 'size')};
    color: ${component('calendar', 'heading', 'navigation', 'fgColor')};
    cursor: pointer;
    display: inline-flex;
    font-family: inherit;
    font-size: ${component('calendar', 'heading', 'navigation', 'fontSize')};
    inline-size: ${component('calendar', 'day', 'size')};
    justify-content: center;
    line-height: 1;
    padding: 0;
  }

  .navigation-button.previous {
    justify-self: start;
  }

  .navigation-button.next {
    justify-self: end;
  }

  .date-controls {
    align-items: center;
    color: ${component('calendar', 'heading', 'fgColor')};
    display: flex;
    font-size: ${component('calendar', 'heading', 'fontSize')};
    font-weight: ${primitive('fontWeight', 'normal')};
    gap: ${primitive('spacing', 'sm')};
    justify-content: center;
    line-height: 1;
    white-space: nowrap;
  }

  select,
  input {
    background-color: transparent;
    border: 0;
    border-radius: 0;
    color: inherit;
    font: inherit;
    min-block-size: 0;
    padding: 0;
  }

  select {
    appearance: none;
    cursor: pointer;
    field-sizing: content;
    inline-size: auto;
    max-inline-size: 100%;
    text-align: end;
    -webkit-appearance: none;
  }

  input {
    appearance: textfield;
    inline-size: 4ch;
    text-align: start;
    -moz-appearance: textfield;
  }

  input::-webkit-inner-spin-button,
  input::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .navigation-button:disabled {
    background-color: ${component('calendar', 'heading', 'navigation', 'disabled', 'bgColor')};
    color: ${component('calendar', 'heading', 'navigation', 'disabled', 'fgColor')};
    cursor: ${component('calendar', 'heading', 'navigation', 'disabled', 'cursor')};
  }

  select:disabled,
  input:disabled {
    background-color: ${component('calendar', 'heading', 'disabled', 'bgColor')};
    color: ${component('calendar', 'heading', 'disabled', 'fgColor')};
    cursor: ${component('calendar', 'heading', 'disabled', 'cursor')};
  }

  .navigation-button:hover:not(:disabled) {
    background-color: ${component('calendar', 'heading', 'navigation', 'hover', 'bgColor')};
    color: ${component('calendar', 'heading', 'navigation', 'hover', 'fgColor')};
  }

  .day:hover:not(:disabled):not(.selected) {
    background-color: ${component('calendar', 'day', 'hover', 'bgColor')};
    color: ${component('calendar', 'day', 'hover', 'fgColor')};
  }

  .navigation-button:active:not(:disabled) {
    background-color: ${component('calendar', 'heading', 'navigation', 'active', 'bgColor')};
    color: ${component('calendar', 'heading', 'navigation', 'active', 'fgColor')};
  }

  .day:active:not(:disabled):not(.selected) {
    background-color: ${component('calendar', 'day', 'active', 'bgColor')};
    color: ${component('calendar', 'day', 'active', 'fgColor')};
  }

  .grid {
    border-collapse: separate;
    border-spacing: 0;
    table-layout: fixed;
    inline-size: 100%;
  }

  .grid th {
    color: ${component('calendar', 'weekday', 'fgColor')};
    font-size: ${component('calendar', 'weekday', 'fontSize')};
    font-weight: ${primitive('fontWeight', 'medium')};
    block-size: ${component('calendar', 'day', 'size')};
    letter-spacing: ${primitive('letterSpacing', 'wide')};
    padding: 0;
    text-align: center;
    text-transform: uppercase;
    vertical-align: middle;
  }

  .grid tbody tr {
    block-size: ${component('calendar', 'day', 'rowSize')};
  }

  .grid td {
    padding: 0;
    text-align: center;
    vertical-align: middle;
  }

  .grid td.range-inner-cell,
  .grid td.range-start-cell,
  .grid td.range-end-cell {
    /* Inline insets of the range track. Cells overlap by half a pixel so adjacent tracks never leave a seam. */
    --calendar-range-inset-start: -0.5px;
    --calendar-range-inset-end: -0.5px;
    --calendar-range-button-inset: calc((100% - ${component('calendar', 'day', 'size')}) / 2);

    position: relative;
  }

  /* The track starts/ends at the center of the endpoint so it hides behind the endpoint's square edge. */
  .grid td.range-start-cell {
    --calendar-range-inset-start: 50%;
  }

  .grid td.range-end-cell {
    --calendar-range-inset-end: 50%;
  }

  /* Where the range wraps to another week, trim the track to the edge of the date button. */
  .grid td.range-row-start:not(.range-start-cell) {
    --calendar-range-inset-start: var(--calendar-range-button-inset);
  }

  .grid td.range-row-end:not(.range-end-cell) {
    --calendar-range-inset-end: var(--calendar-range-button-inset);
  }

  .grid td.range-inner-cell::before,
  .grid td.range-start-cell::before,
  .grid td.range-end-cell::before {
    background-color: ${component('calendar', 'day', 'range', 'bgColor')};
    block-size: ${component('calendar', 'day', 'size')};
    content: '';
    inset-block-start: var(--calendar-range-button-inset);
    inset-inline-end: var(--calendar-range-inset-end);
    inset-inline-start: var(--calendar-range-inset-start);
    pointer-events: none;
    position: absolute;
    z-index: 0;
  }

  .day {
    align-items: center;
    background-color: transparent;
    border: ${primitive('borderWidth', 'thin')} solid transparent;
    border-radius: ${component('calendar', 'day', 'borderRadius')};
    box-sizing: border-box;
    color: ${component('calendar', 'day', 'fgColor')};
    cursor: pointer;
    display: inline-flex;
    font-family: inherit;
    font-size: ${component('calendar', 'day', 'fontSize')};
    block-size: ${component('calendar', 'day', 'size')};
    justify-content: center;
    line-height: 1;
    padding: 0;
    inline-size: min(100%, ${component('calendar', 'day', 'size')});
    position: relative;
    z-index: 1;
  }

  .day.selected {
    background-color: ${component('calendar', 'day', 'selected', 'bgColor')};
    color: ${component('calendar', 'day', 'selected', 'fgColor')};
  }

  .day.selected:hover:not(:disabled) {
    background-color: ${component('calendar', 'day', 'selected', 'hover', 'bgColor')};
    border-color: ${component('calendar', 'day', 'selected', 'hover', 'borderColor')};
    color: ${component('calendar', 'day', 'selected', 'hover', 'fgColor')};
  }

  .day.selected:active:not(:disabled) {
    background-color: ${component('calendar', 'day', 'selected', 'active', 'bgColor')};
    border-color: ${component('calendar', 'day', 'selected', 'active', 'borderColor')};
    color: ${component('calendar', 'day', 'selected', 'active', 'fgColor')};
  }

  .day.range-inner {
    background-color: transparent;
    border-radius: 0;
    color: ${component('calendar', 'day', 'range', 'fgColor')};
  }

  .day.range-inner:hover:not(:disabled) {
    background-color: transparent;
    color: ${component('calendar', 'day', 'range', 'fgColor')};
  }

  .day.range-start {
    border-radius: ${component('calendar', 'day', 'borderRadius')};
    border-end-end-radius: 0;
    border-start-end-radius: 0;
  }

  .day.range-end {
    border-radius: ${component('calendar', 'day', 'borderRadius')};
    border-end-start-radius: 0;
    border-start-start-radius: 0;
  }

  .day.today:not(.selected) {
    border-color: ${component('calendar', 'day', 'today', 'borderColor')};
  }

  .day.disabled,
  .day.disabled:hover {
    background-color: ${component('calendar', 'day', 'disabled', 'bgColor')};
    color: ${component('calendar', 'day', 'disabled', 'fgColor')};
    cursor: ${component('calendar', 'day', 'disabled', 'cursor')};
  }

  @media (forced-colors: active) {
    .day.selected {
      background-color: Highlight;
      border-color: Highlight;
      color: HighlightText;
    }

    .day.today:not(.selected) {
      border-color: ButtonText;
    }

    .day.disabled {
      color: GrayText;
    }
  }
`;
