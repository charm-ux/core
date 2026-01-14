import { css } from 'lit';

export default css`
  :host {
    --accordion-top-border-color: inherit;
    display: flex;
    box-sizing: border-box;
    flex-direction: column;
    border-top: 1px solid var(--accordion-top-border-color);
  }
`;
