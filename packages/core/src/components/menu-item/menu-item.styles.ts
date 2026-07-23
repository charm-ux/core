import { css } from 'lit';
import { SystemColors } from '../../theme/index.js';
import { tokens } from '../../utilities/theme.js';

const { component } = tokens.lit;

export default css`
  :host {
    display: block;
    position: relative;
  }

  .base {
    align-items: center;
    background-color: ${component('menu', 'item', 'bgColor')};
    border: var(--default-border-size) solid ${component('menu', 'item', 'borderColor')};
    border-radius: ${component('menu', 'item', 'borderRadius')};
    color: ${component('menu', 'item', 'fgColor')};
    cursor: default;
    display: flex;
    justify-content: start;
    list-style: none;
    min-width: max-content;
    padding-inline: ${component('menu', 'item', 'paddingX')};
    padding-block: ${component('menu', 'item', 'paddingY')};
    pointer-events: auto;
    position: relative;
    width: 100%;
  }

  a.base {
    text-decoration: none;
    cursor: pointer;
  }

  .base:hover,
  :host([aria-haspopup='true']) .base:hover {
    background-color: ${component('menu', 'item', 'hover', 'bgColor')};
    border-color: ${component('menu', 'item', 'hover', 'borderColor')};
    color: ${component('menu', 'item', 'hover', 'fgColor')};
  }

  .base:active {
    background-color: ${component('menu', 'item', 'active', 'bgColor')};
    border-color: ${component('menu', 'item', 'active', 'borderColor')};
    color: ${component('menu', 'item', 'active', 'fgColor')};
  }

  :host(:focus-visible) {
    outline: none;
  }

  :host(:focus-visible) .base {
    outline: var(--focus-outline-size) var(--focus-outline-style) ${component('menu', 'item', 'focus', 'outlineColor')};
    outline-offset: ${component('menu', 'item', 'focus', 'outlineOffset')};
  }

  :host([disabled]) .base {
    cursor: not-allowed;
    background-color: ${component('menu', 'item', 'disabled', 'bgColor')};
    border-color: ${component('menu', 'item', 'disabled', 'borderColor')};
    color: var(--menu-item-disabled-fg-color, ${component('menu', 'item', 'disabled', 'fgColor')});
  }

  :host([has-submenu]) .base {
    cursor: pointer;
  }

  :host([role='menuitemradio']),
  :host([role='menuitemcheckbox']) .base {
    cursor: pointer;
  }

  .submenu-item-icon,
  .submenu-item-icon-expanded {
    font-size: ${component('menu', 'item', 'submenuItemIconSize')};
    margin-inline-start: auto;
    color: ${component('menu', 'item', 'fgColor')};
    transform: rotate(-90deg);
  }

  .submenu-item-icon-expanded {
    transform: rotate(${component('menu', 'item', 'submenuItemIconRotation')});
  }

  .input-container {
    position: relative;
    width: ${component('menu', 'item', 'inputContainerWidth')};
  }

  .checkbox,
  .radio,
  ::slotted([slot='radio-indicator']) {
    align-items: center;
    justify-content: center;
    position: relative;
    width: ${component('menu', 'item', 'inputSize')};
    height: ${component('menu', 'item', 'inputSize')};
    box-sizing: border-box;
    outline: none;
  }

  .radio {
    display: flex;
    aspect-ratio: 1 / 1;
    background-color: ${component('menu', 'item', 'radio', 'bgColor')};
    border: var(--default-border);
    border-radius: 50%;
    position: relative;
  }

  :host(:hover) .radio {
    border-color: ${component('menu', 'item', 'radio', 'hoverBorderColor')};
  }

  :host(:active) .radio {
    border-color: var(--default-radio-active-border-color);
  }

  :host([aria-checked='true']) .radio-indicator {
    aspect-ratio: 1 / 1;
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
    background: ${component('menu', 'item', 'radio', 'bgColor')};
    pointer-events: none;
  }

  :host([aria-checked='true']:hover) .radio-indicator {
    background: ${component('menu', 'item', 'inputHoverBgColor')};
  }

  :host([aria-checked='true']:active) .radio-indicator {
    background-color: ${component('menu', 'item', 'radio', 'activeBgColor')};
  }

  ::slotted([slot='radio-indicator']) {
    display: none;
  }

  :host([aria-checked='true']) ::slotted([slot='radio-indicator']) {
    display: flex;
  }

  ::slotted([slot='start']),
  ::slotted([slot='end']) {
    display: flex;
  }

  ::slotted([slot='start']) {
    margin-inline-end: ${component('menu', 'item', 'marginX')};
  }

  ::slotted([slot='end']) {
    margin-inline-start: ${component('menu', 'item', 'marginX')};
  }

  @media screen and (forced-colors: active) {
    :host {
      --focus-outline-color: ${SystemColors.Highlight};
      --menu-item-disabled-fg-color: ${SystemColors.GrayText};
    }
  }
`;
