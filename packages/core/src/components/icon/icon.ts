import { html } from 'lit/static-html.js';
import { property, state } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
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

  @state()
  protected svg = '';

  protected icons = project.iconSet;
  protected cachedUrl?: string;
  protected defaultIcon = this.icons['question'];

  protected override async willUpdate() {
    await this.setIcon();
  }

  protected async setIcon() {
    // If no name or url is set, use the default icon.
    if (!this.name && !this.url) {
      this.svg = this.defaultIcon;
      return;
    }

    // If a name is set, use the default icons.
    if (this.name) {
      this.svg = (this.icons as any)[this.name] || this.defaultIcon;
      return;
    }

    // If the url hasn't changed, don't fetch it again.
    if (this.cachedUrl === this.url) return;

    this.cachedUrl = `${this.url}`;

    try {
      const file = await this.requestIcon(this.cachedUrl)!;

      if (this.cachedUrl !== this.url) {
        // If the url has changed while fetching the icon, ignore this request.
        return;
      } else if (file.ok) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(file.svg, 'text/html');
        const svgEl = doc.body.querySelector('svg');

        if (svgEl) {
          this.svg = svgEl.outerHTML;
          this.emit('icon-load');
        } else {
          this.svg = '';
          this.emit('icon-error', { detail: { status: file.status } });
        }
      } else {
        this.svg = '';
        this.emit('icon-error', { detail: { status: file.status } });
      }
    } catch (e) {
      this.svg = this.defaultIcon;
      this.emit('icon-error', { detail: { status: -1 } });
    }
  }

  protected requestIcon(url: string) {
    return fetch(url).then(async response => {
      if (response.ok) {
        const div = document.createElement('div');
        div.innerHTML = await response.text();
        const svg = div.firstElementChild;

        return {
          ok: response.ok,
          status: response.status,
          svg: svg && svg.tagName.toLowerCase() === 'svg' ? svg.outerHTML : '',
        };
      } else {
        return {
          ok: response.ok,
          status: response.status,
          svg: null,
        };
      }
    }) as Promise<IconResponse>;
  }

  protected override render() {
    return this.iconTemplate();
  }

  /** Generates the icon template. */
  protected iconTemplate() {
    return html`
      <span class="visually-hidden">${this.label}</span>
      <span part="icon-base" aria-hidden="true"> ${unsafeSVG(this.svg)} </span>
    `;
  }
}

export default CoreIcon;
