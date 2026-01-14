import { css } from 'lit';
import { SystemColors } from '../../theme/index.js';

const fallbackStyles = {
  color: css`black`,
  controlSize: css`1rem`,
  indicatorSize: css`8px`,
};

export default css`
  :host {
    --radio-control-size: inherit;
    --radio-indicator-size: inherit;

    /** Rest */
    --radio-bg-color: inherit;
    --radio-border-color: inherit;
    --radio-checked-border-color: inherit;
    --radio-label-checked-fg-color: inherit;

    /** Hover */
    --radio-hover-bg-color: inherit;
    --radio-hover-border-color-checked: inherit;
    --radio-hover-border-color-unchecked: inherit;
    --radio-label-unchecked-hover-fg-color: inherit;
    --radio-label-checked-hover-fg-color: inherit;

    /** Active */
    --radio-active-bg-color: inherit;
    --radio-active-border-color-checked: inherit;
    --radio-active-border-color-unchecked: inherit;
    --radio-label-active-fg-color: inherit;

    /** Disabled */
    --radio-disabled-bg-color: inherit;
    --radio-disabled-border-color: inherit;
    --radio-label-disabled-color: inherit;

    display: block;
    width: fit-content;
  }

  :host(:focus-visible) {
    outline: none;
  }

  .radio {
    display: inline-flex;
    gap: var(--form-control-label-gap);
    align-items: center;
    cursor: pointer;
  }

  .radio-label {
    margin-block-end: 0;
    margin-inline-end: 0;
    line-height: 1;
  }

  .form-control-input {
    padding: 0;
  }

  .radio-control {
    flex: 0 0 auto;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--radio-control-size, ${fallbackStyles.controlSize});
    height: var(--radio-control-size, ${fallbackStyles.controlSize});
    aspect-ratio: 1 / 1;
    border: solid var(--default-border-size) var(--radio-border-color, ${fallbackStyles.color});
    border-radius: 50%;
    color: transparent;
    padding: 0;
    align-self: flex-start;
  }

  :host([vertical]) .radio {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: var(--form-control-label-gap);
  }

  ::slotted(*:not(:first-child)) {
    line-height: 1.5;
  }

  /* Checked */
  :host([checked]:not([disabled])) {
    --form-control-label-fg-color: var(--radio-label-checked-fg-color);
    --radio-border-color: var(--radio-checked-border-color);
  }

  .radio-check {
    aspect-ratio: 1 / 1;
    position: absolute;
    width: var(--radio-indicator-size, ${fallbackStyles.indicatorSize});
    border-radius: 50%;
    background-color: var(--radio-bg-color, ${fallbackStyles.color});
  }

  /* Checked + Hover */
  :host([checked]:not([disabled])) .radio:hover {
    --form-control-label-fg-color: var(--radio-label-checked-hover-fg-color);
    --radio-bg-color: var(--radio-hover-bg-color);
    --radio-border-color: var(--radio-hover-border-color-checked);
  }

  /* UnChecked + Hover */
  :host(:not([checked]):not([disabled])) .radio:hover {
    --form-control-label-fg-color: var(--radio-label-unchecked-hover-fg-color);
    --radio-border-color: var(--radio-hover-border-color-unchecked);
  }

  /* Active */
  :host(:focus-visible) .radio {
    outline: var(--focus-outline);
    outline-offset: var(--focus-outline-offset);
  }

  .radio:active {
    --form-control-label-fg-color: var(--radio-label-active-fg-color);
    --radio-bg-color: var(--radio-active-bg-color);
    --radio-border-color: var(--radio-active-border-color-unchecked);
  }

  :host([checked]) .radio:active {
    --radio-border-color: var(--radio-active-border-color-checked);
  }

  /* Disabled */
  :host([disabled]) .radio {
    cursor: not-allowed;
    --form-control-label-fg-color: var(--radio-label-disabled-color);
    --radio-bg-color: var(--radio-disabled-bg-color);
    --radio-checked-disabled-bg-color: var(--radio-disabled-border-color);
  }

    /* High contrast */
    @media screen and (forced-colors: active) {
    :host {
      --radio-border-color: ${SystemColors.ButtonText};
      --radio-bg-color: ${SystemColors.ButtonFace};
    }

    /* Hover */
    :host([checked]:not([disabled])) .radio:hover,
    :host(:not([checked]):not([disabled])) .radio:hover{
      --focus-outline: ${SystemColors.ButtonText} solid 2px;
    }

    /* Checked */
    :host([checked]:not([disabled])) {
      --radio-border-color: ${SystemColors.Highlight};
      --radio-bg-color: ${SystemColors.HighlightText};
    }

    /* Disabled */
    :host([disabled]) .radio {
      --form-control-label-fg-color: ${SystemColors.GrayText};
      --radio-border-color: ${SystemColors.GrayText};
      --radio-bg-color: ${SystemColors.Canvas};
    }

    /* Checked + Disabled */
    :host([disabled][checked]) .radio{
      --radio-checked-disabled-bg-color: ${SystemColors.GrayText};
      --radio-bg-color: ${SystemColors.Canvas};
    }
`;
