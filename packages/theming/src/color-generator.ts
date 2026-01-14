import chroma from 'chroma-js';

const VARIATIONS = [0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950, 1000];
const BASE_VARIATION = 500;

export type PaletteConfiguration = {
  /** the base color for the color variations */
  value: string;
  /** how much (+/-) to adjust the hue per variation */
  hueAdjustment?: number;
  /** how much (+/-) to adjust the saturation per variation */
  saturationAdjustment?: number;
  /** increasing this will make the lighter variations lighter */
  lightnessMin?: number;
  /** increasing this will make the darker variations lighter */
  lightnessMax?: number;
};

type Scale = { [key: string]: number };

/**
 * This function generates a set of color variations based on the base color and the configuration passed in.
 * @param config
 * @returns an object with a key/value pair of the color variations
 */
export function createVariations(config: PaletteConfiguration) {
  if (!config || typeof config.value !== 'string') {
    return {};
  }

  const valueHSL = chroma(config.value).hsl();
  const result: { [key: string]: string } = {};

  // Create hue, saturation, and lightness scales based on configuration
  const hueScale = createHueScale(config.hueAdjustment);
  const saturationScale = createSaturationScale(config.saturationAdjustment);
  const lightnessScale = createLightnessScale(config.lightnessMin, config.lightnessMax, valueHSL[2] * 100);

  VARIATIONS.forEach(variation => {
    const hue = isNaN(valueHSL[0]) ? 0 : valueHSL[0];
    const newH = getPositiveModulo(hue + hueScale[variation], 360);
    const newS = clamp(valueHSL[1] + saturationScale[variation], 0, 100);
    const newL = lightnessScale[variation];

    result[variation] =
      variation === BASE_VARIATION ? chroma(config.value).css('hsl') : chroma.hsl(newH, newS, newL / 100).css('hsl');
  });

  return result;
}

/**
 * Creates a saturation scale based on the VARIATIONS.
 * @param adjustment the amount to adjust the saturation per variation
 * @returns an object with a key/value pair of the saturation variations
 */
export function createSaturationScale(adjustment: number = 0) {
  const index = VARIATIONS.indexOf(BASE_VARIATION);
  const result: Scale = {};

  if (index === -1) {
    throw new Error(`Invalid key value: ${BASE_VARIATION}`);
  }

  VARIATIONS.forEach(variation => {
    const diff = Math.abs(VARIATIONS.indexOf(variation) - index);
    const tweakValue = adjustment ? Math.round((diff + 1) * adjustment * (1 + diff / 10)) / 100 : 0;
    result[variation] = tweakValue > 100 ? 100 : tweakValue;
  });

  return result;
}

/**
 * Creates a hue scale based on the VARIATIONS.
 * @param adjustment the amount to adjust the hue per variation
 * @returns an object with a key/value pair of the hue variations
 */
export function createHueScale(adjustment: number = 0) {
  const index = VARIATIONS.indexOf(BASE_VARIATION);
  const result: Scale = {};

  if (index === -1) {
    throw new Error(`Invalid parameter value: ${stop}`);
  }

  VARIATIONS.map(variation => {
    const diff = Math.abs(VARIATIONS.indexOf(variation) - index);
    const tweakValue = diff * adjustment;
    result[variation] = tweakValue;
  });

  return result;
}

/**
 * Creates a lightness scale based on the VARIATIONS.
 * @param min the minimum lightness value
 * @param max the maximum lightness value
 * @param lightness the base lightness value
 * @returns an object with a key/value pair of the lightness variations
 */
export function createLightnessScale(min: number = 0, max: number = 100, lightness: number) {
  // known variations
  const result: Scale = {
    0: max,
    500: lightness,
    1000: min,
  };

  VARIATIONS.forEach(variation => {
    // skip known variations
    if (variation === 0 || variation === 1000 || variation === BASE_VARIATION) {
      return;
    }

    const diff = Math.abs((variation - BASE_VARIATION) / 100);
    const totalDiff =
      variation < BASE_VARIATION
        ? Math.abs(VARIATIONS.indexOf(BASE_VARIATION) - VARIATIONS.indexOf(VARIATIONS[0])) - 1
        : Math.abs(VARIATIONS.indexOf(BASE_VARIATION) - VARIATIONS.indexOf(VARIATIONS[VARIATIONS.length - 1])) - 1;
    const lightnessAdjustment = variation < BASE_VARIATION ? max - lightness : lightness - min;

    const adjustment =
      variation < BASE_VARIATION
        ? (lightnessAdjustment / totalDiff) * diff + lightness
        : lightness - (lightnessAdjustment / totalDiff) * diff;

    result[variation] = Math.round(adjustment);
  });

  return result;
}

/** Clamps a number between a min and max value */
function clamp(x: number, min: number, max: number) {
  return Math.min(Math.max(x, min), max);
}

/** Creates a modulo result that is always positive */
function getPositiveModulo(x: number, n: number) {
  return Math.abs(x) % Math.abs(n);
}
