import { css } from 'lit';
import { SystemColors } from '../../theme/index.js';
import { project } from '../../utilities/project.js';

const { component, semantic } = project.theme;

export default css`
  :host {
    display: block;
    width: fit-content;
  }

  :host(:focus-visible) {
    outline: none;
  }

  .radio {
    display: inline-flex;
    gap: ${semantic('formControl', 'label', 'gap')};
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
    width: ${component('radio', 'controlSize')};
    height: ${component('radio', 'controlSize')};
    aspect-ratio: 1 / 1;
    border: solid ${semantic('defaultBorder', 'width')} var(--radio-border-color, ${component('radio', 'borderColor')});
    border-radius: 50%;
    color: transparent;
    padding: 0;
    align-self: flex-start;
  }

  :host([vertical]) .radio {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: ${semantic('formControl', 'label', 'gap')};
  }

  ::slotted(*:not(:first-child)) {
    line-height: 1.5;
  }

  /* Checked */
  :host([checked]:not([disabled])) {
    --form-control-label-fg-color: ${component('radio', 'label', 'checkedFgColor')};
    --radio-border-color: ${component('radio', 'checked', 'borderColor')};
  }

  .radio-check {
    aspect-ratio: 1 / 1;
    position: absolute;
    width: ${component('radio', 'indicatorSize')};
    border-radius: 50%;
    background-color: var(--radio-bg-color, ${component('radio', 'bgColor')});
  }

  /* Checked + Hover */
  :host([checked]:not([disabled])) .radio:hover {
    --form-control-label-fg-color: ${component('radio', 'label', 'checkedHoverFgColor')};
    --radio-bg-color: ${component('radio', 'hover', 'bgColor')};
    --radio-border-color: ${component('radio', 'hover', 'borderColorChecked')};
  }

  /* UnChecked + Hover */
  :host(:not([checked]):not([disabled])) .radio:hover {
    --form-control-label-fg-color: ${component('radio', 'label', 'uncheckedHoverFgColor')};
    --radio-border-color: ${component('radio', 'hover', 'borderColorUnchecked')};
  }

  /* Active */
  :host(:focus-visible) .radio {
    outline: ${semantic('focusOutline', 'width')} ${semantic('focusOutline', 'style')} ${semantic('focusOutline', 'color')};
    outline-offset: ${semantic('focusOutline', 'offset')};
  }

  .radio:active {
    --form-control-label-fg-color: ${component('radio', 'label', 'activeFgColor')};
    --radio-bg-color: ${component('radio', 'active', 'bgColor')};
    --radio-border-color: ${component('radio', 'active', 'borderColorUnchecked')};
  }

  :host([checked]) .radio:active {
    --radio-border-color: ${component('radio', 'active', 'borderColorChecked')};
  }

  /* Disabled */
  :host([disabled]) .radio {
    cursor: not-allowed;
    --form-control-label-fg-color: ${component('radio', 'label', 'disabledColor')};
    --radio-bg-color: ${component('radio', 'disabled', 'bgColor')};
    --radio-checked-disabled-bg-color: ${component('radio', 'disabled', 'borderColor')};
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
