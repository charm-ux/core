// THIS FILE IS AUTO-GENERATED. DO NOT EDIT. CONTENTS CAN BE CHANGED IN YOUR THEME CONFIG.

import { unsafeCSS } from "lit";

/**
 * Returns CSS variable for border radius token
 * @param {'none' | 'sm' | 'md' | 'lg' | 'pill' | 'circle'} name - The name of the border radius
 */
export function borderRadius(name) {
  return unsafeCSS(`var(--border-radius-${name})`);
}

/**
 * Returns CSS variable for border width token
 * @param {'none' | 'thin' | 'thick' | 'thicker' | 'thickest'} name - The name of the border width
 */
export function borderWidth(name) {
  return unsafeCSS(`var(--border-width-${name})`);
}

/**
 * Returns CSS variable for value in color palette
 * @param {'primary' | 'danger'} name - The name of the color
 * @param {50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950} variation - The variation of the color
 */
export function color(name, variation) {
  return unsafeCSS(`var(--color-${name}-${variation})`);
}

/**
 * Returns CSS variable for for the alternative value for a color in the palette
 * @param {'primary' | 'danger'} name - The name of the color
 * @param {50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950} variation - The variation of the color
 */
export function altColor(name, variation) {
  return unsafeCSS(`var(--color-${name}-${variation}-alt)`);
}

/**
 * Returns CSS variable for the alpha value in color palette
 * @param {'primary' | 'danger'} name - The name of the color
 * @param {50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950} variation - The variation of the color
 */
export function colorAlpha(name, variation) {
  return unsafeCSS(`var(--color-${name}-${variation}-alpha)`);
}

/**
 * Sets the alpha value for a color in color palette
 * @param {'primary' | 'danger'} name - The name of the color
 * @param {50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950} variation - The variation of the color
 * @param {number} alpha - The alpha value to set
 */
export function setColorAlpha(name, variation, alpha) {
  return unsafeCSS(`--color-${name}-${variation}-alpha: ${alpha};`);
}

/**
 * Returns CSS variable for a value in "neutral" palette
 * @param {0 | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 | 1000} variation - The variation of the neutral color
 */
export function neutralColor(variation) {
  return unsafeCSS(`var(--color-neutral-${variation})`);
}

/**
 * Returns CSS variable for value for the alternative color in "neutral" palette
 * @param {0 | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 | 1000} variation - The variation of the neutral color
 */
export function neutralAltColor(variation) {
  return unsafeCSS(`var(--color-neutral-${variation}-alt)`);
}

/**
 * Returns CSS variable for the alpha value in "neutral" palette
 * @param {0 | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 | 1000} variation - The variation of the neutral color
 */
export function neutralColorAlpha(variation) {
  return unsafeCSS(`var(--color-neutral-${variation}-alpha)`);
}

/**
 * Sets the alpha value for a "neutral" color in color palette
 * @param {0 | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 | 1000} variation - The variation of the "neutral" color
 * @param {number} alpha - The alpha value to set
 */
export function setNeutralColorAlpha(variation, alpha) {
  return unsafeCSS(`--color-neutral-${variation}-alpha: ${alpha};`);
}

/**
 * Returns value of container queries
 * @param {'sm' | 'md' | 'lg' | 'xl'} name - The name of the container query
 */
export function containerQuery(name) {
  const value = { sm: "400px", md: "600px", lg: "800px", xl: "1000px" }[name];
  return unsafeCSS(`${value}`);
}

/**
 * Creates CSS container query block based on defined sizes
 * @param {'sm' | 'md' | 'lg' | 'xl'} name - The name of the container query
 * @param {CSSResult} styles - The styles to apply
 */
export function containerQueryBlock(name, styles) {
  return unsafeCSS(`@container (max-width: ${containerQuery(name)}) {
    ${styles}
  }`);
}

/**
 * Returns CSS variable for animation token
 * @param {'xslow' | 'slow' | 'med' | 'fast' | 'xfast'} name - The name of the animation
 */
export function animation(name) {
  return unsafeCSS(`var(--duration-${name})`);
}

/**
 * Returns CSS variable for font family token
 * @param {'accent' | 'base' | 'monospace'} name - The name of the font family
 */
export function fontFamily(name) {
  return unsafeCSS(`var(--font-family-${name})`);
}

/**
 * Returns CSS variable for font size token
 * @param {'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'} name - The name of the font size
 */
export function fontSize(name) {
  return unsafeCSS(`var(--font-size-${name})`);
}

/**
 * Returns CSS variable for font weight token
 * @param {'regular' | 'medium' | 'semi-bold' | 'bold'} name - The name of the font weight
 */
export function fontWeight(name) {
  return unsafeCSS(`var(--font-weight-${name})`);
}

/**
 * Returns CSS variable for line height token
 * @param {'xs' | 'sm' | 'md' | 'lg'} name - The name of the line height
 */
export function lineHeight(name) {
  return unsafeCSS(`var(--line-height-${name})`);
}

/**
 * Returns value of media queries
 * @param {'sm' | 'md' | 'lg' | 'xl'} name - The name of the media query
 */
export function mediaQuery(name) {
  const value = { sm: "400px", md: "600px", lg: "800px", xl: "1000px" }[name];
  return unsafeCSS(`${value}`);
}

/**
 * Creates CSS media query block based on defined sizes
 * @param {'sm' | 'md' | 'lg' | 'xl'} name - The name of the media query
 * @param {CSSResult} styles - The styles to apply
 */
export function mediaQueryBlock(name, styles) {
  return unsafeCSS(`@media (max-width:${mediaQuery(name)}) {
    ${styles}
  }`);
}

/**
 * Returns CSS variable for spacing token
 * @param {'none' | 'inner' | 'outline' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'} name - The name of the spacing
 */
export function shadow(name) {
  return unsafeCSS(`var(--shadow-${name})`);
}

/**
 * Returns CSS variable for spacing token
 * @param {'none' | '3xs' | 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | '3xl'} name - The name of the spacing
 */
export function spacing(name) {
  return unsafeCSS(`var(--spacing-${name})`);
}

/**
 * Returns CSS variable for default border
 * @param {color | size | style} [token] - Identifies a specific token. Omitting this parameter will return the entire border token.
 * @returns {string} The value of the border token
 */
export function defaultBorder(token) {
  return unsafeCSS(`var(--default-border${token ? "-" + token : ""})`);
}
