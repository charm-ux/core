import { css, unsafeCSS } from 'lit';
import { component, tokens } from '../../utilities/theme.js';

/*
 * Property names rather than var() references. menu declares popup's transition
 * variables so the popup it composes inherits them, and a name is what goes on
 * the left of the colon - component() returns var(--...), which cannot. Read at
 * module evaluation time, the same moment the css template below bakes its own
 * interpolations, so both carry whatever prefix setThemePrefix() established.
 */
const popupShowTransition = unsafeCSS(tokens.prop.component('popup', 'showTransition'));
const popupHideTransition = unsafeCSS(tokens.prop.component('popup', 'hideTransition'));

export default css`
  .popup-base {
    background-color: ${component('menu', 'bgColor')};
    border-radius: ${component('menu', 'borderRadius')};
    border-style: ${component('menu', 'borderStyle')};
    border-color: ${component('menu', 'borderColor')};
    border-width: ${component('menu', 'borderWidth')};
    box-shadow: ${component('menu', 'shadow')};
    max-width: ${component('menu', 'maxWidth')};
    min-width: ${component('menu', 'minWidth')};
    width: ${component('menu', 'width')};
    z-index: ${component('menu', 'zIndex')};
  }

  /*
   * No opacity rules here on purpose. There used to be two, and neither did
   * anything: .popup is the popup element, which is display:contents and so
   * generates no box for opacity to apply to, and [active] is not an attribute
   * popup sets. popup owns the fade; menu hands it the timing and supplies the
   * panel's chrome. Custom properties inherit, so declaring them on the popup
   * element reaches the dialog inside its shadow root.
   *
   * This is also what keeps --{prefix}-menu-transition meaningful. It is a
   * documented cssprop, and after the two dead rules went it had no consumer
   * left. Both directions get the same value, which is what a single
   * transition token means.
   */
  .popup {
    ${popupShowTransition}: ${component('menu', 'transition')};
    ${popupHideTransition}: ${component('menu', 'transition')};
  }

  .popup-base {
    padding: ${component('menu', 'popupPadding')};
  }
`;
