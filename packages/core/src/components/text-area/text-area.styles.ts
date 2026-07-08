import { css } from 'lit';
import { component, semantic } from '../../theme/tokens.js';

export default css`
  .form-control-input {
    padding: unset;
    line-height: inherit;
    height: auto;
  }

  .form-control-base-input {
    padding: ${semantic('formControl', 'paddingY')} ${semantic('formControl', 'paddingX')};
    vertical-align: top;
    line-height: ${component('textareaControl', 'inputLineHeight')};
    width: 100%;
    min-width: ${component('textareaControl', 'inputMinWidth')};
    max-width: 100%;
    height: 100%;
    min-height: ${component('textareaControl', 'inputMinHeight')};
    max-height: 100%;
    resize: none;
  }

  :host(:not([readonly]):not([disabled])) .form-control-label {
    cursor: default;
  }

  :host(:not([readonly]):not([disabled])) .form-control-help-text {
    cursor: default;
  }

  :host(:not([readonly]):not([disabled])) .form-control-error-text {
    cursor: default;
  }

  :host([resize='vertical']) .form-control-base-input {
    resize: vertical;
  }

  :host([resize='horizontal']) .form-control-base-input {
    resize: horizontal;
  }

  :host([resize='both']) .form-control-base-input {
    resize: both;
  }
`;
