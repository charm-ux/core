import { css } from 'lit';
import { component, semantic } from '../../utilities/theme.js';
import { SystemColors } from '../../theme/index.js';

export default css`
  :host([multiple]) .chevron {
    display: none;
  }

  :host(:not([readonly]):not([disabled])) .form-control-label {
    cursor: revert;
  }

  .form-control-input {
    cursor: pointer;
    line-height: 1;
    padding: 0;
  }

  .end-icons {
    position: absolute;
    pointer-events: none;
    inset-inline-end: ${semantic('formControl', 'paddingX')};
  }

  .start {
    inset-inline-start: ${semantic('formControl', 'paddingX')};
    pointer-events: none;
    position: absolute;
  }

  .chevron {
    height: ${component('select', 'iconSize')};
    width: ${component('select', 'iconSize')};
  }

  option {
    color: ${component('select', 'optionFgColor')};
    background-color: ${component('select', 'optionBgColor')};
  }

  @media screen and (forced-colors: active) {
    :host {
      --charm-form-control-fg-color: ${SystemColors.ButtonText};
    }

    :host([disabled]) {
      --charm-form-control-fg-color: ${SystemColors.GrayText};
    }
  }
`;
