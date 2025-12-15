import { css } from 'lit';
import { SystemColors } from '../../theme/index.js';

export default css`
  :host {
    --select-icon-size: inherit;
    --select-option-bg-color: inherit;
    --select-option-fg-color: inherit;
  }

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
    inset-inline-end: var(--select-icon-inset);
    position: absolute;
    pointer-events: none;
    inset-inline-end: var(--form-control-padding-x);
  }

  .start {
    inset-inline-start: var(--form-control-padding-x);
    pointer-events: none;
    position: absolute;
  }

  .chevron {
    height: var(--select-icon-size, 18px);
    width: var(--select-icon-size, 18px);
  }

  option {
    color: var(--select-option-fg-color);
    background-color: var(--select-option-bg-color);
  }

  @media screen and (forced-colors: active) {
    :host {
      --form-control-fg-color: ${SystemColors.ButtonText};
    }

    :host([disabled]) {
      --form-control-fg-color: ${SystemColors.GrayText};
    }
  }
`;
