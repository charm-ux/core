import { css } from 'lit';

const fallbackStyles = {
  size: css`20px`,
};

export default css`
  :host {
    --badge-bg-color: inherit;
    --badge-border-color: inherit;
    --badge-border-radius: inherit;
    --badge-border-style: inherit;
    --badge-border-width: inherit;
    --badge-fg-color: inherit;
    --badge-padding: inherit;
    --badge-size: inherit;
  }

  .base {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    background-color: var(--badge-bg-color);
    border-style: var(--badge-border-style, var(--default-border-style));
    border-color: var(--badge-border-color, var(--default-border-color));
    border-radius: var(--badge-border-radius);
    border-width: var(--badge-border-width, var(--default-border-size));
    color: var(--badge-fg-color);
    font-size: inherit;
    line-height: 1;
    min-height: var(--badge-size, ${fallbackStyles.size});
    min-width: var(--badge-size, ${fallbackStyles.size});
    padding: var(--badge-padding);
    text-align: center;
  }
`;
