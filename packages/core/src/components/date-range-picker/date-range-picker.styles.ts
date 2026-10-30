import { css } from 'lit';
import { component, primitive, semantic } from '../../utilities/theme.js';

export default css`
  :host {
    display: block;
    max-inline-size: 100%;
    --date-range-picker-segment-width: 3ch;
    --date-range-picker-year-width: 4ch;
  }

  .form-control-input {
    align-items: center;
    display: grid;
    gap: ${primitive('spacing', '2xs')};
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .entry {
    align-items: center;
    display: inline-flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    min-inline-size: 0;
  }

  .range-input {
    align-items: center;
    display: inline-flex;
    flex-wrap: wrap;
    gap: ${primitive('spacing', '2xs')};
    justify-content: flex-start;
    max-inline-size: 100%;
    min-inline-size: 0;
  }

  .segment-group {
    align-items: center;
    display: inline-flex;
    flex-wrap: wrap;
    max-inline-size: 100%;
    min-inline-size: 0;
  }

  .segment-wrap {
    align-items: center;
    display: inline-flex;
  }

  .segment {
    appearance: textfield;
    background: transparent;
    border: 0;
    color: inherit;
    field-sizing: content;
    font: inherit;
    inline-size: auto;
    max-inline-size: 100%;
    min-inline-size: var(--date-range-picker-segment-width);
    margin: 0;
    padding: 0 ${primitive('spacing', '2xs')};
    text-align: center;
    -moz-appearance: textfield;
  }

  .segment[data-segment='year'] {
    min-inline-size: var(--date-range-picker-year-width);
  }

  .segment:focus {
    outline: none;
  }

  .segment::placeholder {
    color: ${semantic('formControl', 'placeholderColor')};
    opacity: 1;
  }

  .segment::-webkit-inner-spin-button,
  .segment::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .segment-literal,
  .range-separator {
    color: ${semantic('text', 'secondary')};
    user-select: none;
  }

  .start,
  .end {
    align-items: center;
    display: inline-flex;
  }

  .start {
    margin-inline-end: ${primitive('spacing', 'xs')};
  }

  .end {
    margin-inline-start: ${primitive('spacing', '2xs')};
  }

  .action {
    align-items: center;
    appearance: none;
    background: transparent;
    border: 0;
    border-radius: ${primitive('borderRadius', 'sm')};
    color: inherit;
    cursor: pointer;
    display: inline-flex;
    font: inherit;
    justify-content: center;
    margin: 0;
    min-block-size: 0;
    min-inline-size: 0;
    padding: ${primitive('spacing', '2xs')};
  }

  .action:focus-visible {
    outline: ${primitive('borderWidth', 'thin')} solid ${semantic('focus', 'outlineColor')};
    outline-offset: 0;
  }

  .action[disabled] {
    color: ${semantic('disabled', 'fgColor')};
    cursor: not-allowed;
  }

  .native-input {
    block-size: 0;
    border: 0;
    inline-size: 0;
    opacity: 0;
    overflow: hidden;
    padding: 0;
    pointer-events: none;
    position: absolute;
  }

  .popup {
    background: transparent;
    border: 0;
    margin: 0;
    max-block-size: none;
    max-inline-size: none;
    overflow: visible;
  }

  .popup::part(popup-base) {
    background: ${component('dateRangePicker', 'popover', 'bgColor')};
    border: ${component('dateRangePicker', 'popover', 'border')};
    border-radius: ${component('dateRangePicker', 'popover', 'borderRadius')};
    box-shadow: ${primitive('shadow', 'sm')};
    max-inline-size: ${component('dateRangePicker', 'popover', 'maxWidth')};
    overflow: visible;
    padding: ${component('dateRangePicker', 'popover', 'padding')};
  }

  .footer {
    display: flex;
    justify-content: space-between;
    margin-block-start: ${primitive('spacing', 'sm')};
  }

  .footer-button {
    appearance: none;
    background: transparent;
    border: 0;
    border-radius: ${primitive('borderRadius', 'sm')};
    color: ${semantic('text', 'secondary')};
    cursor: pointer;
    font: inherit;
    padding: ${primitive('spacing', '2xs')} ${primitive('spacing', 'xs')};
  }

  .footer-button:hover:not([disabled]) {
    background: ${semantic('surface', 'secondary')};
    color: ${semantic('text', 'primary')};
  }

  .footer-button:active:not([disabled]) {
    background: ${semantic('surface', 'tertiary')};
  }

  .footer-button:focus-visible {
    outline: ${primitive('borderWidth', 'thin')} solid ${semantic('focus', 'outlineColor')};
    outline-offset: 0;
  }

  .footer-button[disabled] {
    color: ${semantic('disabled', 'fgColor')};
    cursor: not-allowed;
  }

  .footer-button.footer-clear {
    color: ${component('dateRangePicker', 'footer', 'clear', 'fgColor')};
  }

  .footer-button.footer-clear:hover:not([disabled]) {
    background: ${component('dateRangePicker', 'footer', 'clear', 'hover', 'bgColor')};
    color: ${component('dateRangePicker', 'footer', 'clear', 'hover', 'fgColor')};
  }

  .footer-button.footer-clear:active:not([disabled]) {
    background: ${component('dateRangePicker', 'footer', 'clear', 'active', 'bgColor')};
    color: ${component('dateRangePicker', 'footer', 'clear', 'active', 'fgColor')};
  }

  .footer-button.footer-today {
    color: ${component('dateRangePicker', 'footer', 'today', 'fgColor')};
  }

  .footer-button.footer-today:hover:not([disabled]) {
    background: ${component('dateRangePicker', 'footer', 'today', 'hover', 'bgColor')};
    color: ${component('dateRangePicker', 'footer', 'today', 'hover', 'fgColor')};
  }

  .footer-button.footer-today:active:not([disabled]) {
    background: ${component('dateRangePicker', 'footer', 'today', 'active', 'bgColor')};
    color: ${component('dateRangePicker', 'footer', 'today', 'active', 'fgColor')};
  }
`;
