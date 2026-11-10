import { css } from 'lit';
import { component } from '../../utilities/theme.js';

export default css`
  :host {
    display: block;
  }

  .base {
    display: flex;
    flex-direction: column;
    gap: ${component('tagGroup', 'labelGap')};
  }

  .label {
    color: ${component('tagGroup', 'label', 'color')};
    font-size: ${component('tagGroup', 'label', 'fontSize')};
    font-weight: ${component('tagGroup', 'label', 'fontWeight')};
  }

  .help-text {
    color: ${component('tagGroup', 'helpText', 'color')};
    font-size: ${component('tagGroup', 'helpText', 'fontSize')};
  }

  .list {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: ${component('tagGroup', 'gap')};
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .empty {
    color: ${component('tagGroup', 'empty', 'color')};
  }

  :host([disabled]) .label,
  :host([disabled]) .help-text {
    cursor: not-allowed;
  }
`;
