import { css } from 'lit';

export default css`
  :host {
    --menu-bg-color: inherit;
    --menu-border-color: inherit;
    --menu-border-radius: inherit;
    --menu-border-style: inherit;
    --menu-border-width: inherit;
    --menu-max-width: inherit;
    --menu-min-width: inherit;
    --menu-shadow: inherit;
    --menu-transition: inherit;
    --menu-width: inherit;
    --menu-z-index: inherit;
    --menu-popup-padding: inherit;
  }

  .popup-base {
    background-color: var(--menu-bg-color);
    border-radius: var(--menu-border-radius);
    border-style: var(--menu-border-style, var(--default-border-style));
    border-color: var(--menu-border-color, var(--default-border-color));
    border-width: var(--menu-border-width, var(--default-border-size));
    box-shadow: var(--menu-shadow);
    max-width: var(--menu-max-width);
    min-width: var(--menu-min-width);
    width: var(--menu-width);
    z-index: var(--menu-z-index);
  }

  .popup {
    opacity: 0;
    transition: var(--menu-transition);
  }

  .popup[active] {
    opacity: 1;
    pointer-events: inherit;
  }

  .popup-base {
    padding: var(--menu-popup-padding);
  }
`;
