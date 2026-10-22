import { css } from 'lit';
import { component } from '../../utilities/theme.js';

export default css`
  :host {
    display: block;
  }

  :host([hidden]) {
    display: none;
  }

  :host(:not(:first-child)) {
    margin-block-start: ${component('combobox', 'group', 'gap')};
  }

  .option-group-label {
    color: ${component('combobox', 'group', 'label', 'color')};
    font-size: ${component('combobox', 'group', 'label', 'fontSize')};
    font-weight: ${component('combobox', 'group', 'label', 'fontWeight')};
    line-height: ${component('combobox', 'group', 'label', 'lineHeight')};
    padding-block: ${component('combobox', 'group', 'label', 'paddingY')};
    padding-inline: ${component('combobox', 'option', 'paddingX')};
  }

  :host([disabled]) .option-group-label {
    color: ${component('combobox', 'option', 'disabledFgColor')};
  }
`;
