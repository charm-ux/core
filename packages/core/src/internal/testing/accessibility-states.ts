import { aTimeout, elementUpdated, nextFrame, oneEvent } from '@open-wc/testing';
import type CharmDismissibleElement from '../../base/dismissible-element/charm-dismissible-element.js';
import type CharmFormControlElement from '../../base/form-control-element/charm-form-control-element.js';
import type { AccessibilityState } from '../../base/charm-element/charm-element.test-harness.js';

/** Longest time to wait for a dismissible's `after-show` event before scanning anyway. */
const SHOW_SETTLE_TIMEOUT_MS = 1000;

/** Longest time to wait for the open transition to settle after `after-show` before scanning anyway. */
const ANIMATION_SETTLE_TIMEOUT_MS = 1000;

/**
 * Collects every CSS transition/animation running on `element` and its shadow-including descendants. Note that
 * `getAnimations({ subtree: true })` does not cross shadow roots, and a composed popup's fade lives in one.
 */
function collectAnimations(element: Element, animations: Set<Animation>): void {
  element.getAnimations().forEach(animation => animations.add(animation));
  for (const child of element.children) collectAnimations(child, animations);

  const shadowRoot = element.shadowRoot;
  if (!shadowRoot) return;
  shadowRoot.getAnimations().forEach(animation => animations.add(animation));
  for (const child of shadowRoot.children) collectAnimations(child, animations);
}

/**
 * Waits for the open transition to actually finish. `after-show` is timer-based, so on a browser that throttles
 * animation frames it can fire before a composed child's transition has even started; axe would then sample a mostly
 * transparent popup and report a false color-contrast violation.
 */
async function waitForAnimationsToSettle(element: Element): Promise<void> {
  const deadline = performance.now() + ANIMATION_SETTLE_TIMEOUT_MS;
  // Let a transition that begins a frame after `after-show` start before sampling.
  await nextFrame();

  while (performance.now() < deadline) {
    const animations = new Set<Animation>();
    collectAnimations(element, animations);
    const running = [...animations].filter(animation => {
      const timing = animation.effect?.getComputedTiming();
      return animation.playState === 'running' && timing?.iterations !== Infinity;
    });
    if (running.length === 0) return;

    await Promise.race([
      Promise.all(running.map(animation => animation.finished.catch(() => undefined))),
      aTimeout(Math.max(0, deadline - performance.now())),
    ]);
    await nextFrame();
  }
}

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
