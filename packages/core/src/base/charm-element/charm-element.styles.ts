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
    outline: ${semantic('focus', 'outlineWidth')} ${semantic('focus', 'outlineStyle')}
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

  /*
   * Reduced motion. This stylesheet is in every Charm component's shadow root,
   * so one block here covers the whole library - including components added
   * later, and downstream libraries built on Charm.
   *
   * Durations collapse to 0.01ms rather than 0, and animation is never set to
   * none, because transitionend and animationend still have to fire. Dialog
   * closes itself from a transitionend handler, so a hard stop would strand it
   * open.
   *
   * Status indicators (spinner, indeterminate progress bar, skeleton) opt back
   * in from their own stylesheets: an indicator that freezes reads as a hung UI
   * rather than a calm one.
   */
  @media (prefers-reduced-motion: reduce) {
    :host,
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }

    /*
     * Separate rule on purpose. ::details-content is Chromium-only, and an
     * unknown pseudo-element invalidates the entire selector list it appears
     * in - folding this into the list above would drop reduced-motion support
     * altogether in Safari and Firefox. The universal selector does not reach
     * pseudo-elements, so the accordion's height transition needs this.
     */
    *::details-content {
      transition-duration: 0.01ms !important;
    }
  }
`;
