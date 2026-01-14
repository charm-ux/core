import { html } from 'lit/static-html.js';
import { classMap } from 'lit/directives/class-map.js';
import { property } from 'lit/decorators.js';
import CharmElement from '../../base/charm-element/charm-element.js';
import styles from './skeleton.styles.js';

/**
 * Skeleton is a component that is used to indicate that content is loading.
 *
 * @tag ch-skeleton
 * @since 1.0.0
 * @status beta
 *
 * @csspart skeleton-base - the component's base wrapper
 *
 * @cssproperty --skeleton-animation - the animation for the skeleton.
 * @cssproperty --skeleton-bg-color - the background color for the skeleton.
 * @cssproperty --skeleton-bg-size - the background image size for pulse or wave animations.
 * @cssproperty --skeleton-border-radius - the border radius for the skeleton.
 * @cssproperty --skeleton-min-height - minimum height of the skeleton.
 * @cssproperty --skeleton-sheen-color - the background color for the skeleton when there is animation.
 * @cssproperty --skeleton-width - the width of the skeleton.
 **/
export class CoreSkeleton extends CharmElement {
  public static override styles = [...super.styles, styles];
  public static override baseName = 'skeleton';

  /** The animation type of the Skeleton. */
  @property({ type: String, reflect: true })
  public animation?: 'none' | 'wave' | 'pulse';

  /** The shape of the Skeleton. */
  @property() public shape?: 'rect' | 'circle';

  /** Generates the template for the skeleton. */
  protected skeletonTemplate() {
    return html`
      <div
        class=${classMap({
          skeleton: true,
          'skeleton-circle': this.shape === 'circle',
          'skeleton-rect': !this.shape || this.shape === 'rect',
        })}
        aria-busy="true"
        aria-live="polite"
        part="skeleton-base"
      ></div>
    `;
  }

  protected override render() {
    return this.skeletonTemplate();
  }
}

export default CoreSkeleton;
