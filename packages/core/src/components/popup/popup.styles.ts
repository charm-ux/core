import { css } from 'lit';
import { component } from '../../theme/tokens.js';

export default css`
  :host {
    /*
     * These properties are computed to account for the arrow's dimensions after being rotated 45º. The constant 0.7071 is derived from sin(45), which is the diagonal size of the arrow's container after rotating.
     */
    --popup-arrow-size-diagonal: calc(${component('popup', 'arrowSize')} * 0.7071);
    --popup-arrow-padding-offset: calc(var(--popup-arrow-size-diagonal) - ${component('popup', 'arrowSize')});

    display: contents;
  }

  .popup {
    opacity: 1;
    position: absolute;
    isolation: isolate;
    max-width: var(--popup-auto-size-available-width, none);
    max-height: var(--popup-auto-size-available-height, none);
    z-index: ${component('popup', 'zIndex')};
    transition: ${component('popup', 'showTransition')};
    padding: 0;
    border: transparent;
    margin: 0;
  }

  :host([strategy='fixed']) .popup {
    position: fixed;
  }

  :host(:not([open])) .popup {
    opacity: 0;
    transition: ${component('popup', 'hideTransition')};
  }

  .arrow {
    position: absolute;
    width: calc(var(--popup-arrow-size-diagonal) * 2);
    height: calc(var(--popup-arrow-size-diagonal) * 2);
    transform: rotate(45deg);
    background: ${component('popup', 'arrowColor')};
    z-index: -1;
  }

  :host([open] .popup) {
    filter: ${component('popup', 'dropShadow')};
  }

  .popup-hover-bridge {
    display: none;
  }

  :host([open]) .popup-hover-bridge {
    display: block;
    position: fixed;
    z-index: calc(${component('popup', 'zIndex')} - 1);
    inset: 0;
    clip-path: polygon(
      var(--hover-bridge-top-left-x, 0) var(--hover-bridge-top-left-y, 0),
      var(--hover-bridge-top-right-x, 0) var(--hover-bridge-top-right-y, 0),
      var(--hover-bridge-bottom-right-x, 0) var(--hover-bridge-bottom-right-y, 0),
      var(--hover-bridge-bottom-left-x, 0) var(--hover-bridge-bottom-left-y, 0)
    );
  }
`;
