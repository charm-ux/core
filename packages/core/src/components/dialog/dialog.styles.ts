import { css } from 'lit';
import { component } from '../../utilities/theme.js';

export default css`
  /*
   * Ensure the dialog inherits color-scheme from the document. Without this,
   * Firefox and WebKit don't properly resolve light-dark() CSS values inside
   * the native <dialog> element when the document's color-scheme is changed
   * dynamically.
   */
  :host {
    color-scheme: inherit;
    /*
     * The host is always a block. It is empty while closed, so nothing is visible, but it must
     * generate a layout box while open for dialog's RenderedWatcher, which uses the host's
     * getClientRects() to detect when third-party CSS (e.g. cookie banner blockers) hides the open
     * dialog and the page would otherwise be left inert and scroll locked.
     *
     * It must also stay rendered when [open] is removed on close: the internal <dialog> fades out
     * from that moment, and a display: none host would hide the fade and prevent transitionend
     * from firing, breaking the close animation.
     */
    display: block;
  }

  dialog {
    color-scheme: inherit;
    display: none;
    position: fixed;
    inset: var(--dialog-inset, ${component('dialog', 'inset')});
    width: ${component('dialog', 'size')};
    max-width: ${component('dialog', 'maxWidth')};
    max-height: var(--dialog-max-height, ${component('dialog', 'maxHeight')});
    min-width: min(${component('dialog', 'minWidth')}, 100%);
    background: none;
    border: 0;
    overflow: visible;
    opacity: 0;
    padding: 0;
    transition: ${component('dialog', 'transition')};
  }

  dialog[open] {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :host([open]) dialog {
    opacity: 1;
    transition: ${component('dialog', 'transition')};
  }

  /*
   * Entry transitions. showModal() flips the dialog from display:none to
   * display:flex in the same frame that [open] lands on the host, so neither
   * the dialog nor its backdrop has a before-change value to interpolate from.
   * @starting-style supplies that value for both boxes.
   */
  @starting-style {
    :host([open]) dialog {
      opacity: 0;
    }

    :host([open]) dialog::backdrop {
      opacity: 0;
    }
  }

  .dialog-wrapper {
    display: flex;
    background: ${component('dialog', 'bgColor')};
    color: ${component('dialog', 'fgColor')};
    border: ${component('dialog', 'borderWidth')} solid ${component('dialog', 'borderColor')};
    border-radius: ${component('dialog', 'borderRadius')};
    box-shadow: ${component('dialog', 'shadow')};
    flex-direction: column;
    justify-content: center;
    max-height: var(--dialog-max-height, ${component('dialog', 'maxHeight')});
    overflow: hidden;
    width: 100%;
    max-width: 100%;
    pointer-events: none;
    padding-inline: ${component('dialog', 'paddingX')};
    padding-block: ${component('dialog', 'paddingY')};
  }

  .dialog-body {
    overflow: auto;
    flex: 1 1 auto;
    min-height: 0;
    width: 100%;
  }

  .close-btn {
    border: ${component('dialog', 'closeButton', 'borderWidth')} solid
      ${component('dialog', 'closeButton', 'borderColor')};
    background: ${component('dialog', 'closeButton', 'bgColor')};
    color: ${component('dialog', 'closeButton', 'fgColor')};
    cursor: pointer;
    line-height: 0;
    padding: ${component('dialog', 'closeButton', 'padding')};
    height: ${component('dialog', 'closeButton', 'size')};
    width: ${component('dialog', 'closeButton', 'size')};
    border-radius: ${component('dialog', 'closeButton', 'borderRadius')};
  }

  /* Position the close button properly when there is no header */
  .visually-hidden:focus-within {
    position: relative;
  }

  :host([no-header]) .visually-hidden:focus-within .close-btn {
    position: absolute;
    right: 0px;
    z-index: 1;
  }

  .close-btn:hover {
    border: ${component('dialog', 'closeButton', 'hover', 'borderWidth')} solid
      ${component('dialog', 'closeButton', 'hover', 'borderColor')};
    background: ${component('dialog', 'closeButton', 'hover', 'bgColor')};
    color: ${component('dialog', 'closeButton', 'hover', 'fgColor')};
  }

  .close-btn:active {
    border: ${component('dialog', 'closeButton', 'active', 'borderWidth')} solid
      ${component('dialog', 'closeButton', 'active', 'borderColor')};
    background: ${component('dialog', 'closeButton', 'active', 'bgColor')};
    color: ${component('dialog', 'closeButton', 'active', 'fgColor')};
  }

  .close-btn:focus {
    border: ${component('dialog', 'closeButton', 'focus', 'borderWidth')} solid
      ${component('dialog', 'closeButton', 'focus', 'borderColor')};
    background: ${component('dialog', 'closeButton', 'focus', 'bgColor')};
    color: ${component('dialog', 'closeButton', 'focus', 'fgColor')};
  }

  .close-btn > * {
    pointer-events: none;
    width: calc(1 * 24px);
    height: calc(1 * 24px);
    margin: -1px 0px 0px -1px;
  }

  .header-base {
    align-items: flex-start;
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: center;
    gap: ${component('dialog', 'headerToolbarGap')};
  }

  .dialog-title {
    align-self: start;
    margin: 0;
  }

  .toolbar {
    display: flex;
    align-self: end;
    gap: ${component('dialog', 'toolbarButtonGap')};
  }

  .header-base {
    flex-direction: column;
  }

  .header-base--no-actions {
    flex-direction: row-reverse;
  }

  .header-base--no-actions .toolbar {
    align-self: flex-start;
  }

  :host([open]) .dialog-wrapper {
    pointer-events: inherit;
  }

  dialog::backdrop {
    opacity: 0;
    background: ${component('dialog', 'backdropColor')};
    transition: ${component('dialog', 'transition')};
  }

  :host([open]) dialog::backdrop {
    opacity: 1;
    pointer-events: inherit;
    transition: ${component('dialog', 'transition')};
  }

  .dialog-footer {
    display: flex;
    align-self: flex-end;
    gap: ${component('dialog', 'footerButtonGap')};
  }

  .dialog-body--has-header {
    margin-top: ${component('dialog', 'marginTop')};
  }

  .dialog-footer--has-footer {
    margin-top: ${component('dialog', 'marginTop')};
  }

  /* Styles for drawer */
  :host([position]) {
    /*
     * Declared as a custom property rather than inlined below because
     * CharmDismissibleElement decides whether a transition is running at all by
     * scanning the host's computed style for
     * --{prefix}-{baseName}-(show|hide|position)-transition, and dialog closes
     * itself from transitionend. The unprefixed spelling is one of the forms
     * that scan accepts.
     *
     * The --dialog-transition declaration that used to sit here is gone: nothing
     * read it. Consumers read component('dialog', 'transition'), which resolves
     * to the prefixed --{prefix}-dialog-transition, a different property.
     */
    --dialog-position-transition: ${component('dialog', 'positionTransition')};
  }

  :host([position]) dialog {
    /*
     * Drawers slide rather than fade in place, so they get their own timing.
     * Without this the value above was declared and never used, leaving drawers
     * on the centre dialog's transition.
     */
    transition: var(--dialog-position-transition);

    /*
     * The UA stylesheet gives dialog margin:auto, which is what centres the
     * default dialog inside inset:0. A drawer needs to sit flush against its
     * edge, so the auto margins have to go.
     */
    margin: 0;
  }

  :host([position='start']) dialog {
    transform: translateX(-100%);
  }

  :host([position='end']) dialog {
    transform: translateX(100%);
  }

  :host([position='top']) dialog {
    transform: translateY(-100%);
  }

  :host([position='bottom']) dialog {
    transform: translateY(100%);
  }

  :host([position][open]) dialog {
    transform: translate(0, 0);
  }

  /*
   * Slide-in start points, for the same reason as the opacity block near the top
   * of this file. These repeat the closed-state transforms because the rule
   * above starts winning the moment [open] is added, before the box has ever
   * been rendered. Each selector is more specific than the rule it provides a
   * start for, and comes after it.
   */
  @starting-style {
    :host([position='start'][open]) dialog {
      transform: translateX(-100%);
    }

    :host([position='end'][open]) dialog {
      transform: translateX(100%);
    }

    :host([position='top'][open]) dialog {
      transform: translateY(-100%);
    }

    :host([position='bottom'][open]) dialog {
      transform: translateY(100%);
    }
  }

  :host([position='start']) dialog,
  :host([position='end']) dialog {
    height: 100%;
    --dialog-max-height: 100vh;
  }

  :host([position='top']) dialog,
  :host([position='bottom']) dialog {
    width: 100%;
    height: ${component('dialog', 'size')};
  }

  :host([position='start']) .dialog-wrapper,
  :host([position='end']) .dialog-wrapper {
    height: 100%;
  }

  :host([position='top']) .dialog-wrapper,
  :host([position='bottom']) .dialog-wrapper {
    width: 100%;
  }

  :host([position]:not([position='center'])) .dialog-footer {
    position: sticky;
  }

  :host([position]:not([position='center'])) .dialog-footer--has-footer {
    margin-top: 16px;
  }

  :host([position='start']) {
    --dialog-inset: 0px auto auto 0px;
  }

  :host([position='end']) {
    --dialog-inset: 0px 0px auto auto;
  }

  :host([position='top']) {
    --dialog-inset: 0 0 auto 0;
  }

  :host([position='bottom']) {
    --dialog-inset: auto 0 0 0;
  }
`;
