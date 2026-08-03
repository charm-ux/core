import { css } from 'lit';
import { component } from '../../utilities/theme.js';

export default css`
  :host {
    /*
     * Required for the max-height transition to run at all. The closed state is
     * a length and the open state is an intrinsic keyword, and interpolating
     * between the two is exactly what interpolate-size unlocks. Note that
     * none is NOT one of the keywords it covers - only auto, min-content,
     * max-content, fit-content - which is why the openedMaxHeight default is
     * max-content rather than none.
     */
    interpolate-size: allow-keywords;
  }

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
