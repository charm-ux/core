import { css } from 'lit';
import { component } from '../../utilities/theme.js';

export default css`
  ::slotted(*) {
    --_charm-radio-group-direction: row;
  }

  :host([layout='horizontal-stacked']) ::slotted(*) {
    --_charm-radio-group-direction: column;
  }

  .form-control-input {
    height: auto;
    background: transparent;
    border: none;
    display: flex;
    flex-direction: column;
    gap: ${component('radio', 'groupRadioGap')};
    align-items: flex-start;
    justify-content: start;
  }

  :host([layout='horizontal']) .form-control-input,
  :host([layout='horizontal-stacked']) .form-control-input {
    flex-direction: row;
    justify-content: flex-start;
  }
`;
