import { css } from 'lit';
import { SystemColors } from '../../theme/styles/system-colors.js';

const fallbackStyles = {
  gap: css`8px`,
  imageAnimation: css`spin-image 3s linear infinite`,
  indicatorAnimation: css`spin-infinite 1.5s linear infinite`,
  indicatorColor: css`black`,
  labelColor: css`black`,
  labelFontSize: css`12px`,
  labelFontWeight: css`400`,
  size: css`32px`,
  trackColor: css`grey`,
  trackWidth: css`3px`,
};

export default css`
  :host {
    --spinner-gap: inherit;
    --spinner-indicator-color: inherit;
    --spinner-label-color: inherit;
    --spinner-label-font-size: inherit;
    --spinner-label-font-weight: inherit;
    --spinner-label-line-height: inherit;
    --spinner-ring-size: inherit;
    --spinner-track-color: inherit;
    --spinner-track-width: inherit;
    --spinner-image-animation: inherit;
    --spinner-indicator-animation: inherit;
  }

  .spinner {
    display: inline-flex;
    gap: var(--spinner-gap, 8px);
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
    line-height: var(--spinner-label-line-height);
    color: var(--spinner-label-color, ${fallbackStyles.labelColor});
    font-size: var(--spinner-label-font-size, ${fallbackStyles.labelFontSize});
    font-weight: var(--spinner-label-font-weight, ${fallbackStyles.labelFontWeight});
  }

  .spinner-image {
    width: var(--spinner-ring-size, ${fallbackStyles.size});
    height: var(--spinner-ring-size, ${fallbackStyles.size});
    transform: rotate(-90deg);
  }

  .spinner-track {
    stroke: var(--spinner-track-color, ${fallbackStyles.trackColor});
    transform-origin: 0px 0px;
  }

  .spinner-indicator {
    --circumference: calc(var(--radius) * 2 * 3.141592654);
    --indeterminate-chunk: calc(var(--radius) * 1.5);
    stroke: var(--spinner-indicator-color, ${fallbackStyles.indicatorColor});
    stroke-dasharray: var(--circumference) var(--circumference);
    stroke-dashoffset: calc(var(--circumference) - var(--percentage) * var(--circumference));
  }

  .spinner-indicator {
    transform-origin: 50% 50%;
    transform: rotate(-90deg);
    stroke-linecap: round;
    animation: var(--spinner-indicator-animation, ${fallbackStyles.indicatorAnimation});
  }

  .spinner-image {
    animation: var(--spinner-image-animation, ${fallbackStyles.imageAnimation});
  }

  .spinner-indicator,
  .spinner-track {
    --radius: calc(
      var(--spinner-ring-size, ${fallbackStyles.size}) / 2 - var(--spinner-track-width, ${fallbackStyles.trackWidth}) *
        0.5
    );
    stroke-width: var(--spinner-track-width, ${fallbackStyles.trackWidth});
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
