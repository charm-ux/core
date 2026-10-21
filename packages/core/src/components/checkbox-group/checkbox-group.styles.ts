import { css } from 'lit';
import { component, semantic } from '../../utilities/theme.js';

export default css`
  ::slotted(*) {
    --_charm-checkbox-group-direction: row;
  }

  :host([layout='horizontal-stacked']) ::slotted(*) {
    --_charm-checkbox-group-direction: column;
  }

  fieldset {
    min-inline-size: 0;
    margin: 0;
    padding: 0;
    border: 0;
  }

  .checkboxes {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    grid-area: control;
    gap: ${component('checkbox', 'groupCheckboxGap')};
    height: auto;
    border: 0;
    background: transparent;
  }

  :host([layout='horizontal']) .checkboxes,
  :host([layout='horizontal-stacked']) .checkboxes {
    flex-direction: row;
  }

  :host([listbox]:focus-visible) ::slotted([data-listbox-active]) {
    outline: ${semantic('focus', 'outlineWidth')} ${semantic('focus', 'outlineStyle')}
      ${semantic('focus', 'outlineColor')};
    outline-offset: ${semantic('focus', 'outlineOffset')};
  }
`;
