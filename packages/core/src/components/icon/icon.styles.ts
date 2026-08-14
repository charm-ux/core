import { css } from 'lit';

export default css`
  :host {
    --icon-rotate: 0deg;
    --icon-scale-x: 1;
    --icon-scale-y: 1;
    display: inline-flex;
    width: 1em;
    height: 1em;
    contain: strict;
    box-sizing: content-box;
    vertical-align: middle;
  }

  svg {
    display: block;
    height: 100%;
    width: 100%;
    fill: currentColor;
    transform: rotate(var(--icon-rotate)) scale(var(--icon-scale-x), var(--icon-scale-y));
  }
`;
