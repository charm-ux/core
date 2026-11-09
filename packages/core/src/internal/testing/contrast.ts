import { expect, nextFrame } from '@open-wc/testing';

/**
 * Runs axe (including `color-contrast`) against `element` with Charm's default theme in light and then dark mode.
 *
 * The test runner loads `dist/themes/charm/theme.css`, whose colors resolve through `light-dark()`, so switching the
 * root `color-scheme` is enough to exercise both modes without reloading styles.
 */
export async function expectThemeContrast(element: Element, ignoredRules: string[] = []): Promise<void> {
  const root = document.documentElement;
  const previous = root.style.colorScheme;
  try {
    for (const scheme of ['light', 'dark']) {
      root.style.colorScheme = scheme;
      // Let style recalculation and color transitions settle before axe samples colors.
      await nextFrame();
      await new Promise(resolve => setTimeout(resolve, 350));
      expect(getComputedStyle(root).colorScheme, 'color-scheme applied').to.equal(scheme);
      await expect(element).to.be.accessible({ ignoredRules });
    }
  } finally {
    root.style.colorScheme = previous;
  }
}
