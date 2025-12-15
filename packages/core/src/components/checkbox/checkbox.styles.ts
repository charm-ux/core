import { css } from 'lit';

const fallbackStyles = {
  border: css`1px solid #000`,
  background: css`#fff`,
  height: css`1em`,
  color: css`#000`,
  borderRadius: css`2px`,
};

export default css`
  :host {
    /** Rest */
    --checkbox-bg-color-checked: inherit;
    --checkbox-bg-color-unchecked: inherit;
    --checkbox-border-color-checked: inherit;
    --checkbox-border-radius: inherit;
    --checkbox-fg-color-checked: inherit;
    --checkbox-fg-color: inherit;
    --checkbox-icon-size: inherit;
    --checkbox-size: inherit;

    /** Active */
    --checkbox-active-bg-color-checked: inherit;
    --checkbox-active-bg-color-unchecked: inherit;
    --checkbox-active-border-color-unchecked: inherit;
    --checkbox-active-border-color-checked: inherit;
    --checkbox-active-fg-color: inherit;

    /** Hover */
    --checkbox-hover-bg-color-checked: inherit;
    --checkbox-hover-bg-color-unchecked: inherit;
    --checkbox-hover-border-color-unchecked: inherit;
    --checkbox-hover-border-color-checked: inherit;
    --checkbox-hover-fg-color: inherit;

    /** Disabled */
    --checkbox-disabled-bg-color-checked: inherit;
    --checkbox-disabled-bg-color-unchecked: inherit;
    --checkbox-disabled-border-color: inherit;
    --checkbox-disabled-fg-color: inherit;
  }

  .checkbox {
    margin: 0;
  }

  .control {
    flex: 0 0 auto;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--checkbox-size, 16px);
    height: var(--checkbox-size, 16px);
    border: var(--form-control-border, ${fallbackStyles.border});
    border-radius: var(--checkbox-border-radius, ${fallbackStyles.borderRadius});
    background-color: var(--checkbox-bg-color-unchecked, ${fallbackStyles.background});
    color: white;
  }

  .control-label-wrapper {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    position: relative;
    gap: var(--form-control-label-gap);
  }

  .icon {
    width: var(--checkbox-icon-size, 12px);
    height: var(--checkbox-icon-size, 12px);
    visibility: hidden;
  }

  :host([checked]) .icon,
  :host([indeterminate]) .icon {
    visibility: visible;
  }

  .input {
    position: absolute;
    inset: 0;
    opacity: 0;
    padding: 0;
    margin: 0;
    pointer-events: none;
  }

  .label {
    line-height: var(--checkbox-size, 16px);
  }

  :host(:not([checked])) .label {
    background-color: var(--checkbox-bg-color-unchecked);
    color: var(--checkbox-fg-color);
  }

  :host(:not([checked])) .control-label-wrapper:hover .label {
    color: var(--checkbox-hover-fg-color);
  }

  :host(:not([checked])) .control-label-wrapper:active .label {
    color: var(--checkbox-active-fg-color);
  }

  :host([checked]) .control-label-wrapper:active .label {
    color: var(--checkbox-active-fg-color);
  }

  :host(:not([checked])) .control-label-wrapper:hover .control {
    border-color: var(--checkbox-hover-border-color-unchecked, ${fallbackStyles.color});
  }

  :host([checked]) .control-label-wrapper:hover .control {
    background-color: var(--checkbox-hover-bg-color-checked, ${fallbackStyles.color});
    border-color: var(--checkbox-hover-border-color-checked, ${fallbackStyles.color});
  }

  :host(:not([checked])) .control-label-wrapper:active .control {
    border-color: var(--checkbox-active-border-color-unchecked, ${fallbackStyles.color});
  }

  :host([checked]) .control-label-wrapper:active .control {
    background-color: var(--checkbox-active-bg-color-checked, ${fallbackStyles.color});
    border-color: var(--checkbox-active-border-color-checked, ${fallbackStyles.color});
  }
  :host([disabled]) .control-label-wrapper .control {
    background-color: var(--checkbox-disabled-bg-color-unchecked);
    border-color: var(--checkbox-disabled-border-color);
    color: var(--checkbox-disabled-fg-color);
  }

  :host([disabled]) .control-label-wrapper .label {
    color: var(--checkbox-disabled-fg-color);
  }

  :host([label-position='before']) .control-label-wrapper {
    flex-direction: row-reverse;
  }

  :host([checked]) .input:checked {
    background-color: var(--checkbox-bg-color, ${fallbackStyles.color});
  }

  :host([indeterminate]) .control {
    color: var(--checkbox-bg-color-checked, ${fallbackStyles.color});
    border-color: var(--checkbox-border-color-checked, ${fallbackStyles.color});
  }

  :host([indeterminate]) .control-label-wrapper:hover .control {
    color: var(--checkbox-hover-bg-color-checked, ${fallbackStyles.color});
    border-color: var(--checkbox-hover-border-color-checked, ${fallbackStyles.color});
  }

  :host([checked]) .control {
    background-color: var(--checkbox-bg-color-checked, ${fallbackStyles.color});
    border-color: var(--checkbox-border-color-checked, ${fallbackStyles.color});
  }

  :host([disabled]) .checkbox {
    cursor: not-allowed;
    pointer-events: none;
  }

  :host([checked]) .control,
  :host([indeterminate]) .control {
    border-color: var(--checkbox-border-color-checked, ${fallbackStyles.color});
  }

  :host([indeterminate]) .label,
  :host([checked]) .label {
    color: var(--checkbox-fg-color-checked, ${fallbackStyles.color});
  }

  :host([checked][disabled]) .control-label-wrapper:hover .control {
    background-color: var(--checkbox-disabled-bg-color-checked);
  }

  /* Focus */
  :host(:not([disabled])) .input:focus-visible ~ .control-label-wrapper {
    outline: var(--focus-outline);
    outline-offset: var(--focus-outline-offset);
  }
`;
