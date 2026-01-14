import { css } from 'lit';

export default css`
  :host {
    --popup-arrow-color: inherit;
    --popup-arrow-size: 6px;
    --popup-drop-shadow: inherit;
    --popup-hide-transition: inherit;
    --popup-show-transition: inherit;
    --popup-z-index: inherit;

    /*
     * These properties are computed to account for the arrow's dimensions after being rotated 45º. The constant 0.7071 is derived from sin(45), which is the diagonal size of the arrow's container after rotating.
     */
    --popup-arrow-size-diagonal: calc(var(--popup-arrow-size) * 0.7071);
    --popup-arrow-padding-offset: calc(var(--popup-arrow-size-diagonal) - var(--popup-arrow-size));

    display: contents;
  }

  .popup {
    opacity: 1;
    position: absolute;
    isolation: isolate;
    max-width: var(--popup-auto-size-available-width, none);
    max-height: var(--popup-auto-size-available-height, none);
    z-index: var(--popup-z-index);
    transition: var(--popup-show-transition);
    padding: 0;
    border: transparent;
    margin: 0;
  }

  :host([strategy='fixed']) .popup {
    position: fixed;
  }

  :host(:not([open])) .popup {
    opacity: 0;
    transition: var(--popup-hide-transition);
  }

  .arrow {
    position: absolute;
    width: calc(var(--popup-arrow-size-diagonal) * 2);
    height: calc(var(--popup-arrow-size-diagonal) * 2);
    transform: rotate(45deg);
    background: var(--popup-arrow-color);
    z-index: -1;
  }

  :host([open] .popup) {
    filter: var(--popup-drop-shadow);
  }

  .popup-hover-bridge {
    display: none;
  }

  :host([open]) .popup-hover-bridge {
    display: block;
    position: fixed;
    z-index: calc(var(--popup-z-index) - 1);
    inset: 0;
    clip-path: polygon(
      var(--hover-bridge-top-left-x, 0) var(--hover-bridge-top-left-y, 0),
      var(--hover-bridge-top-right-x, 0) var(--hover-bridge-top-right-y, 0),
      var(--hover-bridge-bottom-right-x, 0) var(--hover-bridge-bottom-right-y, 0),
      var(--hover-bridge-bottom-left-x, 0) var(--hover-bridge-bottom-left-y, 0)
    );
  }
`;
