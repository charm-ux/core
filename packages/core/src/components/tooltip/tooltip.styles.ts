import { css } from 'lit';

export default css`
  :host {
    --tooltip-max-width: 20rem;
    --tooltip-hide-delay: 0ms;
    --tooltip-show-delay: 300ms;
    --tooltip-arrow-size: 5px;
    --tooltip-arrow-border-color: inherit;
    --tooltip-bg-color: inherit;
    --tooltip-fg-color: inherit;
    --tooltip-border-radius: inherit;
    --tooltip-border-width: inherit;
    --tooltip-border-style: inherit;
    --tooltip-border-color: inherit;
    --tooltip-padding: inherit;
    --tooltip-box-shadow: inherit;
    --tooltip-show-transition: opacity 150ms ease-in-out;
    --tooltip-hide-transition: opacity 50ms ease-in-out;

    --popup-show-transition: var(--tooltip-show-transition);
    --popup-hide-transition: var(--tooltip-hide-transition);
    --popup-arrow-color: var(--tooltip-bg-color);
    --popup-arrow-size: var(--tooltip-arrow-size);

    display: contents;
    position: relative;
  }

  .popup {
    box-shadow: var(--tooltip-box-shadow);
    border-radius: var(--tooltip-border-radius);
    transform-origin: top;
    z-index: 1000;
  }

  .arrow {
    z-index: 1001;
    border: 0px var(--tooltip-border-style) var(--tooltip-border-color);
  }

  :host[data-current-placement^='top'] .arrow {
    box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.07);
    border-bottom: var(--default-border-size) var(--default-border-style) var(--tooltip-arrow-border-color);
    border-inline-end: var(--default-border-size) var(--default-border-style) var(--tooltip-arrow-border-color);
  }

  :host[data-current-placement^='bottom'] .arrow {
    box-shadow: -2px -2px 2px rgba(0, 0, 0, 0.05);
    border-top: var(--default-border-size) var(--default-border-style) var(--tooltip-arrow-border-color);
    border-inline-start: var(--default-border-size) var(--default-border-style) var(--tooltip-arrow-border-color);
  }

  :host[data-current-placement^='left'] .arrow {
    box-shadow: 2px -2px 2px rgba(0, 0, 0, 0.06);
    border-top: var(--default-border-size) var(--default-border-style) var(--tooltip-arrow-border-color);
    border-inline-end: var(--default-border-size) var(--default-border-style) var(--tooltip-arrow-border-color);
  }

  :host[data-current-placement^='right'] .arrow {
    box-shadow: -2px 2px 2px rgba(0, 0, 0, 0.06);
    border-bottom: var(--default-border-size) var(--default-border-style) var(--tooltip-arrow-border-color);
    border-inline-start: var(--default-border-size) var(--default-border-style) var(--tooltip-arrow-border-color);
  }

  .body {
    background-color: var(--tooltip-bg-color);
    border: var(--tooltip-border-width) var(--tooltip-border-style) var(--tooltip-border-color);
    border-radius: var(--tooltip-border-radius);
    color: var(--tooltip-fg-color);
    max-width: var(--popup-auto-size-max-width, var(--tooltip-max-width));
    padding: var(--tooltip-padding, 4px);
    pointer-events: none;
  }

  @media (forced-colors: active) {
    .tooltip::part(popup-base) {
      border: var(--tooltip-border-width, 1px) solid transparent;
    }

    .tooltip::part(popup-arrow) {
      border-color: transparent;
      border-style: solid;
    }
  }
`;
