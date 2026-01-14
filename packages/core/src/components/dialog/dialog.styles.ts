import { css } from 'lit';

const fallbackStyles = {
  maxHeight: css`calc(100vh - 40px)`,
  maxWidth: css`100vw`,
  size: css`320px`,
};

export default css`
  :host {
    --dialog-close-button-bg-color: inherit;
    --dialog-close-button-border-color: inherit;
    --dialog-close-button-border-radius: inherit;
    --dialog-close-button-border-width: inherit;
    --dialog-close-button-fg-color: inherit;
    --dialog-close-button-padding: inherit;

    /** close button hover */
    --dialog-close-button-hover-bg-color: inherit;
    --dialog-close-button-hover-border-color: inherit;
    --dialog-close-button-hover-fg-color: inherit;

    /** close button active */
    --dialog-close-button-active-bg-color: inherit;
    --dialog-close-button-active-border-color: inherit;
    --dialog-close-button-active-fg-color: inherit;

    /** close button focus */
    --dialog-close-button-focus-bg-color: inherit;
    --dialog-close-button-focus-border-color: inherit;
    --dialog-close-button-focus-fg-color: inherit;

    --dialog-backdrop-color: inherit;
    --dialog-border-color: inherit;
    --dialog-border-radius: none;
    --dialog-border-width: inherit;
    --dialog-footer-button-gap: inherit;
    --dialog-max-height: inherit;
    --dialog-max-width: inherit;
    --dialog-padding-x: inherit;
    --dialog-padding-y: inherit;
    --dialog-shadow: none;
    --dialog-size: inherit;
    --dialog-toolbar-button-gap: inherit;
    --dialog-transition: inherit;
    --dialog-bg-color: inherit;
    --dialog-fg-color: inherit;
    --dialog-header-toolbar-gap: inherit;
    --dialog-margin-top: inherit;
  }

  dialog {
    display: none;
    position: fixed;
    inset: var(--dialog-inset, 0);
    width: var(--dialog-size, ${fallbackStyles.size});
    max-width: var(--dialog-max-width, ${fallbackStyles.maxWidth});
    max-height: var(--dialog-max-height, ${fallbackStyles.maxHeight});
    background: none;
    border: var(--dialog-border, none);
    overflow: hidden;
    opacity: 0;
    transition: var(--dialog-transition);
  }

  dialog[open] {
    display: flex;
  }

  :host([open]) dialog {
    opacity: 1;
    transition: var(--dialog-transition);
  }

  .dialog-wrapper {
    display: flex;
    background: var(--dialog-bg-color, Canvas);
    color: var(--dialog-fg-color, CanvasText);
    border: var(--dialog-border-width, 1px) solid var(--dialog-border-color, black);
    border-radius: var(--dialog-border-radius);
    box-shadow: var(--dialog-shadow);
    flex-direction: column;
    justify-content: center;
    pointer-events: none;
    padding-inline: var(--dialog-padding-x, 16px);
    padding-block: var(--dialog-padding-y, 16px);
  }

  .dialog-body {
    overflow: auto;
    width: 100%;
  }

  .close-btn {
    border: var(--dialog-close-button-border-width) solid var(--dialog-close-button-border-color);
    background: var(--dialog-close-button-bg-color);
    color: var(--dialog-close-button-fg-color);
    cursor: pointer;
    line-height: 0;
    padding: var(--dialog-close-button-padding, 4px);
    height: var(--dialog-close-button-size, inherit);
    width: var(--dialog-close-button-size, inherit);
    border-radius: var(--dialog-close-button-border-radius);
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
    border: var(--dialog-close-button-hover-border-width) solid var(--dialog-close-button-hover-border-color);
    background: var(--dialog-close-button-hover-bg-color);
    color: var(--dialog-close-button-hover-fg-color);
  }

  .close-btn:active {
    border: var(--dialog-close-button-active-border-width) solid var(--dialog-close-button-active-border-color);
    background: var(--dialog-close-button-active-bg-color);
    color: var(--dialog-close-button-active-fg-color);
  }

  .close-btn:focus {
    border: var(--dialog-close-button-focus-border-width) solid var(--dialog-close-button-focus-border-color);
    background: var(--dialog-close-button-focus-bg-color);
    color: var(--dialog-close-button-focus-fg-color);
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
    gap: var(--dialog-header-toolbar-gap, inherit);
  }

  .dialog-title {
    align-self: start;
    margin: 0;
  }

  .toolbar {
    display: flex;
    align-self: end;
    gap: var(--dialog-toolbar-button-gap, 8px);
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
    background: var(--dialog-backdrop-color, hsl(0deg 0% 0% / 70%));
    transition: var(--dialog-transition);
  }

  :host([open]) dialog::backdrop {
    pointer-events: inherit;
    transition: var(--dialog-transition);
  }

  .dialog-footer {
    display: flex;
    align-self: flex-end;
    gap: var(--dialog-footer-button-gap, 8px);
  }

  .dialog-body--has-header {
    margin-top: var(--dialog-margin-top, 8px);
  }

  .dialog-footer--has-footer {
    margin-top: var(--dialog-margin-top, 8px);
  }

  /* Styles for drawer */
  :host([position]) {
    --dialog-position-transition: opacity 0.25s ease-in-out, transform 0.25s ease-in-out;
    /* Override dialog-transition only for positioned dialogs */
    --dialog-transition: var(--dialog-position-transition);
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
    height: var(--dialog-size, ${fallbackStyles.size});
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
