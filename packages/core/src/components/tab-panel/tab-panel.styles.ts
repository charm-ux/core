import { css } from 'lit';
import { tokens } from '../../utilities/theme.js';

const { component } = tokens.lit;

export default css`
  :host {
    display: block;
    transition: ${component('tabPanel', 'transition')};
    opacity: 0;
    min-height: ${component('tabPanel', 'minHeight')};
    box-shadow: ${component('tabPanel', 'boxShadow')};
    position: absolute;
    top: 0;
  }

  :host([visible]) {
    opacity: 1;
    position: relative;
  }

  .tab-panel-base {
    background: ${component('tabPanel', 'bgColor')};
    color: ${component('tabPanel', 'fgColor')};
    padding-inline: ${component('tabPanel', 'paddingX')};
    padding-block: ${component('tabPanel', 'paddingY')};
    border: ${component('tabPanel', 'borderWidth')} ${component('tabPanel', 'borderStyle')}
      ${component('tabPanel', 'borderColor')};
    border-radius: ${component('tabPanel', 'borderRadius')};
  }
`;
