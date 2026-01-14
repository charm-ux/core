import { html } from 'lit/static-html.js';
import { queryAssignedElements } from 'lit/decorators.js';

import CoreOverflow, { type OverflowMenuItem } from '../overflow/overflow.js';
import { CoreDivider } from '../divider/divider.js';

import styles from './button-group-overflow.styles.js';

/**
 * Button Group Overflow will render a button group with an overflow menu for items that do not fit within the available space.
 *
 * @tag ch-button-group-overflow
 * @since 1.0.0
 * @status beta
 *
 * @slot - Elements to display in the button group with overflow capability.
 **/
export class CoreButtonGroupOverflow extends CoreOverflow {
  public static override styles = [...super.styles, styles];
  public static override baseName = 'button-group-overflow';

  @queryAssignedElements({ flatten: true })
  private assignedElements!: HTMLElement[];

  public static override get dependencies() {
    return [...super.dependencies, CoreDivider];
  }

  // Override to get slotted element children, or the element itself if it has no children
  protected override get slottedElements(): HTMLElement[] {
    return this.assignedElements.flatMap(element => {
      const children = Array.from(element.children) as HTMLElement[];
      return children.length > 0 ? children : [element];
    });
  }

  protected override overflowMenuItemTemplate(overFlowItem: OverflowMenuItem) {
    if (overFlowItem.tagName === this.scope.tagName('divider').toUpperCase()) {
      return html`<${this.scope.tag('divider')}></${this.scope.tag('divider')}>`;
    }
    // Use parent template for regular items
    return super.overflowMenuItemTemplate(overFlowItem);
  }
}

export default CoreButtonGroupOverflow;
