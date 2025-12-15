import { css } from 'lit';
import { SystemColors } from '../../theme/styles/system-colors.js';

const fallbackStyles = {
  paddingX: css`12px`,
  paddingY: css`8px`,
};

export default css`
  :host {
    --tab-padding-x: inherit;
    --tab-padding-y: inherit;
    --tab-gap: inherit;
    --tab-font-size: inherit;
    --tab-font-weight: inherit;
    --tab-border-width: inherit;
    --tab-border-radius: inherit;
    --tab-transition: inherit;
    --tab-icon-size: inherit;
    --tab-icon-gap: inherit;

    /** Rest */
    --tab-bg-color: inherit;
    --tab-border-color: inherit;
    --tab-fg-color: inherit;

    /** Disabled */
    --tab-disabled-bg-color: inherit;
    --tab-disabled-border-color: inherit;
    --tab-disabled-fg-color: inherit;
    --tab-disabled-opacity: inherit;

    /** Hover */
    --tab-hover-bg-color: inherit;
    --tab-hover-border-color: inherit;
    --tab-hover-fg-color: inherit;

    /** Focus */
    --tab-focus-bg-color: inherit;
    --tab-focus-border-color: inherit;
    --tab-focus-fg-color: inherit;

    /** Active */
    --tab-active-bg-color: inherit;
    --tab-active-border-color: inherit;
    --tab-active-fg-color: inherit;
    --tab-active-font-weight: inherit;

    align-items: center;
    cursor: pointer;
    display: inline-flex;
    justify-content: center;
    padding-inline: var(--tab-padding-x, ${fallbackStyles.paddingX});
    padding-block: var(--tab-padding-y, ${fallbackStyles.paddingY});
    gap: var(--tab-gap, 0.5rem);
    user-select: none;
    background-color: var(--tab-bg-color);
    border: var(--tab-border-width, 0px) var(--tab-border-style, solid) var(--tab-border-color, transparent);
    color: var(--tab-fg-color);
    border-radius: var(--tab-border-radius);
    line-height: 1;
    font-size: var(--tab-font-size);
    font-weight: var(--tab-font-weight);
    transition: var(--tab-transition, all 0.2s ease);
  }

  :host([selected]) {
    background-color: var(--tab-active-bg-color);
    border-color: var(--tab-active-border-color);
    color: var(--tab-active-fg-color);
    font-weight: var(--tab-active-font-weight);
  }

  :host([disabled]) {
    cursor: not-allowed;
    background-color: var(--tab-disabled-bg-color);
    border-color: var(--tab-disabled-border-color);
    color: var(--tab-disabled-fg-color);
  }

  :host(:hover:not([disabled])) {
    background-color: var(--tab-hover-bg-color);
    border-color: var(--tab-hover-border-color);
    color: var(--tab-hover-fg-color);
  }

  :host(:focus:not([disabled])) {
    background-color: var(--tab-focus-bg-color);
    border-color: var(--tab-focus-border-color);
    color: var(--tab-focus-fg-color);
  }

  :host(:active:not([disabled])) {
    background-color: var(--tab-active-bg-color);
    border-color: var(--tab-active-border-color);
    color: var(--tab-active-fg-color);
  }

  @media screen and (forced-colors: active) {
    :host([disabled]) {
      color: ${SystemColors.GrayText};
    }

    :host(:hover:not([disabled]))::before {
      background: ${SystemColors.Highlight};
    }
  }

  ::slotted([slot='start']) {
    font-size: var(--tab-icon-size);
    margin-inline-end: var(--tab-icon-gap, 0.25rem);
  }

  ::slotted([slot='end']) {
    font-size: var(--tab-icon-size);
    margin-inline-start: var(--tab-icon-gap, 0.25rem);
  }
`;
