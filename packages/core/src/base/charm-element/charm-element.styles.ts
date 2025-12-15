import { css } from 'lit';
import { visuallyHiddenStyles } from '../../theme/styles/visually-hidden.js';

export default css`
  :host,
  *,
  *:before,
  *:after {
    box-sizing: border-box;
  }

  *:focus-visible {
    outline: var(--focus-outline);
    outline-offset: var(--focus-outline-offset);
  }

  [hidden] {
    display: none !important;
  }

  :host([hidden]) {
    display: none !important;
  }

  input,
  button,
  select,
  textarea {
    margin: 0;
    padding: 0;
    letter-spacing: inherit;
    font-size: inherit;
    font-family: inherit;
  }

  .visually-hidden:not(:focus):not(:focus-within) {
    ${visuallyHiddenStyles};
  }
`;
