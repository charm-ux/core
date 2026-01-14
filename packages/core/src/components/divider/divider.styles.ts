import { css } from 'lit';

const fallbackStyles = {
  dividerTextGap: css`0.25em`,
  dividerInset: css`12px`,
};

export default css`
  :host {
    --divider-border: inherit;
    --divider-inset: inherit;
    --divider-text-gap: inherit;
    --divider-text-offset: inherit;
    --divider-vertical-min-height: inherit;
    align-items: center;
    color: black;
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
    border-top: var(--divider-border, var(--default-border));
  }

  .text {
    margin: 0 var(--divider-text-gap, ${fallbackStyles.dividerTextGap});
  }

  :host([orientation='vertical']) {
    min-height: var(--divider-vertical-min-height, 84px);
    flex-direction: column;
  }

  :host([orientation='vertical']) .line {
    border-inline-start: var(--divider-border, var(--default-border));
    flex-grow: 1;
    height: 100%;
    width: 0;
  }

  :host([orientation='vertical']) .text {
    margin: var(--divider-text-gap, ${fallbackStyles.dividerTextGap}) 0;
  }

  :host([align-content='start']) .start,
  :host([align-content='end']) .end,
  :host([orientation='vertical'][align-content='end']) .end,
  :host([orientation='vertical'][align-content='start']) .start {
    max-width: var(--divider-text-offset, 0);
    max-height: var(--divider-text-offset, 0);
  }

  :host([inset]) {
    padding-inline: var(--divider-inset, ${fallbackStyles.dividerInset});
  }

  :host([orientation='vertical'][inset]) {
    padding-block: var(--divider-inset, ${fallbackStyles.dividerInset});
  }
`;
