import { css } from 'lit';
import { component, semantic } from '../../utilities/theme.js';

export default css`
  :host {
    display: inline-flex;
    vertical-align: middle;
  }

  /* The host takes focus when a tag group manages a roving tabindex. */
  :host(:focus-visible) {
    outline: none;
  }

  :host(:focus-visible) .base {
    outline: ${semantic('focus', 'outlineWidth')} ${semantic('focus', 'outlineStyle')}
      ${semantic('focus', 'outlineColor')};
    outline-offset: ${semantic('focus', 'outlineOffset')};
  }

  .base {
    display: inline-flex;
    align-items: center;
    box-sizing: border-box;
    background-color: ${component('tag', 'bgColor')};
    border-color: ${component('tag', 'borderColor')};
    border-radius: ${component('tag', 'borderRadius')};
    border-style: ${component('tag', 'borderStyle')};
    border-width: ${component('tag', 'borderWidth')};
    color: ${component('tag', 'fgColor')};
    font-size: ${component('tag', 'fontSize')};
    gap: ${component('tag', 'gap')};
    line-height: 1;
    max-inline-size: 100%;
    padding-block: ${component('tag', 'paddingY')};
    padding-inline: ${component('tag', 'paddingX')};
  }

  :host(:hover:not([disabled])) .base {
    background-color: ${component('tag', 'hover', 'bgColor')};
  }

  :host([selected]) .base {
    background-color: ${component('tag', 'selected', 'bgColor')};
    border-color: ${component('tag', 'selected', 'borderColor')};
    color: ${component('tag', 'selected', 'fgColor')};
  }

  :host([disabled]) .base {
    background-color: ${component('tag', 'disabled', 'bgColor')};
    border-color: ${component('tag', 'disabled', 'borderColor')};
    color: ${component('tag', 'disabled', 'fgColor')};
    cursor: not-allowed;
  }

  .start,
  .end {
    display: inline-flex;
    align-items: center;
  }

  .content {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: ${component('tag', 'remove', 'bgColor')};
    border: none;
    border-radius: ${component('tag', 'remove', 'borderRadius')};
    color: inherit;
    cursor: pointer;
    font: inherit;
    line-height: 1;
    margin: 0;
    padding: ${component('tag', 'remove', 'padding')};
  }

  .remove:hover:not(:disabled):not(.remove-disabled) {
    background: ${component('tag', 'remove', 'hover', 'bgColor')};
  }

  .remove:disabled,
  .remove-disabled {
    cursor: not-allowed;
  }

  .remove-icon {
    font-size: ${component('tag', 'remove', 'iconSize')};
  }

  @media (forced-colors: active) {
    .base {
      border-color: CanvasText;
    }

    :host([selected]) .base {
      background-color: Highlight;
      color: HighlightText;
    }

    :host([disabled]) .base {
      border-color: GrayText;
      color: GrayText;
    }
  }
`;
