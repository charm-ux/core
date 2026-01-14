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

    display: contents;
    position: relative;
  }

  .tooltip {
    --popup-arrow-color: var(--tooltip-bg-color);
    --popup-arrow-size: var(--tooltip-arrow-size);
  }

  .tooltip::part(popup-base) {
    box-shadow: var(--tooltip-box-shadow);
    border-radius: var(--tooltip-border-radius);
    z-index: 1000;
  }

  .tooltip::part(popup-arrow) {
    z-index: 1001;
    border: 0px var(--tooltip-border-style) var(--tooltip-border-color);
  }

  .tooltip::part(popup) {
    transform-origin: top;
  }

  .tooltip[data-current-placement^='top']::part(popup) {
    transform-origin: bottom;
  }

  .tooltip[data-current-placement^='left']::part(popup) {
    transform-origin: right;
  }

  .tooltip[data-current-placement^='right']::part(popup) {
    transform-origin: left;
  }

  .tooltip[data-current-placement^='top']::part(popup-arrow) {
    box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.07);
    border-bottom: var(--default-border-size) var(--default-border-style) var(--tooltip-arrow-border-color);
    border-inline-end: var(--default-border-size) var(--default-border-style) var(--tooltip-arrow-border-color);
  }

  .tooltip[data-current-placement^='bottom']::part(popup-arrow) {
    box-shadow: -2px -2px 2px rgba(0, 0, 0, 0.05);
    border-top: var(--default-border-size) var(--default-border-style) var(--tooltip-arrow-border-color);
    border-inline-start: var(--default-border-size) var(--default-border-style) var(--tooltip-arrow-border-color);
  }

  .tooltip[data-current-placement^='left']::part(popup-arrow) {
    box-shadow: 2px -2px 2px rgba(0, 0, 0, 0.06);
    border-top: var(--default-border-size) var(--default-border-style) var(--tooltip-arrow-border-color);
    border-inline-end: var(--default-border-size) var(--default-border-style) var(--tooltip-arrow-border-color);
  }

  .tooltip[data-current-placement^='right']::part(popup-arrow) {
    box-shadow: -2px 2px 2px rgba(0, 0, 0, 0.06);
    border-bottom: var(--default-border-size) var(--default-border-style) var(--tooltip-arrow-border-color);
    border-inline-start: var(--default-border-size) var(--default-border-style) var(--tooltip-arrow-border-color);
  }

  .body {
    background-color: var(--tooltip-bg-color);
    border: var(--tooltip-border-width) var(--tooltip-border-style) var(--tooltip-border-color);
    border-radius: var(--tooltip-border-radius);
    color: var(--tooltip-fg-color);
    max-width: var(--tooltip-max-width);
    padding: var(--tooltip-padding, 4px);
    pointer-events: none;
    opacity: 0;
    transition: var(--tooltip-hide-transition);
  }

  .tooltip::part(popup-arrow) {
    opacity: 0;
    transition: var(--tooltip-hide-transition);
  }

  .tooltip--visible .body,
  .tooltip--visible::part(popup-arrow) {
    transition: var(--tooltip-show-transition);
    opacity: 1;
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
