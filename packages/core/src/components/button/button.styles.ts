import { css } from 'lit';
import { project } from '../../utilities/project.js';
const { component } = project.theme;

export default css`
  :host {
    cursor: pointer;
    display: inline-block;
    font-size: inherit;
    vertical-align: top;
  }

  :host([disabled]) {
    cursor: not-allowed;
  }

  .control {
    line-height: 1;
    align-items: center;
    width: 100%;
    background-color: ${component('button', 'bgColor')};
    border-radius: ${component('button', 'borderRadius')};
    border: ${component('button', 'borderWidth')} ${component('button', 'borderStyle')}
      ${component('button', 'borderColor')};
    color: ${component('button', 'fgColor')};
    cursor: pointer;
    display: flex;
    fill: currentColor;
    font-weight: ${component('button', 'fontWeight')};
    justify-content: space-between;
    padding: ${component('button', 'paddingY')} ${component('button', 'paddingX')};
    text-align: center;
    box-shadow: ${component('button', 'shadow')};
  }

  .control:focus {
    background-color: ${component('button', 'focus', 'bgColor')};
    border-color: ${component('button', 'focus', 'borderColor')};
    color: ${component('button', 'focus', 'fgColor')};
    box-shadow: ${component('button', 'focus', 'shadow')};
    position: relative;
    z-index: 1;
  }

  :host([split]) .control {
    border: none; /* button group border is applied */
  }

  :host([split]) .control:focus {
    box-shadow: none; /* boxshadow creates a dark line between the buttons when focused */
  }

  /* Toggle button */
  .control[aria-pressed='true'] {
    background-color: ${component('button', 'pressed', 'bgColor')};
    border-color: ${component('button', 'pressed', 'borderColor')};
    color: ${component('button', 'pressed', 'fgColor')};
  }

  .control:hover {
    background-color: ${component('button', 'hover', 'bgColor')};
    border-color: ${component('button', 'hover', 'borderColor')};
    color: ${component('button', 'hover', 'fgColor')};
    box-shadow: ${component('button', 'hover', 'shadow')};
  }

  :host(:not([disabled])) .control:active {
    background-color: ${component('button', 'active', 'bgColor')};
    border-color: ${component('button', 'active', 'borderColor')};
    color: ${component('button', 'active', 'fgColor')};
    box-shadow: ${component('button', 'active', 'shadow')};
  }

  :host([icon-only]) .control {
    padding: ${component('button', 'iconPaddingY')} ${component('button', 'iconPaddingX')};
  }

  :host([disabled]) .control {
    background-color: ${component('button', 'disabled', 'bgColor')};
    border-color: ${component('button', 'disabled', 'borderColor')};
    color: ${component('button', 'disabled', 'fgColor')};
    box-shadow: ${component('button', 'disabled', 'shadow')};
    cursor: ${component('button', 'disabled', 'cursor')};
  }

  .content {
    display: contents;
  }

  ::slotted(*) {
    pointer-events: none;
    vertical-align: middle;
  }

  slot[name='start']::slotted(*) {
    margin-inline-end: ${component('button', 'contentGap')};
  }

  slot[name='end']::slotted(*) {
    margin-inline-start: ${component('button', 'contentGap')};
  }

  .content {
    grid-column: content;
  }

  .start {
    grid-column: start;
  }

  .end {
    grid-column: end;
  }

  /* Button styles for Horizontal Split Button Group */
  :host([split][button-group-button-position='first']:not([vertical])) .control {
    border-start-end-radius: 0;
    border-end-end-radius: 0;
  }

  :host([split][button-group-button-position='last']:not([vertical])) .control {
    border-start-start-radius: 0;
    border-end-start-radius: 0;
  }
  :host([split][button-group-button-position='inner']:not([vertical])) .control {
    border-radius: 0;
  }

  /* Button styles for Vertical Split Button Group */
  :host([split][vertical][button-group-button-position='first']) .control {
    border-end-start-radius: 0;
    border-end-end-radius: 0;
  }

  :host([split][vertical][button-group-button-position='last']) .control {
    border-start-end-radius: 0;
    border-start-start-radius: 0;
  }
  :host([split][vertical][button-group-button-position='inner']) .control {
    border-radius: 0;
  }

  ::slotted([icon]),
  ::slotted(svg) {
    display: flex;
    width: ${component('button', 'iconSize')};
    height: ${component('button', 'iconSize')};
  }
`;
