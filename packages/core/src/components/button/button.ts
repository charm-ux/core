import { ifDefined } from 'lit/directives/if-defined.js';
import { classMap } from 'lit/directives/class-map.js';
import { html, literal } from 'lit/static-html.js';
import { property } from 'lit/decorators.js';
import CharmFocusableElement from '../../base/focusable-element/charm-focusable-element.js';
import { HasSlotController } from '../../controller/index.js';
import { startContentEndTemplate } from '../../templates/index.js';
import { type CharmDismissibleElement } from '../../base/index.js';
import styles from './button.styles.js';

/**
 * Buttons are used to commit a change or complete steps in a task. They are typically found inside forms, dialogs, panels or pages.
 *
 * @tag ch-button
 * @since 1.0.0
 * @status beta
 *
 * @event change - Custom event that indicates the current toggling state through e.target.pressed.
 * @event focus - Custom event that indicates when focus is gained.
 * @event blur - Custom event that indicates when focus is lost.
 *
 * @slot - The button's content.
 * @slot start - A presentational prefix icon or similar element.
 * @slot end - A presentational suffix icon or similar element.
 *
 * @csspart button-control - The component's base wrapper.
 * @csspart start - The container that wraps the prefix.
 * @csspart content - The button's label.
 * @csspart end - The container that wraps the suffix.
 *
 * @cssproperty --button-active-bg-color - Sets the background color of the button when active.
 * @cssproperty --button-active-border-color - Sets the border color of the button when active.
 * @cssproperty --button-active-fg-color - Sets button's text color when active.
 * @cssproperty --button-active-shadow - Sets button's box-shadow when active.
 * @cssproperty --button-bg-color - Sets the background color of the button.
 * @cssproperty --button-border-color - Sets the border color of the button.
 * @cssproperty --button-border-radius - Sets button's border-radius.
 * @cssproperty --button-border-size - Sets the border width of the button.
 * @cssproperty --button-border-style - Sets the border style of the button.
 * @cssproperty --button-content-gap - Determines the spacing between the slots.
 * @cssproperty --button-disabled-bg-color - Sets the background color of the button when disabled.
 * @cssproperty --button-disabled-border-color - Sets the border color of the button when disabled.
 * @cssproperty --button-disabled-fg-color - Sets button's text color when disabled.
 * @cssproperty --button-disabled-shadow - Sets button's box-shadow when disabled.
 * @cssproperty --button-fg-color - Sets button's text color.
 * @cssproperty --button-focus-bg-color - Sets the background color of the button when focused.
 * @cssproperty --button-focus-border-color - Sets the border color of the button when focused.
 * @cssproperty --button-focus-fg-color - Sets button's text color when focused.
 * @cssproperty --button-focus-shadow - Sets button's box-shadow when focused.
 * @cssproperty --button-hover-bg-color - Sets the background color of the button when hovered.
 * @cssproperty --button-hover-border-color - Sets the border color of the button when hovered.
 * @cssproperty --button-hover-fg-color - Sets button's text color when hovered.
 * @cssproperty --button-hover-shadow - Sets button's box-shadow when hovered.
 * @cssproperty --button-icon-size - Sets the height and width of the slotted icon and svg.
 * @cssproperty --button-padding-x - Determines left and right padding.
 * @cssproperty --button-padding-y - Determines top and bottom padding.
 * @cssproperty --button-shadow - Sets button's box-shadow.
 * @cssproperty --button-pressed-bg-color - Sets the background color of the button when toggled.
 * @cssproperty --button-pressed-border - Sets the border of the button when toggled.
 * @cssproperty --button-pressed-fg-color - Sets button's text color when toggled.
 **/
export class CoreButton extends CharmFocusableElement {
  public static override styles = [...super.styles, styles];
  public static override baseName = 'button';
  protected static formAssociated = true;

  /**
   * Sets "aria-current" on the internal button or link.
   */
  @property({ reflect: true })
  public current?: 'page' | 'step' | 'location' | 'date' | 'time' | 'true' | 'false' | null;

  /**
   * Sets "aria-expanded" on the internal button or link.
   */
  @property({ type: Boolean, reflect: true })
  public expanded?: boolean;

  /**
   * Sets "aria-pressed" on the internal button or link.
   */
  @property({ type: Boolean, reflect: true })
  public pressed?: boolean;

  /**
   * Disables the component on page load.
   */
  @property({ type: Boolean, reflect: true })
  public disabled?: boolean;

  /**
   * Downloads the linked file as the filename.
   * Only used when `href` is set.
   */
  @property()
  public download?: string;

  /**
   * When set, the underlying button will be rendered as an `<a>` with this `href`
   * instead of a `<button>`.
   */
  @property()
  public href?: string;

  /**
   * An optional name for the button. Ignored when `href` is set.
   */
  @property()
  public name?: string;

  /**
   * Defining which referrer is sent when fetching the resource.
   * Only applies to links.
   */
  @property({ attribute: 'referrerpolicy' })
  public referrerPolicy:
    | 'no-referrer'
    | 'no-referrer-when-downgrade'
    | 'origin'
    | 'origin-when-cross-origin'
    | 'same-origin'
    | 'strict-origin'
    | 'strict-origin-when-cross-origin'
    | 'unsafe-url'
    | (string & {}) = 'strict-origin-when-cross-origin';

  /**
   * Tells the browser where to open the link. Only used when `href` is set.
   */
  @property()
  public target?: '_blank' | '_parent' | '_self' | '_top' | (string & {});

  /**
   * Allows a toggling behavior on the component that emits change event if not disabled.
   * Only when is a button.
   */
  @property({ type: Boolean, reflect: true })
  public toggle = false;

  /**
   * Allows the component to be treated standalone or part of a form.
   * The type of button. When the type is `submit`, the button will submit the surrounding form. Note that the default
   * value is `button` instead of `submit`, which is opposite of how native `<button>` elements behave.
   */
  @property({ reflect: true })
  public type: 'button' | 'submit' | 'reset' = 'button';

  /**
   * An optional value for the button. Ignored when `href` is set.
   */
  @property()
  public value?: string;

  /**
   * Allows component to render using only the icon as visual element.
   * Optional, default is false, associated attribute is 'icon-only'
   */
  @property({ type: Boolean, reflect: true, attribute: 'icon-only' })
  public iconOnly?: boolean;

  /**
   * An optional toggle that allows text to wrap. Helper for longer text scenarios.
   */
  @property({ attribute: 'allow-wrap', type: Boolean, reflect: true })
  public allowWrap? = false;

  protected showHandler?: () => void;
  protected hideHandler?: () => void;
  protected toggleHandler?: () => void;
  protected readonly _internals: ElementInternals;
  protected _shows?: string;
  protected _hides?: string;
  protected _toggles?: string;

  public constructor() {
    super();
    this._internals = this.attachInternals();
    new HasSlotController(this, '[default]', 'start', 'end');
  }

  /**
   * referencing a dismissible element's ID, this button will show it when clicked
   */
  @property()
  public get shows(): string | undefined {
    return this._shows;
  }

  /**
   * referencing a dismissible element's ID, this button will hide it when clicked
   */
  @property()
  public get hides(): string | undefined {
    return this._hides;
  }

  /**
   * referencing a dismissible element's ID, this button will show/hide it when clicked
   */
  @property()
  public get toggles(): string | undefined {
    return this._toggles;
  }

  public set shows(value: string | undefined) {
    this._shows = value;
    if (this.showHandler) {
      this.removeEventListener('click', this.showHandler);
    }
    if (value) {
      this.showHandler = () => {
        const el = this.findRootNode(this).getElementById(value) as CharmDismissibleElement;
        el?.show();
        this.expanded = true;
      };
      this.addEventListener('click', this.showHandler);
    }
  }

  public set hides(value: string | undefined) {
    this._hides = value;
    if (this.hideHandler) {
      this.removeEventListener('click', this.hideHandler);
    }
    if (value) {
      this.hideHandler = () => {
        const el = this.findRootNode(this).getElementById(value) as CharmDismissibleElement;
        el?.hide();
        this.expanded = false;
      };
      this.addEventListener('click', this.hideHandler);
    }
  }

  public set toggles(value: string | undefined) {
    this._toggles = value;
    if (this.toggleHandler) {
      this.removeEventListener('click', this.toggleHandler);
    }
    if (value) {
      this.toggleHandler = () => {
        const el = this.findRootNode(this).getElementById(value) as CharmDismissibleElement;
        el?.toggle();
        if (el?.open) {
          this.expanded = el?.open;
        }
      };
      this.addEventListener('click', this.toggleHandler);
    }
  }

  /** @internal Overrides the click method to delegate to the internal element. */
  public override click(): void {
    super.click();
    if (this.disabled) {
      return;
    }

    if (!!this.href) {
      this.shadowRoot?.querySelector<HTMLButtonElement | HTMLAnchorElement>('.control')?.click();
    }
  }

  protected handleClick(event: MouseEvent) {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (!Boolean(this.href) && this.toggle) {
      this.pressed = !this.pressed;
      this.emit('change');
      return;
    }

    if (this.type === 'submit') {
      this._internals?.form?.submit();
    }

    if (this.type === 'reset') {
      this._internals?.form?.reset();
    }
  }

  /*
   * Generate the template for the content of the button.
   */
  protected contentTemplate() {
    return startContentEndTemplate();
  }

  /*
   * Generate the button template.
   */
  protected buttonTemplate() {
    const isLink = !!this.href;
    const tag = this.href ? literal`a` : literal`button`;

    return html`<${tag}
      aria-current=${ifDefined(this.current)}
      aria-disabled=${ifDefined(!isLink && this.disabled !== undefined ? this.disabled : undefined)}
      aria-expanded=${ifDefined(!isLink && this.expanded !== undefined ? this.expanded : undefined)}
      aria-pressed=${ifDefined(!isLink && this.pressed !== undefined ? this.pressed : undefined)}
      class=${classMap({
        control: true,
      })}
      href=${ifDefined(!this.disabled && this.href ? this.href : undefined)}
      name=${ifDefined(isLink ? undefined : this.name)}
      icon-only=${ifDefined(this.iconOnly)}
      allow-wrap=${ifDefined(this.allowWrap)}
      part="button-control"
      referrerpolicy=${ifDefined(isLink ? this.referrerPolicy : undefined)}
      rel=${ifDefined(isLink && this.target ? 'noreferrer noopener' : undefined)}
      target=${ifDefined(isLink ? this.target : undefined)}
      type=${ifDefined(isLink ? undefined : this.type)}
      value=${ifDefined(isLink ? undefined : this.value)}
      ?autofocus=${this.autofocus}
      @click=${this.handleClick}
      @focus=${this.handleFocus}
      @blur=${this.handleBlur}
    >
      ${this.contentTemplate()}
    </${tag}>`;
  }

  protected override render() {
    return this.buttonTemplate();
  }
}

export default CoreButton;
