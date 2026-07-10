import { css } from 'lit';
import { project } from '../../utilities/project.js';
import { SystemColors } from '../../theme/index.js';
const { component, semantic, primitive } = project.theme;

export default css`
  :host {
    display: grid;
  }

  .switch {
    align-items: flex-start;
    justify-content: start;
    vertical-align: middle;
    cursor: pointer;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: ${semantic('formControl', 'label', 'gap')};
    width: fit-content;
  }

  :host([label-position='end']) .switch {
    flex-direction: row-reverse;
  }

  :host([label-position='end']) .form-control {
    display: unset;
  }

  :host([label-position='start']) .switch {
    flex-direction: row;
  }

  .switch-control-wrapper {
    display: inline-flex;
    line-height: 1;
  }

  .switch-control {
    flex: 0 0 auto;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: ${component('switch', 'width')};
    height: ${component('switch', 'height')};
    background-color: ${component('switch', 'control', 'bgColor')};
    border: ${semantic('defaultBorder', 'width')} ${semantic('defaultBorder', 'style')}
      ${component('switch', 'control', 'borderColor')};
    border-radius: ${primitive('borderRadius', 'full')};
    transition: ${component('switch', 'control', 'transition')};
  }

  .switch-thumb {
    width: ${component('switch', 'thumb', 'size')};
    height: ${component('switch', 'thumb', 'size')};
    background-color: ${component('switch', 'thumb', 'bgColor')};
    border-radius: 50%;
    transform: translateX(calc(${component('switch', 'thumb', 'transform')} * (-1)));
    transition: ${component('switch', 'thumb', 'transition')};
  }

  .switch-input {
    position: absolute;
    opacity: 0;
    padding: 0;
    margin: 0;
    pointer-events: none;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  :host(:not([checked])) .switch-checked-message,
  :host([checked]) .switch-unchecked-message {
    display: none;
  }

  .switch-checked-message,
  .switch-unchecked-message {
    user-select: none;
    margin-inline-start: ${semantic('formControl', 'label', 'gap')};
  }

  /* Unchecked + hover for switch control*/
  :host(:not([disabled]):not([checked])) .switch:hover .switch-control {
    border-color: ${component('switch', 'control', 'hover', 'borderColor')};
    background-color: ${component('switch', 'control', 'hover', 'bgColor')};
  }

  /* Checked for switch control*/
  :host([checked]) .switch-control {
    border-color: ${component('switch', 'control', 'checked', 'borderColor')};
    background-color: ${component('switch', 'control', 'checked', 'bgColor')};
  }

  /* Checked + hover for switch control*/
  :host([checked]:not([disabled])) .switch:hover .switch-control {
    border-color: ${component('switch', 'control', 'checked', 'hover', 'borderColor')};
    background-color: ${component('switch', 'control', 'checked', 'hover', 'bgColor')};
  }

  /* Unchecked + hover for switch thumb*/
  :host(:not([disabled]):not([checked])) .switch:hover .switch-thumb {
    background-color: ${component('switch', 'thumb', 'hover', 'bgColor')};
  }

  /* Checked for switch thumb*/
  :host([checked]) .switch-thumb {
    transform: translateX(${component('switch', 'thumb', 'transform')});
    background-color: ${component('switch', 'thumb', 'checked', 'bgColor')};
  }

  /* Checked + hover for switch thumb*/
  :host([checked]:not([disabled])) .switch:hover .switch-thumb {
    background-color: ${component('switch', 'thumb', 'checked', 'hover', 'bgColor')};
  }

  /* Unchecked + active for switch control*/
  :host(:not([disabled]):not([checked])) .switch:active .switch-thumb {
    background-color: ${component('switch', 'control', 'active', 'bgColor')};
  }

  :host(:not([disabled]):not([checked])) .switch:active .switch-control {
    border-color: ${component('switch', 'control', 'active', 'borderColor')};
  }

  /* Checked + active for switch control*/
  :host([checked]:not([disabled])) .switch:active .switch-control {
    border-color: ${component('switch', 'control', 'checked', 'active', 'borderColor')};
    background-color: ${component('switch', 'control', 'checked', 'active', 'bgColor')};
  }

  /* Unchecked + active for switch thumb*/
  :host(:not([disabled]):not([checked])) .switch:active .switch-thumb {
    background-color: ${component('switch', 'thumb', 'active', 'bgColor')};
  }

  /* Checked + active for switch thumb*/
  :host([checked]:not([disabled])) .switch:active .switch-thumb {
    background-color: ${component('switch', 'thumb', 'checked', 'active', 'bgColor')};
  }

  /* Focus */
  .switch:has(.switch-input:focus-visible) {
    outline: ${semantic('focusOutline', 'width')} ${semantic('focusOutline', 'style')}
      ${semantic('focusOutline', 'color')};
    outline-offset: ${semantic('focusOutline', 'offset')};
  }

  /* Disabled */
  :host([disabled]) .switch {
    opacity: ${semantic('formControl', 'disabled', 'opacity')};
    cursor: not-allowed;
  }

  @media screen and (forced-colors: active) {
    :host([disabled]) .switch {
      opacity: 1;
    }

    :host([disabled]) .switch-control {
      background-color: ${SystemColors.ButtonFace};
      border-color: ${SystemColors.GrayText};
    }

    :host([disabled]) .switch-thumb {
      background-color: ${SystemColors.GrayText};
    }

    :host(:not([disabled]):not([checked])) .switch-thumb,
    :host(:not([disabled]):not([checked])) .switch:hover .switch-thumb {
      background-color: ${SystemColors.ButtonText};
    }

    :host(:not([disabled]):not([checked])) .switch-control,
    :host(:not([disabled]):not([checked])) .switch:hover .switch-control {
      background-color: ${SystemColors.ButtonFace};
      border-color: ${SystemColors.ButtonBorder};
    }

    :host([checked]) .switch-thumb,
    :host([checked]:not([disabled])) .switch:hover .switch-thumb {
      background-color: ${SystemColors.Highlight};
    }
  }
`;
