import { css } from 'lit';
import { component } from '../../utilities/theme.js';

export default css`
  .disclosure-base {
    color: ${component('disclosure', 'fgColor')};
    background-color: ${component('disclosure', 'bgColor')};
    display: flex;
    flex-direction: column;
    gap: ${component('disclosure', 'gap')};
    position: relative;
    width: fit-content;
  }

  :host .disclosure-content {
    border: ${component('disclosure', 'contentBorder')};
    border-radius: ${component('disclosure', 'contentBorderRadius')};
    max-height: ${component('disclosure', 'closedMaxHeight')};
    order: -1;
    overflow: hidden;
    transition: ${component('disclosure', 'hideTransition')};
  }

  :host([content-below]) .disclosure-content {
    order: 1;
  }

  :host([open]) .disclosure-content {
    max-height: ${component('disclosure', 'openedMaxHeight')};
    transition: ${component('disclosure', 'showTransition')};
  }
`;
