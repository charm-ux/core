import { css } from 'lit';
import { component } from '../../utilities/theme.js';

export default css`
  :host {
    background: transparent;
    display: inline-flex;
    fill: currentColor;
    outline: none;
  }

  :host([href]) .control {
    cursor: pointer;
  }

  .base {
    align-items: center;
    box-sizing: border-box;
    display: flex;
    fill: inherit;
    white-space: nowrap;
  }

  .control {
    display: flex;
    width: ${component('breadcrumb', 'item', 'controlWidth')};
    align-items: center;
    box-sizing: border-box;
    text-decoration: none;
    color: ${component('breadcrumb', 'item', 'fgColor')};
    padding: ${component('breadcrumb', 'item', 'padding')};
    background-color: ${component('breadcrumb', 'item', 'bgColor')};
    border: ${component('breadcrumb', 'item', 'borderWidth')} solid ${component('breadcrumb', 'item', 'borderColor')};
  }

  :host(:not([current])) a.control:hover {
    cursor: pointer;
    background-color: ${component('breadcrumb', 'item', 'hover', 'bgColor')};
    border-color: ${component('breadcrumb', 'item', 'hover', 'borderColor')};
    color: ${component('breadcrumb', 'item', 'hover', 'fgColor')};
  }

  a.control:hover:active {
    background-color: ${component('breadcrumb', 'item', 'active', 'bgColor')};
    border-color: ${component('breadcrumb', 'item', 'active', 'borderColor')};
    color: ${component('breadcrumb', 'item', 'active', 'fgColor')};
  }

  a.control:focus-visible {
    background-color: ${component('breadcrumb', 'item', 'focus', 'bgColor')};
    border-color: ${component('breadcrumb', 'item', 'focus', 'borderColor')};
    color: ${component('breadcrumb', 'item', 'focus', 'fgColor')};
  }

  :host([disabled]) .control {
    background-color: ${component('breadcrumb', 'item', 'disabled', 'bgColor')};
    border-color: ${component('breadcrumb', 'item', 'disabled', 'borderColor')};
    color: ${component('breadcrumb', 'item', 'disabled', 'fgColor')};
  }

  :host([disabled]) .control {
    cursor: not-allowed;
  }

  :host(:dir(rtl)) .separator {
    display: inline-flex;
    transform: scaleX(-1);
  }

  .start,
  .end {
    display: flex;
  }

  .start ::slotted(*) {
    margin-inline-end: ${component('breadcrumb', 'item', 'gap')};
  }

  .end ::slotted(*) {
    margin-inline-start: ${component('breadcrumb', 'item', 'gap')};
  }

  .content {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
