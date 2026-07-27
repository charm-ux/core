import { css } from 'lit';
import { component } from '../../utilities/theme.js';

export default css`
  .popup-base {
    background-color: ${component('menu', 'bgColor')};
    border-radius: ${component('menu', 'borderRadius')};
    border-style: ${component('menu', 'borderStyle')};
    border-color: ${component('menu', 'borderColor')};
    border-width: ${component('menu', 'borderWidth')};
    box-shadow: ${component('menu', 'shadow')};
    max-width: ${component('menu', 'maxWidth')};
    min-width: ${component('menu', 'minWidth')};
    width: ${component('menu', 'width')};
    z-index: ${component('menu', 'zIndex')};
  }

  .popup {
    opacity: 0;
    transition: ${component('menu', 'transition')};
  }

  .popup[active] {
    opacity: 1;
    pointer-events: inherit;
  }

  .popup-base {
    padding: ${component('menu', 'popupPadding')};
  }
`;
