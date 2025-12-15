import { css } from 'lit';

export default css`
  :host {
    --accordion-item-border-width: inherit;
    --accordion-item-focus-width: inherit;
    --accordion-item-font-size: inherit;
    --accordion-item-font-weight: inherit;
    --accordion-item-line-height: inherit;
    --accordion-item-padding-y: inherit;
    --accordion-item-padding-x: inherit;

    /** Rest */
    --accordion-item-bg-color: inherit;
    --accordion-item-border-color: inherit;
    --accordion-item-fg-color: inherit;

    /** Disabled */
    --accordion-item-disabled-bg-color: inherit;
    --accordion-item-disabled-border-color: inherit;
    --accordion-item-disabled-fg-color: inherit;

    /** Hover */
    --accordion-item-hover-bg-color: inherit;
    --accordion-item-hover-border-color: inherit;
    --accordion-item-hover-fg-color: inherit;

    /** Focus */
    --accordion-item-focus-bg-color: inherit;
    --accordion-item-focus-border-color: inherit;
    --accordion-item-focus-fg-color: inherit;

    /** Active */
    --accordion-item-active-bg-color: inherit;
    --accordion-item-active-border-color: inherit;
    --accordion-item-active-fg-color: inherit;

    /** Animation */
    --accordion-item-indicator-open-transition: inherit;
    --accordion-item-indicator-close-transition: inherit;
    --accordion-item-open-transition: inherit;
    --accordion-item-close-transition: inherit;

    --accordion-item-icon-collapsed-transform: inherit;
    --accordion-item-icon-expanded-transform: inherit;
    --accordion-item-icon-transition: inherit;
    --accordion-item-bottom-border-color: inherit;
    --accordion-item-animation-duration: inherit;
    --accordion-item-animation-timing-function: inherit;

    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    interpolate-size: allow-keywords;
  }

  .base {
    display: inline-block;
    position: relative;
    overflow: hidden;
    width: 100%;
    background-color: var(--accordion-item-bg-color);
    color: var(--accordion-item-fg-color);
  }

  .base::details-content {
    block-size: 0;
    transition-behavior: allow-discrete;
  }

  .base[open]::details-content {
    block-size: auto;
  }

  .summary {
    display: flex;
    gap: 0.5rem;
    list-style: none;
    align-items: center;
    padding-inline: 0.75rem 1rem;
    padding-block: 0.5rem;
    margin-inline-start: 0;
    border: var(--accordion-item-border-width) solid var(--accordion-item-border-color);
  }

  .summary > h1,
  .summary > h2,
  .summary > h3,
  .summary > h4,
  .summary > h5,
  .summary > h6 {
    margin: 0;
  }

  .summary::-webkit-details-marker {
    display: none;
  }

  .summary:hover,
  .summary:focus,
  .summary:focus-within,
  .summary:focus-visible {
    background: var(--accordion-item-hover-bg-color);
    border-color: var(--accordion-item-hover-border-color);
    color: var(--accordion-item-hover-fg-color);
    outline: none;
  }

  :host([animated]) .base::details-content {
    transition:
      block-size var(--accordion-item-animation-duration, 300ms) var(--accordion-item-animation-timing-function, ease),
      content-visibility var(--accordion-item-animation-duration, 300ms)
        var(--accordion-item-animation-timing-function, ease);
  }

  :host([disabled]) {
    cursor: not-allowed;
    background-color: var(--accordion-item-disabled-bg-color);
    border-color: var(--accordion-item-disabled-border-color, transparent);
    color: var(--accordion-item-disabled-fg-color);
  }

  :host([disabled]) .summary {
    pointer-events: none;
  }

  .icon,
  .start,
  .end {
    display: flex;
    align-items: center;
    fill: currentColor;
  }

  .start,
  .end {
    justify-content: center;
  }

  .icon {
    justify-content: flex-start;
  }

  :host .chevron {
    font-size: 20px;
    transform: var(--accordion-item-icon-down-start-transform, rotate(-90deg));
    transition: var(--accordion-item-icon-transition);
  }

  :host([open]) .chevron {
    transform: var(--accordion-item-icon-down-end-transform, rotate(0deg));
  }

  :host .chevron-rtl {
    transform: -(var(--accordion-item-icon-down-end-transform, rotate(-90deg)));
  }

  :host([expand-icon-position='end']) .icon {
    order: 1;
    margin-inline-start: auto;
  }
`;
