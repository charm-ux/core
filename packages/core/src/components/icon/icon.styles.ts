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

  :host(:not([render='svg'])[name]) {
    background-color: currentColor;
    mask: var(--_icon-src) center / contain no-repeat;
    -webkit-mask: var(--_icon-src) center / contain no-repeat;
    transform: rotate(var(--icon-rotate, 0deg)) scale(var(--icon-scale-x, 1), var(--icon-scale-y, 1));
  }

  :host(:not([render='svg'])[name][flip='x']),
  :host(:not([render='svg'])[name][flip='both']) {
    --icon-scale-x: -1;
  }

  :host(:not([render='svg'])[name][flip='y']),
  :host(:not([render='svg'])[name][flip='both']) {
    --icon-scale-y: -1;
  }

  @media (forced-colors: active) {
    :host(:not([render='svg'])[name]) {
      background-color: CanvasText;
    }
  }

  svg {
    display: block;
    height: 100%;
    width: 100%;
    fill: currentColor;
    transform: rotate(var(--icon-rotate, 0deg)) scale(var(--icon-scale-x, 1), var(--icon-scale-y, 1));
  }

  :host([flip='x']) svg,
  :host([flip='both']) svg {
    --icon-scale-x: -1;
  }

  :host([flip='y']) svg,
  :host([flip='both']) svg {
    --icon-scale-y: -1;
  }
`;
