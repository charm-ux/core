import { css } from 'lit';
import { SystemColors } from '../../theme/styles/system-colors.js';

const fallbackStyles = {
  animation: css`indeterminate 2.5s infinite cubic-bezier(0.37, 0, 0.63, 1)`,
  borderRadius: css`9999px`,
  fontWeight: css`400`,
  height: css`4px`,
  indicatorColor: css`black`,
  labelColor: css`black`,
  trackColor: css`grey`,
  transition: css` 400ms width, 400ms background-color`,
};

export default css`
  :host {
    --progress-bar-animation: inherit;
    --progress-bar-border-radius: inherit;
    --progress-bar-height: inherit;
    --progress-bar-indicator-color: inherit;
    --progress-bar-icon-color: inherit;
    --progress-bar-track-color: inherit;
    --progress-bar-transition: inherit;
    --form-control-label-font-weight: 400;
    --form-control-label-gap: 2px;

    display: block;
    width: 100%;
  }

  :host(:not([readonly]):not([disabled])) .form-control-label {
    cursor: text;
  }

  .progress-bar-base {
    display: flex;
    flex-direction: column;
    gap: var(--form-control-label-gap);
  }

  .progress-bar-track {
    position: relative;
    background-color: var(--progress-bar-track-color, ${fallbackStyles.trackColor});
    height: var(--progress-bar-height, ${fallbackStyles.height});
    border-radius: var(--progress-bar-border-radius, ${fallbackStyles.borderRadius});
    overflow: hidden;
  }

  ::slotted([icon]) {
    color: var(--progress-bar-icon-color, ${fallbackStyles.labelColor});
  }

  .progress-bar-indicator {
    width: var(--progress-percent);
    height: 100%;
    background: var(--progress-bar-indicator-color, ${fallbackStyles.indicatorColor});
    line-height: var(--progress-bar-height, ${fallbackStyles.height});
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    transition: var(--progress-bar-transition, ${fallbackStyles.transition});
    user-select: none;
  }

  :host([indeterminate]) .progress-bar-indicator {
    position: absolute;
    animation: var(--progress-bar-animation, ${fallbackStyles.animation});
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
      outline: var(--default-outline-size) var(--default-outline-style) ${SystemColors.FieldText};
    }

    .progress-bar-indicator {
      background-color: ${SystemColors.Highlight};
      color: ${SystemColors.HighlightText};
    }
  }
`;
