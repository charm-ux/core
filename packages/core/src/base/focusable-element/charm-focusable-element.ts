import { property, state } from 'lit/decorators.js';
import { LitElement } from 'lit';
import CharmElement from '../charm-element/charm-element.js';

/**
 * Base class for focusable components where the true focused element is inside the shadow root. This class delegates
 * focus to the first focusable element in the shadowroot and adds the `focusable` attribute to the component when the
 * component gains or loses focus. It also provides a `hasFocus` property that can be used to style the component when
 * it has focus.
 */
export class CharmFocusableElement extends CharmElement {
  public static override styles = [...super.styles];
  public static override shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  /**
   * Auto focuses the component on page load.
   */
  @property({ type: Boolean, reflect: true })
  public override autofocus = false;

  @state()
  protected hasFocus = false;

  @state()
  protected hadFocus = false;

  protected focusableEventOptions: CustomEventInit = {};
  protected useBlurHandler = true;
  protected useFocusHandler = true;

  public override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('focusable', '');

    if (this.useBlurHandler) this.addEventListener('blur', this.handleBlur);
    if (this.useFocusHandler) this.addEventListener('focus', this.handleFocus);
  }

  protected handleBlur() {
    this.hadFocus = true;
    if (this.hasFocus) {
      this.hasFocus = false;
    }
  }

  protected handleFocus() {
    if (!this.hasFocus) {
      this.hasFocus = true;
    }
  }
}

export default CharmFocusableElement;
