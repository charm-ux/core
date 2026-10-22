import { css } from 'lit';
import { component, semantic } from '../../utilities/theme.js';

export default css`
  :host {
    display: block;
    width: 100%;
  }

  .combobox-control {
    cursor: text;
    flex-wrap: wrap;
    gap: ${semantic('formControl', 'iconGap')};
    height: auto;
    justify-content: flex-start;
    min-height: ${semantic('formControl', 'inputHeight')};
    padding-block: 0;
    row-gap: 0;
  }

  .combobox-start {
    align-items: center;
    display: inline-flex;
    order: 0;
  }

  slot[name='start']::slotted(*) {
    display: inline-flex;
  }

  .combobox-input {
    flex: 1 1 6ch;
    min-width: 4ch;
    order: 2;
    padding-block: ${semantic('formControl', 'paddingY')};
  }

  .combobox-tags {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    gap: ${component('combobox', 'tag', 'gap')};
    max-width: 100%;
    order: 1;
    padding-block: ${semantic('formControl', 'paddingY')};
  }

  .combobox-tag {
    align-items: center;
    background-color: ${component('combobox', 'tag', 'bgColor')};
    border-radius: ${component('combobox', 'tag', 'borderRadius')};
    color: ${component('combobox', 'tag', 'fgColor')};
    display: inline-flex;
    font-size: ${component('combobox', 'tag', 'fontSize')};
    gap: ${component('combobox', 'tag', 'gap')};
    max-width: 100%;
    padding-block: ${component('combobox', 'tag', 'paddingY')};
    padding-inline: ${component('combobox', 'tag', 'paddingX')};
  }

  .combobox-tag-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .combobox-tag-remove {
    align-items: center;
    background: none;
    border: 0;
    color: inherit;
    cursor: pointer;
    display: inline-flex;
    flex: none;
    margin: 0;
    padding: 0;
  }

  .combobox-tag-remove scoped-icon {
    height: ${component('combobox', 'iconSize')};
    width: ${component('combobox', 'iconSize')};
  }

  .combobox-tag-remove:disabled {
    cursor: not-allowed;
    opacity: ${semantic('formControl', 'disabled', 'opacity')};
  }

  .combobox-clear {
    align-items: center;
    background: none;
    border: 0;
    color: ${semantic('formControl', 'fgColor')};
    cursor: pointer;
    display: inline-flex;
    flex: none;
    margin: 0;
    order: 3;
    padding: 0;
  }

  .combobox-clear scoped-icon,
  .combobox-chevron scoped-icon {
    height: ${component('combobox', 'iconSize')};
    width: ${component('combobox', 'iconSize')};
  }

  .combobox-chevron {
    align-items: center;
    background: none;
    border: 0;
    color: ${semantic('formControl', 'fgColor')};
    cursor: pointer;
    display: inline-flex;
    flex: none;
    font: inherit;
    margin: 0;
    order: 4;
    padding: 0;
    transform: rotate(0deg);
    transition: transform 0.15s ease;
  }

  :host([open]) .combobox-chevron {
    transform: rotate(180deg);
  }

  :host([readonly]) .combobox-chevron,
  :host([disabled]) .combobox-chevron {
    cursor: default;
  }

  :host([disabled]) .combobox-control,
  :host([disabled]) .combobox-input {
    cursor: not-allowed;
  }

  .combobox-listbox {
    background-color: ${component('combobox', 'listbox', 'bgColor')};
    border-color: ${component('combobox', 'listbox', 'borderColor')};
    border-radius: ${component('combobox', 'listbox', 'borderRadius')};
    border-style: ${component('combobox', 'listbox', 'borderStyle')};
    border-width: ${component('combobox', 'listbox', 'borderWidth')};
    box-shadow: ${component('combobox', 'listbox', 'shadow')};
    box-sizing: border-box;
    max-height: ${component('combobox', 'listbox', 'maxHeight')};
    outline: none;
    overflow-y: auto;
    padding: ${component('combobox', 'listbox', 'padding')};
    width: 100%;
  }

  .combobox-empty,
  .combobox-loading {
    align-items: center;
    color: ${component('combobox', 'listbox', 'emptyColor')};
    display: flex;
    justify-content: center;
    padding-block: ${component('combobox', 'option', 'paddingY')};
    padding-inline: ${component('combobox', 'option', 'paddingX')};
  }

  @media screen and (prefers-reduced-motion: reduce) {
    .combobox-chevron {
      transition: none;
    }
  }
`;
