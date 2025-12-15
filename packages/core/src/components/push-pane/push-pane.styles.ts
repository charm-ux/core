import { css } from 'lit';

export default css`
  :host {
    --push-pane-bg-color: inherit;
    --push-pane-fg-color: inherit;
    --push-pane-size: inherit;
    --push-pane-transition: inherit;
    --push-pane-divider-color: inherit;

    --push-pane-padding-x: inherit;
    --push-pane-padding-y: inherit;
    --push-pane-body-padding-x: inherit;
    --push-pane-body-padding-y: inherit;
    --push-pane-body-margin-top: inherit;
    --push-pane-body-margin-bottom: inherit;
    --push-pane-body-margin-inline: inherit;
    --push-pane-header-padding-x: inherit;
    --push-pane-header-padding-y: inherit;
    --push-pane-footer-padding-x: inherit;
    --push-pane-footer-padding-y: inherit;

    --push-pane-close-button-bg-color: inherit;
    --push-pane-close-button-fg-color: inherit;
    --push-pane-close-button-border-color: inherit;
    --push-pane-close-button-border-width: inherit;
    --push-pane-close-button-border-radius: inherit;
    --push-pane-close-button-padding: inherit;

    --push-pane-toolbar-button-gap: inherit;
    --push-pane-footer-button-gap: inherit;

    /** close button hover */
    --push-pane-close-button-hover-bg-color: inherit;
    --push-pane-close-button-hover-border-color: inherit;
    --push-pane-close-button-hover-fg-color: inherit;

    /** close button active */
    --push-pane-close-button-active-bg-color: inherit;
    --push-pane-close-button-active-border-color: inherit;
    --push-pane-close-button-active-fg-color: inherit;

    /** close button focus */
    --push-pane-close-button-focus-bg-color: inherit;
    --push-pane-close-button-focus-border-color: inherit;
    --push-pane-close-button-focus-fg-color: inherit;

    padding-inline: var(--push-pane-padding-x);
    padding-block: var(--push-pane-padding-y);
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
    transition: var(--push-pane-transition);
    border-inline-end: 1px solid var(--push-pane-divider-color);
    border-inline-start: none;
    padding-block: 0;
    padding-inline: 0;
    background-color: var(--push-pane-bg-color);
    margin-inline-start: 0;
    margin-inline-end: 0;
    color: var(--push-pane-fg-color);
  }

  :host([open]) .base {
    width: var(--push-pane-size, 340px);
    margin-inline-end: var(--push-pane-body-margin-inline, 1em);
    opacity: 1;
    overflow: auto;
    padding-block: var(--push-pane-body-padding-y, 1em);
    padding-inline: var(--push-pane-body-padding-x, 1em);
    transition: var(--push-pane-transition);
  }

  :host([position='end']) .base {
    float: right;
  }

  :host([open][position='end']) .base {
    border-inline-start: 1px solid var(--push-pane-divider-color);
    margin-inline-start: var(--push-pane-body-margin-inline, 1em);
    margin-inline-end: 0;
  }

  :host([open][position='bottom']) .base {
    border-top: 1px solid var(--push-pane-divider-color);
    margin-inline-start: 0;
    margin-inline-end: 0;
    width: 100%;
    height: var(--push-pane-size, 340px);
  }

  header {
    display: flex;
    justify-content: space-between;
    padding-block: var(--push-pane-header-padding-y);
    padding-inline: var(--push-pane-header-padding-x);
  }

  header h2 {
    margin: 0;
  }

  footer {
    padding-block: var(--push-pane-footer-padding-y);
    padding-inline: var(--push-pane-footer-padding-x);
    display: flex;
    gap: var(--push-pane-footer-button-gap, 8px);
    justify-content: flex-end;
  }

  .close-button {
    border: var(--push-pane-close-button-border-width) solid var(--push-pane-close-button-border-color);
    background: var(--push-pane-close-button-bg-color);
    border-radius: var(--push-pane-close-button-border-radius);
    color: var(--push-pane-close-button-fg-color);
    cursor: pointer;
    line-height: 0;
    padding: var(--push-pane-close-button-padding, 4px);
  }

  .close-button:hover {
    border: var(--push-pane-close-button-hover-border-width) solid var(--push-pane-close-button-hover-border-color);
    background: var(--push-pane-close-button-hover-bg-color);
  }

  .close-button:active {
    border: var(--push-pane-close-button-active-border-width) solid var(--push-pane-close-button-active-border-color);
    background: var(--push-pane-close-button-active-bg-color);
  }

  .close-button:focus {
    border: var(--push-pane-close-button-focus-border-width) solid var(--push-pane-close-button-focus-border-color);
    background: var(--push-pane-close-button-focus-bg-color);
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
    margin-bottom: var(--push-pane-body-margin-bottom);
  }

  .body--has-actions {
    margin-top: var(--push-pane-body-margin-top);
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
    gap: var(--push-pane-toolbar-button-gap);
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
