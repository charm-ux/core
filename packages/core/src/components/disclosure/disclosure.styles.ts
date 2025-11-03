import { css } from 'lit';

export default css`
  :host {
    --disclosure-gap: inherit;
    --disclosure-content-border: inherit;
    --disclosure-content-border-radius: inherit;
    --disclosure-bg-color: inherit;
    --disclosure-fg-color: inherit;
    --disclosure-closed-max-height: inherit;
    --disclosure-opened-max-height: inherit;
    --disclosure-show-transition: inherit;
    --disclosure-hide-transition: inherit;
  }

  .disclosure-base {
    color: var(--disclosure-fg-color);
    background-color: var(--disclosure-bg-color);
    display: flex;
    flex-direction: column;
    gap: var(--disclosure-gap, 0);
    position: relative;
    width: fit-content;
  }

  :host .disclosure-content {
    border: var(--disclosure-content-border, 1px solid transparent);
    border-radius: var(--disclosure-content-border-radius, 0);
    max-height: var(--disclosure-closed-max-height, 0);
    order: -1;
    overflow: hidden;
    transition: var(--disclosure-hide-transition);
  }

  :host([content-below]) .disclosure-content {
    order: 1;
  }

  :host([open]) .disclosure-content {
    max-height: var(--disclosure-opened-max-height, none);
    transition: var(--disclosure-show-transition);
  }
`;
