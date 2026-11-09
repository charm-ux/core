import { aTimeout, nextFrame } from '@open-wc/testing';

/** Longest time to wait for animations to settle before continuing anyway. */
const ANIMATION_SETTLE_TIMEOUT_MS = 1000;

/** How long the subtree must stay animation-free before it is considered settled. */
const ANIMATION_STABLE_WINDOW_MS = 100;

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

function getRunningAnimations(element: Element): Animation[] {
  const animations = new Set<Animation>();
  collectAnimations(element, animations);
  return [...animations].filter(animation => {
    const timing = animation.effect?.getComputedTiming();
    return animation.playState === 'running' && timing?.iterations !== Infinity;
  });
}

/**
 * Waits for CSS transitions/animations in `element`'s shadow-including subtree to finish. Timing-based events such as
 * `after-show` can fire before a composed child's transition has even started, and browsers can throttle animation
 * frames, so axe would otherwise sample a partially transparent surface and report false contrast violations. The
 * subtree must stay animation-free for a short window so late-starting transitions are also caught.
 */
export async function waitForAnimationsToSettle(element: Element): Promise<void> {
  const deadline = performance.now() + ANIMATION_SETTLE_TIMEOUT_MS;
  let settledAt = 0;

  while (performance.now() < deadline) {
    await nextFrame();
    const running = getRunningAnimations(element);

    if (running.length > 0) {
      settledAt = 0;
      await Promise.race([
        Promise.all(running.map(animation => animation.finished.catch(() => undefined))),
        aTimeout(Math.max(0, deadline - performance.now())),
      ]);
      continue;
    }

    if (settledAt === 0) {
      settledAt = performance.now();
    } else if (performance.now() - settledAt >= ANIMATION_STABLE_WINDOW_MS) {
      return;
    }
  }
}
