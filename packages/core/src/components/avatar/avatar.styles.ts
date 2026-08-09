import { css } from 'lit';
import { component } from '../../utilities/theme.js';

export default css`
  :host {
    display: inline-block;
    position: relative;
  }

  .base {
    position: relative;
    width: ${component('avatar', 'size')};
    height: ${component('avatar', 'size')};
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
    background-color: ${component('avatar', 'bgColor')};
    border-radius: ${component('avatar', 'borderRadius')};
  }

  .initials {
    text-transform: capitalize;
    white-space: nowrap;
    color: ${component('avatar', 'fgColor')};
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
    background-color: ${component('avatar', 'indicatorBgColor')};
    border: ${component('avatar', 'indicatorBorderWidth')} solid ${component('avatar', 'indicatorBorderColor')};
    border-radius: ${component('avatar', 'indicatorBorderRadius')};
    color: ${component('avatar', 'indicatorFgColor')};
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
    width: ${component('avatar', 'indicatorSize')};
    height: ${component('avatar', 'indicatorSize')};
  }
`;
