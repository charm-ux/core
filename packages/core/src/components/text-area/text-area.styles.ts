import { css } from 'lit';

const fallbackStyles = {
  minHeight: css`2rem`,
  minWidth: css`4rem`,
  width: css`fit-content`,
};

export default css`
  :host {
    --textarea-control-input-min-height: inherit;
    --textarea-control-input-min-width: inherit;
    --textarea-control-input-line-height: inherit;
  }

  .form-control-input {
    padding: unset;
    line-height: inherit;
    height: auto;
  }

  .form-control-base-input {
    padding: var(--form-control-padding-y, 5px) var(--form-control-padding-x, 5px);
    vertical-align: top;
    line-height: var(--textarea-control-input-line-height);
    width: 100%;
    min-width: var(--textarea-control-input-min-width, ${fallbackStyles.minWidth});
    max-width: 100%;
    height: 100%;
    min-height: var(--textarea-control-input-min-height, ${fallbackStyles.minHeight});
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
