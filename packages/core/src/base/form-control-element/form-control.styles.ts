import { css } from 'lit';
import { SystemColors } from '../../theme/styles/system-colors.js';

export default css`
  :host {
    display: block;
    width: 100%;
    --form-control-range-track-size: 4px;
    --form-control-range-thumb-size: 20px;
    --form-control-range-track-margin-top: 3px;
  }

  .form-control {
    display: inline-grid;
    font-size: var(--form-control-font-size);
    grid-template-areas:
      'label .'
      'help  .'
      'control control'
      'error .';
    width: 100%;
  }

  /* Label */
  .form-control-label {
    color: var(--form-control-label-fg-color);
    padding: 0;
    font-size: var(--form-control-label-font-size);
    font-weight: var(--form-control-label-font-weight);
    grid-area: label;
    margin-block-end: var(--form-control-label-gap);
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
    grid-column-gap: var(--form-control-label-gap);
  }

  :host([label-position='start']) .form-control {
    grid-template-areas:
      'label control'
      'help  .'
      'error .';
    grid-column-gap: var(--form-control-label-gap);
  }

  :host(:not([readonly]):not([disabled])) .form-control-label {
    cursor: pointer;
  }

  /** Input states */

  :host([required]) .required-indicator {
    margin-inline-start: var(--form-control-label-required-indicator-gap);
  }

  .required-indicator {
    color: var(--form-control-invalid-message-fg-color);
  }

  :host([disabled]) {
    cursor: not-allowed;
  }

  :host([disabled]) .form-control-input {
    background-color: var(--form-control-disabled-bg-color);
    border-color: var(--form-control-disabled-border-color);
    color: var(--form-control-disabled-fg-color);
    opacity: var(--form-control-disabled-opacity);
    cursor: not-allowed;
  }

  /* Help text */
  .form-control-help-text {
    color: var(--form-control-help-text-fg-color);
    font-size: var(--form-control-help-text-font-size);
    font-weight: var(--form-control-help-text-font-weight);
    grid-area: help;
  }

  .form-control-has-help-text .form-control-help-text {
    display: block;
    margin-block-end: var(--form-control-help-text-gap);
  }

  /* Input */
  .form-control-input {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    border: var(--default-border);
    width: 100%;
    background-color: var(--form-control-bg-color);
    height: var(--form-control-input-height);
    padding: var(--form-control-padding-y) var(--form-control-padding-x);
    grid-area: control;
    border-radius: var(--form-control-border-radius);
    line-height: 1;
  }

  :host(:not(type='range')) .form-control-input {
    background-color: var(--form-control-bg-color);
    border: var(--default-border);
    border-radius: var(--form-control-border-radius);
    color: var(--form-control-fg-color);
    vertical-align: middle;
    overflow: hidden;
  }

  .form-control-input:focus-within {
    border-color: var(--form-control-focus-border-color);
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
    color: var(--form-control-fg-color);
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
    margin-inline-end: var(--form-control-icon-gap);
    display: inline-flex;
  }

  slot[name='end']::slotted(*) {
    margin-inline-start: var(--form-control-icon-gap);
    display: inline-flex;
  }

  /* Error text */
  .form-control-error-text {
    display: none;
    margin-top: 4px;
    color: var(--form-control-invalid-message-fg-color);
    grid-area: error;
    font-size: var(--form-control-invalid-message-font-size);
  }

  .form-control-error-text-icon {
    margin-inline-end: var(--form-control-icon-gap);
  }

  :host([invalid]) .form-control-has-interaction .form-control-input {
    border-color: var(--form-control-invalid-border-color);
    outline-color: var(--form-control-invalid-border-color);
  }

  :host([invalid]) .form-control-has-interaction .form-control-error-text {
    display: flex;
    align-items: center;
  }

  .form-control-base-input::placeholder {
    color: var(--form-control-placeholder-color);
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
    margin-block-end: var(--form-control-label-gap);
  }

  .form-control-group.form-control-has-label.form-control-has-help-text .form-control-label {
    margin-block-end: var(--form-control-label-gap);
  }

  .form-control-group .form-control-help-text {
    margin-block-end: var(--form-control-help-text-gap);
  }

  .form-control-group .form-control-error-text {
    margin-top: 12px;
  }

  /* Group items */
  .form-control-group-item-label {
    font-size: var(--form-control-label-font-size);
    font-weight: var(--form-control-label-font-weight);
    margin-inline-start: var(--form-control-label-gap);
    user-select: none;
  }

  .form-control-has-label .form-control-group-item-label {
    display: block;
  }

  /* Styles for slider */

  :host([type='range']) .form-control-input {
    width: fit-content;
  }

  :host([type='range']) {
    --form-control-input-height: calc(max(var(--form-control-range-track-size), var(--form-control-range-thumb-size)));
  }

  :host([type='range']) .form-control-input,
  :host([type='range']) .form-control-input:focus-within {
    border: transparent;
  }

  :host([type='range']) .form-control-base-input {
    width: 100%;
    height: var(--form-control-range-track-size);
    outline-color: transparent;
  }

  :host([type='range'][disabled]) .form-control-input {
    background-color: transparent;
  }

  :host([type='range']) .form-control-base-input::-webkit-slider-thumb {
    width: var(--form-control-range-thumb-size);
    height: var(--form-control-range-thumb-size);
    position: relative;
    z-index: 1;
    margin-top: calc((var(--form-control-range-thumb-size) - var(--form-control-range-track-size)) / 2 * -1);
  }

  :host([type='range']) .form-control-base-input::-moz-range-thumb {
    width: var(--form-control-range-thumb-size);
    height: var(--form-control-range-thumb-size);
    position: relative;
    z-index: 1;
    margin-top: calc((var(--form-control-range-thumb-size) - var(--form-control-range-track-size)) / 2 * -1);
  }

  :host([type='range']:not([disabled])) .form-control-base-input::-webkit-slider-thumb {
    cursor: pointer;
  }

  :host([type='range']:not([disabled])) .form-control-base-input::-moz-range-thumb {
    cursor: pointer;
  }

  :host([type='range']) .form-control-base-input::-webkit-slider-runnable-track {
    width: 100%;
    height: var(--form-control-range-track-size);
    border-radius: var(--form-control-border-radius);
    margin-top: var(--form-control-range-track-margin-top);
  }

  :host([type='range']) .form-control-base-input::-moz-range-track {
    width: 100%;
    height: var(--form-control-range-track-size);
    border-radius: var(--form-control-border-radius);
    margin-top: var(--form-control-range-track-margin-top);
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
