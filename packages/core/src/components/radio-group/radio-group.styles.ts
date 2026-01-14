import { css } from 'lit';

const fallbackStyles = {
  gap: css`0px`,
};

export default css`
  :host {
    --radio-group-radio-gap: inherit;
  }

  ::slotted(.he-radio:not(:last-of-type)) {
    margin-bottom: var(--radio-group-radio-gap, ${fallbackStyles.gap});
  }

  .form-control-input {
    border: none;
    display: flex;
    gap: var(--radio-group-radio-gap, ${fallbackStyles.gap});
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
