import { css } from 'lit';
import { tokens } from '../../utilities/theme.js';

const { component } = tokens.lit;

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
    width: ${component('breadcrumb', 'item', 'controlWidth')};
    align-items: center;
    text-decoration: none;
  }

  a {
    display: flex;
    padding: ${component('breadcrumb', 'item', 'padding')};
    background-color: ${component('breadcrumb', 'item', 'bgColor')};
    border: ${component('breadcrumb', 'item', 'borderWidth')} solid ${component('breadcrumb', 'item', 'borderColor')};
    color: ${component('breadcrumb', 'item', 'fgColor')};
  }

  :host(:not([selected])) a:hover {
    cursor: pointer;
    background-color: ${component('breadcrumb', 'item', 'hover', 'bgColor')};
    border-color: ${component('breadcrumb', 'item', 'hover', 'borderColor')};
    color: ${component('breadcrumb', 'item', 'hover', 'fgColor')};
  }

  a:hover:active {
    background-color: ${component('breadcrumb', 'item', 'active', 'bgColor')};
    border-color: ${component('breadcrumb', 'item', 'active', 'borderColor')};
    color: ${component('breadcrumb', 'item', 'active', 'fgColor')};
  }

  a:focus {
    outline: none;
    background-color: ${component('breadcrumb', 'item', 'focus', 'bgColor')};
    border-color: ${component('breadcrumb', 'item', 'focus', 'borderColor')};
    color: ${component('breadcrumb', 'item', 'focus', 'fgColor')};
  }

  :host([disabled]) a {
    background-color: ${component('breadcrumb', 'item', 'disabled', 'bgColor')};
    border-color: ${component('breadcrumb', 'item', 'disabled', 'borderColor')};
    color: ${component('breadcrumb', 'item', 'disabled', 'fgColor')};
  }

  :host([disabled]) .control {
    cursor: not-allowed;
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
