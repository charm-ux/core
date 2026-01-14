import { css } from 'lit';

export default css`
  :host {
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
  }
`;
