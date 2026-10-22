import { css } from 'lit';
import { component, semantic } from '../../utilities/theme.js';
import { SystemColors } from '../../theme/index.js';

export default css`
  :host {
    content-visibility: auto;
    display: block;
  }

  :host([hidden]) {
    display: none;
  }

  .option-base {
    align-items: center;
    background-color: ${component('combobox', 'option', 'bgColor')};
    border-radius: ${component('combobox', 'option', 'borderRadius')};
    color: ${component('combobox', 'option', 'fgColor')};
    cursor: pointer;
    display: flex;
    gap: ${semantic('formControl', 'iconGap')};
    padding-block: ${component('combobox', 'option', 'paddingY')};
    padding-inline: ${component('combobox', 'option', 'paddingX')};
  }

  :host(:hover) .option-base,
  :host([current]) .option-base {
    background-color: ${component('combobox', 'option', 'hoverBgColor')};
  }

  :host([selected]) .option-base {
    background-color: ${component('combobox', 'option', 'selectedBgColor')};
  }

  :host([selected][current]) .option-base {
    background-color: ${component('combobox', 'option', 'activeBgColor')};
  }

  :host([aria-disabled='true']) .option-base,
  :host([aria-disabled='true']:hover) .option-base {
    background-color: ${component('combobox', 'option', 'bgColor')};
    color: ${component('combobox', 'option', 'disabledFgColor')};
    cursor: not-allowed;
  }

  .option-start,
  .option-end {
    align-items: center;
    display: none;
    flex: none;
  }

  .option-start.has-content,
  .option-end.has-content {
    display: inline-flex;
  }

  .option-label {
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .option-check {
    color: ${component('combobox', 'option', 'check', 'color')};
    flex: none;
    height: ${component('combobox', 'option', 'check', 'size')};
    width: ${component('combobox', 'option', 'check', 'size')};
  }

  @media screen and (forced-colors: active) {
    :host([current]) .option-base {
      outline: 2px solid ${SystemColors.Highlight};
      outline-offset: -2px;
    }

    :host([aria-disabled='true']) .option-base {
      color: ${SystemColors.GrayText};
    }
  }
`;
