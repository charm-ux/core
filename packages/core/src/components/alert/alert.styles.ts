import { css } from 'lit';
import { SystemColors } from '../../theme/index.js';

export default css`
  :host {
    display: block;
    --alert-actions-gap: inherit;
    --alert-bg-color: inherit;
    --alert-border: inherit;
    --alert-button-bg-color: inherit;
    --alert-button-border: inherit;
    --alert-button-font-size: inherit;
    --alert-button-padding: inherit;
    --alert-fg-color: inherit;
    --alert-font-size: inherit;
    --alert-font-weight: inherit;
    --alert-heading-font-size: inherit;
    --alert-heading-font-weight: inherit;
    --alert-icon-fg-color: inherit;
    --alert-icon-margin: inherit;
    --alert-icon-size: inherit;
    --alert-message-margin: inherit;
    --alert-padding: inherit;
    --alert-transition: inherit;
  }

  .alert-wrapper {
    overflow: hidden;
    opacity: 1;
    transition: var(--alert-transition);
  }

  :host(:not([open])) .alert-wrapper {
    opacity: 0;
  }

  .alert {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    background-color: var(--alert-bg-color, var(--color-neutral-100));
    padding: var(--alert-padding);
    border: var(--alert-border);
    color: var(--alert-fg-color);
  }

  .alert-content {
    display: flex;
    align-items: flex-start;
    width: 100%;
  }

  .alert-icon {
    flex: 0;
    font-size: var(--alert-icon-size, 16px);
    min-width: var(--alert-icon-size, 16px);
    min-height: var(--alert-icon-size, 16px);
    margin: var(--alert-icon-margin, 8px 0px 0px 12px);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .alert-message-container {
    flex: 1;
    font-size: var(--alert-font-size);
    font-weight: var(--alert-font-weight, normal);
    margin: var(--alert-message-margin);
    display: flex;
    min-width: 0px;
  }

  .alert-message-container {
    overflow: hidden;
    align-self: center;
  }

  .alert-message-inner-container {
    height: 100%;
    white-space: normal;
    word-break: break-word;
  }

  .alert-actions {
    flex: 0;
    display: flex;
    gap: var(--alert-actions-gap);
    align-items: center;
    justify-content: flex-end;
  }

  .dismiss-button {
    background: var(--alert-button-bg-color, transparent);
    border: var(--alert-button-border, none);
    cursor: pointer;
    font-size: var(--alert-button-font-size, 1rem);
    padding: var(--alert-button-padding);
  }

  .dismiss-button:hover {
    background: var(--alert-button-hover-bg-color, transparent);
  }

  .dismiss-button:active {
    background: var(--alert-button-active-bg-color, transparent);
  }

  ::slotted([slot='icon'][icon]) {
    color: var(--alert-icon-fg-color);
  }

  .alert-heading {
    margin: 0;
    font-size: var(--alert-heading-font-size);
    font-weight: var(--alert-heading-font-weight, bold);
    display: contents;
  }

  /* High contrast */
  @media screen and (forced-colors: active) {
    .alert {
      border: 1px solid ${SystemColors.CanvasText};
    }

    .alert-icon {
      color: ${SystemColors.CanvasText};
    }
  }
`;
