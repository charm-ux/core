import { describe, expect, test } from 'vitest';
import { getHelperTemplate } from '../token-helper-generator.js';
import { basicTokens, themedTokens } from './test-data.js';

describe('getHelperTemplate', () => {
  test('generates typed color helper function', () => {
    const helper = getHelperTemplate('color', themedTokens.primitives.color);

    expect(helper?.includes(`* @param {'primary' | 'secondary'} name - The name of the color`)).toBe(true);
    expect(helper?.includes(`* @param {100 | 200 | 300 | 400 | 500} variation - The variation of the color`)).toBe(
      true
    );
  });

  test('generates typed color helper function for unique color palettes when `uniquePalettes` is provided', () => {
    const helper = getHelperTemplate('color', basicTokens.primitives.color, '', {
      uniquePalettes: ['gray'],
      tokens: basicTokens,
    });

    expect(
      helper?.includes(
        `@param {100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900} variation - The variation of the color`
      )
    ).toBe(true);
    expect(
      helper?.includes(
        `* @param {100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900} variation - The variation of the "gray" color`
      )
    ).toBe(true);
  });

  test('does not generate neutral palette helper function when it is not found', () => {
    const helper = getHelperTemplate('color', themedTokens.primitives.color);

    expect(helper?.includes('getNeutralColor')).toBe(false);
  });

  test('generates typed container query helper function with a list of container options', () => {
    const helper = getHelperTemplate('containerQuery', basicTokens.primitives.containerQuery);

    expect(helper?.includes(`@param {'sm' | 'md' | 'lg' | 'xl'} name - The name of the container query`)).toBe(true);
    expect(helper?.includes('{"sm":"400px","md":"600px","lg":"800px","xl":"1000px"}[name]')).toBe(true);
  });
});
