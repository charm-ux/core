import fs from 'fs';
import path from 'path';
import chroma from 'chroma-js';
import * as prettier from 'prettier';
import { defaultConfig } from './default-values.js';
import { getGlobalTokenHelpers, getHelperTemplate } from './token-helper-generator.js';
import baseReset from './base-reset.js';
import { createVariations } from './color-generator.js';
import { addGlobalCssUtilities, generateCssUtilities } from './css-utility-generator.js';
import { getCssValue, mergeDeep, toKebabCase } from './utilities.js';
import type { ThemeConfiguration, ThemeFileContents } from './types.js';

let userConfig: ThemeConfiguration;

export function generateTheme(config: ThemeConfiguration = {}) {
  updateConfig(config);
  createDirectories();
  createCssReset();
  createThemeFiles();
  createTokenHelpers();
}

function updateConfig(config: ThemeConfiguration = {}) {
  userConfig = mergeDeep(defaultConfig, config);
}

function createDirectories() {
  createOutDir(userConfig.outDir);
  if (userConfig.helpersOutDir) {
    createOutDir(userConfig.helpersOutDir);
  }
}

function createTokenHelpers() {
  if (userConfig.skipHelpers) {
    return;
  }

  const tokenHelpers = `
// THIS FILE IS AUTO-GENERATED. DO NOT EDIT. CONTENTS CAN BE CHANGED IN YOUR THEME CONFIG.

import { unsafeCSS } from 'lit';

${makeTokenHelpers(userConfig.tokens?.primitives)}
${userConfig.extendedTokenHelpers || ''}
`;

  saveFile(userConfig.helpersOutDir || userConfig.outDir, userConfig.helpersFileName!, tokenHelpers, 'typescript');
}

function createThemeFiles() {
  const themeFileContents = getThemeFileContents(userConfig);

  themeFileContents.baseTheme && saveFile(userConfig.outDir, userConfig.themeFileName!, themeFileContents.baseTheme);
  themeFileContents.darkTheme &&
    saveFile(userConfig.outDir, userConfig.darkThemeFileName!, themeFileContents.darkTheme);
  themeFileContents.selectorTheme &&
    saveFile(userConfig.outDir, userConfig.selectorThemeFileName!, themeFileContents.selectorTheme);
  themeFileContents.cssUtilities &&
    saveFile(userConfig.outDir, userConfig.cssUtilityClassesFileName!, themeFileContents.cssUtilities);
}

/**
 * Gets the final contents for each of the file types provided by the theme generator
 * @param {ThemeConfiguration} config
 * @returns {ThemeFileContents}
 */
export function getThemeFileContents(config: ThemeConfiguration = {}): ThemeFileContents {
  updateConfig(config);

  const themeFileContent: ThemeFileContents = {
    baseTheme: '',
    lightTheme: '',
    darkTheme: '',
    selectorTheme: '',
    cssUtilities: '',
  };

  const { baseTheme, lightTheme, darkTheme, cssUtilities } = makeThemeContent(userConfig.tokens, config.tokenPrefix);

  if (!config.skipNonSelectorThemes) {
    /** Light theme template */
    themeFileContent.baseTheme = `
/* THIS FILE IS AUTO-GENERATED. DO NOT EDIT. CONTENTS CAN BE CHANGED IN YOUR THEME CONFIG. */

:is(:root, :host) {
  ${baseTheme};
  ${getExtendedContent(userConfig?.extendedTokens)}
  ${lightTheme};
  ${getExtendedContent(userConfig?.extendedLightTokens)}
}`;

    /** Dark theme template */
    themeFileContent.darkTheme = darkTheme
      ? `
/* THIS FILE IS AUTO-GENERATED. DO NOT EDIT. CONTENTS CAN BE CHANGED IN YOUR THEME CONFIG. */

@media (prefers-color-scheme: dark) {
  :is(:root, :host) {
    ${darkTheme.trim()};
    ${getExtendedContent(userConfig?.extendedDarkTokens)}
  }
}`
      : '';
  }

  /** Selector theme template */
  if (config.lightThemeSelector || config.darkThemeSelector) {
    themeFileContent.selectorTheme = `${
      config.lightThemeSelector
        ? `
/* THIS FILE IS AUTO-GENERATED. DO NOT EDIT. CONTENTS CAN BE CHANGED IN YOUR THEME CONFIG. */

/* Shared styles */
${config.lightThemeSelector}, ${config.darkThemeSelector} {
  ${baseTheme}
  ${getExtendedContent(userConfig?.extendedTokens)}
}

/* Light theme styles */
${config.lightThemeSelector} {
  ${lightTheme};
  ${getExtendedContent(userConfig?.extendedLightTokens)}
}`
        : `
/* THIS FILE IS AUTO-GENERATED. DO NOT EDIT. CONTENTS CAN BE CHANGED IN YOUR THEME CONFIG. */

/* Base theme styles */
:is(:root, :host) {
  ${baseTheme};
  ${getExtendedContent(userConfig?.extendedTokens)}
  ${lightTheme};
  ${getExtendedContent(userConfig?.extendedLightTokens)}
}`
    } 

/* Dark theme styles */
${config.darkThemeSelector} {
  ${darkTheme};
  ${getExtendedContent(userConfig?.extendedDarkTokens)}
}`;
  }

  if (cssUtilities) {
    themeFileContent.cssUtilities = addGlobalCssUtilities(cssUtilities, userConfig.extendedCssUtilities);
  }

  return themeFileContent;
}

export function makeTokenHelpers(obj: any) {
  if (!obj) {
    return '';
  }

  const tokenHelpers: string[] = [];

  // add user-defined neutral color to unique palettes to generate the token helpers
  if (userConfig?.neutralColor) {
    userConfig.uniquePalettes = [userConfig.neutralColor];
  }

  for (const key in obj) {
    const helperTemplate = getHelperTemplate(key, obj[key], userConfig?.tokenPrefix, userConfig);

    if (helperTemplate) {
      tokenHelpers.push(helperTemplate);
    }
  }

  tokenHelpers.push(getGlobalTokenHelpers());

  return tokenHelpers.join('\n');
}

/**
 * Generates the theme content for the light and dark themes, helper templates, and utility classes
 * @param obj - The token object
 * @param prefix - The prefix to be used for the token (accumulates as child object are indexed)
 * @param baseThemeResult - The result array for the light theme
 * @param darkThemeResult - The result array for the dark theme
 * @param helperTemplates - The result array for the helper templates
 * @returns
 */
export function makeThemeContent(
  obj: any,
  prefix = '',
  baseThemeResult: string[] = [],
  lightThemeResult: string[] = [],
  darkThemeResult: string[] = [],
  cssUtilities: string[] = [],
  tokenContext = ''
): ThemeFileContents {
  for (const key in obj) {
    const tokenValue = obj[key];

    if (['primitives', 'semantics', 'extendedTokens'].includes(key)) {
      tokenContext = key;
      makeThemeContent(
        tokenValue,
        key === 'primitives' ? prefix : '',
        baseThemeResult,
        lightThemeResult,
        darkThemeResult,
        cssUtilities,
        tokenContext
      );

      continue;
    }

    if (isQueryToken(key)) {
      continue;
    }

    if (needsColorPaletteGeneration(obj, key, tokenContext)) {
      generateColorPalette(tokenValue);
    }

    if (!userConfig?.skipCssUtilityGeneration && tokenContext === 'primitives') {
      generateCssUtilities(key, tokenValue, cssUtilities, prefix);
    }

    addGroupedTokens(key, baseThemeResult);

    const tokenName = `${prefix && prefix + '-'}${toKebabCase(key)}`;
    if (hasChildTokens(tokenValue)) {
      if (hasColorSchemeTokens(tokenValue)) {
        if (isColorToken(prefix)) {
          addColorToken(tokenName, tokenValue.light, lightThemeResult);
          addColorToken(tokenName, tokenValue.dark, darkThemeResult);
          addColorAlphaToken(tokenName, baseThemeResult);
        } else {
          lightThemeResult.push(`--${tokenName}: ${getCssValue(tokenValue.light)}`);
          darkThemeResult.push(`--${tokenName}: ${getCssValue(tokenValue.dark)}`);
        }
      } else {
        makeThemeContent(
          tokenValue,
          tokenName,
          baseThemeResult,
          lightThemeResult,
          darkThemeResult,
          cssUtilities,
          tokenContext
        );
      }
    } else {
      if (isColorToken(prefix)) {
        addColorToken(tokenName, tokenValue, baseThemeResult);
        addColorAlphaToken(tokenName, baseThemeResult);
      } else {
        baseThemeResult.push(`--${tokenName}: ${getCssValue(tokenValue)}`);
      }
    }
  }

  return {
    baseTheme: baseThemeResult.join(';\n'),
    lightTheme: lightThemeResult.join(';\n'),
    darkTheme: darkThemeResult.join(';\n'),
    cssUtilities: cssUtilities.join('\n'),
  };
}

function isQueryToken(key: string) {
  return key === 'containerQuery' || key === 'mediaQuery';
}

function generateColorPalette(colors: any) {
  if (!colors) {
    return;
  }

  for (const colorKey in colors) {
    const palette = createVariations({ value: colors[colorKey] });

    if (colorKey !== userConfig.neutralColor) {
      delete palette[0];
      delete palette[1000];
    }

    colors[colorKey] = palette;
  }
}

function hasChildTokens(token: any) {
  return typeof token === 'object' && token !== null && !Object.keys(token)?.some(x => x === '_$cssResult$');
}

function hasColorSchemeTokens(token: any) {
  return Object.entries(token).some(([k]) => k === 'light' || k === 'dark');
}

function needsColorPaletteGeneration(obj: any, key: string, tokenContext: string) {
  return (
    tokenContext === 'primitives' &&
    key === 'color' &&
    Object.entries(obj[key]).some(([k]) => typeof k === 'string' && typeof obj[key][k] !== 'object')
  );
}

function isColorToken(prefix: string) {
  return prefix.includes('color');
}

function createCssReset() {
  if (userConfig.skipReset) {
    return;
  }

  saveFile(
    userConfig.outDir,
    userConfig.resetFileName!,
    baseReset + '\n' + getExtendedContent(userConfig.extendedResetStyles)
  );
}

function createOutDir(outDir: string = './') {
  if (outDir !== './' && !fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
}

async function saveFile(outDir = './', fileName: string, contents: string, parser: 'css' | 'typescript' = 'css') {
  const outputPath = path.join(outDir, fileName);
  try {
    contents = await prettier.format(contents, { parser });
    fs.writeFileSync(outputPath, contents);
  } catch (error) {
    throw new Error(`Error writing file: ${outputPath}` + error);
  }

  return outputPath;
}

function addColorToken(token: string, value: string, result: string[]) {
  result.push(`--${token}: ${getFormattedColorValue(token, value)}`);

  if (!userConfig?.skipAltColorGeneration) {
    result.push(`--${token}-alt: ${getAlternateColorValue(value)}`);
  }
}

function addColorAlphaToken(tokenName: string, result: string[]) {
  if (!userConfig?.skipAlphaColorGeneration) {
    result.push(`--${tokenName}-alpha: 1`);
  }
}

function addGroupedTokens(key: string, baseThemeResult: string[]) {
  if (key === 'defaultBorder') {
    baseThemeResult.push(
      `--default-border: var(--default-border-size) var(--default-border-color) var(--default-border-style)`
    );
  }

  if (key === 'focusOutline') {
    baseThemeResult.push(
      `--focus-outline: var(--focus-outline-size) var(--focus-outline-color) var(--focus-outline-style)`
    );
  }
}

function getFormattedColorValue(token: string, value: string) {
  if (userConfig?.skipAlphaColorGeneration) {
    return userConfig?.useHsl ? chroma(value).css('hsl') : value;
  }

  const color = chroma(value)
    .alpha(0.05)
    .css(userConfig?.useHsl ? 'hsl' : undefined);
  return color.replace('0.05)', `var(--${token}-alpha))`);
}

function getAlternateColorValue(value: string) {
  const lightContrast = chroma.contrast(value, 'white');
  const darkContrast = chroma.contrast(value, 'black');
  return lightContrast > darkContrast ? 'white' : 'black';
}

function getExtendedContent(content: any) {
  if (!content) {
    return '';
  }

  return typeof content === 'function' ? content.toString() : content;
}
