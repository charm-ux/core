import { css } from 'lit';
import { component } from '../../utilities/theme.js';

export default css`
  :host {
    --tooltip-hide-delay: 0ms;
    --tooltip-show-delay: 300ms;

    display: contents;
    position: relative;
  }

  .tooltip {
    --popup-arrow-color: ${component('tooltip', 'bgColor')};
    --popup-arrow-size: ${component('tooltip', 'arrowSize')};
  }

  .tooltip::part(popup-base) {
    box-shadow: ${component('tooltip', 'boxShadow')};
    border-radius: ${component('tooltip', 'borderRadius')};
    z-index: 1000;
  }

  .tooltip::part(popup-arrow) {
    z-index: 1001;
    border: 0px ${component('tooltip', 'borderStyle')} ${component('tooltip', 'borderColor')};
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
    border-bottom: var(--default-border-size) var(--default-border-style) ${component('tooltip', 'arrowBorderColor')};
    border-inline-end: var(--default-border-size) var(--default-border-style)
      ${component('tooltip', 'arrowBorderColor')};
  }

  .tooltip[data-current-placement^='bottom']::part(popup-arrow) {
    box-shadow: -2px -2px 2px rgba(0, 0, 0, 0.05);
    border-top: var(--default-border-size) var(--default-border-style) ${component('tooltip', 'arrowBorderColor')};
    border-inline-start: var(--default-border-size) var(--default-border-style)
      ${component('tooltip', 'arrowBorderColor')};
  }

  .tooltip[data-current-placement^='left']::part(popup-arrow) {
    box-shadow: 2px -2px 2px rgba(0, 0, 0, 0.06);
    border-top: var(--default-border-size) var(--default-border-style) ${component('tooltip', 'arrowBorderColor')};
    border-inline-end: var(--default-border-size) var(--default-border-style)
      ${component('tooltip', 'arrowBorderColor')};
  }

  .tooltip[data-current-placement^='right']::part(popup-arrow) {
    box-shadow: -2px 2px 2px rgba(0, 0, 0, 0.06);
    border-bottom: var(--default-border-size) var(--default-border-style) ${component('tooltip', 'arrowBorderColor')};
    border-inline-start: var(--default-border-size) var(--default-border-style)
      ${component('tooltip', 'arrowBorderColor')};
  }

  .body {
    background-color: ${component('tooltip', 'bgColor')};
    border: ${component('tooltip', 'borderWidth')} ${component('tooltip', 'borderStyle')}
      ${component('tooltip', 'borderColor')};
    border-radius: ${component('tooltip', 'borderRadius')};
    color: ${component('tooltip', 'fgColor')};
    max-width: ${component('tooltip', 'maxWidth')};
    padding: ${component('tooltip', 'padding')};
    pointer-events: none;
    opacity: 0;
    transition: ${component('tooltip', 'hideTransition')};
  }

  .tooltip::part(popup-arrow) {
    opacity: 0;
    transition: ${component('tooltip', 'hideTransition')};
  }

  .tooltip--visible .body,
  .tooltip--visible::part(popup-arrow) {
    transition: ${component('tooltip', 'showTransition')};
    opacity: 1;
  }

  @media (forced-colors: active) {
    .tooltip::part(popup-base) {
      border: ${component('tooltip', 'borderWidth')} solid transparent;
    }

    .tooltip::part(popup-arrow) {
      border-color: transparent;
      border-style: solid;
    }
  }
`;
