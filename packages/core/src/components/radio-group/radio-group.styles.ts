import { css } from 'lit';
import { project } from '../../utilities/project.js';
const { component } = project.theme;

export default css`
  ::slotted(.he-radio:not(:last-of-type)) {
    margin-bottom: ${component('radio', 'groupRadioGap')};
  }

  .form-control-input {
    height: auto;
    background: transparent;
    border: none;
    display: flex;
    gap: ${component('radio', 'groupRadioGap')};
    align-items: flex-start;
    justify-content: start;
  }

  .form-control-input {
    flex-direction: column;
  }

  :host([layout='horizontal']) .form-control-input,
  :host([layout='horizontal-stacked']) .form-control-input {
    flex-direction: row;
    justify-content: flex-start;
  }

  :host([disabled]) .form-control-input {
    height: auto;
  }
`;
