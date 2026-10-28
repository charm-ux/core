import { css } from 'lit';
import { component, semantic } from '../../utilities/theme.js';

export default css`
  :host {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    background-color: ${component('tabs', 'bgColor')};
    padding: ${component('tabs', 'paddingY')} ${component('tabs', 'paddingX')};
    border: ${component('tabs', 'borderWidth')} ${component('tabs', 'borderStyle')} ${component('tabs', 'borderColor')};
    border-radius: ${component('tabs', 'borderRadius')};
    row-gap: ${component('tabs', 'tablistGap')};
  }

  ::slotted([role='tab']) {
    flex: 0 0 auto;
  }

  .tablist {
    display: flex;
    min-width: 0;
    width: 100%;
    position: relative;
    column-gap: ${component('tabs', 'gap')};
    justify-self: ${component('tabs', 'align')};
    overflow-x: auto;
    padding: calc(${semantic('focus', 'outlineWidth')} + ${semantic('focus', 'outlineOffset')});
  }

  .tabpanel {
    grid-row: 2;
    grid-column: 1;
    position: relative;
  }

  :host([layout='vertical']) {
    grid-template-columns: auto 1fr;
    justify-content: start;
    column-gap: ${component('tabs', 'tablistGap')};
  }

  :host([layout='vertical']) .tablist {
    flex-direction: column;
    column-gap: revert;
    grid-column: 1;
    grid-row: 1;
    position: relative;
    row-gap: ${component('tabs', 'gap')};
    width: max-content;
    max-width: 100%;
    min-width: ${component('tabs', 'verticalMinWidth')};
  }

  :host([layout='vertical']) .tabpanel {
    grid-column: 2;
    grid-row: 1;
  }

  :host([layout='vertical']) ::slotted([role='tab']) {
    justify-content: start;
  }
`;
