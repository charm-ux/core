// src/generator/generateReset.ts

/**
 * Options for CSS reset generation.
 */
export type ResetOptions = {
  /** CSS variable prefix (default: 'charm') */
  prefix?: string;
  /** Wrap reset in @layer directive (default: false) */
  useLayers?: boolean;
  /** Include normalize.css-style resets (default: true) */
  includeNormalize?: boolean;
};

/**
 * Generate a CSS reset that references design tokens.
 *
 * The generated reset:
 * - Uses box-sizing: border-box universally
 * - Removes default margins
 * - Sets sensible typography defaults
 * - References semantic tokens for body, links, focus, etc.
 *
 * @param options - Reset generation options
 * @returns CSS reset string
 *
 * @example
 * ```ts
 * const reset = generateReset({ prefix: 'charm' });
 * // *,
 * // *::before,
 * // *::after {
 * //   box-sizing: border-box;
 * // }
 * // ...
 * ```
 */
export function generateReset(options: ResetOptions = {}): string {
  const prefix = options.prefix ?? 'charm';

  const reset = `
*,
*::before,
*::after {
  box-sizing: border-box;
}

* {
  margin: 0;
}

html {
  line-height: 1.5;
  -webkit-text-size-adjust: 100%;
  -moz-tab-size: 4;
  tab-size: 4;
}

body {
  margin: 0;
  line-height: inherit;
  font-family: var(--${prefix}-body-font-family, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif);
  font-size: var(--${prefix}-body-font-size, 1rem);
  font-weight: var(--${prefix}-body-font-weight, 400);
  line-height: var(--${prefix}-body-line-height, 1.5);
  color: var(--${prefix}-body-foreground-color, inherit);
  background-color: var(--${prefix}-body-background-color, inherit);
}

img,
picture,
video,
canvas,
svg {
  display: block;
  max-width: 100%;
}

input,
button,
textarea,
select {
  font: inherit;
}

p,
h1,
h2,
h3,
h4,
h5,
h6 {
  overflow-wrap: break-word;
}

h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: var(--${prefix}-heading-font-family, inherit);
  font-weight: var(--${prefix}-heading-font-weight, 600);
  line-height: var(--${prefix}-heading-line-height, 1.25);
  color: var(--${prefix}-heading-foreground-color, inherit);
}

a {
  color: var(--${prefix}-link-foreground-color, inherit);
  text-decoration: var(--${prefix}-link-decoration, none);
}

a:hover {
  color: var(--${prefix}-link-hover-foreground-color, inherit);
  text-decoration: var(--${prefix}-link-hover-decoration, underline);
}

a:focus-visible {
  color: var(--${prefix}-link-focus-foreground-color, inherit);
  text-decoration: var(--${prefix}-link-focus-decoration, underline);
}

a:active {
  color: var(--${prefix}-link-active-foreground-color, inherit);
}

:focus-visible {
  outline: var(--${prefix}-focus-outline-width, 2px) var(--${prefix}-focus-outline-style, solid) var(--${prefix}-focus-outline-color, currentColor);
  outline-offset: var(--${prefix}-focus-outline-offset, 2px);
}

button {
  cursor: pointer;
  background: transparent;
  border: none;
}

button:disabled {
  cursor: not-allowed;
}

ul,
ol {
  padding-left: 1.5em;
}

ul[role="list"],
ol[role="list"] {
  list-style: none;
  padding-left: 0;
}

table {
  border-collapse: collapse;
  border-spacing: 0;
}

hr {
  height: 0;
  color: inherit;
  border-top-width: 1px;
}

abbr[title] {
  text-decoration: underline dotted;
}

b,
strong {
  font-weight: bolder;
}

code,
kbd,
samp,
pre {
  font-family: var(--${prefix}-font-family-mono, ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace);
  font-size: 0.875em;
}

small {
  font-size: 80%;
}

sub,
sup {
  font-size: 75%;
  line-height: 0;
  position: relative;
  vertical-align: baseline;
}

sub {
  bottom: -0.25em;
}

sup {
  top: -0.5em;
}

fieldset {
  margin: 0;
  padding: 0;
  border: none;
}

legend {
  padding: 0;
}

progress {
  vertical-align: baseline;
}

::-webkit-inner-spin-button,
::-webkit-outer-spin-button {
  height: auto;
}

[type="search"] {
  -webkit-appearance: textfield;
  outline-offset: -2px;
}

::-webkit-search-decoration {
  -webkit-appearance: none;
}

::-webkit-file-upload-button {
  -webkit-appearance: button;
  font: inherit;
}

summary {
  display: list-item;
}

[hidden] {
  display: none !important;
}
`.trim();

  if (options.useLayers) {
    return `@layer reset {\n${reset}\n}`;
  }

  return reset;
}

/**
 * Generate minimal reset focusing only on box-sizing and margins.
 */
export function generateMinimalReset(): string {
  return `
*,
*::before,
*::after {
  box-sizing: border-box;
}

* {
  margin: 0;
}
`.trim();
}
