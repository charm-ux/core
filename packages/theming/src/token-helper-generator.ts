import { ThemeConfiguration } from './types.js';
import { isNumber, toKebabCase, toPascalCase } from './utilities.js';

export function getHelperTemplate(name: string, values: object, tokenPrefix?: string, userConfig?: ThemeConfiguration) {
  const prefix = `--${tokenPrefix ? tokenPrefix + '-' : ''}`;

  switch (name) {
    case 'duration':
      return durationTemplate(values, prefix);
    case 'borderRadius':
      return borderRadiusTemplate(values, prefix);
    case 'borderWidth':
      return borderWidthTemplate(values, prefix);
    case 'color':
      return colorTemplate(values, prefix, userConfig);
    case 'containerQuery':
      return containerQueryTemplate(values, prefix);
    case 'fontFamily':
      return fontFamilyTemplate(values, prefix);
    case 'fontSize':
      return fontSizeTemplate(values, prefix);
    case 'fontWeight':
      return fontWeightsTemplate(values, prefix);
    case 'lineHeight':
      return lineHeightsTemplate(values, prefix);
    case 'mediaQuery':
      return mediaQueryTemplate(values, prefix);
    case 'shadow':
      return shadowTemplate(values, prefix);
    case 'spacing':
      return spacingTemplate(values, prefix);
    case 'zIndex':
      return zIndexTemplate(values, prefix);
    default:
      return '';
  }
}

export function getGlobalTokenHelpers() {
  return `
/**
 * Returns CSS variable for default border
 * @param {color | size | style} [token] - Identifies a specific token. Omitting this parameter will return the entire border token.
 * @returns {string} The value of the border token
 */
export function defaultBorder(token) {
  return unsafeCSS(\`var(--default-border\${token ? '-' + token : ''})\`);
}
`;
}

function durationTemplate(values: object, prefix?: string) {
  return `
/** 
 * Returns CSS variable for animation token 
 * @param {${Object.keys(values)
   .map(x => formatValue(x))
   .join(' | ')}} name - The name of the animation
  */
export function animation(name) {
  return unsafeCSS(\`var(${prefix}duration-\${name})\`);
}
`;
}

function borderRadiusTemplate(values: object, prefix?: string) {
  return `
/** 
 * Returns CSS variable for border radius token 
 * @param {${Object.keys(values)
   .map(x => formatValue(x))
   .join(' | ')}} name - The name of the border radius
  */   
export function borderRadius(name) {
  return unsafeCSS(\`var(${prefix}border-radius-\${name})\`);
}
`;
}

function borderWidthTemplate(values: object, prefix?: string) {
  return `
/** 
 * Returns CSS variable for border width token 
 * @param {${Object.keys(values)
   .map(x => formatValue(x))
   .join(' | ')}} name - The name of the border width
  */
export function borderWidth(name) {
  return unsafeCSS(\`var(${prefix}border-width-\${name})\`);
}
`;
}

function colorTemplate(values: object, prefix?: string, userConfig?: ThemeConfiguration) {
  const standardColors = Object.keys(values || {})?.filter(x => !userConfig?.uniquePalettes?.includes(x));
  const standardVariations = Object.keys((values as any)[standardColors[0]]);
  if (userConfig?.neutralColor && !userConfig.uniquePalettes?.includes(userConfig.neutralColor)) {
    (userConfig.uniquePalettes = userConfig.uniquePalettes || [])?.push(userConfig.neutralColor);
  }

  return (
    `
/** 
* Returns CSS variable for value in color palette 
* @param {${standardColors.map(x => `'${x}'`).join(' | ')}} name - The name of the color
* @param {${standardVariations.map(x => formatValue(x)).join(' | ')}} variation - The variation of the color
*/
export function color(name, variation) {
  return unsafeCSS(\`var(${prefix}color-\${name}-\${variation})\`);
}

${
  userConfig?.skipAltColorGeneration
    ? ''
    : `
/** 
* Returns CSS variable for for the alternative value for a color in the palette 
* @param {${standardColors.map(x => `'${x}'`).join(' | ')}} name - The name of the color
* @param {${standardVariations.map(x => formatValue(x)).join(' | ')}} variation - The variation of the color
*/
export function altColor(name, variation) {
  return unsafeCSS(\`var(${prefix}color-\${name}-\${variation}-alt)\`);
}`
}

${
  userConfig?.skipAlphaColorGeneration
    ? ''
    : `
/** 
* Returns CSS variable for the alpha value in color palette 
* @param {${standardColors.map(x => `'${x}'`).join(' | ')}} name - The name of the color
* @param {${standardVariations.map(x => formatValue(x)).join(' | ')}} variation - The variation of the color
*/
export function colorAlpha(name, variation) {
  return unsafeCSS(\`var(${prefix}color-\${name}-\${variation}-alpha)\`);
}

/** 
* Sets the alpha value for a color in color palette 
* @param {${standardColors.map(x => `'${x}'`).join(' | ')}} name - The name of the color
* @param {${standardVariations.map(x => formatValue(x)).join(' | ')}} variation - The variation of the color
* @param {number} alpha - The alpha value to set
*/
export function setColorAlpha(name, variation, alpha) {
  return unsafeCSS(\`${prefix}color-\${name}-\${variation}-alpha: \${alpha};\`);
}`
}
` +
    (!userConfig?.uniquePalettes?.length
      ? ''
      : userConfig.uniquePalettes
          .map(color => {
            return `
/** 
* Returns CSS variable for a value in "${color}" palette 
* @param {${Object.keys((values as any)[color] || {})
              .map(x => formatValue(x))
              .join(' | ')}} variation - The variation of the neutral color
*/
export function ${color}Color(variation) {
  return unsafeCSS(\`var(${prefix}color-${color}-\${variation})\`);
}

${
  userConfig?.skipAltColorGeneration
    ? ''
    : `
/** 
* Returns CSS variable for value for the alternative color in "${color}" palette 
* @param {${Object.keys((values as any)[color] || {})
        .map(x => formatValue(x))
        .join(' | ')}} variation - The variation of the neutral color
*/
export function ${color}AltColor(variation) {
  return unsafeCSS(\`var(${prefix}color-${color}-\${variation}-alt)\`);
}`
}

${
  userConfig?.skipAlphaColorGeneration
    ? ''
    : `
/** 
* Returns CSS variable for the alpha value in "${color}" palette 
* @param {${Object.keys((values as any)[color] || {})
        .map(x => formatValue(x))
        .join(' | ')}} variation - The variation of the neutral color
*/
export function ${color}ColorAlpha(variation) {
  return unsafeCSS(\`var(${prefix}color-${color}-\${variation}-alpha)\`);
}

/** 
* Sets the alpha value for a "${color}" color in color palette 
* @param {${Object.keys((values as any)[color] || {})
        .map(x => formatValue(x))
        .join(' | ')}} variation - The variation of the "${color}" color
* @param {number} alpha - The alpha value to set
*/
export function set${toPascalCase(color)}ColorAlpha(variation, alpha) {
  return unsafeCSS(\`${prefix}color-${color}-\${variation}-alpha: \${alpha};\`);
}`
}
`;
          })
          .join('\n'))
  );
}

function containerQueryTemplate(values: object, prefix?: string) {
  return `
/** 
 * Returns value of container queries 
 * @param {${Object.keys(values)
   .map(x => formatValue(x))
   .join(' | ')}} name - The name of the container query
  */
export function containerQuery(name) {
  const value = ${JSON.stringify(values)}[name];
  return unsafeCSS(\`\${value}\`);
}

/** 
 * Creates CSS container query block based on defined sizes 
 * @param {${Object.keys(values)
   .map(x => formatValue(x))
   .join(' | ')}} name - The name of the container query
  * @param {CSSResult} styles - The styles to apply
  */
export function containerQueryBlock(name, styles) {
  return unsafeCSS(\`@container (max-width: \${containerQuery(name)}) {
    \${styles}
  }\`);
}
`;
}

function fontFamilyTemplate(values: object, prefix?: string) {
  return `
/** 
 * Returns CSS variable for font family token 
 * @param {${Object.keys(values)
   .map(x => formatValue(x))
   .join(' | ')}} name - The name of the font family
  */
export function fontFamily(name) {
  return unsafeCSS(\`var(${prefix}font-family-\${name})\`);
}
`;
}

function fontSizeTemplate(values: object, prefix?: string) {
  return `
/** 
 * Returns CSS variable for font size token 
 * @param {${Object.keys(values)
   .map(x => formatValue(x))
   .join(' | ')}} name - The name of the font size
  */
export function fontSize(name) {
  return unsafeCSS(\`var(${prefix}font-size-\${name})\`);
}
`;
}

function fontWeightsTemplate(values: object, prefix?: string) {
  return `
/** 
 * Returns CSS variable for font weight token 
 * @param {${Object.keys(values)
   .map(x => formatValue(x))
   .join(' | ')}} name - The name of the font weight
  */
export function fontWeight(name) {
  return unsafeCSS(\`var(${prefix}font-weight-\${name})\`);
}
`;
}

function lineHeightsTemplate(values: object, prefix?: string) {
  return `
/** 
 * Returns CSS variable for line height token 
 * @param {${Object.keys(values)
   .map(x => formatValue(x))
   .join(' | ')}} name - The name of the line height
  */
export function lineHeight(name) {
  return unsafeCSS(\`var(${prefix}line-height-\${name})\`);
}
`;
}

function mediaQueryTemplate(values: object, prefix?: string) {
  return `
/** 
 * Returns value of media queries 
 * @param {${Object.keys(values)
   .map(x => formatValue(x))
   .join(' | ')}} name - The name of the media query
  */
export function mediaQuery(name) {
  const value = ${JSON.stringify(values)}[name];
  return unsafeCSS(\`\${value}\`);
}

/** 
 * Creates CSS media query block based on defined sizes 
 * @param {${Object.keys(values)
   .map(x => formatValue(x))
   .join(' | ')}} name - The name of the media query
  * @param {CSSResult} styles - The styles to apply
  */
export function mediaQueryBlock(name, styles) {
  return unsafeCSS(\`@media (max-width:\${mediaQuery(name)}) {
    \${styles}
  }\`);
}
`;
}

function shadowTemplate(values: object, prefix?: string) {
  return `
/** 
 * Returns CSS variable for spacing token 
 * @param {${Object.keys(values)
   .map(x => formatValue(x))
   .join(' | ')}} name - The name of the spacing
  */
export function shadow(name) {
  return unsafeCSS(\`var(${prefix}shadow-\${name})\`);
}
`;
}

function spacingTemplate(values: object, prefix?: string) {
  return `
/** 
 * Returns CSS variable for spacing token 
 * @param {${Object.keys(values)
   .map(x => formatValue(x))
   .join(' | ')}} name - The name of the spacing
  */
export function spacing(name) {
  return unsafeCSS(\`var(${prefix}spacing-\${name})\`);
}
`;
}

function zIndexTemplate(values: object, prefix?: string) {
  return `
/** 
 * Returns CSS variable for z-index token 
 * @param {${Object.keys(values)
   .map(x => formatValue(x))
   .join(' | ')}} name - The name of the z-index
 */
export function zIndex(name) {
  return unsafeCSS(\`var(${prefix}z-index-\${name})\`);
}
`;
}

function formatValue(value: string | number) {
  return isNumber(value) ? value : `'${toKebabCase(value as string)}'`;
}
