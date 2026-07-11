import { css } from 'lit';
import { project } from '../../utilities/project.js';
import { SystemColors } from '../../theme/styles/system-colors.js';

const { component } = project.theme;

export default css`
  .spinner {
    display: inline-flex;
    gap: ${component('spinner', 'gap')};
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }

  :host([label-position='before']) .spinner {
    flex-direction: row-reverse;
    align-items: center;
  }

  :host([label-position='after']) .spinner {
    flex-direction: row;
    align-items: center;
  }

  :host([label-position='above']) .spinner {
    flex-direction: column-reverse;
  }

  .spinner-label {
    width: 100%;
    height: 100%;
    text-align: center;
    user-select: none;
    line-height: ${component('spinner', 'labelLineHeight')};
    color: ${component('spinner', 'labelColor')};
    font-size: ${component('spinner', 'labelFontSize')};
    font-weight: ${component('spinner', 'labelFontWeight')};
  }

  .spinner-image {
    width: ${component('spinner', 'ringSize')};
    height: ${component('spinner', 'ringSize')};
    transform: rotate(-90deg);
  }

  .spinner-track {
    stroke: ${component('spinner', 'trackColor')};
    transform-origin: 0px 0px;
  }

  .spinner-indicator {
    --circumference: calc(var(--radius) * 2 * 3.141592654);
    --indeterminate-chunk: calc(var(--radius) * 1.5);
    stroke: ${component('spinner', 'indicatorColor')};
    stroke-dasharray: var(--circumference) var(--circumference);
    stroke-dashoffset: calc(var(--circumference) - var(--percentage) * var(--circumference));
  }

  .spinner-indicator {
    transform-origin: 50% 50%;
    transform: rotate(-90deg);
    stroke-linecap: round;
    animation: ${component('spinner', 'indicatorAnimation')};
  }

  .spinner-image {
    animation: ${component('spinner', 'imageAnimation')};
  }

  .spinner-indicator,
  .spinner-track {
    --radius: calc(${component('spinner', 'ringSize')} / 2 - ${component('spinner', 'trackWidth')} * 0.5);
    stroke-width: ${component('spinner', 'trackWidth')};
    r: var(--radius);
    fill: none;
    cy: 50%;
    cx: 50%;
  }

  @keyframes spin-infinite {
    0% {
      stroke-dasharray: 1, 150;
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -35;
    }
    100% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -124;
    }
  }

  @keyframes spin-image {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }

  /* High contrast */
  @media screen and (forced-colors: active) {
    .spinner-track {
      stroke: ${SystemColors.HighlightText};
    }

    .spinner .spinner-indicator,
    .spinner-indicator {
      stroke: ${SystemColors.Highlight};
    }
  }
`;
