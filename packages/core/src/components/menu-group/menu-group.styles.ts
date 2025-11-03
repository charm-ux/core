import { css } from 'lit';

export default css`
  :host {
    --menu-group-heading-padding-x: inherit;
    --menu-group-heading-padding-y: inherit;
    --menu-group-heading-weight: inherit;
    --menu-group-heading-size: inherit;
    --menu-group-heading-line-height: inherit;
    --menu-group-heading-margin: inherit;
  }

  .base {
    align-items: flex-start;
    cursor: default;
    display: flex;
    flex-direction: column;
    padding: var(--menu-group-heading-padding-y) var(--menu-group-heading-padding-x);
  }

  .heading {
    width: 100%;
    text-align: start;
  }

  .heading,
  ::slotted([slot='heading']) {
    font-size: var(--menu-group-heading-size, 1rem);
    font-weight: var(--menu-group-heading-weight, bold);
    padding: var(--menu-group-heading-padding-y) var(--menu-group-heading-padding-x);
    line-height: var(--menu-group-heading-line-height);
    margin: var(--menu-group-heading-margin);
  }

  ::slotted(menu-item) {
    width: 100%;
  }
`;
