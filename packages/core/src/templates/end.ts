import { html } from 'lit/static-html.js';

export const endTemplate = (part = 'end') => {
  return html`<span part=${part} class="end">
    <slot name="end"></slot>
  </span>`;
};
