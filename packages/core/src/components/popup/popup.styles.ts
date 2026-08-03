import { css } from 'lit';
import { component } from '../../utilities/theme.js';

export default css`
  :host {
    /*
     * These properties are computed to account for the arrow's dimensions after being rotated 45º. The constant 0.7071 is derived from sin(45), which is the diagonal size of the arrow's container after rotating.
     */
    --popup-arrow-size-diagonal: calc(${component('popup', 'arrowSize')} * 0.7071);
    --popup-arrow-padding-offset: calc(var(--popup-arrow-size-diagonal) - ${component('popup', 'arrowSize')});

    display: contents;
  }

  .popup {
    opacity: 1;
    /*
     * Moved up from the :host([open] .popup) rule that used to sit further down,
     * which was invalid: :host() only accepts a compound selector for the host
     * itself, so the descendant combinator made the browser discard the whole
     * rule. Ungated on purpose - the popup is at opacity 0 when closed, so the
     * [open] gate bought nothing and would have made the shadow pop off on close
     * rather than fade with everything else.
     */
    filter: ${component('popup', 'dropShadow')};
    position: absolute;
    isolation: isolate;
    max-width: var(--popup-auto-size-available-width, none);
    max-height: var(--popup-auto-size-available-height, none);
    z-index: ${component('popup', 'zIndex')};
    transition: ${component('popup', 'showTransition')};
    padding: 0;
    border: transparent;
    margin: 0;
  }

  :host([strategy='fixed']) .popup {
    position: fixed;
  }

  :host(:not([open])) .popup {
    opacity: 0;
    transition: ${component('popup', 'hideTransition')};
  }

  /*
   * Entry transition. The popup is display:none while closed - the hidden
   * attribute is set imperatively once the exit transition settles - so on open
   * the box is rendered for the first time with [open] already on the host.
   * Opacity computes straight to 1 and there is no before-change value to
   * interpolate from, which is why the popup faded out but snapped in.
   * @starting-style supplies that value. Same selector as the .popup rule above
   * and placed after it, which is what lets it win the starting-style pass.
   *
   * Reopening mid-fade-out is unaffected: the box is still rendered then, so no
   * starting style applies and the transition simply reverses from where it is.
   */
  @starting-style {
    :host([open]) .popup {
      opacity: 0;
    }
  }

  .arrow {
    position: absolute;
    width: calc(var(--popup-arrow-size-diagonal) * 2);
    height: calc(var(--popup-arrow-size-diagonal) * 2);
    transform: rotate(45deg);
    background: ${component('popup', 'arrowColor')};
    z-index: -1;
  }

  .popup-hover-bridge {
    display: none;
  }

  :host([open]) .popup-hover-bridge {
    display: block;
    position: fixed;
    z-index: calc(${component('popup', 'zIndex')} - 1);
    inset: 0;
    clip-path: polygon(
      var(--hover-bridge-top-left-x, 0) var(--hover-bridge-top-left-y, 0),
      var(--hover-bridge-top-right-x, 0) var(--hover-bridge-top-right-y, 0),
      var(--hover-bridge-bottom-right-x, 0) var(--hover-bridge-bottom-right-y, 0),
      var(--hover-bridge-bottom-left-x, 0) var(--hover-bridge-bottom-left-y, 0)
    );
  }
`;
