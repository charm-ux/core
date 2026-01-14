import { css } from 'lit';

export default css`
  :host {
    --card-bg-color: inherit;
    --card-body-padding-x: inherit;
    --card-body-padding-y: inherit;
    --card-border-color: inherit;
    --card-border-radius: inherit;
    --card-border-size: inherit;
    --card-border-style: inherit;
    --card-box-shadow: inherit;
    --card-content-gap: inherit;
    --card-fg-color: inherit;
    --card-footer-padding-x: inherit;
    --card-footer-padding-y: inherit;
    --card-heading-gap: inherit;
    --card-heading-padding-x: inherit;
    --card-heading-padding-y: inherit;
    --card-heading-size: inherit;
    --card-heading-weight: inherit;
    --card-padding: inherit;
    --card-subheading-size: inherit;
    --card-subheading-weight: inherit;

    display: inline-block;
  }

  .base {
    display: flex;
    flex-direction: column;
    border: var(--card-border-size, var(--default-border-size)) var(--card-border-style, var(--default-border-style))
      var(--card-border-color, var(--default-border-color));
    border-radius: var(--card-border-radius);
    gap: var(--card-content-gap);
    color: var(--card-fg-color);
    background-color: var(--card-bg-color);
    box-shadow: var(--card-box-shadow);
    padding: var(--card-padding);
    height: 100%;
  }

  :host([media-position='start']) .base,
  :host([media-position='end']) .base {
    flex-direction: row;
  }

  :host([media-position='bottom']) .base {
    flex-flow: column-reverse;
  }

  :host([media-position='end']) .base {
    flex-flow: row-reverse;
  }

  .header {
    display: flex;
    flex-direction: column;
    gap: var(--card-heading-gap);
    padding: var(--card-heading-padding-y) var(--card-heading-padding-x);
  }

  .header h3 {
    font-weight: var(--card-heading-weight);
    font-size: var(--card-heading-size);
    margin: 0;
  }

  .header h4 {
    font-weight: var(--card-subheading-weight);
    font-size: var(--card-subheading-size);
    margin: 0;
  }

  .card-content {
    display: grid;
    grid-auto-flow: row;
    padding: var(--card-body-padding-y) var(--card-body-padding-x);
  }

  .footer {
    margin-top: auto;
    padding: var(--card-footer-padding-y) var(--card-footer-padding-x);
  }

  ::slotted([slot='media']) {
    display: block;
  }
`;
