import { parseDuration } from './animations.js';

export interface TransitionInfo {
  transition: boolean;
  transitionProperty?: string;
}

/**
 * Detects the transition property and whether a transition is present from a CSS transition string.
 * It appends a short-lived probe element to `attachTo` with `transition: transitionStyles` and
 * reads the computed `transition-property` and `transition-duration` to find the property with
 * the longest duration. Returns a Promise that resolves once computed styles are available.
 */
export async function detectTransitionFromStyles(
  attachTo: Element,
  transitionStyles?: string
): Promise<TransitionInfo> {
  try {
    const styles =
      (transitionStyles || '').toString().trim() || getComputedStyle(attachTo).getPropertyValue('transition') || '';

    if (!styles || styles === 'none') return { transition: false };

    const probe = document.createElement('span');
    probe.className = 'transition-probe';
    probe.style.transition = styles;

    // Append to the element we're attaching to so computed style resolution matches where the transition will occur
    (attachTo as HTMLElement).appendChild(probe);

    // Wait a frame so UA computes styles
    await new Promise(requestAnimationFrame);

    const probeStyle = getComputedStyle(probe);
    const properties = probeStyle
      .getPropertyValue('transition-property')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const durationsRaw = probeStyle
      .getPropertyValue('transition-duration')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const durationsMs = durationsRaw
      .map(d => {
        try {
          return parseDuration(d);
        } catch {
          if (d.endsWith('ms')) return parseFloat(d);
          if (d.endsWith('s')) return parseFloat(d) * 1000;
          return parseFloat(d) || 0;
        }
      })
      .map(n => (Number.isNaN(n) ? 0 : n));

    // Cleanup probe
    probe.remove();

    if (durationsMs.length === 0) return { transition: false };

    const maxMs = Math.max(...durationsMs);
    const index = durationsMs.indexOf(maxMs);
    const transitionProperty = (properties[index] || properties[0]) as string | undefined;

    return { transition: maxMs > 0, transitionProperty };
  } catch (e) {
    // On error, don't block — indicate no transition
    try {
      // Best-effort probe cleanup (if present)
      const existing = (attachTo as HTMLElement).querySelector('.transition-probe');
      if (existing) existing.remove();
    } catch {
      /* swallow */
    }
    return { transition: false };
  }
}

export default detectTransitionFromStyles;
