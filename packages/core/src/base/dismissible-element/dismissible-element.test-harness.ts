import { CharmElementTests } from '../charm-element/charm-element.test-harness.js';
import { openAccessibilityState } from '../../internal/testing/accessibility-states.js';
import CharmDismissibleElement from './charm-dismissible-element.js';

/**
 * Tests every `CharmDismissibleElement` must pass. Registers the `open` accessibility state so each dismissible is
 * scanned while open, not only in its initial (usually closed) state.
 */
export class DismissibleElementTests<T extends CharmDismissibleElement> extends CharmElementTests<T> {
  public constructor() {
    super();

    this.addAccessibilityStates(openAccessibilityState());
  }
}
