import { css } from 'lit';
import { SystemColors } from '../../theme/styles/system-colors.js';
import { component, semantic } from '../../utilities/theme.js';

export default css`
  :host {
    display: block;
    width: 100%;
  }

  :host(:not([readonly]):not([disabled])) .form-control-label {
    cursor: text;
  }

  .progress-bar-base {
    display: flex;
    flex-direction: column;
    gap: ${semantic('formControl', 'label', 'gap')};
  }

  .progress-bar-track {
    position: relative;
    background-color: ${component('progressBar', 'trackColor')};
    height: ${component('progressBar', 'height')};
    border-radius: ${component('progressBar', 'borderRadius')};
    overflow: hidden;
  }

  ::slotted([icon]) {
    color: ${component('progressBar', 'iconColor')};
  }

  .progress-bar-indicator {
    width: var(--progress-percent);
    height: 100%;
    background: ${component('progressBar', 'indicatorBgColor')};
    line-height: ${component('progressBar', 'height')};
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    transition: ${component('progressBar', 'transition')};
    user-select: none;
  }

  :host([indeterminate]) .progress-bar-indicator {
    position: absolute;
    inset-block: 0;
    width: 50%;
    animation: ${component('progressBar', 'animation')};
  }

  @keyframes indeterminate {
    0% {
      inset-inline-start: -50%;
    }
    75%,
    100% {
      inset-inline-start: 100%;
    }
  }

  /* High contrast */
  @media screen and (forced-colors: active) {
    .progress-bar-track {
      forced-color-adjust: none;
      background-color: ${SystemColors.Field};
      outline: ${semantic('defaultBorder', 'width')} ${semantic('defaultBorder', 'style')} ${SystemColors.FieldText};
    }

    .progress-bar-indicator {
      background-color: ${SystemColors.Highlight};
      color: ${SystemColors.HighlightText};
    }
  }

  /* Status indicator - see the spinner's note. Slowed, not stopped. */
  @media (prefers-reduced-motion: reduce) {
    :host([indeterminate]) .progress-bar-indicator {
      animation-duration: 2.5s !important;
      animation-iteration-count: infinite !important;
    }
  }
`;
