import { css } from 'lit';
import { tokens } from '../../utilities/theme.js';

const { component } = tokens.lit;

export default css`
  :host {
    display: flex;
    box-sizing: border-box;
    flex-direction: column;
    border-top: 1px solid ${component('accordion', 'topBorderColor')};
  }
`;
