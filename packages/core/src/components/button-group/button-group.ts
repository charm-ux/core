import { html } from 'lit/static-html.js';
import { property, queryAssignedElements } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import CharmElement from '../../base/charm-element/charm-element.js';
import CoreButton from '../button/button.js';
import CoreTooltip from '../tooltip/tooltip.js';

import styles from './button-group.styles.js';

const BUTTON_CHILDREN = ['button'];

/**
 * Button Group organizes related buttons into a cohesive visual unit, providing logical grouping for actions that are functionally related. It supports vertical/horizontal layouts, split styling, and single/multiple selection modes.
 *
 * @tag ch-button-group
 * @since 1.0.0
 * @status beta
 *
 * @event change - Listens for change events from child buttons when their state changes.
 *
 * @slot - One or more Button or Menu elements to display in the button group.
 *
 * @csspart button-group-base - The component's base wrapper.
 *
 * @cssproperty --button-group-divider-color - Sets the divider color when the button is in a button group, defaults to --button-fg-color.
 * @cssproperty --button-group-divider-height - Sets the divider height when the button is in a button group, defaults to 100% for horizontal button groups, 1px for vertical groups.
 * @cssproperty --button-group-divider-width - Sets the divider width when the button is in a button group, defaults to 100% for vertical button groups, 1px for horizontal groups.
 * @cssproperty --button-group-gap - Sets the gap between each button.
 * @cssproperty --button-pressed-bg-color - Sets the pressed background color of each button.
 * @cssproperty --button-pressed-border - Sets the pressed border of each button.
 * @cssproperty --button-bg-color - Sets the background color of the button group when split.
 * @cssproperty --button-border-color - Sets the border color of the button group when split.
 * @cssproperty --button-border-radius - Sets border radius for the button group when split.
 * @cssproperty --button-border-size - Sets the border width of the button group when split.
 * @cssproperty --button-border-style - Sets the border style of the button group when split.
 * @cssproperty --button-focus-border-color - Sets the border color when focused and split.
 * @cssproperty --button-hover-border-color - Sets the border color when hovered and split.
 * @cssproperty --button-disabled-border-color - Sets the border color when disabled and split.
 **/
export class CoreButtonGroup extends CharmElement {
  public static override styles = [...super.styles, styles];

  public static override baseName = 'button-group';

  /** A label to use for the button group's aria-label attribute. */
  @property() public label?: string;

  /**
   * Vertically stacks the buttons in the group
   */
  @property({ type: Boolean, reflect: true })
  public vertical?: boolean;

  /**
   * Splits the buttons in the group by removing gap and border radius
   */
  @property({ type: Boolean, reflect: true })
  public split?: boolean;

  /**
   * When set to 'single', only one button in the group can be selected at a time, multiple buttons can be selected when set to 'multiple'
   */
  @property({ reflect: true })
  public select?: 'single' | 'multiple' | null;

  /**
   * When set, the button group will behave like a toolbar with a roving tab index, arrow keyboard interaction, and a role of toolbar
   */
  @property({ type: Boolean, reflect: true })
  public toolbar?: boolean;

  @queryAssignedElements({ flatten: true })
  protected slottedElements!: Array<HTMLElement>;

  protected focusedIndex: number = 0;
  protected prevSelectedIndex: number = 0;

  /** all child button elements, including nested button group children */
  protected get buttons(): CoreButton[] {
    const buttonChildren = BUTTON_CHILDREN.map(tag => this.scope.tagName(tag));
    const buttonSelector = buttonChildren.join(',');
    return this.slottedElements.reduce((btns, el) => {
      if (buttonChildren.includes(el.tagName.toLowerCase())) {
        return btns.concat(el as CoreButton);
      }
      // child button groups manage their own buttons
      if (el instanceof CoreButtonGroup) {
        return btns;
      }
      // Otherwise (overflow container, etc.), find all buttons within
      const nestedButtons = Array.from(el.querySelectorAll<CoreButton>(buttonSelector));
      return btns.concat(nestedButtons);
    }, [] as CoreButton[]);
  }

  public override connectedCallback() {
    super.connectedCallback();

    if (this.select) {
      this.addEventListener('change', this.handleToggleChange);
    }
  }

  public override disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('change', this.handleToggleChange);
    this.removeEventListener('keydown', this.handleKeyDown);
  }

  public override attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    super.attributeChangedCallback(name, oldValue, newValue);
    // Need to add keydown listener when toolbar  is set because it might be propagated from a parent button group
    if (name === 'toolbar' && newValue !== null) {
      this.addEventListener('keydown', this.handleKeyDown);
    }
  }

  /**
   * Handles the 'change' event from a button for toggling of buttons
   * @param {Event} e - The 'change' event object.
   */
  protected handleToggleChange = () => {
    if (this.select === 'single') {
      // reset all pressed attr's on buttons
      this.buttons.forEach(button => {
        if (button.hasAttribute('pressed')) {
          button.removeAttribute('pressed');
        }
      });
    }
  };

  /**
   * Handles the 'keydown' event on button-group
   * @param {KeyboardEvent} e - The 'keyboard' event object.
   */
  protected handleKeyDown = (e: KeyboardEvent) => {
    {
      if (!['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        return;
      }

      e.preventDefault();
      // Stop the event from bubbling up to parent button groups
      e.stopPropagation();

      let nextIndex = -1;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown': {
          nextIndex = this.focusedIndex === this.slottedElements.length - 1 ? 0 : this.focusedIndex + 1;
          break;
        }

        case 'ArrowLeft':
        case 'ArrowUp': {
          nextIndex = this.focusedIndex === 0 ? this.slottedElements.length - 1 : this.focusedIndex - 1;
          break;
        }
      }

      this.setFocus(this.focusedIndex, nextIndex);
    }
  };

  protected initializeSlottedElements() {
    this.setAttributes();
    this.setTooltipPosition();
  }

  protected setAttributes() {
    // Set child button attributes
    const buttons = this.buttons;
    buttons.forEach((button, idx) => {
      if (idx === 0) {
        button.setAttribute('button-group-button-position', 'first');
      } else if (idx < buttons.length - 1) {
        button.setAttribute('button-group-button-position', 'inner');
      } else {
        button.setAttribute('button-group-button-position', 'last');
      }
      if (this.vertical) {
        button.setAttribute('vertical', '');
      }
      if (this.split) {
        button.setAttribute('split', '');
      }
      if (this.select) {
        button.setAttribute('toggle', '');
      }
      if (this.toolbar) {
        button.tabIndex = idx === 0 ? 0 : -1;
      }
    });

    if (this.toolbar) {
      // Propagate toolbar attribute to child button groups, including nested ones
      this.slottedElements.forEach(el => {
        if (el instanceof CoreButtonGroup) {
          el.setAttribute('toolbar', '');
        }
        const allDescendants = el.querySelectorAll('*');
        allDescendants.forEach(descendant => {
          if (descendant instanceof CoreButtonGroup) {
            descendant.setAttribute('toolbar', '');
          }
        });
      });
    }
  }

  protected setTooltipPosition() {
    for (const el of this.slottedElements) {
      if (el.tagName.toLowerCase() === this.scope.tagName(CoreTooltip.baseName)) {
        const tooltip = el as CoreTooltip;
        if (!tooltip.distance) {
          tooltip.distance = 12;
        }
      }
    }
  }

  /** Sets the focus on the specified tab indices. */
  protected setFocus(prevIndex: number, newIndex: number) {
    this.focusedIndex = newIndex;
    this.prevSelectedIndex = prevIndex;
    this.slottedElements[this.prevSelectedIndex].setAttribute('tabindex', '-1');
    this.slottedElements[this.focusedIndex].setAttribute('tabindex', '0');
    this.slottedElements[this.focusedIndex].focus();
  }

  protected override render() {
    return this.buttonGroupTemplate();
  }

  /** Generates the template for the button group. */
  protected buttonGroupTemplate() {
    return html`
      <div
        part="button-group-base"
        class="button-group"
        role=${this.toolbar ? 'toolbar' : 'group'}
        aria-label=${ifDefined(this.label)}
      >
        <slot @slotchange=${this.initializeSlottedElements}></slot>
      </div>
    `;
  }
}

export default CoreButtonGroup;
