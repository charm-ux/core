import { css } from 'lit';
import { component } from '../../theme/tokens.js';

export default css`
  dialog {
    display: none;
    position: fixed;
    inset: ${component('dialog', 'inset')};
    width: ${component('dialog', 'size')};
    max-width: ${component('dialog', 'maxWidth')};
    max-height: ${component('dialog', 'maxHeight')};
    background: none;
    border: ${component('dialog', 'border')};
    overflow: hidden;
    opacity: 0;
    transition: ${component('dialog', 'transition')};
  }

  dialog[open] {
    display: flex;
  }

  :host([open]) dialog {
    opacity: 1;
    transition: ${component('dialog', 'transition')};
  }

  .dialog-wrapper {
    display: flex;
    background: ${component('dialog', 'bgColor')};
    color: ${component('dialog', 'fgColor')};
    border: ${component('dialog', 'borderWidth')} solid ${component('dialog', 'borderColor')};
    border-radius: ${component('dialog', 'borderRadius')};
    box-shadow: ${component('dialog', 'shadow')};
    flex-direction: column;
    justify-content: center;
    pointer-events: none;
    padding-inline: ${component('dialog', 'paddingX')};
    padding-block: ${component('dialog', 'paddingY')};
  }

  .dialog-body {
    overflow: auto;
    width: 100%;
  }

  .close-btn {
    border: ${component('dialog', 'closeButton', 'borderWidth')} solid
      ${component('dialog', 'closeButton', 'borderColor')};
    background: ${component('dialog', 'closeButton', 'bgColor')};
    color: ${component('dialog', 'closeButton', 'fgColor')};
    cursor: pointer;
    line-height: 0;
    padding: ${component('dialog', 'closeButton', 'padding')};
    height: ${component('dialog', 'closeButton', 'size')};
    width: ${component('dialog', 'closeButton', 'size')};
    border-radius: ${component('dialog', 'closeButton', 'borderRadius')};
  }

  /* Position the close button properly when there is no header */
  .visually-hidden:focus-within {
    position: relative;
  }

  :host([no-header]) .visually-hidden:focus-within .close-btn {
    position: absolute;
    right: 0px;
    z-index: 1;
  }

  .close-btn:hover {
    border: ${component('dialog', 'closeButton', 'hover', 'borderWidth')} solid
      ${component('dialog', 'closeButton', 'hover', 'borderColor')};
    background: ${component('dialog', 'closeButton', 'hover', 'bgColor')};
    color: ${component('dialog', 'closeButton', 'hover', 'fgColor')};
  }

  .close-btn:active {
    border: ${component('dialog', 'closeButton', 'active', 'borderWidth')} solid
      ${component('dialog', 'closeButton', 'active', 'borderColor')};
    background: ${component('dialog', 'closeButton', 'active', 'bgColor')};
    color: ${component('dialog', 'closeButton', 'active', 'fgColor')};
  }

  .close-btn:focus {
    border: ${component('dialog', 'closeButton', 'focus', 'borderWidth')} solid
      ${component('dialog', 'closeButton', 'focus', 'borderColor')};
    background: ${component('dialog', 'closeButton', 'focus', 'bgColor')};
    color: ${component('dialog', 'closeButton', 'focus', 'fgColor')};
  }

  .close-btn svg {
    pointer-events: none;
    width: calc(1 * 24px);
    height: calc(1 * 24px);
    margin: -1px 0px 0px -1px;
  }

  .header-base {
    align-items: flex-start;
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: center;
    gap: ${component('dialog', 'headerToolbarGap')};
  }

  .dialog-title {
    align-self: start;
    margin: 0;
  }

  .toolbar {
    display: flex;
    align-self: end;
    gap: ${component('dialog', 'toolbarButtonGap')};
  }

  .header-base {
    flex-direction: column;
  }

  .header-base--no-actions {
    flex-direction: row-reverse;
  }

  .header-base--no-actions .toolbar {
    align-self: flex-start;
  }

  :host([open]) .dialog-wrapper {
    pointer-events: inherit;
  }

  .base--visible::backdrop {
    opacity: 1;
  }

  dialog::backdrop {
    opacity: 0;
    background: ${component('dialog', 'backdropColor')};
    transition: ${component('dialog', 'transition')};
  }

  :host([open]) dialog::backdrop {
    pointer-events: inherit;
    transition: ${component('dialog', 'transition')};
  }

  .dialog-footer {
    display: flex;
    align-self: flex-end;
    gap: ${component('dialog', 'footerButtonGap')};
  }

  .dialog-body--has-header {
    margin-top: ${component('dialog', 'marginTop')};
  }

  .dialog-footer--has-footer {
    margin-top: ${component('dialog', 'marginTop')};
  }

  /* Styles for drawer */
  :host([position]) {
    --dialog-position-transition: opacity 0.25s ease-in-out, transform 0.25s ease-in-out;
    /* Override dialog-transition only for positioned dialogs */
    --dialog-transition: ${component('dialog', 'positionTransition')};
  }

  :host([position='start']) dialog {
    transform: translateX(-100%);
  }

  :host([position='end']) dialog {
    transform: translateX(100%);
  }

  :host([position='top']) dialog {
    transform: translateY(-100%);
  }

  :host([position='bottom']) dialog {
    transform: translateY(100%);
  }

  :host([position][open]) dialog,
  :host([position]) .base--visible dialog {
    transform: translate(0, 0);
  }

  :host([position='start']) dialog,
  :host([position='end']) dialog {
    height: 100%;
    --dialog-max-height: 100vh;
  }

  :host([position='top']) dialog,
  :host([position='bottom']) dialog {
    width: 100%;
    height: ${component('dialog', 'size')};
  }

  :host([position='start']) .dialog-wrapper,
  :host([position='end']) .dialog-wrapper {
    height: 100%;
  }

  :host([position='top']) .dialog-wrapper,
  :host([position='bottom']) .dialog-wrapper {
    width: 100%;
  }

  :host(:not([position='center'])) .dialog-body {
    flex: 1 1 auto;
  }

  :host(:not([position='center'])) .dialog-footer {
    position: sticky;
  }

  :host(:not([position='center'])) .dialog-footer--has-footer {
    margin-top: 16px;
  }

  :host([position='start']) {
    --dialog-inset: 0px auto auto 0px;
  }

  :host([position='end']) {
    --dialog-inset: 0px 0px auto auto;
  }

  :host([position='top']) {
    --dialog-inset: 0 0 auto 0;
  }

  :host([position='bottom']) {
    --dialog-inset: auto 0 0 0;
  }
`;
