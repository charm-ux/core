import { css } from 'lit';
import { component } from '../../utilities/theme.js';

export default css`
  :host {
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
  }

  .base[open]::details-content {
    block-size: auto;
  }

  .summary {
    display: flex;
    gap: ${component('accordionItem', 'summaryGap')};
    list-style: none;
    align-items: center;
    padding: ${component('accordionItem', 'summaryPaddingY')} ${component('accordionItem', 'summaryPaddingX')};
    margin-inline-start: 0;
    border: ${component('accordionItem', 'borderWidth')} solid ${component('accordionItem', 'borderColor')};
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
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

  .summary:hover {
    background: ${component('accordionItem', 'hover', 'bgColor')};
    border-color: ${component('accordionItem', 'hover', 'borderColor')};
    color: ${component('accordionItem', 'hover', 'fgColor')};
  }

  /*
   * Longhands rather than the transition shorthand. transition-behavior is one
   * of that shorthand's longhands, so declaring transition here - or in any
   * subclass stylesheet that appends after this one - resets allow-discrete to
   * normal. content-visibility is discrete, so without allow-discrete it flips
   * to hidden the instant the item closes and the block-size collapse animates
   * an already-invisible box, making the close look instant.
   */
  .base::details-content {
    transition-property: block-size, content-visibility;
    transition-duration: ${component('accordionItem', 'animation', 'duration')};
    transition-timing-function: ${component('accordionItem', 'animation', 'timingFunction')};
    transition-behavior: allow-discrete;
  }

  /*
   * Expose the animation through the convention custom-properties that
   * CharmDismissibleElement measures ({baseName}-show/hide-transition) so its
   * after-show / after-hide events settle once the block-size animation has
   * actually finished. block-size drives the timing; content-visibility is a
   * discrete flip.
   */
  :host {
    --accordion-item-show-transition: block-size ${component('accordionItem', 'animation', 'duration')}
      ${component('accordionItem', 'animation', 'timingFunction')};
    --accordion-item-hide-transition: block-size ${component('accordionItem', 'animation', 'duration')}
      ${component('accordionItem', 'animation', 'timingFunction')};
  }

  /*
   * The shared reduced-motion block in charm-element.styles only matches
   * elements, not ::details-content, so the collapse is disabled here. 'none'
   * tells CharmDismissibleElement there is no transition, so after-show and
   * after-hide fire immediately.
   */
  @media (prefers-reduced-motion: reduce) {
    .base::details-content {
      transition: none;
    }

    :host {
      --accordion-item-show-transition: none;
      --accordion-item-hide-transition: none;
    }
  }

  :host([disabled]) .base,
  :host([disabled]) .summary {
    background-color: ${component('accordionItem', 'disabled', 'bgColor')};
    border-color: ${component('accordionItem', 'disabled', 'borderColor')};
    color: ${component('accordionItem', 'disabled', 'fgColor')};
  }

  :host([disabled]) .summary {
    cursor: not-allowed;
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
    font-size: ${component('accordionItem', 'icon', 'size')};
    transform: ${component('accordionItem', 'icon', 'collapsedTransform')};
    transition: ${component('accordionItem', 'icon', 'transition')};
  }

  :host([open]) .chevron {
    transform: ${component('accordionItem', 'icon', 'expandedTransform')};
  }

  :host([expand-icon-position='end']) .icon {
    order: 1;
    margin-inline-start: auto;
  }
`;
