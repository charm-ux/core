import { css } from 'lit';
import { component, semantic } from '../../theme/tokens.js';

export default css`
  .checkbox {
    margin: 0;
  }

  .control {
    flex: 0 0 auto;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: ${component('checkbox', 'size')};
    height: ${component('checkbox', 'size')};
    border: ${semantic('formControl', 'borderWidth')} ${semantic('formControl', 'borderStyle')}
      ${component('checkbox', 'borderColor')};
    border-radius: ${component('checkbox', 'borderRadius')};
    background-color: ${component('checkbox', 'bgColor')};
    color: white;
  }

  .control-label-wrapper {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    position: relative;
    gap: ${semantic('formControl', 'label', 'gap')};
  }

  .icon {
    width: ${component('checkbox', 'iconSize')};
    height: ${component('checkbox', 'iconSize')};
    visibility: hidden;
  }

  :host([checked]) .icon,
  :host([indeterminate]) .icon {
    visibility: visible;
  }

  .input {
    position: absolute;
    inset: 0;
    opacity: 0;
    padding: 0;
    margin: 0;
    pointer-events: none;
  }

  .label {
    line-height: ${component('checkbox', 'size')};
  }

  :host(:not([checked])) .label {
    background-color: ${component('checkbox', 'bgColor')};
    color: ${component('checkbox', 'fgColor')};
  }

  :host(:not([checked])) .control-label-wrapper:hover .label {
    color: ${component('checkbox', 'hover', 'fgColor')};
  }

  :host(:not([checked])) .control-label-wrapper:active .label {
    color: ${component('checkbox', 'active', 'fgColor')};
  }

  :host([checked]) .control-label-wrapper:active .label {
    color: ${component('checkbox', 'active', 'fgColor')};
  }

  :host(:not([checked])) .control-label-wrapper:hover .control {
    border-color: ${component('checkbox', 'hover', 'borderColor')};
  }

  :host([checked]) .control-label-wrapper:hover .control {
    background-color: ${component('checkbox', 'checked', 'hover', 'bgColor')};
    border-color: ${component('checkbox', 'checked', 'hover', 'borderColor')};
  }

  :host(:not([checked])) .control-label-wrapper:active .control {
    border-color: ${component('checkbox', 'active', 'borderColor')};
  }

  :host([checked]) .control-label-wrapper:active .control {
    background-color: ${component('checkbox', 'checked', 'active', 'bgColor')};
    border-color: ${component('checkbox', 'checked', 'active', 'borderColor')};
  }

  :host([disabled]) .control-label-wrapper .control {
    background-color: ${component('checkbox', 'disabled', 'bgColor')};
    border-color: ${component('checkbox', 'disabled', 'borderColor')};
    color: ${component('checkbox', 'disabled', 'fgColor')};
  }

  :host([disabled]) .control-label-wrapper .label {
    color: ${component('checkbox', 'disabled', 'fgColor')};
  }

  :host([label-position='before']) .control-label-wrapper {
    flex-direction: row-reverse;
  }

  :host([checked]) .input:checked {
    background-color: ${component('checkbox', 'checked', 'bgColor')};
  }

  :host([indeterminate]) .control {
    color: ${component('checkbox', 'checked', 'bgColor')};
    border-color: ${component('checkbox', 'checked', 'borderColor')};
  }

  :host([indeterminate]) .control-label-wrapper:hover .control {
    color: ${component('checkbox', 'checked', 'hover', 'bgColor')};
    border-color: ${component('checkbox', 'checked', 'hover', 'borderColor')};
  }

  :host([checked]) .control {
    background-color: ${component('checkbox', 'checked', 'bgColor')};
    border-color: ${component('checkbox', 'checked', 'borderColor')};
  }

  :host([disabled]) .checkbox {
    cursor: not-allowed;
    pointer-events: none;
  }

  :host([checked]) .control,
  :host([indeterminate]) .control {
    border-color: ${component('checkbox', 'checked', 'borderColor')};
  }

  :host([indeterminate]) .label,
  :host([checked]) .label {
    color: ${component('checkbox', 'checked', 'fgColor')};
  }

  :host([checked][disabled]) .control-label-wrapper:hover .control {
    background-color: ${component('checkbox', 'disabled', 'bgColor')};
  }

  /* Focus */
  :host(:not([disabled])) .input:focus-visible ~ .control-label-wrapper {
    outline: ${semantic('focusOutline', 'width')} ${semantic('focusOutline', 'style')}
      ${semantic('focusOutline', 'color')};
    outline-offset: ${semantic('focusOutline', 'offset')};
  }
`;
