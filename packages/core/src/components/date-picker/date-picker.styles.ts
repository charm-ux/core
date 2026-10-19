import { css } from 'lit';
import { component, primitive, semantic } from '../../utilities/theme.js';

export default css`
  :host {
    display: block;
    max-inline-size: 100%;
    --date-picker-segment-width: 3ch;
    --date-picker-year-width: 4ch;
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
    justify-content: flex-start;
    min-inline-size: 0;
    overflow: hidden;
  }

  .segments {
    align-items: center;
    display: inline-flex;
    justify-content: flex-start;
    min-inline-size: 0;
  }

  .start,
  .end {
    align-items: center;
    display: inline-flex;
  }

  .start:empty,
  .end:empty {
    display: none;
  }

  .start {
    margin-inline-end: ${primitive('spacing', 'xs')};
  }

  .end {
    margin-inline-start: ${primitive('spacing', '2xs')};
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
    font: inherit;
    inline-size: var(--date-picker-segment-width);
    margin: 0;
    min-inline-size: 0;
    padding: 0;
    text-align: center;
    -moz-appearance: textfield;
  }

  .segment[data-segment='year'] {
    inline-size: var(--date-picker-year-width);
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

  .segment-literal {
    color: ${semantic('text', 'secondary')};
    user-select: none;
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
    background: ${component('datePicker', 'popover', 'bgColor')};
    border: ${component('datePicker', 'popover', 'border')};
    border-radius: ${component('datePicker', 'popover', 'borderRadius')};
    box-shadow: ${primitive('shadow', 'sm')};
    max-inline-size: ${component('datePicker', 'popover', 'maxWidth')};
    overflow: visible;
    padding: ${component('datePicker', 'popover', 'padding')};
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
    color: ${component('datePicker', 'footer', 'clear', 'fgColor')};
  }

  .footer-button.footer-clear:hover:not([disabled]) {
    background: ${component('datePicker', 'footer', 'clear', 'hover', 'bgColor')};
    color: ${component('datePicker', 'footer', 'clear', 'hover', 'fgColor')};
  }

  .footer-button.footer-clear:active:not([disabled]) {
    background: ${component('datePicker', 'footer', 'clear', 'active', 'bgColor')};
    color: ${component('datePicker', 'footer', 'clear', 'active', 'fgColor')};
  }

  .footer-button.footer-today {
    color: ${component('datePicker', 'footer', 'today', 'fgColor')};
  }

  .footer-button.footer-today:hover:not([disabled]) {
    background: ${component('datePicker', 'footer', 'today', 'hover', 'bgColor')};
    color: ${component('datePicker', 'footer', 'today', 'hover', 'fgColor')};
  }

  .footer-button.footer-today:active:not([disabled]) {
    background: ${component('datePicker', 'footer', 'today', 'active', 'bgColor')};
    color: ${component('datePicker', 'footer', 'today', 'active', 'fgColor')};
  }
`;
