import { html } from 'lit/static-html.js';
import { property, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import CharmElement from '../../base/charm-element/charm-element.js';
import { project } from '../../utilities/project.js';
import styles from './icon.styles.js';

export interface IconResponse {
  ok: boolean;
  status: number;
  svg: string;
}

export interface IconErrorEvent {
  status: number;
}

const CACHEABLE_ERROR = Symbol('cacheable-error');
const RETRYABLE_ERROR = Symbol('retryable-error');

type SVGResult = SVGSVGElement | typeof CACHEABLE_ERROR | typeof RETRYABLE_ERROR;
const iconCache = new Map<string, Promise<SVGResult>>();
const svgMarkupCache = new Map<string, SVGSVGElement>();

function parseSvg(markup: string): SVGSVGElement | null {
  const cached = svgMarkupCache.get(markup);
  if (cached) {
    return cached.cloneNode(true) as SVGSVGElement;
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(markup, 'image/svg+xml');
    const svgEl = doc.documentElement;

    if (!svgEl || svgEl.nodeName.toLowerCase() !== 'svg') {
      return null;
    }

    const adoptedSvg = document.adoptNode(svgEl) as unknown as SVGSVGElement;
    svgMarkupCache.set(markup, adoptedSvg);
    return adoptedSvg.cloneNode(true) as SVGSVGElement;
  } catch {
    return null;
  }
}

/**
 * Icons are symbols that can be used to represent various options within an application.
 *
 * @tag ch-icon
 * @since 1.0.0
 * @status beta
 *
 * @event icon-load - Emitted when the icon has loaded.
 * @event {IconErrorEvent} icon-error - Emitted when the icon fails to load.
 *
 * @csspart icon-base - The base of the icon.
 **/
export class CoreIcon extends CharmElement {
  public static override styles = [...super.styles, styles];
  public static override baseName = 'icon';

  /** The name of the icon to draw. */
  @property({ reflect: true })
  public name?: string;

  /** Label of the icon for assertive technologies. This is required for accessibility. */
  @property()
  public label?: string;

  /** A string that points to an external SVG. */
  @property()
  public url?: string;

  /** Sets the rotation degree of the icon. */
  @property({ type: Number, reflect: true })
  public rotate = 0;

  /** Sets the flip direction of the icon. */
  @property({ reflect: true })
  public flip?: 'x' | 'y' | 'both';

  @state()
  protected svg: SVGSVGElement | null = null;

  protected icons = project.iconSet;
  protected defaultIcon =
    parseSvg(this.icons['question']) ?? document.createElementNS('http://www.w3.org/2000/svg', 'svg');

  protected override async willUpdate() {
    await this.setIcon();
  }

  protected async setIcon() {
    if (!this.name && !this.url) {
      this.svg = this.defaultIcon.cloneNode(true) as SVGSVGElement;
      return;
    }

    if (this.name) {
      const icon = parseSvg((this.icons as Record<string, string>)[this.name] || this.icons['question']);
      this.svg = icon ? (icon.cloneNode(true) as SVGSVGElement) : (this.defaultIcon.cloneNode(true) as SVGSVGElement);
      return;
    }

    const resolvedUrl = `${this.url}`;
    if (!resolvedUrl) {
      this.svg = this.defaultIcon.cloneNode(true) as SVGSVGElement;
      return;
    }

    let iconResolver = iconCache.get(resolvedUrl);
    if (!iconResolver) {
      iconResolver = this.requestIcon(resolvedUrl);
      iconCache.set(resolvedUrl, iconResolver);
    }

    const icon = await iconResolver;

    if (icon === RETRYABLE_ERROR) {
      iconCache.delete(resolvedUrl);
    }

    if (resolvedUrl !== this.url) {
      return;
    }

    if (icon === RETRYABLE_ERROR || icon === CACHEABLE_ERROR) {
      this.svg = this.defaultIcon.cloneNode(true) as SVGSVGElement;
      this.emit('icon-error', { detail: { status: icon === RETRYABLE_ERROR ? 503 : 500 } });
      return;
    }

    this.svg = icon.cloneNode(true) as SVGSVGElement;
    this.emit('icon-load');
  }

  protected requestIcon(url: string): Promise<SVGResult> {
    return fetch(url)
      .then(async response => {
        if (!response.ok) {
          return response.status === 410 ? CACHEABLE_ERROR : RETRYABLE_ERROR;
        }

        const markup = await response.text();
        const parsedSvg = parseSvg(markup);

        if (!parsedSvg) {
          return CACHEABLE_ERROR;
        }

        return parsedSvg;
      })
      .catch(() => RETRYABLE_ERROR);
  }

  protected override updated(changedProperties: Map<string, unknown>) {
    const shouldSyncSvg =
      changedProperties.has('svg') ||
      changedProperties.has('rotate') ||
      changedProperties.has('flip') ||
      changedProperties.has('label');

    if (shouldSyncSvg) {
      this.syncIconNode();
    }
  }

  protected override render() {
    return html`
      <span
        part="icon-base"
        role=${ifDefined(this.label ? 'img' : undefined)}
        aria-label=${ifDefined(this.label)}
        aria-hidden=${ifDefined(this.label ? undefined : 'true')}
      >
        ${this.label ? html`<span class="visually-hidden">${this.label}</span>` : ''}
      </span>
    `;
  }

  protected syncIconNode() {
    const base = this.shadowRoot?.querySelector('[part="icon-base"]');
    if (!base) {
      return;
    }

    const label = base.querySelector('.visually-hidden');
    if (this.label) {
      if (!label) {
        const hiddenLabel = document.createElement('span');
        hiddenLabel.classList.add('visually-hidden');
        hiddenLabel.textContent = this.label;
        base.prepend(hiddenLabel);
      } else {
        label.textContent = this.label;
      }
    } else if (label) {
      label.remove();
    }

    const svg = this.svg?.cloneNode(true) as SVGSVGElement | null;
    if (!svg) {
      return;
    }

    const existingSvg = base.querySelector('[part="svg"]');
    if (existingSvg) {
      existingSvg.replaceWith(svg);
    } else {
      base.append(svg);
    }

    svg.setAttribute('part', 'svg');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('aria-hidden', 'true');

    const scaleX = this.flip === 'x' || this.flip === 'both' ? -1 : 1;
    const scaleY = this.flip === 'y' || this.flip === 'both' ? -1 : 1;
    this.style.setProperty('--icon-rotate', `${this.rotate}deg`);
    this.style.setProperty('--icon-scale-x', `${scaleX}`);
    this.style.setProperty('--icon-scale-y', `${scaleY}`);
  }
}

export default CoreIcon;
