import { css } from 'lit';
import { SystemColors } from '../../theme/index.js';
import { tokens } from '../../utilities/theme.js';

const { component } = tokens.lit;

export default css`
  :host {
    display: block;
  }

  .alert-wrapper {
    overflow: hidden;
    opacity: 1;
    transition: ${component('alert', 'transition')};
  }

  :host(:not([open])) .alert-wrapper {
    opacity: 0;
  }

  .alert {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    background-color: ${component('alert', 'bgColor')};
    padding: ${component('alert', 'padding')};
    border: ${component('alert', 'border')};
    color: ${component('alert', 'fgColor')};
  }

  .alert-content {
    display: flex;
    align-items: flex-start;
    width: 100%;
  }

  .alert-icon {
    flex: 0;
    font-size: ${component('alert', 'iconSize')};
    min-width: ${component('alert', 'iconSize')};
    min-height: ${component('alert', 'iconSize')};
    margin: ${component('alert', 'iconMargin')};
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .alert-message-container {
    flex: 1;
    font-size: ${component('alert', 'fontSize')};
    font-weight: ${component('alert', 'fontWeight')};
    margin: ${component('alert', 'messageMargin')};
    display: flex;
    min-width: 0px;
    background-color: ${component('alert', 'bgColor')};
    color: ${component('alert', 'fgColor')};
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
    gap: ${component('alert', 'actionsGap')};
    align-items: center;
    justify-content: flex-end;
  }

  .dismiss-button {
    background: ${component('alert', 'buttonBgColor')};
    border: ${component('alert', 'buttonBorder')};
    cursor: pointer;
    font-size: ${component('alert', 'buttonFontSize')};
    padding: ${component('alert', 'buttonPadding')};
  }

  .dismiss-button:hover {
    background: ${component('alert', 'buttonHoverBgColor')};
  }

  .dismiss-button:active {
    background: ${component('alert', 'buttonActiveBgColor')};
  }

  ::slotted([slot='icon'][icon]) {
    color: ${component('alert', 'iconFgColor')};
  }

  .alert-heading {
    margin: 0;
    font-size: ${component('alert', 'headingFontSize')};
    font-weight: ${component('alert', 'headingFontWeight')};
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
