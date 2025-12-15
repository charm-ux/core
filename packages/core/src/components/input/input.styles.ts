import { css } from 'lit';

const fallbackStyles = {
  thumbColor: css`rgb(16, 16, 16)`,
  progressColor: css`rgb(16, 16, 16)`,
  trackColor: css`rgb(255, 255, 255)`,
  borderRadius: css`5px`,
};
export default css`
  :host {
    --input-range-thumb-color: inherit;
    --input-range-progress-color: inherit;
    --input-range-track-color: inherit;

    --input-range-hover-fg-color: inherit;
    --input-range-hover-bg-color: inherit;

    --input-range-active-fg-color: inherit;
    --input-range-active-bg-color: inherit;

    --input-range-disabled-fg-color: inherit;
    --input-range-disabled-bg-color: inherit;
  }

  .form-control-input {
    border-radius: var(--form-control-border-radius, ${fallbackStyles.borderRadius});
  }

  /* Hover */
  .form-control-input:hover {
    background-color: var(--form-control-hover-bg-color);
    border-color: var(--form-control-hover-border-color);
    color: var(--form-control-hover-fg-color);
  }

  /* Focus */
  .form-control-input:focus-within {
    background-color: var(--form-control-focus-bg-color);
    border-color: var(--form-control-focus-border-color);
    color: var(--form-control-focus-fg-color);
  }

  /* Styles for slider */
  :host([type='range'][disabled]) {
    --input-range-progress-color: var(--input-range-disabled-fg-color);
    --input-range-track-color: var(--input-range-disabled-bg-color);
    --input-range-thumb-color: var(--input-range-disabled-fg-color);
    --form-control-background-color-disabled: transparent;
    --form-control-opacity-disabled: 1;
  }

  :host([type='range']) .form-control-base-input::-webkit-slider-thumb {
    appearance: none;
    background-color: var(--input-range-thumb-color, ${fallbackStyles.thumbColor});
  }

  :host([type='range']) .form-control-base-input::-moz-range-thumb {
    appearance: none;
    background-color: var(--input-range-thumb-color, ${fallbackStyles.thumbColor});
  }

  :host([type='range']) .form-control-base-input::-webkit-slider-runnable-track {
    appearance: none;
    color: light-dark(
      var(--input-range-progress-color, ${fallbackStyles.progressColor}),
      var(--input-range-track-color, ${fallbackStyles.trackColor})
    );
  }

  :host([type='range']) .form-control-base-input::-moz-range-track {
    appearance: none;
    color: light-dark(
      var(--input-range-progress-color, ${fallbackStyles.progressColor}),
      var(--input-range-track-color, ${fallbackStyles.trackColor})
    );
  }

  :host([type='range']:not([readonly]):not([disabled])) .form-control:hover {
    --input-range-progress-color: var(--input-range-hover-fg-color);
    --input-range-thumb-color: var(--input-range-hover-fg-color);
    --input-range-track-color: var(--input-range-hover-bg-color);
  }

  :host([type='range']:not([readonly]):not([disabled])) .form-control:active {
    --input-range-progress-color: var(--input-range-active-fg-color);
    --input-range-thumb-color: var(--input-range-active-fg-color);
    --input-range-track-color: var(--input-range-active-bg-color);
  }
`;
