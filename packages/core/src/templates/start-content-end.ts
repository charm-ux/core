import { html } from 'lit/static-html.js';
import { ClassInfo, classMap } from 'lit/directives/class-map.js';
import { startTemplate } from './start.js';
import { endTemplate } from './end.js';

export interface StartContentEndTemplateOptions {
  /** Extra classes to apply to the content wrapper. */
  classOptions?: ClassInfo;
  /** Handler for the default content slot's `slotchange` event. */
  contentSlotChange?: (event: Event) => void;
}

export const startContentEndTemplate = (options: StartContentEndTemplateOptions = {}) => {
  return html`${startTemplate()}
    <span part="content" class=${classMap({ content: true, ...options.classOptions })}>
      <slot @slotchange=${options.contentSlotChange}></slot>
    </span>
    ${endTemplate()}`;
};
