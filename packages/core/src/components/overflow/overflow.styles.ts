import { css } from 'lit';
import { component } from '../../theme/tokens.js';

export default css`
  :host,
  .collapsing-container {
    display: ${component('overflow', 'collapsingContainerDisplay')};
    width: 100%;
  }

  .collapsing-content {
    display: inline-flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: ${component('overflow', 'itemGap')};
    width: max-content;
  }
`;
