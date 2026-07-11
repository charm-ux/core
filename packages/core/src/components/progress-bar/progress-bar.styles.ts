import { css } from 'lit';
import { SystemColors } from '../../theme/styles/system-colors.js';
import { project } from '../../utilities/project.js';

const { component, semantic } = project.theme;

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
    background: ${component('progressBar', 'indicatorColor')};
    line-height: ${component('progressBar', 'height')};
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    transition: ${component('progressBar', 'transition')};
    user-select: none;
  }

  :host([indeterminate]) .progress-bar-indicator {
    position: absolute;
    animation: ${component('progressBar', 'animation')};
  }

  @keyframes indeterminate {
    0% {
      inset-inline-start: -50%;
      width: 50%;
    }
    75%,
    100% {
      inset-inline-start: 100%;
      width: 50%;
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
`;
