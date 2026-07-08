import { css } from 'lit';
import { component } from '../../theme/tokens.js';

export default css`
  :host {
    display: flex;
    box-sizing: border-box;
    flex-direction: column;
    border-top: 1px solid ${component('accordion', 'topBorderColor')};
  }
`;
