/**
 * Custom Elements Manifest tooling for normalizing the CSS custom property prefix.
 *
 * Components document their CSS custom properties via `@cssproperty` JSDoc tags, but
 * those names are inconsistently prefixed in source. At runtime every variable is
 * emitted with the active theme prefix (default `--charm-`, see
 * `@charm-ux/theming` `cssVar.ts`). This module rewrites the `cssProperties[].name`
 * entries in a manifest so the documented names match the theme's prefix.
 *
 * Exposes both a standalone transform (`applyThemePrefix`) that operates on a parsed
 * `custom-elements.json`, and an analyzer plugin (`cssPrefixPlugin`) that applies the
 * same transform during `cem analyze`.
 */

import { charmDefinition } from '@charm-ux/theming/themes';

/** The default CSS custom property prefix used by Charm components (`--charm-...`). */
export const DEFAULT_PREFIX = 'charm';

/**
 * Matches any single leading prefix segment in a custom property body, i.e. the
 * `xxxx` in `--xxxx-...`. Use this as
 * `defaultPrefix` when the incoming prefix is unknown and varies per project.
 *
 * Caveat: this cannot distinguish a real prefix from a genuine first segment, so
 * `--form-control-bg-color` would become `--{prefix}-control-bg-color`. Only use
 * it when every name is known to carry a prefix. Single-segment names such as
 * `--gap` have no leading `xxxx-` and are left for the target prefix to be added.
 */
export const ANY_PREFIX = /^[^-]+-/;

type DefaultPrefix = string | string[] | RegExp;

interface PrefixOptions {
  prefix: string;
  defaultPrefix?: DefaultPrefix;
}

/**
 * Strip a leading prefix from a CSS custom property body (the name minus `--`).
 *
 * @param {string} body
 * @param {DefaultPrefix} defaultPrefix
 * @returns {string}
 */
function stripKnownPrefix(body: string, defaultPrefix: DefaultPrefix): string {
  if (defaultPrefix instanceof RegExp) {
    // Treat the pattern as a prefix matcher: anchor it to the start and drop the
    // `g` flag so matching is stateless and never strips from the middle.
    const source = defaultPrefix.source.startsWith('^') ? defaultPrefix.source : `^(?:${defaultPrefix.source})`;
    const anchored = new RegExp(source, defaultPrefix.flags.replace('g', ''));
    return body.replace(anchored, '');
  }

  const knownPrefixes = Array.isArray(defaultPrefix) ? defaultPrefix : [defaultPrefix];
  const matched = knownPrefixes.find(p => p && body.startsWith(`${p}-`));
  return matched ? body.slice(matched.length + 1) : body;
}

/**
 * Rewrite a single CSS custom property name so it carries `prefix`.
 *
 * Strips a leading prefix matched by `defaultPrefix`, then applies `--{prefix}-` to
 * the remaining body. Names already starting with `--{prefix}-` are returned
 * unchanged (the transform is idempotent), and values that are not custom
 * properties (missing the leading `--`) are left untouched.
 *
 * @param {string} name
 * @param {PrefixOptions} options
 * @returns {string}
 */
export function rewriteCssVarName(name: string, { prefix, defaultPrefix = ANY_PREFIX }: PrefixOptions): string {
  if (typeof name !== 'string' || !name.startsWith('--')) {
    return name;
  }

  // Already normalized to the target prefix — keep the transform idempotent.
  if (prefix && name.startsWith(`--${prefix}-`)) {
    return name;
  }

  const body = stripKnownPrefix(name.slice(2), defaultPrefix);

  return prefix ? `--${prefix}-${body}` : `--${body}`;
}

interface CssProperty {
  name?: string;
}
interface ManifestDeclaration {
  cssProperties?: CssProperty[];
}
interface ManifestModule {
  declarations?: ManifestDeclaration[];
}
interface CustomElementsManifest {
  modules?: ManifestModule[];
}

/**
 * Rewrite every `cssProperties[].name` in a Custom Elements Manifest so it carries
 * the theme prefix. Mutates `manifest` in place (matching the analyzer's plugin
 * contract) and returns the number of names that changed.
 *
 * @param {CustomElementsManifest} manifest - Parsed `custom-elements.json`.
 * @param {PrefixOptions} options
 * @returns {number} Count of renamed CSS custom properties.
 */
export function applyThemePrefix(
  manifest: CustomElementsManifest | null | undefined,
  { prefix, defaultPrefix = ANY_PREFIX }: PrefixOptions
): number {
  if (!manifest || !Array.isArray(manifest.modules)) {
    return 0;
  }

  let changed = 0;
  for (const mod of manifest.modules) {
    const declarations = mod?.declarations;
    if (!Array.isArray(declarations)) continue;

    for (const declaration of declarations) {
      const cssProperties = declaration?.cssProperties;
      if (!Array.isArray(cssProperties)) continue;

      for (const cssProperty of cssProperties) {
        if (!cssProperty || typeof cssProperty.name !== 'string') continue;

        const next = rewriteCssVarName(cssProperty.name, { prefix, defaultPrefix });
        if (next !== cssProperty.name) {
          cssProperty.name = next;
          changed += 1;
        }
      }
    }
  }

  return changed;
}

interface CssPrefixPluginOptions {
  prefix?: string;
  defaultPrefix?: DefaultPrefix;
}

/**
 * Custom Elements Manifest analyzer plugin that normalizes every documented CSS
 * custom property name to the theme prefix. Runs during `packageLinkPhase` so it
 * sees the fully linked manifest (including inherited `cssProperties`).
 *
 * Register it in `custom-elements-manifest.config.mjs` before `cemSorterPlugin` so
 * the finalized names are the ones that get sorted.
 *
 * @param {CssPrefixPluginOptions} [options]
 * @returns {{ name: string, packageLinkPhase: (params: { customElementsManifest: CustomElementsManifest }) => void }}
 */
export function cssPrefixPlugin(options: CssPrefixPluginOptions = {}) {
  const { prefix = charmDefinition.prefix ?? DEFAULT_PREFIX, defaultPrefix = ANY_PREFIX } = options;

  return {
    name: 'charm-css-prefix',
    packageLinkPhase({ customElementsManifest }: { customElementsManifest: CustomElementsManifest }) {
      applyThemePrefix(customElementsManifest, { prefix, defaultPrefix });
    },
  };
}
