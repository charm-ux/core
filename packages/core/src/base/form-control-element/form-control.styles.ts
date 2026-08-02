import { css } from 'lit';
import { semantic } from '../../utilities/theme.js';
import { SystemColors } from '../../theme/styles/system-colors.js';

/* stylelint-disable-next-line no-empty-source */
export default css`
  :host {
    display: block;
    width: 100%;
  }

  .form-control {
    display: inline-grid;
    font-size: ${semantic('formControl', 'fontSize')};
    grid-template-areas:
      'label .'
      'help  .'
      'control control'
      'error .';
    width: 100%;
  }

  /* Label */
  .form-control-label {
    color: ${semantic('formControl', 'label', 'color')};
    padding: 0;
    font-size: ${semantic('formControl', 'label', 'fontSize')};
    font-weight: ${semantic('formControl', 'label', 'fontWeight')};
    grid-area: label;
    margin-block-end: ${semantic('formControl', 'label', 'gap')};
    max-width: fit-content;
  }

  .form-control-has-label .form-control-label {
    display: inline-block;
  }

  :host([label-position='end']) .form-control {
    grid-template-areas:
      'control label'
      '. help'
      '. error';
    grid-column-gap: ${semantic('formControl', 'label', 'gap')};
  }

  :host([label-position='start']) .form-control {
    grid-template-areas:
      'label control'
      'help  .'
      'error .';
    grid-column-gap: ${semantic('formControl', 'label', 'gap')};
  }

  :host(:not([readonly]):not([disabled])) .form-control-label {
    cursor: pointer;
  }

  /** Input states */

  :host([required]) .required-indicator {
    margin-inline-start: ${semantic('formControl', 'label', 'requiredIndicatorGap')};
  }

  .required-indicator {
    color: ${semantic('formControl', 'invalid', 'message', 'color')};
  }

  :host([disabled]) {
    cursor: not-allowed;
  }

  :host([disabled]) .form-control-input {
    background-color: ${semantic('formControl', 'disabled', 'bgColor')};
    border-color: ${semantic('formControl', 'disabled', 'borderColor')};
    color: ${semantic('formControl', 'disabled', 'fgColor')};
    opacity: ${semantic('formControl', 'disabled', 'opacity')};
    cursor: not-allowed;
  }

  /* Help text */
  .form-control-help-text {
    color: ${semantic('formControl', 'helpText', 'color')};
    font-size: ${semantic('formControl', 'helpText', 'fontSize')};
    font-weight: ${semantic('formControl', 'helpText', 'fontWeight')};
    grid-area: help;
  }

  .form-control-has-help-text .form-control-help-text {
    display: block;
    margin-block-end: ${semantic('formControl', 'helpText', 'gap')};
  }

  /* Input */
  .form-control-input {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    border: ${semantic('defaultBorder', 'width')} ${semantic('defaultBorder', 'style')}
      ${semantic('defaultBorder', 'color')};
    width: 100%;
    background-color: ${semantic('formControl', 'bgColor')};
    height: ${semantic('formControl', 'inputHeight')};
    padding: ${semantic('formControl', 'paddingY')} ${semantic('formControl', 'paddingX')};
    grid-area: control;
    border-radius: ${semantic('formControl', 'borderRadius')};
    line-height: 1;
  }

  :host(:not(type='range')) .form-control-input {
    background-color: ${semantic('formControl', 'bgColor')};
    border: ${semantic('defaultBorder', 'width')} ${semantic('defaultBorder', 'style')}
      ${semantic('defaultBorder', 'color')};
    border-radius: ${semantic('formControl', 'borderRadius')};
    color: ${semantic('formControl', 'fgColor')};
    vertical-align: middle;
    overflow: hidden;
  }

  .form-control-input:focus-within {
    border-color: ${semantic('formControl', 'focus', 'borderColor')};
  }

  .form-control-input:focus-visible {
    outline: 0;
  }

  .form-control-input-start,
  .form-control-input-end {
    line-height: 1;
  }

  .form-control-base-input {
    flex: 1;
    color: ${semantic('formControl', 'fgColor')};
  }

  :host(:not([type='range'])) .form-control-base-input {
    outline: none;
    min-width: 0;
    border: none;
    background: none;
    box-shadow: none;
    margin: 0;
    cursor: inherit;
    -webkit-appearance: none;
  }

  slot[name='start']::slotted(*) {
    margin-inline-end: ${semantic('formControl', 'iconGap')};
    display: inline-flex;
  }

  slot[name='end']::slotted(*) {
    margin-inline-start: ${semantic('formControl', 'iconGap')};
    display: inline-flex;
  }

  /* Error text */
  .form-control-error-text {
    display: none;
    margin-top: 4px;
    color: ${semantic('formControl', 'invalid', 'message', 'color')};
    grid-area: error;
    font-size: ${semantic('formControl', 'invalid', 'message', 'fontSize')};
  }

  .form-control-error-text-icon {
    margin-inline-end: ${semantic('formControl', 'iconGap')};
  }

  :host([invalid]) .form-control-has-interaction .form-control-input {
    border-color: ${semantic('formControl', 'invalid', 'borderColor')};
    outline-color: ${semantic('formControl', 'invalid', 'borderColor')};
  }

  :host([invalid]) .form-control-has-interaction .form-control-error-text {
    display: flex;
    align-items: center;
  }

  .form-control-base-input::placeholder {
    color: ${semantic('formControl', 'placeholderColor')};
  }

  /* Groups */
  fieldset.form-control-group {
    border: none;
    padding: 0;
    margin: 0;
    min-width: 0;
  }

  .form-control-group .form-control-label {
    cursor: default;
    margin-block-end: ${semantic('formControl', 'label', 'gap')};
  }

  .form-control-group.form-control-has-label.form-control-has-help-text .form-control-label {
    margin-block-end: ${semantic('formControl', 'label', 'gap')};
  }

  .form-control-group .form-control-help-text {
    margin-block-end: ${semantic('formControl', 'helpText', 'gap')};
  }

  .form-control-group .form-control-error-text {
    margin-top: 12px;
  }

  /* Group items */
  .form-control-group-item-label {
    font-size: ${semantic('formControl', 'label', 'fontSize')};
    font-weight: ${semantic('formControl', 'label', 'fontWeight')};
    margin-inline-start: ${semantic('formControl', 'label', 'gap')};
    user-select: none;
  }

  .form-control-has-label .form-control-group-item-label {
    display: block;
  }

  /* Styles for slider */

  :host([type='range']) .form-control-input {
    width: fit-content;
    height: calc(
      max(${semantic('formControl', 'range', 'trackSize')}, ${semantic('formControl', 'range', 'thumbSize')})
    );
  }

  :host([type='range']) .form-control-input,
  :host([type='range']) .form-control-input:focus-within {
    border: transparent;
  }

  :host([type='range']) .form-control-base-input {
    width: 100%;
    height: ${semantic('formControl', 'range', 'trackSize')};
    outline-color: transparent;
  }

  :host([type='range'][disabled]) .form-control-input {
    background-color: transparent;
  }

  :host([type='range']) .form-control-base-input::-webkit-slider-thumb {
    width: ${semantic('formControl', 'range', 'thumbSize')};
    height: ${semantic('formControl', 'range', 'thumbSize')};
    position: relative;
    z-index: 1;
    margin-top: calc(
      (${semantic('formControl', 'range', 'thumbSize')} - ${semantic('formControl', 'range', 'trackSize')}) / 2 * -1
    );
  }

  :host([type='range']) .form-control-base-input::-moz-range-thumb {
    width: ${semantic('formControl', 'range', 'thumbSize')};
    height: ${semantic('formControl', 'range', 'thumbSize')};
    position: relative;
    z-index: 1;
    margin-top: calc(
      (${semantic('formControl', 'range', 'thumbSize')} - ${semantic('formControl', 'range', 'trackSize')}) / 2 * -1
    );
  }

  :host([type='range']:not([disabled])) .form-control-base-input::-webkit-slider-thumb {
    cursor: pointer;
  }

  :host([type='range']:not([disabled])) .form-control-base-input::-moz-range-thumb {
    cursor: pointer;
  }

  :host([type='range']) .form-control-base-input::-webkit-slider-runnable-track {
    width: 100%;
    height: ${semantic('formControl', 'range', 'trackSize')};
    border-radius: ${semantic('formControl', 'borderRadius')};
    margin-top: ${semantic('formControl', 'range', 'trackMarginTop')};
  }

  :host([type='range']) .form-control-base-input::-moz-range-track {
    width: 100%;
    height: ${semantic('formControl', 'range', 'trackSize')};
    border-radius: ${semantic('formControl', 'borderRadius')};
    margin-top: ${semantic('formControl', 'range', 'trackMarginTop')};
  }

  @media screen and (forced-colors: active) {
    :host([disabled]),
    :host([disabled]) .form-control-input {
      border-color: ${SystemColors.GrayText};
      color: ${SystemColors.GrayText};
      opacity: 1;
    }

    .form-control-input:focus-within {
      outline: 2px solid ${SystemColors.Highlight};
    }
  }
`;
