import { css } from 'lit';
import { component } from '../../utilities/theme.js';

export default css`
  :host {
    display: inline-block;
  }

  .base {
    display: flex;
    flex-direction: column;
    border: ${component('card', 'borderWidth')} ${component('card', 'borderStyle')} ${component('card', 'borderColor')};
    border-radius: ${component('card', 'borderRadius')};
    gap: ${component('card', 'contentGap')};
    color: ${component('card', 'fgColor')};
    background-color: ${component('card', 'bgColor')};
    box-shadow: ${component('card', 'shadow')};
    padding: ${component('card', 'padding')};
    height: 100%;
  }

  .content {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
  }

  :host([media-position='start']) .base,
  :host([media-position='end']) .base {
    flex-direction: row;
  }

  :host([media-position='bottom']) [part='card-media'],
  :host([media-position='end']) [part='card-media'] {
    order: 1;
  }

  :host([media-position='start']) [part='card-media'] {
    order: -1;
  }

  .header {
    display: flex;
    flex-direction: column;
    gap: ${component('card', 'headingGap')};
    padding: ${component('card', 'headingPaddingY')} ${component('card', 'headingPaddingX')};
  }

  .header h3 {
    font-weight: ${component('card', 'headingWeight')};
    font-size: ${component('card', 'headingSize')};
    margin: 0;
  }

  .header h4 {
    font-weight: ${component('card', 'subheadingWeight')};
    font-size: ${component('card', 'subheadingSize')};
    margin: 0;
  }

  .card-content {
    display: grid;
    grid-auto-flow: row;
    padding: ${component('card', 'bodyPaddingY')} ${component('card', 'bodyPaddingX')};
  }

  .footer {
    margin-top: auto;
    padding: ${component('card', 'footerPaddingY')} ${component('card', 'footerPaddingX')};
  }

  ::slotted([slot='media']) {
    display: block;
  }
`;
