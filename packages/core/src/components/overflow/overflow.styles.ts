import { css } from 'lit';

export default css`
  :host {
    --overflow-item-gap: inherit;
    --overflow-collapsing-container-display: inherit;
  }

  :host,
  .collapsing-container {
    display: var(--overflow-collapsing-container-display, inline-block);
    width: 100%;
  }

  .collapsing-content {
    display: inline-flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: var(--overflow-item-gap);
    width: max-content;
  }
`;
