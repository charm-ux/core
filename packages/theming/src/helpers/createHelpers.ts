import { cssVar, type CssVarOptions } from './cssVar.js';
import type {
  PrimitiveTokens,
  ColorKeys,
  SpacingKeys,
  BorderRadiusKeys,
  BorderWidthKeys,
  ShadowKeys,
  DurationKeys,
  TimingFunctionKeys,
  ZIndexKeys,
  TypographySubKeys,
  TypedRefFn,
} from '../types/index.js';

/**
 * Type-safe helper functions for referencing primitive tokens as CSS variable strings.
 * Used for non-Lit contexts where plain strings are needed instead of CSSResult.
 *
 * @template P - The primitive tokens type for type-safe key inference
 */
export type TokenHelpers<P extends PrimitiveTokens = PrimitiveTokens> = {
  /** Reference a color token, optionally with a palette step */
  color: (name: ColorKeys<P>, step?: string | number) => string;
  /** Reference a spacing token */
  spacing: (name: SpacingKeys<P>) => string;
  /** Reference a border radius token */
  borderRadius: (name: BorderRadiusKeys<P>) => string;
  /** Reference a border width token */
  borderWidth: (name: BorderWidthKeys<P>) => string;
  /** Reference a shadow token */
  shadow: (name: ShadowKeys<P>) => string;
  /** Reference a font family token */
  fontFamily: (name: TypographySubKeys<P, 'fontFamily'>) => string;
  /** Reference a font size token */
  fontSize: (name: TypographySubKeys<P, 'fontSize'>) => string;
  /** Reference a font weight token */
  fontWeight: (name: TypographySubKeys<P, 'fontWeight'>) => string;
  /** Reference a line height token */
  lineHeight: (name: TypographySubKeys<P, 'lineHeight'>) => string;
  /** Reference a letter spacing token */
  letterSpacing: (name: TypographySubKeys<P, 'letterSpacing'>) => string;
  /** Reference a duration token */
  duration: (name: DurationKeys<P>) => string;
  /** Reference a timing function (easing) token */
  timingFunction: (name: TimingFunctionKeys<P>) => string;
  /** Reference a z-index token */
  zIndex: (name: ZIndexKeys<P>) => string;
  /** Generic ref function for arbitrary token paths */
  ref: TypedRefFn<P>;
};

/** Options for creating token helpers */
export type CreateHelpersOptions = CssVarOptions;

/**
 * Create runtime helper functions from primitive tokens.
 *
 * @param _primitives - The primitive tokens object (used for type inference)
 * @param options - Configuration options including prefix
 * @returns Helper functions for referencing tokens as CSS variables
 */
export function createHelpers<P extends PrimitiveTokens>(
  _primitives: P,
  options: CreateHelpersOptions = {}
): TokenHelpers<P> {
  const makeVar = (...segments: (string | number)[]) => cssVar(...segments, options);

  return {
    color: (name, step) => (step !== undefined ? makeVar('color', name, step) : makeVar('color', name)),

    spacing: name => makeVar('spacing', name),

    borderRadius: name => makeVar('border-radius', name),

    borderWidth: name => makeVar('border-width', name),

    shadow: name => makeVar('shadow', name),

    fontFamily: name => makeVar('font-family', name),

    fontSize: name => makeVar('font-size', name),

    fontWeight: name => makeVar('font-weight', name),

    lineHeight: name => makeVar('line-height', name),

    letterSpacing: name => makeVar('letter-spacing', name),

    duration: name => makeVar('duration', name),

    timingFunction: name => makeVar('timing-function', name),

    zIndex: name => makeVar('z-index', name),

    ref: ((...segments: (string | number)[]) => {
      return makeVar(...segments);
    }) as TypedRefFn<P>,
  };
}
