/**
 * Lit CSS integration for @charm-ux/theming
 *
 * Provides type-safe CSS helpers for use in Lit component styles.
 * The helpers return CSSResult objects that can be interpolated directly
 * in Lit's css`` template literals.
 *
 * @example
 * ```typescript
 * import { createCssHelpers } from '@charm-ux/theming/lit';
 * import { charmTokens } from '@charm-ux/theming';
 * import { css } from 'lit';
 *
 * const { primitive, semantic } = createCssHelpers(charmTokens.definition, 'charm');
 *
 * const styles = css`
 *   :host {
 *     background: ${primitive('color', 'primary', 500)};
 *     color: ${semantic('text', 'primary')};
 *   }
 * `;
 * ```
 *
 * @packageDocumentation
 */

import { type CSSResult, unsafeCSS } from 'lit';
import { cssVarName } from '../helpers/cssVar.js';
import type {
  BorderRadiusKeys,
  BorderWidthKeys,
  ColorKeys,
  ComponentTokens,
  DurationKeys,
  PaletteStep,
  PrimitiveTokens,
  ResolvedTokenDefinition,
  SemanticTokens,
  ShadowKeys,
  SpacingKeys,
  TimingFunctionKeys,
  TypographySubKeys,
  ZIndexKeys,
} from '../types/index.js';

/**
 * CSS helper function that returns a CSSResult for Lit interpolation.
 *
 * @example
 * ```typescript
 * const color = primitive('color', 'primary', 500);
 * // Returns CSSResult wrapping 'var(--charm-color-primary-500)'
 * ```
 */
export type CssHelperFn = (...segments: (string | number)[]) => CSSResult;

/**
 * Type-safe primitive token helper for Lit CSS templates.
 *
 * Provides overloads for each primitive token category with proper
 * type inference based on the token definition.
 *
 * @template P - The primitive tokens type for type-safe key inference
 */
export type PrimitiveCssHelper<P extends PrimitiveTokens> = {
  /** Color reference without palette step (for base colors like white/black) */
  (category: 'color', name: ColorKeys<P>): CSSResult;
  /** Color reference with palette step */
  (category: 'color', name: ColorKeys<P>, step: PaletteStep): CSSResult;
  /** Spacing token reference */
  (category: 'spacing', name: SpacingKeys<P>): CSSResult;
  /** Border radius token reference */
  (category: 'borderRadius', name: BorderRadiusKeys<P>): CSSResult;
  /** Border width token reference */
  (category: 'borderWidth', name: BorderWidthKeys<P>): CSSResult;
  /** Shadow token reference */
  (category: 'shadow', name: ShadowKeys<P>): CSSResult;
  /** Duration token reference */
  (category: 'duration', name: DurationKeys<P>): CSSResult;
  /** Timing function (easing) token reference */
  (category: 'timingFunction', name: TimingFunctionKeys<P>): CSSResult;
  /** Z-index token reference */
  (category: 'zIndex', name: ZIndexKeys<P>): CSSResult;
  /** Font family token reference */
  (category: 'fontFamily', name: TypographySubKeys<P, 'fontFamily'>): CSSResult;
  /** Font size token reference */
  (category: 'fontSize', name: TypographySubKeys<P, 'fontSize'>): CSSResult;
  /** Font weight token reference */
  (category: 'fontWeight', name: TypographySubKeys<P, 'fontWeight'>): CSSResult;
  /** Line height token reference */
  (category: 'lineHeight', name: TypographySubKeys<P, 'lineHeight'>): CSSResult;
  /** Letter spacing token reference */
  (category: 'letterSpacing', name: TypographySubKeys<P, 'letterSpacing'>): CSSResult;
  /** Fallback for arbitrary primitive paths */
  (...segments: (string | number)[]): CSSResult;
};

/**
 * Type-safe semantic token helper for Lit CSS templates.
 *
 * Semantic tokens are organized by component/context and reference
 * primitive tokens to create meaningful aliases.
 *
 * @template S - The semantic tokens type for type-safe key inference
 */
export type SemanticCssHelper<S extends SemanticTokens> = {
  /** Semantic token reference with component and property */
  <K extends keyof S & string>(component: K, property: string): CSSResult;
  /** Semantic token reference with nested group */
  <K extends keyof S & string>(component: K, group: string, property: string): CSSResult;
  /** Semantic token reference with deeply nested path */
  <K extends keyof S & string>(component: K, group: string, subgroup: string, property: string): CSSResult;
  /** Fallback for arbitrary semantic paths */
  (...segments: (string | number)[]): CSSResult;
};

/**
 * Type-safe component token helper for Lit CSS templates.
 *
 * Component tokens are organized by component name and can reference
 * both primitive and semantic tokens.
 *
 * @template C - The component tokens type for type-safe key inference
 */
export type ComponentCssHelper<C extends ComponentTokens> = {
  /** Component token reference with component and property */
  <K extends keyof C & string>(componentName: K, property: string): CSSResult;
  /** Component token reference with nested group */
  <K extends keyof C & string>(componentName: K, group: string, property: string): CSSResult;
  /** Component token reference with deeply nested path */
  <K extends keyof C & string>(componentName: K, group: string, subgroup: string, property: string): CSSResult;
  /** Fallback for arbitrary component paths */
  (...segments: (string | number)[]): CSSResult;
};

/**
 * CSS helpers for Lit templates returned by {@link createCssHelpers}.
 *
 * @template P - Primitive tokens type
 * @template S - Semantic tokens type
 * @template C - Component tokens type
 */
export type CssHelpers<
  P extends PrimitiveTokens = PrimitiveTokens,
  S extends SemanticTokens = SemanticTokens,
  C extends ComponentTokens = ComponentTokens,
> = {
  /**
   * Reference a primitive token as a CSSResult.
   *
   * @example
   * ```typescript
   * css`color: ${primitive('color', 'primary', 500)};`
   * css`padding: ${primitive('spacing', 'md')};`
   * ```
   */
  primitive: PrimitiveCssHelper<P>;

  /**
   * Reference a semantic token as a CSSResult.
   *
   * @example
   * ```typescript
   * css`color: ${semantic('text', 'primary')};`
   * css`background: ${semantic('surface', 'default', 'bgColor')};`
   * ```
   */
  semantic: SemanticCssHelper<S>;

  /**
   * Reference a component token as a CSSResult.
   *
   * @example
   * ```typescript
   * css`background: ${component('button', 'primary', 'bgColor')};`
   * css`border-radius: ${component('card', 'borderRadius')};`
   * ```
   */
  component: ComponentCssHelper<C>;
};

/**
 * Maps primitive category names to their CSS variable name format.
 * Some categories use kebab-case in CSS variables.
 */
const CATEGORY_CSS_NAMES: Record<string, string> = {
  borderRadius: 'border-radius',
  borderWidth: 'border-width',
  fontFamily: 'font-family',
  fontSize: 'font-size',
  fontWeight: 'font-weight',
  lineHeight: 'line-height',
  letterSpacing: 'letter-spacing',
  timingFunction: 'timing-function',
  zIndex: 'z-index',
};

/**
 * Create Lit CSS helpers for a token definition.
 *
 * The helpers return CSSResult objects that can be safely interpolated
 * in Lit's css`` template literals using unsafeCSS() internally.
 *
 * @param definition - The resolved token definition from defineTokens()
 * @param prefix - Optional CSS variable prefix (defaults to definition.prefix or '')
 * @returns Object with primitive, semantic, and component helper functions
 *
 * @example
 * ```typescript
 * import { createCssHelpers } from '@charm-ux/theming/lit';
 * import { charmTokens } from '@charm-ux/theming';
 * import { css, LitElement } from 'lit';
 * import { customElement } from 'lit/decorators.js';
 *
 * const { primitive, semantic, component } = createCssHelpers(
 *   charmTokens.definition,
 *   'charm'
 * );
 *
 * @customElement('my-button')
 * export class MyButton extends LitElement {
 *   static styles = css`
 *     :host {
 *       display: inline-flex;
 *       background: ${primitive('color', 'primary', 500)};
 *       color: ${semantic('text', 'onPrimary')};
 *       padding: ${primitive('spacing', 'sm')} ${primitive('spacing', 'md')};
 *       border-radius: ${component('button', 'borderRadius')};
 *     }
 *
 *     :host(:hover) {
 *       background: ${primitive('color', 'primary', 600)};
 *     }
 *   `;
 * }
 * ```
 */
export function createCssHelpers<
  P extends PrimitiveTokens,
  S extends SemanticTokens = SemanticTokens,
  C extends ComponentTokens = ComponentTokens,
>(definition: ResolvedTokenDefinition<P, S, C>, prefix?: string): CssHelpers<P, S, C> {
  const resolvedPrefix = prefix ?? definition.prefix ?? '';

  /**
   * Create a CSSResult from a CSS variable reference.
   */
  const makeCssVar = (...segments: (string | number)[]): CSSResult => {
    const varName = cssVarName(resolvedPrefix, ...segments);
    return unsafeCSS(`var(${varName})`);
  };

  /**
   * Primitive token helper - handles category name mapping.
   */
  const primitive: PrimitiveCssHelper<P> = ((...args: (string | number)[]): CSSResult => {
    const [category, ...rest] = args;
    const cssCategory = CATEGORY_CSS_NAMES[String(category)] ?? String(category);
    return makeCssVar(cssCategory, ...rest);
  }) as PrimitiveCssHelper<P>;

  /**
   * Semantic token helper - references semantic tokens directly.
   */
  const semantic: SemanticCssHelper<S> = ((...segments: (string | number)[]): CSSResult => {
    return makeCssVar(...segments);
  }) as SemanticCssHelper<S>;

  /**
   * Component token helper - references component tokens directly.
   */
  const component: ComponentCssHelper<C> = ((...segments: (string | number)[]): CSSResult => {
    return makeCssVar(...segments);
  }) as ComponentCssHelper<C>;

  return {
    primitive,
    semantic,
    component,
  };
}
