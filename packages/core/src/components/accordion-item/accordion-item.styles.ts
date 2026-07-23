import { css } from 'lit';
import { tokens } from '../../utilities/theme.js';

const { component } = tokens.lit;

export default css`
  :host {
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    interpolate-size: allow-keywords;
  }

  .base {
    display: inline-block;
    position: relative;
    overflow: hidden;
    width: 100%;
    background-color: ${component('accordionItem', 'bgColor')};
    color: ${component('accordionItem', 'fgColor')};
  }

  .base::details-content {
    block-size: 0;
    transition-behavior: allow-discrete;
  }

  .base[open]::details-content {
    block-size: auto;
  }

  .summary {
    display: flex;
    gap: 0.5rem;
    list-style: none;
    align-items: center;
    padding-inline: 0.75rem 1rem;
    padding-block: 0.5rem;
    margin-inline-start: 0;
    border: ${component('accordionItem', 'borderWidth')} solid ${component('accordionItem', 'borderColor')};
  }

  .summary > h1,
  .summary > h2,
  .summary > h3,
  .summary > h4,
  .summary > h5,
  .summary > h6 {
    margin: 0;
  }

  .summary::-webkit-details-marker {
    display: none;
  }

  .summary:hover,
  .summary:focus,
  .summary:focus-within,
  .summary:focus-visible {
    background: ${component('accordionItem', 'hover', 'bgColor')};
    border-color: ${component('accordionItem', 'hover', 'borderColor')};
    color: ${component('accordionItem', 'hover', 'fgColor')};
    outline: none;
  }

  :host([animated]) .base::details-content {
    transition:
      block-size ${component('accordionItem', 'animation', 'duration')}
        ${component('accordionItem', 'animation', 'timingFunction')},
      content-visibility ${component('accordionItem', 'animation', 'duration')}
        ${component('accordionItem', 'animation', 'timingFunction')};
  }

  :host([disabled]) {
    cursor: not-allowed;
    background-color: ${component('accordionItem', 'disabled', 'bgColor')};
    border-color: ${component('accordionItem', 'disabled', 'borderColor')};
    color: ${component('accordionItem', 'disabled', 'fgColor')};
  }

  :host([disabled]) .summary {
    pointer-events: none;
  }

  .icon,
  .start,
  .end {
    display: flex;
    align-items: center;
    fill: currentColor;
  }

  .start,
  .end {
    justify-content: center;
  }

  .icon {
    justify-content: flex-start;
  }

  :host .chevron {
    font-size: 20px;
    transform: ${component('accordionItem', 'icon', 'collapsedTransform')};
    transition: ${component('accordionItem', 'icon', 'transition')};
  }

  :host([open]) .chevron {
    transform: ${component('accordionItem', 'icon', 'expandedTransform')};
  }

  :host .chevron-rtl {
    transform: -(${component('accordionItem', 'icon', 'expandedTransform')});
  }

  :host([expand-icon-position='end']) .icon {
    order: 1;
    margin-inline-start: auto;
  }
`;
