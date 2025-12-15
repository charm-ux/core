import { css } from 'lit';

const fallbackStyles = {
  tabPanelPaddingX: css`10px`,
  tabPanelPaddingY: css`12px`,
};

export default css`
  :host {
    --tab-panel-padding-x: inherit;
    --tab-panel-padding-y: inherit;
    --tab-panel-transition: inherit;
    --tab-panel-border-color: inherit;
    --tab-panel-border-width: inherit;
    --tab-panel-border-style: inherit;
    --tab-panel-border-radius: inherit;
    --tab-panel-min-height: inherit;
    --tab-panel-box-shadow: inherit;
    --tab-panel-bg-color: inherit;
    --tab-panel-fg-color: inherit;

    display: block;
    transition: var(--tab-panel-transition, opacity 0.2s ease);
    opacity: 0;
    min-height: var(--tab-panel-min-height);
    box-shadow: var(--tab-panel-box-shadow);
    position: absolute;
    top: 0;
  }

  :host([visible]) {
    opacity: 1;
    position: relative;
  }

  .tab-panel-base {
    background: var(--tab-panel-bg-color, inherit);
    color: var(--tab-panel-fg-color, inherit);
    padding-inline: var(--tab-panel-padding-x, ${fallbackStyles.tabPanelPaddingX});
    padding-block: var(--tab-panel-padding-y, ${fallbackStyles.tabPanelPaddingY});
    border: var(--tab-panel-border-width, 0) var(--tab-panel-border-style, solid)
      var(--tab-panel-border-color, transparent);
    border-radius: var(--tab-panel-border-radius);
  }
`;
