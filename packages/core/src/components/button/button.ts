import { ifDefined } from 'lit/directives/if-defined.js';
import { classMap } from 'lit/directives/class-map.js';
import { html, literal } from 'lit/static-html.js';
import { property, state } from 'lit/decorators.js';
import CharmFocusableElement from '../../base/focusable-element/charm-focusable-element.js';
import { startContentEndTemplate } from '../../templates/index.js';
import { type CharmDismissibleElement, type CharmElement } from '../../base/index.js';
import styles from './button.styles.js';

/**
 * True when the node is a visually-hidden or hidden element that shouldn't count as button
 * content. Mirrors the convention used by `HasSlotController`.
 */
const isVisuallyHidden = (node: Node): boolean => {
  if (!(node instanceof Element)) {
    return false;
  }
  return node.hasAttribute('hidden') || (node instanceof HTMLElement && node.classList.contains('visually-hidden'));
};

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
 * @cssprop --charm-button-active-bg-color - Sets the background color of the button when active.
 * @cssprop --charm-button-active-border-color - Sets the border color of the button when active.
 * @cssprop --charm-button-active-fg-color - Sets button's text color when active.
 * @cssprop --charm-button-active-shadow - Sets button's box-shadow when active.
 * @cssprop --charm-button-bg-color - Sets the background color of the button.
 * @cssprop --charm-button-border-color - Sets the border color of the button.
 * @cssprop --charm-button-border-radius - Sets button's border-radius.
 * @cssprop --charm-button-border-style - Sets the border style of the button.
 * @cssprop --charm-button-border-width - Sets the border width of the button.
 * @cssprop --charm-button-content-alignment - Sets the alignment of the button content.
 * @cssprop --charm-button-content-gap - Determines the spacing between the slots.
 * @cssprop --charm-button-disabled-bg-color - Sets the background color of the button when disabled.
 * @cssprop --charm-button-disabled-border-color - Sets the border color of the button when disabled.
 * @cssprop --charm-button-disabled-cursor - Sets the cursor style when disabled.
 * @cssprop --charm-button-disabled-fg-color - Sets button's text color when disabled.
 * @cssprop --charm-button-disabled-shadow - Sets button's box-shadow when disabled.
 * @cssprop --charm-button-fg-color - Sets button's text color.
 * @cssprop --charm-button-focus-bg-color - Sets the background color of the button when focused.
 * @cssprop --charm-button-focus-border-color - Sets the border color of the button when focused.
 * @cssprop --charm-button-focus-fg-color - Sets button's text color when focused.
 * @cssprop --charm-button-focus-shadow - Sets button's box-shadow when focused.
 * @cssprop --charm-button-font-weight - Sets the font weight of the button.
 * @cssprop --charm-button-hover-bg-color - Sets the background color of the button when hovered.
 * @cssprop --charm-button-hover-border-color - Sets the border color of the button when hovered.
 * @cssprop --charm-button-hover-fg-color - Sets button's text color when hovered.
 * @cssprop --charm-button-hover-shadow - Sets button's box-shadow when hovered.
 * @cssprop --charm-button-icon-padding-x - Sets the horizontal padding for icon-only buttons.
 * @cssprop --charm-button-icon-padding-y - Sets the vertical padding for icon-only buttons.
 * @cssprop --charm-button-icon-size - Sets the height and width of the slotted icon and svg.
 * @cssprop --charm-button-padding-x - Determines left and right padding.
 * @cssprop --charm-button-padding-y - Determines top and bottom padding.
 * @cssprop --charm-button-pressed-bg-color - Sets the background color of the button when toggled.
 * @cssprop --charm-button-pressed-border-color - Sets the border color of the button when toggled.
 * @cssprop --charm-button-pressed-fg-color - Sets button's text color when toggled.
 * @cssprop --charm-button-shadow - Sets button's box-shadow.
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

  /** Sets `aria-haspopup` on the internal button or link. */
  @property({ attribute: 'haspopup' })
  public haspopup?: string;

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

  /** Relationship tokens for linked buttons. */
  @property()
  public rel?: string;

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
   * Allows the component to render using only the icon as visual element.
   * Optional, default is false, associated attribute is 'icon-only'. When not set, this is
   * detected automatically when the default slot contains only an icon and no other visible
   * content.
   */
  @property({ type: Boolean, reflect: true, attribute: 'icon-only' })
  public iconOnly?: boolean;

  /**
   * An optional toggle that allows text to wrap. Helper for longer text scenarios.
   */
  @property({ attribute: 'allow-wrap', type: Boolean, reflect: true })
  public allowWrap? = false;

  /** @internal True when the default slot resolves to only an icon (auto-detected). */
  @state()
  protected isIconButton = false;

  @state()
  protected formDisabled = false;

  protected readonly _internals: ElementInternals;
  protected _shows?: string;
  protected _hides?: string;
  protected _toggles?: string;

  protected submitTimer?: number;
  protected dismissibleTarget?: CharmDismissibleElement;
  protected dismissibleHideEvent?: string;

  public constructor() {
    super();
    this._internals = this.attachInternals();
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
    if (value === this._shows) return;
    this._shows = value;
    this.syncDismissibleAction();
  }

  public set hides(value: string | undefined) {
    if (value === this._hides) return;
    this._hides = value;
    this.syncDismissibleAction();
  }

  public set toggles(value: string | undefined) {
    if (value === this._toggles) return;
    this._toggles = value;
    this.syncDismissibleAction();
  }

  /** @internal Overrides the click method to delegate to the internal element. */
  public override click(): void {
    if (this.disabled || this.formDisabled) return;
    this.shadowRoot?.querySelector<HTMLButtonElement | HTMLAnchorElement>('.control')?.click();
  }

  public override connectedCallback() {
    super.connectedCallback();
    // slotchange doesn't compose out of the shadow root, but it does bubble to it, so a
    // single delegated listener catches every slot's changes (see HasSlotController).
    this.shadowRoot?.addEventListener('slotchange', this.handleSlotChange);
    this.syncDismissibleAction();
  }

  public override disconnectedCallback() {
    if (this.submitTimer !== undefined) {
      window.clearTimeout(this.submitTimer);
      this.submitTimer = undefined;
    }
    this.syncDismissibleAction(false);
    super.disconnectedCallback();
    this.shadowRoot?.removeEventListener('slotchange', this.handleSlotChange);
  }

  protected formDisabledCallback(disabled: boolean) {
    this.formDisabled = disabled;
    this.toggleAttribute('form-disabled', disabled);
  }

  protected syncDismissibleAction(connected = this.isConnected) {
    this.removeEventListener('click', this.handleDismissibleAction);
    if (this.dismissibleTarget && this.dismissibleHideEvent) {
      this.dismissibleTarget.removeEventListener(this.dismissibleHideEvent, this.handleDismissibleHide);
    }
    this.dismissibleTarget = undefined;
    this.dismissibleHideEvent = undefined;
    if (connected && (this._shows || this._hides || this._toggles)) {
      this.addEventListener('click', this.handleDismissibleAction);
    }
  }

  protected handleDismissibleAction = (event: Event) => {
    if (event.defaultPrevented || this.disabled || this.formDisabled || this.href) return;
    const targetId = this._shows || this._hides || this._toggles;
    if (!targetId) return;
    const target = this.getScopedElementById(targetId) as CharmDismissibleElement | null;
    if (!target) return;
    if (this.dismissibleTarget !== target) {
      if (this.dismissibleTarget && this.dismissibleHideEvent) {
        this.dismissibleTarget.removeEventListener(this.dismissibleHideEvent, this.handleDismissibleHide);
      }
      this.dismissibleTarget = target;
      const baseName = (target.constructor as typeof CharmElement).baseName;
      this.dismissibleHideEvent = `${baseName}-hide`;
      target.addEventListener(this.dismissibleHideEvent, this.handleDismissibleHide);
    }
    if (this._shows) target.show();
    else if (this._hides) target.hide();
    else target.toggle();
    this.expanded = !!target.open;
  };

  protected handleDismissibleHide = () => {
    this.expanded = false;
  };

  protected readonly handleSlotChange = (event: Event) => {
    const slot = event.target as HTMLSlotElement;
    if (slot.name) {
      return;
    }
    this.isIconButton = this.hasIconOnlyContent(slot.assignedNodes({ flatten: true }));
  };

  protected handleClick(event: MouseEvent) {
    if (this.disabled || this.formDisabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    if (!Boolean(this.href) && this.toggle) {
      this.pressed = !this.pressed;
      this.emit('change');
      return;
    }

    if (this.href) return;
    if (this.type === 'submit' || this.type === 'reset') {
      if (this.submitTimer !== undefined) window.clearTimeout(this.submitTimer);
      this.submitTimer = window.setTimeout(() => {
        this.submitTimer = undefined;
        if (event.defaultPrevented || this.disabled || this.formDisabled) return;
        const form = this._internals.form;
        if (!form) return;
        if (this.type === 'reset') {
          form.reset();
          return;
        }
        const submitter = document.createElement('button');
        submitter.type = 'submit';
        submitter.hidden = true;
        if (this.name !== undefined) submitter.name = this.name;
        if (this.value !== undefined) submitter.value = this.value;
        form.append(submitter);
        try {
          form.requestSubmit(submitter);
        } finally {
          submitter.remove();
        }
      });
    }
  }

  /*
   * Generate the template for the content of the button.
   */
  protected contentTemplate() {
    return startContentEndTemplate();
  }

  /**
   * True when every visible node in the default slot is an icon and there is at least one
   * icon. Visually-hidden labels (per A11Y-002) don't disqualify icon-only detection.
   */
  protected hasIconOnlyContent(nodes: Node[]): boolean {
    let hasIcon = false;

    for (const node of nodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        if (node.textContent?.trim()) {
          return false;
        }
        continue;
      }

      if (isVisuallyHidden(node)) {
        continue;
      }

      if (this.isIconElement(node)) {
        hasIcon = true;
      } else {
        return false;
      }
    }

    return hasIcon;
  }

  /**
   * True when the node represents an icon: an inline SVG, an element carrying the `icon`
   * attribute, or the scope's icon component.
   */
  protected isIconElement(node: Node): boolean {
    if (!(node instanceof Element)) {
      return false;
    }
    if (node instanceof SVGElement) {
      return true;
    }
    if (node.hasAttribute('icon')) {
      return true;
    }
    return node.localName.toLowerCase() === this.scope.tagName('icon').toLowerCase();
  }

  /*
   * Generate the button template.
   */
  protected buttonTemplate() {
    const isLink = !!this.href;
    const tag = this.href ? literal`a` : literal`button`;

    return html`<${tag}
      aria-current=${ifDefined(this.current)}
      aria-disabled=${ifDefined(this.disabled || this.formDisabled ? 'true' : undefined)}
      aria-expanded=${ifDefined(!isLink && this.expanded !== undefined ? this.expanded : undefined)}
      aria-haspopup=${ifDefined(this.haspopup)}
      aria-pressed=${ifDefined(!isLink && (this.toggle || this.pressed !== undefined) ? String(this.pressed ?? false) : undefined)}
      class=${classMap({
        control: true,
        'is-icon-button': this.iconOnly || this.isIconButton,
      })}
      href=${ifDefined(this.href)}
      role=${ifDefined(isLink && (this.disabled || this.formDisabled) ? 'link' : undefined)}
      name=${ifDefined(isLink ? undefined : this.name)}
      download=${ifDefined(isLink ? this.download : undefined)}
      part="button-control"
      referrerpolicy=${ifDefined(isLink ? this.referrerPolicy : undefined)}
      rel=${ifDefined(isLink ? (this.rel ?? (this.target === '_blank' ? 'noopener' : undefined)) : undefined)}
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
