import { css } from 'lit';

export default css`
  :host {
    --breadcrumb-item-gap: inherit;
    --breadcrumb-item-padding: inherit;
    --breadcrumb-item-control-width: inherit;
    --breadcrumb-item-border-width: inherit;

    /**Rest */
    --breadcrumb-item-bg-color: inherit;
    --breadcrumb-item-border-color: inherit;
    --breadcrumb-item-fg-color: inherit;

    /**Hover */
    --breadcrumb-item-hover-bg-color: inherit;
    --breadcrumb-item-hover-border-color: inherit;
    --breadcrumb-item-hover-fg-color: inherit;

    /**Active */
    --breadcrumb-item-active-bg-color: inherit;
    --breadcrumb-item-active-border-color: inherit;
    --breadcrumb-item-active-fg-color: inherit;

    /**Focus */
    --breadcrumb-item-focus-bg-color: inherit;
    --breadcrumb-item-focus-border-color: inherit;
    --breadcrumb-item-focus-fg-color: inherit;

    /**Disabled */
    --breadcrumb-item-disabled-bg-color: inherit;
    --breadcrumb-item-disabled-border-color: inherit;
    --breadcrumb-item-disabled-fg-color: inherit;

    background: transparent;
    display: inline-flex;
    fill: currentColor;
    outline: none;
  }

  :host([href]) .control {
    cursor: pointer;
  }

  .base {
    align-items: center;
    box-sizing: border-box;
    display: flex;
    fill: inherit;
    white-space: nowrap;
  }

  .control {
    width: var(--breadcrumb-item-control-width, 100%);
    align-items: center;
    text-decoration: none;
  }

  a {
    display: flex;
    padding: var(--breadcrumb-item-padding, 6px);
    background-color: var(--breadcrumb-item-bg-color);
    border: var(--breadcrumb-item-border-width, 1px) solid var(--breadcrumb-item-border-color, transparent);
    color: var(--breadcrumb-item-fg-color);
  }

  :host(:not([selected])) a:hover {
    cursor: pointer;
    background-color: var(--breadcrumb-item-hover-bg-color);
    border-color: var(--breadcrumb-item-hover-border-color, transparent);
    color: var(--breadcrumb-item-hover-fg-color);
  }

  a:hover:active {
    background-color: var(--breadcrumb-item-active-bg-color);
    border-color: var(--breadcrumb-item-active-border-color, transparent);
    color: var(--breadcrumb-item-active-fg-color);
  }

  a:focus {
    outline: none;
    background-color: var(--breadcrumb-item-focus-bg-color);
    border-color: var(--breadcrumb-item-focus-border-color);
    color: var(--breadcrumb-item-focus-fg-color);
  }

  :host([disabled]) a {
    background-color: var(--breadcrumb-item-disabled-bg-color);
    border-color: var(--breadcrumb-item-disabled-border-color, transparent);
    color: var(--breadcrumb-item-disabled-fg-color);
  }

  :host([disabled]) .control {
    cursor: not-allowed;
  }

  .start,
  .end {
    display: flex;
  }

  .start ::slotted(*) {
    margin-inline-end: var(--breadcrumb-item-gap, 4px);
  }

  .end ::slotted(*) {
    margin-inline-start: var(--breadcrumb-item-gap, 4px);
  }

  .content {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
