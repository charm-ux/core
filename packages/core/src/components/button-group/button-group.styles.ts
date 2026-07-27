import { css } from 'lit';
import { component } from '../../utilities/theme.js';

export default css`
  :host {
    display: inline-block;
    width: 100%;
  }

  .button-group {
    align-items: center;
    display: inline-flex;
    flex-direction: row;
    width: 100%;
    gap: ${component('button', 'group', 'gap')};
  }

  :host([split]) .button-group {
    background-color: ${component('button', 'bgColor')};
    border: ${component('button', 'borderWidth')} ${component('button', 'borderStyle')}
      ${component('button', 'borderColor')};
    border-radius: ${component('button', 'borderRadius')};
  }

  :host([split]) .button-group:focus {
    border-color: ${component('button', 'focus', 'borderColor')};
  }

  :host([split]) .button-group:hover {
    border-color: ${component('button', 'hover', 'borderColor')};
  }

  :host([split]) .button-group:disabled {
    border-color: ${component('button', 'disabled', 'borderColor')};
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
    height: ${component('button', 'group', 'dividerHeight')};
    width: 1px;
    background-color: ${component('button', 'group', 'dividerColor')};
    z-index: 2;
  }

  :host([vertical][split]) ::slotted(:not([button-group-button-position='first'])):before {
    content: '';
    position: absolute;
    top: -0.5px;
    right: 50%;
    transform: translateX(50%);
    width: ${component('button', 'group', 'dividerWidth')};
    height: 1px;
    background-color: ${component('button', 'group', 'dividerColor')};
    z-index: 2;
  }
`;
