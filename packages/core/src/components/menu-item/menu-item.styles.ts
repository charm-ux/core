import { css } from 'lit';
import { SystemColors } from '../../theme/index.js';

const fallbackStyles = {
  indicatorColor: css`black`,
};

export default css`
  :host {
    --menu-item-border-radius: inherit;
    --menu-item-padding-x: inherit;
    --menu-item-padding-y: inherit;
    --menu-item-margin-x: inherit;
    --menu-item-input-container-width: inherit;
    --menu-item-checkbox-icon-size: inherit;

    --menu-item-submenu-item-icon-size: inherit;
    --menu-item-submenu-item-icon-rotation: inherit;

    --menu-item-radio-bg-color: inherit;
    --menu-item-radio-border-color: inherit;
    --menu-item-radio-hover-bg-color: inherit;
    --menu-item-radio-hover-border-color: inherit;
    --menu-item-radio-active-bg-color: inherit;
    --menu-item-radio-active-border-color: inherit;

    /** Rest */
    --menu-item-bg-color: inherit;
    --menu-item-border-color: inherit;
    --menu-item-fg-color: inherit;

    /** Hover */
    --menu-item-hover-bg-color: inherit;
    --menu-item-hover-border-color: inherit;
    --menu-item-hover-fg-color: inherit;

    /** Active */
    --menu-item-active-bg-color: inherit;
    --menu-item-active-border-color: inherit;
    --menu-item-active-fg-color: inherit;

    /** Disabled */
    --menu-item-disabled-bg-color: inherit;
    --menu-item-disabled-border-color: inherit;
    --menu-item-disabled-fg-color: inherit;

    /** Focus */
    --menu-item-focus-outline-color: inherit;
    --menu-item-focus-outline-offset: inherit;

    display: block;
    position: relative;
  }

  .base {
    align-items: center;
    background-color: var(--menu-item-bg-color);
    border: var(--default-border-size) solid var(--menu-item-border-color, transparent);
    border-radius: var(--menu-item-border-radius);
    color: var(--menu-item-fg-color);
    cursor: default;
    display: flex;
    justify-content: start;
    list-style: none;
    min-width: max-content;
    padding-inline: var(--menu-item-padding-x, 8px);
    padding-block: var(--menu-item-padding-y, 8px);
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
    background-color: var(--menu-item-hover-bg-color);
    border-color: var(--menu-item-hover-border-color, transparent);
    color: var(--menu-item-hover-fg-color);
  }

  .base:active {
    background-color: var(--menu-item-active-bg-color);
    border-color: var(--menu-item-active-border-color, transparent);
    color: var(--menu-item-active-fg-color);
  }

  :host(:focus-visible) {
    outline: none;
  }

  :host(:focus-visible) .base {
    outline: var(--focus-outline-size) var(--focus-outline-style) var(--menu-item-focus-outline-color);
    outline-offset: var(--menu-item-focus-outline-offset);
  }

  :host([disabled]) .base {
    cursor: not-allowed;
    background-color: var(--menu-item-disabled-bg-color);
    border-color: var(--menu-item-disabled-border-color, transparent);
    color: var(--menu-item-disabled-fg-color);
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
    font-size: var(--menu-item-submenu-item-icon-size, 20px);
    margin-inline-start: auto;
    color: var(--menu-item-fg-color);
    transform: rotate(-90deg);
  }

  .submenu-item-icon-expanded {
    transform: rotate(var(--menu-item-submenu-item-icon-rotation, -90deg));
  }

  .input-container {
    position: relative;
    width: var(--menu-item-input-container-width, 22px);
  }

  .checkbox,
  .radio,
  ::slotted([slot='radio-indicator']) {
    align-items: center;
    justify-content: center;
    position: relative;
    width: var(--menu-item-input-size, 1rem);
    height: var(--menu-item-input-size, 1rem);
    box-sizing: border-box;
    outline: none;
  }

  .radio {
    display: flex;
    aspect-ratio: 1 / 1;
    background-color: var(--menu-item-radio-bg-color);
    border: var(--default-border);
    border-radius: 50%;
    position: relative;
  }

  :host(:hover) .radio {
    border-color: var(--menu-item-radio-hover-border-color);
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
    background: var(--menu-item-radio-bg-color, ${fallbackStyles.indicatorColor});
    pointer-events: none;
  }

  :host([aria-checked='true']:hover) .radio-indicator {
    background: var(--menu-item-input-hover-bg-color, ${fallbackStyles.indicatorColor});
  }

  :host([aria-checked='true']:active) .radio-indicator {
    background-color: var(--menu-item-radio-active-bg-color);
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
    margin-inline-end: var(--menu-item-margin-x, 8px);
  }

  ::slotted([slot='end']) {
    margin-inline-start: var(--menu-item-margin-x, 8px);
  }

  @media screen and (forced-colors: active) {
    :host {
      --focus-outline-color: ${SystemColors.Highlight};
      --menu-item-disabled-fg-color: ${SystemColors.GrayText};
    }
  }
`;
