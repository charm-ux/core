import { css, type CSSResult, unsafeCSS } from 'lit';
import { semantic } from '../../utilities/theme.js';

export interface RelocateFocusRingOptions {
  /** Selector of the visual element the ring should wrap (e.g. `.radio`). */
  target: string;
  /** Outline color token, defaults to the shared `focus.outlineColor`. */
  outlineColor?: CSSResult;
  /** Outline offset token, defaults to the shared `focus.outlineOffset`. */
  outlineOffset?: CSSResult;
}

/**
 * Move the keyboard focus ring from the host onto a visual element.
 *
 * Hosts are focusable and would otherwise receive the shared focus ring; for
 * controls whose visual affordance is an inner element (radio, menu item,
 * etc.), the ring is suppressed on the host and re-applied around `target`.
 *
 * @example
 * ```ts
 * export default css`
 *   ${relocateFocusRing({ target: '.radio' })}
 * `;
 * ```
 */
export function relocateFocusRing({
  target,
  outlineColor = semantic('focus', 'outlineColor'),
  outlineOffset = semantic('focus', 'outlineOffset'),
}: RelocateFocusRingOptions): CSSResult {
  return css`
    :host(:focus-visible) {
      outline: none;
    }

    :host(:focus-visible) ${unsafeCSS(target)} {
      outline: ${semantic('focus', 'outlineWidth')} ${semantic('focus', 'outlineStyle')} ${outlineColor};
      outline-offset: ${outlineOffset};
    }
  `;
}
