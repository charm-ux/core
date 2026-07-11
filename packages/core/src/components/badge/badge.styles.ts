import { css } from 'lit';
import { project } from '../../utilities/project.js';

const { component } = project.theme;

export default css`
  .base {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    background-color: ${component('badge', 'bgColor')};
    border-style: ${component('badge', 'borderStyle')};
    border-color: ${component('badge', 'borderColor')};
    border-radius: ${component('badge', 'borderRadius')};
    border-width: ${component('badge', 'borderWidth')};
    color: ${component('badge', 'fgColor')};
    font-size: inherit;
    line-height: 1;
    min-height: ${component('badge', 'size')};
    min-width: ${component('badge', 'size')};
    padding: ${component('badge', 'padding')};
    text-align: center;
  }
`;
