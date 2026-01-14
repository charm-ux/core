import { css } from 'lit';

const fallbackStyles = {
  tabsGap: css`8px`,
  tabsAlign: css`start`,
};

export default css`
  :host {
    --tabs-gap: inherit;
    --tabs-align: inherit;
    --tab-border-radius: inherit;
    --tabs-border-width: inherit;
    --tabs-border-color: inherit;
    --tabs-border-style: inherit;
    --tabs-border-radius: inherit;
    --tabs-padding-x: inherit;
    --tabs-padding-y: inherit;
    --tabs-bg-color: inherit;
    --tabs-vertical-min-width: inherit;

    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    background-color: var(--tabs-bg-color);
    padding: var(--tabs-padding-y, 0) var(--tabs-padding-x, 0);
    border: var(--tabs-border-width, 0) var(--tabs-border-style, solid) var(--tabs-border-color, transparent);
    border-radius: var(--tabs-border-radius);
  }

  ::slotted([role='tab']) {
    grid-row: 1;
  }

  .tablist {
    display: grid;
    grid-template-rows: auto auto;
    grid-template-columns: auto;
    width: max-content;
    position: relative;
    column-gap: var(--tabs-gap, ${fallbackStyles.tabsGap});
    row-gap: revert;
    justify-self: var(--tabs-align, ${fallbackStyles.tabsAlign});
    overflow-x: auto;
  }

  .tabpanel {
    grid-row: 2;
    grid-column: 1 / 3;
    position: relative;
  }

  :host([layout='vertical']) {
    grid-template-columns: auto 1fr;
    justify-content: start;
  }

  :host([layout='vertical']) .tablist {
    column-gap: revert;
    grid-column: 1;
    grid-row: 1;
    position: relative;
    row-gap: var(--tabs-gap, ${fallbackStyles.tabsGap});
    width: 100%;
    width: max-content;
    min-width: var(--tabs-vertical-min-width);
  }

  :host([layout='vertical']) .tabpanel {
    grid-column: 2;
    grid-row: 1;
  }

  :host([layout='vertical']) ::slotted([role='tab']) {
    justify-content: start;
    grid-column: 2;
    grid-row: revert;
  }
`;
