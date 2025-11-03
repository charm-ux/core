import { describe, expect, test } from 'vitest';
import chroma from 'chroma-js';
import { createVariations } from '../color-generator.js';

describe('createVariations', () => {
  test('generates 11 variations including black, white, and base color', () => {
    const variations = createVariations({ value: '#54F75E' });

    expect(Object.keys(variations)).toHaveLength(13);
    expect(variations[0]).toBe('hsl(0,0%,100%)');
    expect(variations[500]).toBe(chroma('#54F75E').css('hsl'));
    expect(variations[1000]).toBe('hsl(0,0%,0%)');
  });

  test('generates a different hue of the variations when `hueAdjustment` is changed', () => {
    const variations = createVariations({ value: '#54F75E' });
    const newVariations = createVariations({ value: '#54F75E', hueAdjustment: 15 });

    for (const key in variations) {
      if (key !== '0' && key !== '500' && key !== '1000') {
        expect(variations[key]).not.toBe(newVariations[key]);
        expect(chroma(variations[key]).hsl()[0]).toBeLessThan(chroma(newVariations[key]).hsl()[0]);
      } else {
        expect(variations[key]).toBe(newVariations[key]);
      }
    }
  });

  test('generates a different saturation of the variations when `saturationAdjustment` is changed', () => {
    const variations = createVariations({ value: '#54F75E' });
    const newVariations = createVariations({ value: '#54F75E', saturationAdjustment: 15 });

    for (const key in variations) {
      if (key !== '0' && key !== '500' && key !== '1000') {
        expect(variations[key]).not.toBe(newVariations[key]);
        expect(chroma(variations[key]).hsl()[1]).toBeLessThan(chroma(newVariations[key]).hsl()[1]);
      } else {
        expect(variations[key]).toBe(newVariations[key]);
      }
    }
  });

  test('generates a lighter shade of the darkest variation when `lightnessMax` is increased', () => {
    const variations = createVariations({ value: '#54F75E' });
    const lighterVariations = createVariations({ value: '#54F75E', lightnessMin: 10 });
    const originalLightness = chroma(variations[950]).hsl()[2];
    const newLightness = chroma(lighterVariations[950]).hsl()[2];

    expect(newLightness).toBeGreaterThan(originalLightness);
  });

  test('generates a darker shade of the lightest variation when `lightnessMin` is increased', () => {
    const variations = createVariations({ value: '#54F75E' });
    const darkerVariations = createVariations({ value: '#54F75E', lightnessMax: 90 });
    const originalLightness = chroma(variations[50]).hsl()[2];
    const newLightness = chroma(darkerVariations[50]).hsl()[2];

    expect(newLightness).toBeLessThan(originalLightness);
  });
});
