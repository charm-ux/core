import { aTimeout, elementUpdated, oneEvent } from '@open-wc/testing';
import { waitForAnimationsToSettle } from './animations.js';
import type CharmDismissibleElement from '../../base/dismissible-element/charm-dismissible-element.js';
import type CharmFormControlElement from '../../base/form-control-element/charm-form-control-element.js';
import type { AccessibilityState } from '../../base/charm-element/charm-element.test-harness.js';

/** Longest time to wait for a dismissible's `after-show` event before scanning anyway. */
const SHOW_SETTLE_TIMEOUT_MS = 1000;

/**
 * Opens a dismissible component and waits for its `{baseName}-after-show` event plus any open transition, so axe scans
 * the settled open state rather than a mid-transition frame.
 */
export async function openDismissible(el: CharmDismissibleElement): Promise<void> {
  const baseName = (el.constructor as typeof CharmDismissibleElement).baseName;
  const afterShow = oneEvent(el, `${baseName}-after-show`);
  el.show();
  await Promise.race([afterShow, aTimeout(SHOW_SETTLE_TIMEOUT_MS)]);
  await elementUpdated(el);
  await waitForAnimationsToSettle(el);
}

/** The `open` state for components that extend `CharmDismissibleElement`. */
export function openAccessibilityState<T extends CharmDismissibleElement>(
  overrides: Partial<AccessibilityState<T>> = {}
): Record<string, AccessibilityState<T>> {
  return {
    open: {
      description: 'when open',
      setup: el => openDismissible(el),
      ...overrides,
    },
  };
}

/**
 * The shared states for components that extend `CharmFormControlElement`: invalid (after interaction, so the error is
 * exposed to assistive technology), disabled, readonly, and required.
 */
export function formControlAccessibilityStates<T extends CharmFormControlElement>(): Record<
  string,
  AccessibilityState<T>
> {
  return {
    invalid: {
      description: 'when invalid',
      setup: el => {
        el.setCustomValidity('Enter a valid value');
      },
    },
    disabled: {
      description: 'when disabled',
      setup: el => {
        el.disabled = true;
      },
    },
    readonly: {
      description: 'when readonly',
      setup: el => {
        el.readonly = true;
      },
    },
    required: {
      description: 'when required',
      setup: el => {
        el.required = true;
      },
    },
  };
}
