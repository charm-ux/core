// src/types/tokens.ts

/**
 * Light/dark color pair for theme-aware colors.
 *
 * @example
 * ```ts
 * const background: LightDarkValue = {
 *   light: '#ffffff',
 *   dark: '#0a0a0a',
 * };
 * ```
 */
export type LightDarkValue = {
  light: string;
  dark: string;
};

/**
 * Color value that can be a simple string or a light/dark pair.
 *
 * - Single string: same color in both modes
 * - LightDarkValue: different colors per mode
 *
 * @example
 * ```ts
 * const solid: ColorOrLightDark = '#ff0000';
 * const themed: ColorOrLightDark = { light: '#fff', dark: '#000' };
 * ```
 */
export type ColorOrLightDark = string | LightDarkValue;

/**
 * Valid palette step values (50-950).
 *
 * Steps represent lightness levels where:
 * - 50: Lightest tint
 * - 500: Base color (the input color for auto-generated palettes)
 * - 950: Darkest shade
 */
export type PaletteStep = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;

/**
 * Pre-defined color palette with numeric steps.
 *
 * Use this when you want to define specific colors for each step
 * rather than auto-generating from a base color.
 *
 * @example
 * ```ts
 * const customGray: ColorPalette = {
 *   50: '#fafafa',
 *   100: '#f4f4f5',
 *   500: '#71717a',
 *   900: '#18181b',
 * };
 * ```
 */
export type ColorPalette = {
  [step in PaletteStep]?: ColorOrLightDark;
};

/**
 * Named color group for organizing related colors.
 *
 * @example
 * ```ts
 * const brandColors: ColorGroup = {
 *   logo: '#ff0000',
 *   accent: { light: '#00ff00', dark: '#00cc00' },
 * };
 * ```
 */
export type ColorGroup = {
  [name: string]: ColorOrLightDark;
};

/**
 * Color definition value - determines how the color is processed.
 *
 * - `string`: Auto-expanded into a full 50-950 palette using OKLCH
 * - `LightDarkValue`: Base color with light/dark variants, no palette expansion
 * - `ColorPalette`: Pre-defined palette steps
 * - `ColorGroup`: Named color variants
 *
 * @example
 * ```ts
 * // Auto-expand to palette
 * primary: '#3b82f6'
 *
 * // Base color (no expansion)
 * white: { light: '#ffffff', dark: '#ffffff' }
 *
 * // Pre-defined palette
 * gray: { 100: '#f4f4f5', 500: '#71717a', 900: '#18181b' }
 * ```
 */
export type ColorDefinitionValue = string | ColorPalette | ColorGroup;

/**
 * Color definitions map - the `color` property of primitive tokens.
 *
 * @template K - Union of color name keys for type-safe access
 *
 * @example
 * ```ts
 * const colors: ColorDefinitions = {
 *   white: { light: '#ffffff', dark: '#ffffff' },  // Base color
 *   black: { light: '#000000', dark: '#000000' },  // Base color
 *   primary: '#3b82f6',   // Auto-expands to palette
 *   neutral: '#71717a',   // Auto-expands to palette
 * };
 * ```
 */
export type ColorDefinitions<K extends string = string> = {
  [name in K]: ColorDefinitionValue | TokenWithMetadata<ColorDefinitionValue>;
};

/**
 * Wrapper for adding metadata to any token value.
 *
 * @template T - The underlying token value type
 *
 * @example
 * ```ts
 * const spacingWithMeta: TokenWithMetadata<string> = {
 *   value: '16px',
 *   description: 'Default content padding',
 *   deprecated: 'Use spacing.4 instead',
 * };
 * ```
 */
export type TokenWithMetadata<T = string | number | TokenMap> = {
  /** Human-readable description of the token's purpose */
  description?: string;
  /** Deprecation notice - true or a message explaining the replacement */
  deprecated?: string | boolean;
  /** The actual token value */
  value: T;
};

/**
 * Primitive token value - string, number, or metadata-wrapped.
 */
export type TokenValue = string | number | TokenWithMetadata;

/**
 * Recursive token map for nested token structures.
 *
 * Supports both string and numeric keys for flexibility.
 *
 * @example
 * ```ts
 * const spacing: TokenMap = {
 *   0: '0',
 *   4: '4px',
 *   8: '8px',
 * };
 *
 * const typography: TokenMap = {
 *   fontFamily: {
 *     primary: 'Inter, sans-serif',
 *     mono: 'Fira Code, monospace',
 *   },
 * };
 * ```
 */
export type TokenMap = {
  [name: string | number]: TokenValue | TokenMap;
};

/**
 * Structured shadow definition for type-safe box-shadow values.
 *
 * Supports light/dark color variants for theme-aware shadows.
 *
 * @example
 * ```ts
 * const elevated: ShadowValue = {
 *   color: { light: 'rgba(0,0,0,0.1)', dark: 'rgba(0,0,0,0.3)' },
 *   offsetX: '0px',
 *   offsetY: '4px',
 *   blur: '6px',
 *   spread: '0px',
 * };
 * ```
 */
export type ShadowValue = {
  /** Shadow color - can be a single color or light/dark pair */
  color: ColorOrLightDark;
  /** Horizontal offset (e.g., '0px', '4px') */
  offsetX: string;
  /** Vertical offset (e.g., '4px', '6px') */
  offsetY: string;
  /** Blur radius (e.g., '6px', '1rem') */
  blur: string;
  /** Spread radius (e.g., '0px', '-1px') */
  spread: string;
  /** Whether this is an inset shadow */
  inset?: boolean;
};

/**
 * Shadow token value - can be a CSS string, structured shadow, or layered shadows.
 *
 * @example
 * ```ts
 * // CSS string
 * const simple: ShadowTokenValue = '0 4px 6px rgba(0,0,0,0.1)';
 *
 * // Layered shadows (array)
 * const layered: ShadowTokenValue = [
 *   { color: 'rgba(0,0,0,0.04)', offsetX: '0px', offsetY: '1px', blur: '2px', spread: '0px' },
 *   { color: 'rgba(0,0,0,0.08)', offsetX: '0px', offsetY: '4px', blur: '8px', spread: '0px' },
 * ];
 * ```
 */
export type ShadowTokenValue = string | ShadowValue | ShadowValue[];

/**
 * Shadow tokens map with optional metadata support.
 */
export type ShadowTokens = {
  [name: string | number]: ShadowTokenValue | TokenWithMetadata<ShadowTokenValue>;
};

/**
 * Cubic bezier timing function value per W3C Design Tokens spec.
 * Array of exactly 4 numbers [P1x, P1y, P2x, P2y] representing the two control points.
 *
 * @see https://www.designtokens.org/tr/2025.10/format/#cubic-bezier
 *
 * @example
 * ```ts
 * const easeOut: CubicBezierValue = [0, 0, 0.2, 1];
 * const easeInOut: CubicBezierValue = [0.4, 0, 0.2, 1];
 * ```
 */
export type CubicBezierValue = [number, number, number, number];

/**
 * Timing function tokens map.
 * Values should be CubicBezierValue arrays for cross-platform compatibility.
 *
 * @example
 * ```ts
 * const timingFunctions: TimingFunctionTokens = {
 *   linear: [0, 0, 1, 1],
 *   easeOut: [0, 0, 0.2, 1],
 *   easeInOut: [0.4, 0, 0.2, 1],
 * };
 * ```
 */
export type TimingFunctionTokens = {
  [name: string]: CubicBezierValue | TokenWithMetadata<CubicBezierValue>;
};

/**
 * Typography token categories.
 *
 * @example
 * ```ts
 * const typography: TypographyTokens = {
 *   fontFamily: {
 *     primary: 'Inter, sans-serif',
 *     mono: 'Fira Code, monospace',
 *   },
 *   fontSize: {
 *     sm: '14px',
 *     base: '16px',
 *     lg: '18px',
 *   },
 *   fontWeight: {
 *     normal: '400',
 *     bold: '700',
 *   },
 * };
 * ```
 */
export type TypographyTokens = {
  fontFamily?: TokenMap;
  fontSize?: TokenMap;
  fontWeight?: TokenMap;
  lineHeight?: TokenMap;
  letterSpacing?: TokenMap;
};

/**
 * Primitive design tokens - the foundation of the design system.
 *
 * These are raw values that get transformed into CSS custom properties.
 * Semantic tokens reference these primitives to create meaningful aliases.
 *
 * @template ColorKey - Union of color names for type-safe color access
 *
 * @example
 * ```ts
 * const primitives: PrimitiveTokens = {
 *   color: {
 *     white: { light: '#fff', dark: '#fff' },
 *     primary: '#3b82f6',  // Auto-expands to palette
 *   },
 *   spacing: {
 *     0: '0',
 *     4: '4px',
 *     8: '8px',
 *   },
 *   borderRadius: {
 *     sm: '4px',
 *     md: '8px',
 *     full: '9999px',
 *   },
 * };
 * ```
 */
export type PrimitiveTokens<ColorKey extends string = string> = {
  /** Border radius values */
  borderRadius?: TokenMap;
  /** Border width values */
  borderWidth?: TokenMap;
  /** Color definitions - base colors and palette seeds */
  color?: ColorDefinitions<ColorKey>;
  /** Animation/transition durations */
  duration?: TokenMap;
  /** Animation/transition timing functions (easing curves) as cubic bezier arrays */
  timingFunction?: TimingFunctionTokens;
  /** Box shadow definitions */
  shadow?: ShadowTokens;
  /** Spacing scale for margins, paddings, gaps */
  spacing?: TokenMap;
  /** Typography scale (fonts, sizes, weights, etc.) */
  typography?: TypographyTokens;
  /** Z-index layers */
  zIndex?: TokenMap;
};

// ---- Type utilities for extracting token keys ----

/**
 * Generic key extractor for primitive token categories.
 *
 * @template P - Primitive tokens type
 * @template K - Key of PrimitiveTokens to extract from
 * @template F - Fallback type if extraction fails
 */
export type PrimitiveKeys<P extends PrimitiveTokens, K extends keyof PrimitiveTokens, F = string> = P[K] extends object
  ? keyof P[K] & F
  : F;

/**
 * Extract color name keys from PrimitiveTokens.
 *
 * Returns the union of all color names defined in the primitives.
 *
 * @example
 * ```ts
 * type MyColors = ColorKeys<typeof myTokens.definition.primitives>;
 * // 'white' | 'black' | 'primary' | 'secondary' | ...
 * ```
 */
export type ColorKeys<P extends PrimitiveTokens> = P['color'] extends ColorDefinitions<infer K> ? K : string;

/** Extract spacing keys from PrimitiveTokens */
export type SpacingKeys<P extends PrimitiveTokens> = PrimitiveKeys<P, 'spacing', string | number>;

/** Extract border radius keys from PrimitiveTokens */
export type BorderRadiusKeys<P extends PrimitiveTokens> = PrimitiveKeys<P, 'borderRadius'>;

/** Extract shadow keys from PrimitiveTokens */
export type ShadowKeys<P extends PrimitiveTokens> = PrimitiveKeys<P, 'shadow'>;

/** Extract duration keys from PrimitiveTokens */
export type DurationKeys<P extends PrimitiveTokens> = PrimitiveKeys<P, 'duration'>;

/** Extract timing function keys from PrimitiveTokens */
export type TimingFunctionKeys<P extends PrimitiveTokens> = PrimitiveKeys<P, 'timingFunction'>;

/** Extract border width keys from PrimitiveTokens */
export type BorderWidthKeys<P extends PrimitiveTokens> = PrimitiveKeys<P, 'borderWidth'>;

/** Extract z-index keys from PrimitiveTokens */
export type ZIndexKeys<P extends PrimitiveTokens> = PrimitiveKeys<P, 'zIndex', string | number>;

/**
 * Extract keys from a typography sub-category.
 *
 * @template P - Primitive tokens type
 * @template K - Typography category key (fontFamily, fontSize, etc.)
 */
export type TypographySubKeys<
  P extends PrimitiveTokens,
  K extends keyof TypographyTokens,
> = P['typography'] extends TypographyTokens
  ? P['typography'][K] extends TokenMap
    ? keyof P['typography'][K] & (string | number)
    : string | number
  : string | number;

/** Extract property keys from a semantic or component token group */
export type SemanticPropertyKeys<T> = keyof T & string;

/**
 * Type-safe reference function for creating CSS variable references.
 *
 * Returns a CSS `var()` reference string based on the token path.
 * Overloaded to provide autocomplete and type checking for primitive token
 * categories, plus flexible overloads for semantic token references.
 *
 * @template P - Primitive tokens type for type-safe key inference
 */
export type TypedRefFn<P extends PrimitiveTokens> = {
  // ---- Color overloads ----

  /** Base color reference (no palette step) */
  (category: 'color', name: ColorKeys<P>): string;
  /** Palette color with step */
  (category: 'color', name: ColorKeys<P>, step: PaletteStep): string;

  // ---- Other primitive overloads ----

  /** Spacing token reference */
  (category: 'spacing', name: SpacingKeys<P>): string;
  /** Border radius token reference */
  (category: 'borderRadius', name: BorderRadiusKeys<P>): string;
  /** Shadow token reference */
  (category: 'shadow', name: ShadowKeys<P>): string;
  /** Duration token reference */
  (category: 'duration', name: DurationKeys<P>): string;
  /** Timing function (easing) token reference */
  (category: 'timingFunction', name: TimingFunctionKeys<P>): string;
  /** Font family token reference */
  (category: 'fontFamily', name: TypographySubKeys<P, 'fontFamily'>): string;
  /** Font size token reference */
  (category: 'fontSize', name: TypographySubKeys<P, 'fontSize'>): string;
  /** Font weight token reference */
  (category: 'fontWeight', name: TypographySubKeys<P, 'fontWeight'>): string;
  /** Line height token reference */
  (category: 'lineHeight', name: TypographySubKeys<P, 'lineHeight'>): string;
  /** Letter spacing token reference */
  (category: 'letterSpacing', name: TypographySubKeys<P, 'letterSpacing'>): string;
  /** Border width token reference */
  (category: 'borderWidth', name: BorderWidthKeys<P>): string;
  /** Z-index token reference */
  (category: 'zIndex', name: ZIndexKeys<P>): string;

  // ---- Semantic token overloads ----

  /** Semantic token reference with a single property segment */
  (category: 'semantic', component: string, property: string): string;
  /** Semantic token reference with a nested group segment */
  (category: 'semantic', component: string, group: string, property: string): string;
  /** Semantic token reference with a nested subgroup segment */
  (category: 'semantic', component: string, group: string, subgroup: string, property: string): string;

  // ---- Catch-all fallback ----

  /**
   * Fallback for arbitrary paths when TypeScript can't infer the key type.
   * Accepts any string/number segments and joins them into a CSS variable name.
   */
  (...segments: (string | number)[]): string;
};

/**
 * Reference helper passed to the semantics and components factory functions.
 *
 * This is the same callable shape as `TypedRefFn` - call it directly to
 * create CSS variable references (e.g. `ref('color', 'primary', 500)`).
 *
 * @template P - The primitive tokens type for type-safe references
 */
export type RefHelper<P extends PrimitiveTokens = PrimitiveTokens> = TypedRefFn<P>;

/**
 * Semantic token value - a CSS variable reference string or metadata-wrapped.
 *
 * @example
 * ```ts
 * // Direct reference
 * fontSize: ref('fontSize', '16')
 *
 * // With metadata
 * fontSize: {
 *   value: ref('fontSize', '16'),
 *   description: 'Base body font size',
 * }
 * ```
 */
export type SemanticTokenValue = string | TokenWithMetadata<string>;

/**
 * Semantic color value - supports theming with light/dark variants.
 *
 * @example
 * ```ts
 * // Single value (same in both modes)
 * backgroundColor: ref('color', 'primary', 500)
 *
 * // Light/dark variants
 * backgroundColor: {
 *   light: ref('color', 'neutral', 50),
 *   dark: ref('color', 'neutral', 900),
 * }
 * ```
 */
export type SemanticColorValue = string | LightDarkValue | TokenWithMetadata<string | LightDarkValue>;

/**
 * Recursive semantic token group for organizing tokens by component/context.
 *
 * Supports nested groups for surfaces, states, and complex components.
 */
export type SemanticTokenGroup = {
  [property: string]: SemanticTokenValue | SemanticColorValue | SemanticTokenGroup;
};

// ---- Interactive state types ----

/**
 * Tokens that change based on interactive state.
 *
 * These define the visual properties that can vary between states
 * (default, hover, focus, active, disabled, etc.).
 *
 * @example
 * ```ts
 * const buttonDefault: StateUpdateTokens = {
 *   bgColor: ref('color', 'primary', 500),
 *   fgColor: ref('color', 'white'),
 *   borderColor: 'transparent',
 * };
 * ```
 */
export type StateUpdateTokens = {
  bgColor?: SemanticColorValue;
  fgColor?: SemanticColorValue;
  secondaryFgColor?: SemanticColorValue;
  borderColor?: SemanticColorValue;
  shadow?: SemanticTokenValue;
  opacity?: number | string;
  cursor?: string;
  colorScheme?: 'light' | 'dark' | string;
};

/**
 * Interactive state variants for a component or surface.
 *
 * Each state contains the tokens that override the default state.
 *
 * @example
 * ```ts
 * const buttonStates: StateTokens = {
 *   hover: { bgColor: ref('color', 'primary', 600) },
 *   active: { bgColor: ref('color', 'primary', 700) },
 *   disabled: { opacity: 0.5, cursor: 'not-allowed' },
 * };
 * ```
 */
export type StateTokens = {
  hover?: StateUpdateTokens;
  focus?: StateUpdateTokens;
  active?: StateUpdateTokens;
  disabled?: StateUpdateTokens;
  invalid?: StateUpdateTokens;
  loading?: StateUpdateTokens;
};

/**
 * Surface state tokens - combines default state with interactive states.
 *
 * Use this for any interactive element that needs consistent state handling.
 *
 * @example
 * ```ts
 * const primarySurface: SurfaceStates = {
 *   bgColor: ref('color', 'primary', 500),
 *   fgColor: ref('color', 'white'),
 *   hover: { bgColor: ref('color', 'primary', 600) },
 *   active: { bgColor: ref('color', 'primary', 700) },
 *   disabled: { opacity: 0.5 },
 * };
 * ```
 */
export type SurfaceStates = StateUpdateTokens & StateTokens;

/**
 * Predefined surface token groups.
 *
 * Surfaces are reusable background/foreground combinations
 * with full interactive state support.
 *
 * @example
 * ```ts
 * const surfaces: SurfaceTokens = {
 *   default: { bgColor: ref('color', 'neutral', 50), ... },
 *   brand: { bgColor: ref('color', 'primary', 500), ... },
 *   accent: { bgColor: ref('color', 'accent', 500), ... },
 * };
 * ```
 */
export type SurfaceTokens = {
  default?: SurfaceStates;
  brand?: SurfaceStates;
  accent?: SurfaceStates;
  neutral?: SurfaceStates;
  neutralLight?: SurfaceStates;
  neutralDark?: SurfaceStates;
  info?: SurfaceStates;
  success?: SurfaceStates;
  warning?: SurfaceStates;
  danger?: SurfaceStates;
};

// ---- Base semantic token types (used by CSS reset) ----

/** Body/document semantic tokens */
export type BodySemanticTokens = {
  backgroundColor: SemanticColorValue;
  foregroundColor: SemanticColorValue;
  fontFamily: SemanticTokenValue;
  fontSize: SemanticTokenValue;
  fontWeight: SemanticTokenValue;
  lineHeight: SemanticTokenValue;
};

/** Focus outline semantic tokens */
export type FocusOutlineSemanticTokens = {
  color: SemanticColorValue;
  width: SemanticTokenValue;
  style: SemanticTokenValue;
  offset: SemanticTokenValue;
};

/** Heading semantic tokens */
export type HeadingSemanticTokens = {
  foregroundColor?: SemanticColorValue;
  fontFamily?: SemanticTokenValue;
  fontWeight: SemanticTokenValue;
  lineHeight: SemanticTokenValue;
};

/** Link semantic tokens */
export type LinkSemanticTokens = {
  foregroundColor: SemanticColorValue;
  decoration: SemanticTokenValue;
  hoverForegroundColor?: SemanticColorValue;
  hoverDecoration?: SemanticTokenValue;
  activeForegroundColor?: SemanticColorValue;
  activeDecoration?: SemanticTokenValue;
  focusForegroundColor?: SemanticColorValue;
  focusDecoration?: SemanticTokenValue;
  visitedForegroundColor?: SemanticColorValue;
  visitedDecoration?: SemanticTokenValue;
  disabledForegroundColor?: SemanticColorValue;
  disabledDecoration?: SemanticTokenValue;
};

/** Border defaults semantic tokens */
export type BorderSemanticTokens = {
  width: SemanticTokenValue;
  color: SemanticColorValue;
  style?: SemanticTokenValue;
};

/** Default button semantic tokens - extends SurfaceStates with button-specific properties */
export type DefaultButtonSemanticTokens = SurfaceStates & {
  borderWidth?: SemanticTokenValue;
  borderStyle?: SemanticTokenValue;
  borderRadius?: SemanticTokenValue;
  fontWeight?: SemanticTokenValue;
  paddingX?: SemanticTokenValue;
  paddingY?: SemanticTokenValue;
};

/** Form container semantic tokens */
export type FormSemanticTokens = {
  backgroundColor?: SemanticColorValue;
  foregroundColor?: SemanticColorValue;
  borderColor?: SemanticColorValue;
  borderWidth?: SemanticTokenValue;
  borderStyle?: SemanticTokenValue;
  borderRadius?: SemanticTokenValue;
  paddingX?: SemanticTokenValue;
  paddingY?: SemanticTokenValue;
  contentGap?: SemanticTokenValue;
};

/** Form control (input/select/textarea) semantic tokens - extends SurfaceStates with form-specific properties */
export type FormControlSemanticTokens = SurfaceStates & {
  borderWidth?: SemanticTokenValue;
  borderStyle?: SemanticTokenValue;
  borderRadius?: SemanticTokenValue;
  fontSize?: SemanticTokenValue;
  paddingX?: SemanticTokenValue;
  paddingY?: SemanticTokenValue;
  inputHeight?: SemanticTokenValue;
  placeholderColor?: SemanticColorValue;
  label?: FormControlTextSemanticTokens;
  helpText?: FormControlTextSemanticTokens;
  invalid?: {
    message?: FormControlTextSemanticTokens;
    placeholderColor?: SemanticColorValue;
  };
  disabled?: {
    placeholderColor?: SemanticColorValue;
  };
};

export type FormControlTextSemanticTokens = {
  foregroundColor?: SemanticColorValue;
  fontSize?: SemanticTokenValue;
  fontWeight?: SemanticTokenValue;
  gap?: SemanticTokenValue;
};

/** Typography size scale */
export type TypographySize = '2xl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs' | '2xs';

/** Properties for each typography size */
export type TypographySizeTokens = {
  fontSize?: SemanticTokenValue;
  fontWeight?: SemanticTokenValue;
  lineHeight?: SemanticTokenValue;
  letterSpacing?: SemanticTokenValue;
};

/** Typography category with size scale */
export type TypographyCategoryTokens = {
  [size in TypographySize]?: TypographySizeTokens | TokenWithMetadata<TypographySizeTokens>;
};

/** Semantic typography tokens organized by category */
export type TypographySemanticTokens = {
  display?: TypographyCategoryTokens;
  heading?: TypographyCategoryTokens;
  body?: TypographyCategoryTokens;
  label?: TypographyCategoryTokens;
  overline?: TypographyCategoryTokens;
};

/** Base semantic tokens used by the CSS reset */
export type BaseSemanticTokens = {
  body?: Partial<BodySemanticTokens>;
  focusOutline?: Partial<FocusOutlineSemanticTokens>;
  heading?: Partial<HeadingSemanticTokens>;
  link?: Partial<LinkSemanticTokens>;
  border?: Partial<BorderSemanticTokens>;
  defaultButton?: Partial<DefaultButtonSemanticTokens>;
  form?: Partial<FormSemanticTokens>;
  formControl?: Partial<FormControlSemanticTokens>;
  surface?: Partial<SurfaceTokens>;
  typography?: Partial<TypographySemanticTokens>;
};

/**
 * Semantic tokens organized by component/context.
 *
 * Maps component names to their token groups.
 */
export type SemanticTokens = {
  [component: string]: SemanticTokenGroup;
};

/**
 * Component token value - same shape as semantic tokens.
 */
export type ComponentTokenValue = string | LightDarkValue | TokenWithMetadata<string | LightDarkValue>;

/**
 * Component token group - base properties plus optional nested groups (e.g. states).
 */
export type ComponentTokenGroup = {
  [property: string]: ComponentTokenValue | ComponentTokenGroup;
};

/**
 * All component token definitions.
 *
 * Maps component names to their token groups.
 */
export type ComponentTokens = {
  [componentName: string]: ComponentTokenGroup;
};

/**
 * Complete token definition - the input to `defineTokens()`.
 *
 * @template P - Primitive tokens type
 * @template S - Semantic tokens type
 * @template C - Component tokens type
 *
 * @example
 * ```ts
 * const definition: TokenDefinition = {
 *   prefix: 'charm',
 *   primitives: {
 *     color: { primary: '#3b82f6' },
 *     spacing: { 4: '4px', 8: '8px' },
 *   },
 *   semantics: ({ ref }) => ({
 *     defaultButton: {
 *       backgroundColor: ref('color', 'primary', 500),
 *       paddingX: ref('spacing', 8),
 *     },
 *   }),
 * };
 * ```
 */
export type TokenDefinition<
  P extends PrimitiveTokens = PrimitiveTokens,
  S extends SemanticTokens = SemanticTokens,
  C extends ComponentTokens = ComponentTokens,
> = {
  /** Prefix for all CSS variable names (e.g., 'charm' -> --charm-color-primary) */
  prefix?: string;
  /** Primitive design tokens (colors, spacing, typography, etc.) */
  primitives: P;
  /** Factory function for semantic tokens that reference primitives */
  semantics?: (helper: RefHelper<P>) => S;
  /** Factory function for component tokens that reference primitives or semantics */
  components?: (helper: RefHelper<P>) => C;
};

/**
 * Resolved token definition returned by `defineTokens()`.
 *
 * Unlike {@link TokenDefinition} - whose `semantics`/`components` fields are
 * *factory functions* supplied by the caller - this type represents the
 * definition after those factories have been invoked, so `semantics` and
 * `components` hold the resolved token data.
 *
 * @template P - Primitive tokens type
 * @template S - Semantic tokens type
 * @template C - Component tokens type
 *
 * @example
 * ```ts
 * const resolved: ResolvedTokenDefinition = {
 *   primitives: { color: { primary: '#3b82f6' } },
 *   semantics: { surface: { primary: 'var(--color-primary-500)' } },
 * };
 * ```
 */
export type ResolvedTokenDefinition<
  P extends PrimitiveTokens = PrimitiveTokens,
  S extends SemanticTokens = SemanticTokens,
  C extends ComponentTokens = ComponentTokens,
> = {
  /** Prefix for all CSS variable names (e.g., 'charm' -> --charm-color-primary) */
  prefix?: string;
  /** Primitive design tokens (colors, spacing, typography, etc.) */
  primitives: P;
  /** Resolved semantic tokens (after the factory function has been invoked) */
  semantics?: S;
  /** Resolved component tokens (after the factory function has been invoked) */
  components?: C;
};
