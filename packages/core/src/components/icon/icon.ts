import { html } from 'lit/static-html.js';
import { property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import CharmElement from '../../base/charm-element/charm-element.js';
import { project } from '../../utilities/project.js';
import { getThemePrefix } from '../../utilities/theme.js';
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
    return cached;
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(markup, 'image/svg+xml');
    const svgEl = doc.documentElement;

    if (!svgEl || svgEl.nodeName.toLowerCase() !== 'svg') {
      return null;
    }

    const adoptedSvg = document.adoptNode(svgEl) as unknown as SVGSVGElement;
    adoptedSvg.setAttribute('part', 'svg');
    adoptedSvg.setAttribute('viewBox', adoptedSvg.getAttribute('viewBox') || '0 0 16 16');
    adoptedSvg.setAttribute('aria-hidden', 'true');
    svgMarkupCache.set(markup, adoptedSvg);
    return adoptedSvg;
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

  /** Selects the rendering strategy. Named icons use a CSS mask by default; use `svg` as an escape hatch. */
  @property({ attribute: 'render', reflect: true, useDefault: true })
  public renderMode: 'mask' | 'svg' = 'mask';

  /** Sets the rotation degree of the icon. */
  @property({ type: Number, reflect: true })
  public rotate = 0;

  /** Sets the flip direction of the icon. */
  @property({ reflect: true })
  public flip?: 'x' | 'y' | 'both';

  @query('[part="icon-base"]')
  protected iconBase?: HTMLElement;

  @state()
  protected svg: SVGSVGElement | null = null;

  protected icons = project.iconSet;
  protected cachedSource?: string;

  protected get maskMode() {
    return Boolean(this.name && this.renderMode !== 'svg');
  }

  protected override willUpdate(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('rotate')) {
      if (this.rotate) this.style.setProperty('--icon-rotate', `${this.rotate}deg`);
      else this.style.removeProperty('--icon-rotate');
    }
    if (this.maskMode) {
      if (changedProperties.has('name') || changedProperties.has('renderMode')) {
        const name = this.name ?? 'question';
        const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '-').replace(/^[0-9]/, '-$&') || 'icon';
        this.style.setProperty(
          '--_icon-src',
          `var(--${getThemePrefix()}-icon-${safeName}, var(--${getThemePrefix()}-icon-question))`
        );
      }
      return;
    }
    void this.setIcon();
  }

  protected setIcon() {
    const source = this.iconSource();

    if (source === this.cachedSource) {
      return;
    }

    this.cachedSource = source;

    if (!this.name && !this.url) {
      this.svg = getDefaultIcon();
      return;
    }

    if (this.name) {
      this.svg = parseSvg((this.icons as Record<string, string>)[this.name]) ?? getDefaultIcon();
      return;
    }

    const resolvedUrl = `${this.url}`;
    if (!resolvedUrl) {
      this.svg = getDefaultIcon();
      return;
    }

    let iconResolver = iconCache.get(resolvedUrl);
    if (!iconResolver) {
      iconResolver = this.requestIcon(resolvedUrl);
      iconCache.set(resolvedUrl, iconResolver);
    }

    return this.applyUrlIcon(resolvedUrl, iconResolver);
  }

  protected async applyUrlIcon(resolvedUrl: string, iconResolver: Promise<SVGResult>) {
    const icon = await iconResolver;
    if (icon === RETRYABLE_ERROR) iconCache.delete(resolvedUrl);
    if (resolvedUrl !== this.url) return;
    if (icon === RETRYABLE_ERROR || icon === CACHEABLE_ERROR) {
      this.svg = getDefaultIcon();
      this.emit('icon-error', { detail: { status: icon === RETRYABLE_ERROR ? 503 : 500 } });
      return;
    }
    this.svg = icon;
    this.emit('icon-load');
  }

  protected iconSource(): string {
    if (this.name) {
      return `name:${this.name}`;
    }

    if (this.url) {
      return `url:${this.url}`;
    }

    return 'default';
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
    if (this.maskMode) {
      this.iconBase?.querySelector('[part="svg"]')?.remove();
      return;
    }

    const shouldSyncSvg = changedProperties.has('svg') || changedProperties.has('renderMode');

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
    const base = this.iconBase;
    if (!base) {
      return;
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
  }
}

let defaultIcon: SVGSVGElement | undefined;
function getDefaultIcon(): SVGSVGElement {
  if (!defaultIcon)
    defaultIcon = parseSvg(project.iconSet.question) ?? document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  return defaultIcon;
}

export default CoreIcon;
