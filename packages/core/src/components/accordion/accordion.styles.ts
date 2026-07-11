import { css } from 'lit';
import { project } from '../../utilities/project.js';

const { component } = project.theme;

export default css`
  :host {
    display: flex;
    box-sizing: border-box;
    flex-direction: column;
    border-top: 1px solid ${component('accordion', 'topBorderColor')};
  }
`;
