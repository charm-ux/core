import { css } from 'lit';

export default css`
  :host {
    display: inline-block;
    --button-group-gap: inherit;
    width: 100%;
  }

  .button-group {
    align-items: center;
    display: inline-flex;
    flex-direction: row;
    width: 100%;
    gap: var(--button-group-gap, 1px);
  }

  :host([split]) .button-group {
    background-color: var(--button-bg-color, revert);
    border: var(--button-border-size, var(--default-border-size))
      var(--button-border-style, var(--default-border-style)) var(--button-border-color, var(--default-border-color));
    border-radius: var(--button-border-radius);
  }

  :host([split]) .button-group:focus {
    border-color: var(--button-focus-border-color);
  }

  :host([split]) .button-group:hover {
    border-color: var(--button-hover-border-color, var(--default-border-color));
  }

  :host([split]) .button-group:disabled {
    border-color: var(--button-disabled-border-color, var(--default-border-color));
  }

  :host([split]) {
    width: auto;
  }

  :host([vertical]) .button-group {
    flex-direction: column;
    align-items: stretch;
    width: auto;
  }

  ::slotted([menu]),
  ::slotted([button]) {
    flex: 0 1 auto;
    position: relative;
    display: inline-grid;
    --button-content-alignment: stretch;
    width: auto;
  }

  /* Split Button Styles */
  :host(:not([vertical])[split]) {
    --button-group-gap: 0;
  }

  :host([vertical][split]) {
    --button-group-gap: 0;
  }

  :host(:not([vertical])[split]) ::slotted(:not([button-group-button-position='first'])):before {
    content: '';
    position: absolute;
    top: 50%;
    left: -0.5px;
    transform: translateY(-50%);
    height: var(--button-group-divider-height, 100%);
    width: 1px;
    background-color: var(--button-group-divider-color, var(--button-fg-color));
    z-index: 2;
  }

  :host([vertical][split]) ::slotted(:not([button-group-button-position='first'])):before {
    content: '';
    position: absolute;
    top: -0.5px;
    right: 50%;
    transform: translateX(50%);
    width: var(--button-group-divider-width, 100%);
    height: 1px;
    background-color: var(--button-group-divider-color, var(--button-fg-color));
    z-index: 2;
  }
`;
