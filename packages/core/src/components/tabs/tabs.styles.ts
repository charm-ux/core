import { css } from 'lit';
import { project } from '../../utilities/project.js';
const { component } = project.theme;

export default css`
  :host {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    background-color: ${component('tabs', 'bgColor')};
    padding: ${component('tabs', 'paddingY')} ${component('tabs', 'paddingX')};
    border: ${component('tabs', 'borderWidth')} ${component('tabs', 'borderStyle')} ${component('tabs', 'borderColor')};
    border-radius: ${component('tabs', 'borderRadius')};
  }

  ::slotted([role='tab']) {
    grid-row: 1;
  }

  .tablist {
    display: grid;
    grid-template-rows: auto auto;
    grid-template-columns: auto;
    width: max-content;
    position: relative;
    column-gap: ${component('tabs', 'gap')};
    row-gap: revert;
    justify-self: ${component('tabs', 'align')};
    overflow-x: auto;
  }

  .tabpanel {
    grid-row: 2;
    grid-column: 1 / 3;
    position: relative;
  }

  :host([layout='vertical']) {
    grid-template-columns: auto 1fr;
    justify-content: start;
  }

  :host([layout='vertical']) .tablist {
    column-gap: revert;
    grid-column: 1;
    grid-row: 1;
    position: relative;
    row-gap: ${component('tabs', 'gap')};
    width: 100%;
    width: max-content;
    min-width: ${component('tabs', 'verticalMinWidth')};
  }

  :host([layout='vertical']) .tabpanel {
    grid-column: 2;
    grid-row: 1;
  }

  :host([layout='vertical']) ::slotted([role='tab']) {
    justify-content: start;
    grid-column: 2;
    grid-row: revert;
  }
`;
