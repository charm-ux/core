import { css } from 'lit';
import { component } from '../../theme/tokens.js';
import { SystemColors } from '../../theme/styles/system-colors.js';

export default css`
  :host {
    align-items: center;
    cursor: pointer;
    display: inline-flex;
    justify-content: center;
    padding-inline: ${component('tab', 'paddingX')};
    padding-block: ${component('tab', 'paddingY')};
    gap: ${component('tab', 'gap')};
    user-select: none;
    background-color: ${component('tab', 'bgColor')};
    border: ${component('tab', 'borderWidth')} ${component('tab', 'borderStyle')} ${component('tab', 'borderColor')};
    color: ${component('tab', 'fgColor')};
    border-radius: ${component('tab', 'borderRadius')};
    line-height: 1;
    font-size: ${component('tab', 'fontSize')};
    font-weight: ${component('tab', 'fontWeight')};
    transition: ${component('tab', 'transition')};
  }

  :host([selected]) {
    background-color: ${component('tab', 'active', 'bgColor')};
    border-color: ${component('tab', 'active', 'borderColor')};
    color: ${component('tab', 'active', 'fgColor')};
    font-weight: ${component('tab', 'active', 'fontWeight')};
  }

  :host([disabled]) {
    cursor: not-allowed;
    background-color: ${component('tab', 'disabled', 'bgColor')};
    border-color: ${component('tab', 'disabled', 'borderColor')};
    color: ${component('tab', 'disabled', 'fgColor')};
  }

  :host(:hover:not([disabled])) {
    background-color: ${component('tab', 'hover', 'bgColor')};
    border-color: ${component('tab', 'hover', 'borderColor')};
    color: ${component('tab', 'hover', 'fgColor')};
  }

  :host(:focus:not([disabled])) {
    background-color: ${component('tab', 'focus', 'bgColor')};
    border-color: ${component('tab', 'focus', 'borderColor')};
    color: ${component('tab', 'focus', 'fgColor')};
  }

  :host(:active:not([disabled])) {
    background-color: ${component('tab', 'active', 'bgColor')};
    border-color: ${component('tab', 'active', 'borderColor')};
    color: ${component('tab', 'active', 'fgColor')};
  }

  @media screen and (forced-colors: active) {
    :host([disabled]) {
      color: ${SystemColors.GrayText};
    }

    :host(:hover:not([disabled]))::before {
      background: ${SystemColors.Highlight};
    }
  }

  ::slotted([slot='start']) {
    font-size: ${component('tab', 'iconSize')};
    margin-inline-end: ${component('tab', 'iconGap')};
  }

  ::slotted([slot='end']) {
    font-size: ${component('tab', 'iconSize')};
    margin-inline-start: ${component('tab', 'iconGap')};
  }
`;
