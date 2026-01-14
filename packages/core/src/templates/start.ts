import { html } from 'lit/static-html.js';

export const startTemplate = (part = 'start') => {
  return html`<span part=${part} class="start">
    <slot name="start"></slot>
  </span>`;
};
