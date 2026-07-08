import { css } from 'lit';
import { component, semantic } from '../../theme/tokens.js';

export default css`
  .form-control-input {
    border-radius: ${semantic('formControl', 'borderRadius')};
  }

  /* Hover */
  .form-control-input:hover {
    background-color: ${semantic('formControl', 'hover', 'bgColor')};
    border-color: ${semantic('formControl', 'hover', 'borderColor')};
    color: ${semantic('formControl', 'hover', 'fgColor')};
  }

  /* Focus */
  .form-control-input:focus-within {
    background-color: ${semantic('formControl', 'focus', 'bgColor')};
    border-color: ${semantic('formControl', 'focus', 'borderColor')};
    color: ${semantic('formControl', 'focus', 'fgColor')};
  }

  /* Styles for slider */
  :host([type='range'][disabled]) {
    --input-range-progress-color: ${component('inputRange', 'disabled', 'fgColor')};
    --input-range-track-color: ${component('inputRange', 'disabled', 'bgColor')};
    --input-range-thumb-color: ${component('inputRange', 'disabled', 'fgColor')};
    --charm-form-control-disabled-bg-color: transparent;
    --charm-form-control-disabled-opacity: 1;
  }

  :host([type='range']) .form-control-base-input::-webkit-slider-thumb {
    appearance: none;
    background-color: ${component('inputRange', 'thumbColor')};
  }

  :host([type='range']) .form-control-base-input::-moz-range-thumb {
    appearance: none;
    background-color: ${component('inputRange', 'thumbColor')};
  }

  :host([type='range']) .form-control-base-input::-webkit-slider-runnable-track {
    appearance: none;
    color: light-dark(${component('inputRange', 'progressColor')}, ${component('inputRange', 'trackColor')});
  }

  :host([type='range']) .form-control-base-input::-moz-range-track {
    appearance: none;
    color: light-dark(${component('inputRange', 'progressColor')}, ${component('inputRange', 'trackColor')});
  }

  :host([type='range']:not([readonly]):not([disabled])) .form-control:hover {
    --input-range-progress-color: ${component('inputRange', 'hover', 'fgColor')};
    --input-range-thumb-color: ${component('inputRange', 'hover', 'fgColor')};
    --input-range-track-color: ${component('inputRange', 'hover', 'bgColor')};
  }

  :host([type='range']:not([readonly]):not([disabled])) .form-control:active {
    --input-range-progress-color: ${component('inputRange', 'active', 'fgColor')};
    --input-range-thumb-color: ${component('inputRange', 'active', 'fgColor')};
    --input-range-track-color: ${component('inputRange', 'active', 'bgColor')};
  }
`;
