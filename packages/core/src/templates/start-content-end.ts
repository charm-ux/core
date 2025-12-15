import { html } from 'lit/static-html.js';
import { ClassInfo, classMap } from 'lit/directives/class-map.js';
import { startTemplate } from './start.js';
import { endTemplate } from './end.js';

const defaultClassOptions: Record<'content', ClassInfo> = {
  content: { content: true },
};

export const startContentEndTemplate = (classOptions = defaultClassOptions) => {
  return html`${startTemplate()}
    <span part="content" class=${classMap(classOptions.content)}>
      <slot></slot>
    </span>
    ${endTemplate()}`;
};
