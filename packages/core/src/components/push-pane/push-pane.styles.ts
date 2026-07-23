import { css } from 'lit';
import { tokens } from '../../utilities/theme.js';

const { component } = tokens.lit;

export default css`
  :host {
    padding-inline: ${component('pushPane', 'paddingX')};
    padding-block: ${component('pushPane', 'paddingY')};
    overflow: hidden;
  }

  .base {
    width: 0;
    opacity: 0;
    padding-inline: 0;
    padding-block: 0;
    margin-inline: 0;
    margin-block: 0;
    height: 100%;
    max-width: 100%;
    display: flex;
    flex-direction: column;
    float: left;
    overflow: hidden;
    transition: ${component('pushPane', 'transition')};
    border-inline-end: 1px solid ${component('pushPane', 'dividerColor')};
    border-inline-start: none;
    padding-block: 0;
    padding-inline: 0;
    background-color: ${component('pushPane', 'bgColor')};
    margin-inline-start: 0;
    margin-inline-end: 0;
    color: ${component('pushPane', 'fgColor')};
  }

  :host([open]) .base {
    width: ${component('pushPane', 'size')};
    margin-inline-end: ${component('pushPane', 'bodyMarginInline')};
    opacity: 1;
    overflow: auto;
    padding-block: ${component('pushPane', 'bodyPaddingY')};
    padding-inline: ${component('pushPane', 'bodyPaddingX')};
    transition: ${component('pushPane', 'transition')};
  }

  :host([position='end']) .base {
    float: right;
  }

  :host([open][position='end']) .base {
    border-inline-start: 1px solid ${component('pushPane', 'dividerColor')};
    margin-inline-start: ${component('pushPane', 'bodyMarginInline')};
    margin-inline-end: 0;
  }

  :host([open][position='bottom']) .base {
    border-top: 1px solid ${component('pushPane', 'dividerColor')};
    margin-inline-start: 0;
    margin-inline-end: 0;
    width: 100%;
    height: ${component('pushPane', 'size')};
  }

  header {
    display: flex;
    justify-content: space-between;
    padding-block: ${component('pushPane', 'headerPaddingY')};
    padding-inline: ${component('pushPane', 'headerPaddingX')};
  }

  header h2 {
    margin: 0;
  }

  footer {
    padding-block: ${component('pushPane', 'footerPaddingY')};
    padding-inline: ${component('pushPane', 'footerPaddingX')};
    display: flex;
    gap: ${component('pushPane', 'footerButtonGap')};
    justify-content: flex-end;
  }

  .close-button {
    border: ${component('pushPane', 'closeButton', 'borderWidth')} solid
      ${component('pushPane', 'closeButton', 'borderColor')};
    background: ${component('pushPane', 'closeButton', 'bgColor')};
    border-radius: ${component('pushPane', 'closeButton', 'borderRadius')};
    color: ${component('pushPane', 'closeButton', 'fgColor')};
    cursor: pointer;
    line-height: 0;
    padding: ${component('pushPane', 'closeButton', 'padding')};
  }

  .close-button:hover {
    border: ${component('pushPane', 'closeButton', 'hover', 'borderWidth')} solid
      ${component('pushPane', 'closeButton', 'hover', 'borderColor')};
    background: ${component('pushPane', 'closeButton', 'hover', 'bgColor')};
  }

  .close-button:active {
    border: ${component('pushPane', 'closeButton', 'active', 'borderWidth')} solid
      ${component('pushPane', 'closeButton', 'active', 'borderColor')};
    background: ${component('pushPane', 'closeButton', 'active', 'bgColor')};
  }

  .close-button:focus {
    border: ${component('pushPane', 'closeButton', 'focus', 'borderWidth')} solid
      ${component('pushPane', 'closeButton', 'focus', 'borderColor')};
    background: ${component('pushPane', 'closeButton', 'focus', 'bgColor')};
  }

  .close-button svg {
    pointer-events: none;
    width: 24px;
    height: 24px;
  }

  .body {
    flex: 1 1 auto;
    overflow: auto;
    height: auto;
  }

  .body--has-footer {
    margin-bottom: ${component('pushPane', 'bodyMarginBottom')};
  }

  .body--has-actions {
    margin-top: ${component('pushPane', 'bodyMarginTop')};
  }

  .header-base {
    flex-direction: column;
  }

  .header-base--no-actions {
    flex-direction: row-reverse;
  }

  .toolbar {
    display: flex;
    align-self: end;
    gap: ${component('pushPane', 'toolbarButtonGap')};
  }

  .push-pane-actions {
    display: flex;
  }

  .header-base--no-actions .toolbar {
    align-self: center;
  }

  /* Position the close button properly when there is no header */
  .visually-hidden:focus-within {
    position: relative;
  }

  :host([no-header]) .visually-hidden:focus-within .close-button {
    position: absolute;
    right: 0px;
    z-index: 1;
  }
`;
