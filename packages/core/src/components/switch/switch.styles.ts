import { css } from 'lit';
import { SystemColors } from '../../theme/index.js';

const fallbackStyles = {
  controlBackgroundColor: css`var(--body-bg-color)`,
  thumbBackgroundColor: css`black`,
};

export default css`
  :host {
    --switch-control-transition: inherit;
    --switch-focus-outline: inherit;
    --switch-height: inherit;
    --switch-thumb-size: inherit;
    --switch-thumb-transform: inherit;
    --switch-thumb-transition: inherit;
    --switch-width: inherit;

    /* Rest */
    --switch-control-bg-color: inherit;
    --switch-control-border-color: inherit;
    --switch-control-checked-bg-color: inherit;
    --switch-control-checked-border-color: inherit;
    --switch-thumb-bg-color: inherit;
    --switch-thumb-checked-bg-color: inherit;

    /* Hover */
    --switch-control-hover-bg-color: inherit;
    --switch-control-hover-border-color: inherit;
    --switch-control-checked-hover-bg-color: inherit;
    --switch-control-checked-hover-border-color: inherit;
    --switch-thumb-hover-bg-color: inherit;
    --switch-thumb-checked-hover-bg-color: inherit;

    /* Active */
    --switch-control-active-bg-color: inherit;
    --switch-control-active-border-color: inherit;
    --switch-control-checked-active-bg-color: inherit;
    --switch-control-checked-active-border-color: inherit;
    --switch-thumb-active-bg-color: inherit;
    --switch-thumb-checked-active-bg-color: inherit;

    display: grid;
  }

  .switch {
    align-items: flex-start;
    justify-content: start;
    vertical-align: middle;
    cursor: pointer;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: var(--form-control-label-gap, 4px);
    width: fit-content;
  }

  :host([label-position='end']) .switch {
    flex-direction: row-reverse;
  }

  :host([label-position='end']) .form-control {
    display: unset;
  }

  :host([label-position='start']) .switch {
    flex-direction: row;
  }

  .switch-control-wrapper {
    display: inline-flex;
    line-height: 1;
  }

  .switch-control {
    flex: 0 0 auto;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--switch-width, 40px);
    height: var(--switch-height, 16px);
    background-color: var(--switch-control-bg-color, ${fallbackStyles.controlBackgroundColor});
    border: var(--default-border-size) var(--default-border-style) var(--switch-control-border-color, black);
    border-radius: var(--border-radius-circular, 16px);
    transition: var(--switch-control-transition);
  }

  .switch-thumb {
    width: var(--switch-thumb-size, 12px);
    height: var(--switch-thumb-size, 12px);
    background-color: var(--switch-thumb-bg-color, ${fallbackStyles.thumbBackgroundColor});
    border-radius: 50%;
    transform: translateX(calc(var(--switch-thumb-transform, 10px) * (-1)));
    transition: var(--switch-thumb-transition,);
  }

  .switch-input {
    position: absolute;
    opacity: 0;
    padding: 0;
    margin: 0;
    pointer-events: none;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  :host(:not([checked])) .switch-checked-message,
  :host([checked]) .switch-unchecked-message {
    display: none;
  }

  .switch-checked-message,
  .switch-unchecked-message {
    user-select: none;
    margin-inline-start: var(--form-control-label-gap, 4px);
  }

  /* Unchecked + hover for switch control*/
  :host(:not([disabled]):not([checked])) .switch:hover .switch-control {
    border-color: var(--switch-control-hover-border-color);
    background-color: var(--switch-control-hover-bg-color);
  }

  /* Checked for switch control*/
  :host([checked]) .switch-control {
    border-color: var(--switch-control-checked-border-color);
    background-color: var(--switch-control-checked-bg-color);
  }

  /* Checked + hover for switch control*/
  :host([checked]:not([disabled])) .switch:hover .switch-control {
    border-color: var(--switch-control-checked-hover-border-color);
    background-color: var(--switch-control-checked-hover-bg-color);
  }

  /* Unchecked + hover for switch thumb*/
  :host(:not([disabled]):not([checked])) .switch:hover .switch-thumb {
    background-color: var(--switch-thumb-hover-bg-color, ${fallbackStyles.thumbBackgroundColor});
  }

  /* Checked for switch thumb*/
  :host([checked]) .switch-thumb {
    transform: translateX(var(--switch-thumb-transform, 10px));
    background-color: var(--switch-thumb-checked-bg-color, ${fallbackStyles.thumbBackgroundColor});
  }

  /* Checked + hover for switch thumb*/
  :host([checked]:not([disabled])) .switch:hover .switch-thumb {
    background-color: var(--switch-thumb-checked-hover-bg-color, ${fallbackStyles.thumbBackgroundColor});
  }

  /* Unchecked + active for switch control*/
  :host(:not([disabled]):not([checked])) .switch:active .switch-thumb {
    background-color: var(--switch-control-active-bg-color);
  }

  :host(:not([disabled]):not([checked])) .switch:active .switch-control {
    border-color: var(--switch-control-active-border-color);
  }

  /* Checked + active for switch control*/
  :host([checked]:not([disabled])) .switch:active .switch-control {
    border-color: var(--switch-control-checked-active-border-color);
    background-color: var(--switch-control-checked-active-bg-color);
  }

  /* Unchecked + active for switch thumb*/
  :host(:not([disabled]):not([checked])) .switch:active .switch-thumb {
    background-color: var(--switch-thumb-active-bg-color, ${fallbackStyles.thumbBackgroundColor});
  }

  /* Checked + active for switch thumb*/
  :host([checked]:not([disabled])) .switch:active .switch-thumb {
    background-color: var(--switch-thumb-checked-active-bg-color, ${fallbackStyles.thumbBackgroundColor});
  }

  /* Focus */
  .switch:has(.switch-input:focus-visible) {
    outline: var(--focus-outline);
    outline-offset: var(--focus-outline-offset);
  }

  /* Disabled */
  :host([disabled]) .switch {
    opacity: var(--form-control-disabled-opacity, 40%);
    cursor: not-allowed;
  }

  @media screen and (forced-colors: active) {
    :host([disabled]) .switch {
      opacity: 1;
    }

    :host([disabled]) .switch-control {
      background-color: ${SystemColors.ButtonFace};
      border-color: ${SystemColors.GrayText};
    }

    :host([disabled]) .switch-thumb {
      background-color: ${SystemColors.GrayText};
    }

    :host(:not([disabled]):not([checked])) .switch-thumb,
    :host(:not([disabled]):not([checked])) .switch:hover .switch-thumb {
      background-color: ${SystemColors.ButtonText};
    }

    :host(:not([disabled]):not([checked])) .switch-control,
    :host(:not([disabled]):not([checked])) .switch:hover .switch-control {
      background-color: ${SystemColors.ButtonFace};
      border-color: ${SystemColors.ButtonBorder};
    }

    :host([checked]) .switch-thumb,
    :host([checked]:not([disabled])) .switch:hover .switch-thumb {
      background-color: ${SystemColors.Highlight};
    }
  }
`;
