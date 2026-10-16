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
    display: grid;
    grid-template-columns: max-content minmax(0, 1fr) max-content;
    line-height: 1;
    padding-block: 0;
    padding-inline: ${semantic('formControl', 'paddingX')};
  }

  .end-icons {
    align-items: center;
    display: flex;
    grid-column: 3;
    grid-row: 1;
    pointer-events: none;
  }

  .start {
    grid-column: 1;
    grid-row: 1;
    pointer-events: none;
  }

  .chevron {
    height: ${component('select', 'iconSize')};
    width: ${component('select', 'iconSize')};
  }

  .input-control {
    grid-column: 2;
    grid-row: 1;
    min-width: 0;
    padding-inline: 0;
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
