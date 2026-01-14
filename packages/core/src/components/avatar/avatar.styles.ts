import { css } from 'lit';

const fallbackStyles = {
  size: css`32px`,
  backgroundColor: css`#E6E6E6`,
  borderRadius: css`100%`,
};

export default css`
  :host {
    --avatar-bg-color: inherit;
    --avatar-size: inherit;
    --avatar-border-radius: inherit;
    --avatar-indicator-bg-color: inherit;
    --avatar-indicator-border-width: inherit;
    --avatar-indicator-border-color: inherit;
    --avatar-indicator-border-radius: inherit;
    --avatar-indicator-color: inherit;
    --avatar-indicator-padding: inherit;
    --avatar-indicator-size: calc(var(--avatar-size, 32px) * 10 / 32);
    display: inline-block;
    position: relative;
  }

  .base {
    position: relative;
    width: var(--avatar-size, ${fallbackStyles.size});
    height: var(--avatar-size, ${fallbackStyles.size});
  }

  .background {
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 1px solid transparent;
    outline: none;
    position: relative;
    width: 100%;
    height: 100%;
    background-color: var(--avatar-bg-color, ${fallbackStyles.backgroundColor});
    border-radius: var(--avatar-border-radius, ${fallbackStyles.borderRadius});
  }

  .initials {
    text-transform: capitalize;
    white-space: nowrap;
  }

  .image {
    display: block;
    object-fit: fill;
    position: absolute;
    width: 100%;
    height: 100%;
  }

  .status-container {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    inset-block-end: 0;
    inset-inline-end: 0;
    background-color: var(--avatar-indicator-bg-color);
    border: var(--avatar-indicator-border-width) solid var(--avatar-indicator-border-color);
    border-radius: var(--avatar-indicator-border-radius);
    color: var(--avatar-indicator-color);
  }

  ::slotted([slot='image']) {
    display: block;
    object-fit: cover;
    width: 100%;
    height: 100%;
  }

  ::slotted([slot='status-indicator']) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--avatar-indicator-size);
    height: var(--avatar-indicator-size);
  }
`;
