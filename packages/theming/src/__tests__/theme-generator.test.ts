import { describe, expect, test } from 'vitest';
import { getThemeFileContents, makeThemeContent } from '../theme-generator.js';
import { toKebabCase } from '../utilities.js';
import { basicTokens, themedTokens } from './test-data.js';

describe('camelToKebab', () => {
  test('converts strings to kebab-case', () => {
    const camel = toKebabCase('helloWorld');
    const pascal = toKebabCase('HelloWorld');
    const title = toKebabCase('Hello World');
    const expected = 'hello-world';

    expect(camel).toBe(expected);
    expect(pascal).toBe(expected);
    expect(title).toBe(expected);
  });
});

describe('makeThemeContent', () => {
  test('creates tokens with prefix', () => {
    const { baseTheme } = makeThemeContent(basicTokens, 'ch');
    const someHavePrefix = baseTheme.split('\n').some(x => x.startsWith('--ch-'));
    const someDoNotHavePrefix = baseTheme.split('\n').some(x => !x.startsWith('--ch-'));

    expect(someHavePrefix).toBe(true);
    expect(someDoNotHavePrefix).toBe(true);
  });

  test('creates separate tokens for the light and dark themes', () => {
    const { lightTheme, darkTheme } = makeThemeContent(themedTokens);

    expect(lightTheme.split('\n').length).toBe(26);
    expect(darkTheme.split('\n').length).toBe(26);
  });

  test('creates tokens with prefix for light and dark themes', () => {
    const { lightTheme } = makeThemeContent(themedTokens, 'ch');

    expect(lightTheme.includes('--ch-color-primary-100')).toBe(true);
    expect(lightTheme.includes('--body-bg-color')).toBe(true);
  });
});

describe('getThemeFileContents', () => {
  test('creates default config if no config is passed to it', () => {
    const { baseTheme } = getThemeFileContents();

    expect(baseTheme.includes(':is(:root, :host)')).toBe(true);
    expect(baseTheme.includes('--body-bg-color: inherit;')).toBe(true);
    expect(
      baseTheme.includes(
        '--default-border: var(--default-border-size) var(--default-border-color) var(--default-border-style);'
      )
    ).toBe(true);
  });

  test('creates CSS file content for light and dark themes only', () => {
    const options = {
      tokens: themedTokens,
    };

    const { baseTheme, darkTheme, selectorTheme } = getThemeFileContents(options);

    expect(baseTheme.includes(':is(:root, :host)')).toBe(true);
    expect(baseTheme.includes('--body-bg-color: white;')).toBe(true);
    expect(darkTheme.includes('--body-bg-color: black;')).toBe(true);
    expect(darkTheme.includes('@media (prefers-color-scheme: dark)')).toBe(true);
    expect(selectorTheme).toBe('');
  });

  test('creates CSS file content for light, dark, and selector themes', () => {
    const options = {
      tokens: themedTokens,
      lightThemeSelector: '.light-theme',
      darkThemeSelector: '.dark-theme',
    };

    const { baseTheme, darkTheme, selectorTheme } = getThemeFileContents(options);

    expect(baseTheme.includes(':is(:root, :host)')).toBe(true);
    expect(darkTheme.includes('@media (prefers-color-scheme: dark)')).toBe(true);
    expect(selectorTheme?.includes('.light-theme') && selectorTheme?.includes('.dark-theme')).toBe(true);
  });

  test('creates color, alternative color, and alpha tokens for each color', () => {
    const options = {
      tokens: basicTokens,
    };

    const { baseTheme } = getThemeFileContents(options);

    expect(baseTheme?.includes('--color-gray-200: rgba(225,225,225,var(--color-gray-200-alpha));')).toBe(true);
    expect(baseTheme?.includes('--color-gray-200-alpha: 1;')).toBe(true);
    expect(baseTheme?.includes('--color-gray-200-alt: black;')).toBe(true);
  });

  test('creates color palette based on base colors', () => {
    const options = {
      neutralColor: 'neutral',

      tokens: {
        primitives: {
          color: {
            primary: '#0f6cbd',
            danger: '#C50F1F',
            neutral: '#808080',
          },
        },
      },
    };

    const { baseTheme } = getThemeFileContents(options);

    expect(baseTheme?.includes('--color-primary-100: rgba(198,226,251,var(--color-primary-100-alpha));')).toBe(true);
    expect(baseTheme?.includes('--color-danger-950: rgba(19,1,3,var(--color-danger-950-alpha));')).toBe(true);
    expect(baseTheme?.includes('--color-neutral-1000: rgba(0,0,0,var(--color-neutral-1000-alpha));')).toBe(true);
  });
});
