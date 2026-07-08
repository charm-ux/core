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

export type TokenHelpers<P extends PrimitiveTokens = PrimitiveTokens> = {
  color: (name: ColorKeys<P>, step?: string | number) => string;
  spacing: (name: SpacingKeys<P>) => string;
  borderRadius: (name: BorderRadiusKeys<P>) => string;
  borderWidth: (name: BorderWidthKeys<P>) => string;
  shadow: (name: ShadowKeys<P>) => string;
  fontFamily: (name: TypographySubKeys<P, 'fontFamily'>) => string;
  fontSize: (name: TypographySubKeys<P, 'fontSize'>) => string;
  fontWeight: (name: TypographySubKeys<P, 'fontWeight'>) => string;
  lineHeight: (name: TypographySubKeys<P, 'lineHeight'>) => string;
  letterSpacing: (name: TypographySubKeys<P, 'letterSpacing'>) => string;
  duration: (name: DurationKeys<P>) => string;
  timingFunction: (name: TimingFunctionKeys<P>) => string;
  zIndex: (name: ZIndexKeys<P>) => string;
  ref: TypedRefFn<P>;
};

export type CreateHelpersOptions = CssVarOptions;

/**
 * Create runtime helper functions from primitive tokens
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
