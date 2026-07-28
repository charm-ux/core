import { css } from 'lit';
import { semantic } from '../../utilities/theme.js';
import { visuallyHiddenStyles } from '../../theme/styles/visually-hidden.js';

export default css`
  :host,
  *,
  *:before,
  *:after {
    box-sizing: border-box;
  }

  *:focus-visible {
    outline: ${semantic('focus', 'outlineSize')} ${semantic('focus', 'outlineStyle')}
      ${semantic('focus', 'outlineColor')};
    outline-offset: ${semantic('focus', 'outlineOffset')};
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
