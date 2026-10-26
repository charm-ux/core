import { css } from 'lit';
import { component, semantic } from '../../utilities/theme.js';

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
  :host([type='range']) {
    --charm-input-range-progress-color: ${component('inputRange', 'progressColor')};
    --charm-input-range-track-color: ${component('inputRange', 'trackColor')};
    --charm-input-range-thumb-color: ${component('inputRange', 'thumbColor')};
  }

  :host([type='range'][disabled]),
  :host([type='range'][form-disabled]) {
    --charm-input-range-progress-color: ${component('inputRange', 'disabled', 'fgColor')};
    --charm-input-range-track-color: ${component('inputRange', 'disabled', 'bgColor')};
    --charm-input-range-thumb-color: ${component('inputRange', 'disabled', 'fgColor')};
    --charm-form-control-disabled-bg-color: transparent;
    --charm-form-control-disabled-opacity: 1;
  }

  :host([type='range']) .form-control-base-input::-webkit-slider-thumb {
    appearance: none;
    background-color: var(--charm-input-range-thumb-color);
  }

  :host([type='range']) .form-control-base-input::-moz-range-thumb {
    appearance: none;
    background-color: var(--charm-input-range-thumb-color);
  }

  :host([type='range']) .form-control-base-input::-webkit-slider-runnable-track {
    appearance: none;
    color: light-dark(var(--charm-input-range-progress-color), var(--charm-input-range-track-color));
  }

  :host([type='range']) .form-control-base-input::-moz-range-track {
    appearance: none;
    color: light-dark(var(--charm-input-range-progress-color), var(--charm-input-range-track-color));
  }

  :host([type='range']:not([readonly]):not([disabled]):not([form-disabled])) .form-control:hover {
    --charm-input-range-progress-color: ${component('inputRange', 'hover', 'fgColor')};
    --charm-input-range-thumb-color: ${component('inputRange', 'hover', 'fgColor')};
    --charm-input-range-track-color: ${component('inputRange', 'hover', 'bgColor')};
  }

  :host([type='range']:not([readonly]):not([disabled]):not([form-disabled])) .form-control:active {
    --charm-input-range-progress-color: ${component('inputRange', 'active', 'fgColor')};
    --charm-input-range-thumb-color: ${component('inputRange', 'active', 'fgColor')};
    --charm-input-range-track-color: ${component('inputRange', 'active', 'bgColor')};
  }
`;
