import { css } from 'lit';

export default css`
  :host {
    --button-border-radius: inherit;
    --button-border-size: inherit;
    --button-border-style: inherit;
    --button-content-alignment: inherit;
    --button-content-gap: inherit;
    --button-font-weight: inherit;
    --button-icon-padding-x: inherit;
    --button-icon-padding-y: inherit;
    --button-padding-x: inherit;
    --button-padding-y: inherit;
    --button-icon-size: inherit;

    /** Rest */
    --button-bg-color: inherit;
    --button-border-color: inherit;
    --button-fg-color: inherit;
    --button-shadow: inherit;

    /* Toggle Button  */
    --button-pressed-bg-color: inherit;
    --button-pressed-border: inherit;
    --button-pressed-fg-color: inherit;

    /** Disabled */
    --button-disabled-bg-color: inherit;
    --button-disabled-border-color: inherit;
    --button-disabled-fg-color: inherit;
    --button-disabled-shadow: inherit;

    /** Hover */
    --button-hover-bg-color: inherit;
    --button-hover-border-color: inherit;
    --button-hover-fg-color: inherit;
    --button-hover-shadow: inherit;

    /** Focus */
    --button-focus-bg-color: inherit;
    --button-focus-border-color: inherit;
    --button-focus-fg-color: inherit;
    --button-focus-shadow: inherit;

    /** Active */
    --button-active-bg-color: inherit;
    --button-active-border-color: inherit;
    --button-active-fg-color: inherit;
    --button-active-shadow: inherit;

    /** Button group */
    --button-group-divider-color: inherit;
    --button-group-divider-height: inherit;
    --button-group-divider-width: inherit;
    --button-group-gap: inherit;

    cursor: pointer;
    display: inline-block;
    font-size: inherit;
    vertical-align: top;
  }

  :host([disabled]) {
    cursor: not-allowed;
  }

  .control {
    line-height: 1;
    align-items: var(--button-content-alignment, center);
    width: 100%;
    background-color: var(--button-bg-color, revert);
    border-radius: var(--button-border-radius);
    border: var(--button-border-size, var(--default-border-size))
      var(--button-border-style, var(--default-border-style)) var(--button-border-color, var(--default-border-color));
    color: var(--button-fg-color);
    cursor: pointer;
    display: flex;
    fill: currentColor;
    font-weight: var(--button-font-weight, normal);
    justify-content: space-between;
    padding: var(--button-padding-y, 4px) var(--button-padding-x, 12px);
    text-align: center;
  }

  .control:focus {
    background-color: var(--button-focus-bg-color, revert);
    border-color: var(--button-focus-border-color);
    color: var(--button-focus-fg-color);
    box-shadow: var(--button-focus-shadow);
    position: relative;
    z-index: 1;
  }

  :host([split]) .control {
    border: none; /* button group border is applied */
  }

  :host([split]) .control:focus {
    box-shadow: none; /* boxshadow creates a dark line between the buttons when focused */
  }

  /* Toggle button */
  .control[aria-pressed='true'] {
    background-color: var(--button-pressed-bg-color, var(--button-bg-color));
    border: var(--button-pressed-border, var(--default-border));
    color: var(--button-pressed-fg-color, var(--button-fg-color));
  }

  .control:hover {
    background-color: var(--button-hover-bg-color, revert);
    border-color: var(--button-hover-border-color, var(--default-border-color));
    color: var(--button-hover-fg-color);
    box-shadow: var(--button-hover-shadow);
  }

  :host(:not([disabled])) .control:active {
    background-color: var(--button-active-bg-color, revert);
    border-color: var(--button-active-border-color, var(--default-border-color));
    color: var(--button-active-fg-color);
    box-shadow: var(--button-active-shadow);
  }

  :host([icon-only]) .control {
    --button-padding-x: var(--button-icon-padding-x, 4px);
    --button-padding-y: var(--button-icon-padding-y, 4px);
  }

  :host([disabled]) .control {
    background-color: var(--button-disabled-bg-color, revert);
    border-color: var(--button-disabled-border-color, var(--default-border-color));
    color: var(--button-disabled-fg-color);
    box-shadow: var(--button-disabled-shadow);
    cursor: not-allowed;
  }

  .content {
    display: contents;
  }

  ::slotted(*) {
    pointer-events: none;
    vertical-align: middle;
  }

  slot[name='start']::slotted(*) {
    margin-inline-end: var(--button-content-gap, 4px);
  }

  slot[name='end']::slotted(*) {
    margin-inline-start: var(--button-content-gap, 4px);
  }

  .content {
    grid-column: content;
  }

  .start {
    grid-column: start;
  }

  .end {
    grid-column: end;
  }

  /* Button styles for Horizontal Split Button Group */
  :host([split][button-group-button-position='first']:not([vertical])) .control {
    border-start-end-radius: 0;
    border-end-end-radius: 0;
  }

  :host([split][button-group-button-position='last']:not([vertical])) .control {
    border-start-start-radius: 0;
    border-end-start-radius: 0;
  }
  :host([split][button-group-button-position='inner']:not([vertical])) .control {
    border-radius: 0;
  }

  /* Button styles for Vertical Split Button Group */
  :host([split][vertical][button-group-button-position='first']) .control {
    border-end-start-radius: 0;
    border-end-end-radius: 0;
  }

  :host([split][vertical][button-group-button-position='last']) .control {
    border-start-end-radius: 0;
    border-start-start-radius: 0;
  }
  :host([split][vertical][button-group-button-position='inner']) .control {
    border-radius: 0;
  }

  ::slotted([icon]),
  ::slotted(svg) {
    display: flex;
    width: var(--button-icon-size, 1em);
    height: var(--button-icon-size, 1em);
  }
`;
