import { css } from 'lit';
import { project } from '../../utilities/project.js';
const { component } = project.theme;

export default css`
  :host {
    align-items: center;
    color: inherit;
    display: flex;
    flex-direction: row;
    line-height: 1;
    position: relative;
    text-align: center;
    width: 100%;
  }

  .line {
    width: 100%;
    height: 0;
    border-top: ${component('divider', 'border')};
  }

  .text {
    margin: 0 ${component('divider', 'textGap')};
    color: ${component('divider', 'fgColor')};
  }

  :host([orientation='vertical']) {
    min-height: ${component('divider', 'verticalMinHeight')};
    flex-direction: column;
  }

  :host([orientation='vertical']) .line {
    border-inline-start: ${component('divider', 'border')};
    flex-grow: 1;
    height: 100%;
    width: 0;
  }

  :host([orientation='vertical']) .text {
    margin: ${component('divider', 'textGap')} 0;
  }

  :host([align-content='start']) .start,
  :host([align-content='end']) .end,
  :host([orientation='vertical'][align-content='end']) .end,
  :host([orientation='vertical'][align-content='start']) .start {
    max-width: ${component('divider', 'textOffset')};
    max-height: ${component('divider', 'textOffset')};
  }

  :host([inset]) {
    padding-inline: ${component('divider', 'inset')};
  }

  :host([orientation='vertical'][inset]) {
    padding-block: ${component('divider', 'inset')};
  }
`;
