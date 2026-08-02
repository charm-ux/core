import { css } from 'lit';
import { relocateFocusRing, SystemColors } from '../../theme/index.js';
import { component, semantic } from '../../utilities/theme.js';

export default css`
  :host {
    display: block;
    width: fit-content;
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
    border: solid ${semantic('defaultBorder', 'width')} ${component('radio', 'borderColor')};
    border-radius: 50%;
    background-color: ${component('radio', 'bgColor')};
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
  :host([checked]:not([disabled])) .radio-control {
    border-color: ${component('radio', 'checked', 'borderColor')};
  }

  :host([checked]:not([disabled])) .radio-label {
    color: ${component('radio', 'label', 'checked', 'color')};
  }

  .radio-check {
    aspect-ratio: 1 / 1;
    position: absolute;
    width: ${component('radio', 'indicatorSize')};
    border-radius: 50%;
    background-color: ${component('radio', 'checked', 'bgColor')};
  }

  /* Checked + Hover */
  :host([checked]:not([disabled])) .radio:hover .radio-control {
    background-color: ${component('radio', 'hover', 'bgColor')};
    border-color: ${component('radio', 'checked', 'hover', 'borderColor')};
  }

  :host([checked]:not([disabled])) .radio:hover .radio-label {
    color: ${component('radio', 'label', 'checked', 'hover', 'color')};
  }

  /* UnChecked + Hover */
  :host(:not([checked]):not([disabled])) .radio:hover .radio-control {
    border-color: ${component('radio', 'unchecked', 'hover', 'borderColor')};
  }

  :host(:not([checked]):not([disabled])) .radio:hover .radio-label {
    color: ${component('radio', 'label', 'unchecked', 'hover', 'color')};
  }

  /* Focus */
  ${relocateFocusRing({ target: '.radio' })}

  /* Active */
  :host([checked]:not([disabled])) .radio:active .radio-control {
    background-color: ${component('radio', 'active', 'bgColor')};
    border-color: ${component('radio', 'checked', 'active', 'borderColor')};
  }

  :host(:not([checked]):not([disabled])) .radio:active .radio-control {
    background-color: ${component('radio', 'active', 'bgColor')};
    border-color: ${component('radio', 'unchecked', 'active', 'borderColor')};
  }

  .radio:active .radio-label {
    color: ${component('radio', 'label', 'active', 'color')};
  }

  /* Disabled */
  :host([disabled]) .radio {
    cursor: not-allowed;
  }

  :host([disabled]) .radio-control {
    background-color: ${component('radio', 'disabled', 'bgColor')};
    border-color: ${component('radio', 'disabled', 'borderColor')};
  }

  :host([disabled]) .radio-check {
    background-color: ${component('radio', 'disabled', 'borderColor')};
  }

  :host([disabled]) .radio-label {
    color: ${component('radio', 'label', 'disabled', 'color')};
  }

  /* High contrast */
  @media screen and (forced-colors: active) {
    .radio-control {
      background-color: ${SystemColors.ButtonFace};
      border-color: ${SystemColors.ButtonText};
    }

    /* Hover */
    :host([checked]:not([disabled])) .radio:hover .radio-control,
    :host(:not([checked]):not([disabled])) .radio:hover .radio-control {
      outline: ${SystemColors.ButtonText} solid 2px;
    }

    /* Checked */
    :host([checked]:not([disabled])) .radio-control {
      background-color: ${SystemColors.HighlightText};
      border-color: ${SystemColors.Highlight};
    }

    /* Disabled */
    :host([disabled]) .radio-control {
      background-color: ${SystemColors.Canvas};
      border-color: ${SystemColors.GrayText};
    }

    :host([disabled]) .radio-label {
      color: ${SystemColors.GrayText};
    }

    /* Checked + Disabled */
    :host([disabled][checked]) .radio-check {
      background-color: ${SystemColors.GrayText};
    }
  }
`;
