import type { CSSResult } from 'lit';

/**
 * Global theme configuration
 */
export type ThemeConfiguration = {
  /** Primitive and semantic tokens used to generate theme */
  tokens?: CharmTokens;
  /** Identifies the neutral color palette for generated colors */
  neutralColor?: string;
  /** Used to add a custom prefix to your primitive tokens - `--my-color...` */
  tokenPrefix?: string;
  /** Specifies where the generated files should be added - default is `./` */
  outDir?: string;
  /** The name of the file that will contain the reset styles - default is `reset.css` */
  resetFileName?: string;
  /** The name of the file that will contain the base theme - default is `theme.css` */
  themeFileName?: string;
  /** The name of the file that will contain the dark theme - default is `dark-theme.css` */
  darkThemeFileName?: string;
  /** The name of the file that will contain the selector theme (if you have specified selectors) - default is `selector-theme.css` */
  selectorThemeFileName?: string;
  /** The name of the file that will contain the CSS utility classes (if you have specified selectors) - default is `utility-classes.css` */
  cssUtilityClassesFileName?: string;
  /** The name of the file that will contain the helper functions for quick access to your tokens - default is `token-helpers.ts` */
  helpersFileName?: string;
  /** Specifies where the helper functions file should be added - default is the same as the `outDir` setting */
  helpersOutDir?: string;
  /** Adds custom styles to your reset file */
  extendedResetStyles?: CSSResult | string;
  /** Adds custom styles to your base theme */
  extendedTokens?: CSSResult | string;
  /** Adds custom styles to your light theme */
  extendedLightTokens?: CSSResult | string;
  /** Adds custom styles to your dark theme */
  extendedDarkTokens?: CSSResult | string;
  /** Adds custom styles to your selector theme */
  extendedSemanticTokens?: CSSResult | string;
  /** Adds custom functions to the token helpers */
  extendedTokenHelpers?: CSSResult | string;
  /** Adds custom CSS utilities to the generated utilities */
  extendedCssUtilities?: CSSResult | string;
  /** Specifies the CSS selector for your light theme */
  lightThemeSelector?: string;
  /** Specifies the CSS selector for your dark theme */
  darkThemeSelector?: string;
  /** Skips the generation of the helper functions file */
  skipHelpers?: boolean;
  /** Skips the generation of the reset file */
  skipReset?: boolean;
  /** Skips the generation of the non-selector themes */
  skipNonSelectorThemes?: boolean;
  /** Skips the generation of the alpha color token for each color in the color palette */
  skipAlphaColorGeneration?: boolean;
  /** Skips the generation of the alternate color for each color in the color palette */
  skipAltColorGeneration?: boolean;
  /** Skips the generation of the CSS utility classes */
  skipCssUtilityGeneration?: boolean;
  /** Provides custom tools for colors if they palette differs from other colors */
  uniquePalettes?: string[];
  /** Specifies if the generated CSS should use HSL instead of RGB */
  useHsl?: boolean;
};

type ColorThemes = {
  baseTheme: string;
  lightTheme: string;
  darkTheme: string;
  selectorTheme?: string;
  cssUtilities?: string;
};

type Helpers = {
  CssUtilityClasses?: string;
};

export type ThemeFileContents = ColorThemes & Helpers;

export type CharmTokens = {
  /** Primitives are the reusable foundational tokens that can be used your global CSS or within your components */
  primitives?: {
    borderRadius?: BorderRadii;
    borderWidth?: BorderWidths;
    color?: Colors;
    containerQuery?: ContainerQueries;
    duration?: Durations;
    fontFamily?: FontFamilies;
    fontSize?: FontSizes;
    fontWeight?: FontWeights;
    lineHeight?: LineHeights;
    mediaQuery?: MediaQueries;
    shadow?: Shadows;
    spacing?: Spacings;
    timingFunction?: TimingFunctions;
    zIndex?: ZIndexes;
    extendedTokens?: object;
  };

  /** Semantics are used to define baseline themes. These tokens are referenced within Charm core components, CSS reset, and can also be used in your global CSS or within your components */
  semantics?: {
    body?: Body;
    defaultBorder?: DefaultBorder;
    button?: Button;
    form?: Form;
    formControl?: FormControl;
    heading?: Heading;
    link?: Link;
    focusOutline?: FocusOutline;
    extendedTokens?: object;
  };
};

/*********************
 *
 * ****PRIMITIVES****
 *
 *********************/
export type Durations = {
  [key: string]: string;
};

export type TimingFunctions = {
  [key: string]: string;
};

export type BorderRadii = {
  [key: string]: string;
};

export type BorderWidths = {
  [key: string]: string;
};

export type Colors = {
  [key: string]:
    | {
        [key: string]: ColorSchemeColors | string;
      }
    | string;
};

export type ContainerQueries = {
  [key: string]: string;
};

export type FontFamilies = {
  [key: string]: string;
};

export type FontSizes = {
  [key: string]: string;
};

export type FontWeights = {
  [key: string]: string;
};

export type LineHeights = {
  [key: string]: string;
};

export type MediaQueries = {
  [key: string]: string;
};

export type Shadows = {
  [key: string]: ColorSchemeColors | string;
};

export type Spacings = {
  [key: string]: string;
};

export type ZIndexes = {
  [key: string]: number;
};

/********************
 *
 * ****SEMANTICS****
 *
 ********************/

export type Body = {
  bgColor?: ColorSchemeColors | CSSResult | string;
  fgColor?: ColorSchemeColors | CSSResult | string;
  fontFamily?: CSSResult | string;
  fontSize?: CSSResult | string;
  fontWeight?: CSSResult | string;
  lineHeight?: CSSResult | string;
};

export type DefaultBorder = {
  size?: CSSResult | string;
  color?: ColorSchemeColors | CSSResult | string;
  style?: CSSResult | string;
};

export type Button = {
  // REST
  bgColor?: ColorSchemeColors | CSSResult | string;
  borderColor?: ColorSchemeColors | CSSResult | string;
  borderSize?: CSSResult | string;
  borderStyle?: CSSResult | string;
  borderRadius?: CSSResult | string;
  fgColor?: ColorSchemeColors | CSSResult | string;
  fontWeight?: CSSResult | string;
  paddingX?: CSSResult | string;
  paddingY?: CSSResult | string;
  shadow?: ColorSchemeColors | CSSResult | string;

  // ACTIVE
  activeFgColor?: ColorSchemeColors | CSSResult | string;
  activeBorderColor?: ColorSchemeColors | CSSResult | string;
  activeBgColor?: ColorSchemeColors | CSSResult | string;
  activeShadow?: ColorSchemeColors | CSSResult | string;

  // DISABLED
  disabledBgColor?: ColorSchemeColors | CSSResult | string;
  disabledBorderColor?: ColorSchemeColors | CSSResult | string;
  disabledFgColor?: ColorSchemeColors | CSSResult | string;
  disabledShadow?: ColorSchemeColors | CSSResult | string;

  // FOCUS
  focusBgColor?: ColorSchemeColors | CSSResult | string;
  focusBorderColor?: ColorSchemeColors | CSSResult | string;
  focusFgColor?: ColorSchemeColors | CSSResult | string;
  focusShadow?: ColorSchemeColors | CSSResult | string;

  // HOVER
  hoverBgColor?: ColorSchemeColors | CSSResult | string;
  hoverBorderColor?: ColorSchemeColors | CSSResult | string;
  hoverFgColor?: ColorSchemeColors | CSSResult | string;
  hoverShadow?: ColorSchemeColors | CSSResult | string;
};

export type Form = {
  borderColor?: ColorSchemeColors | CSSResult | string;
  borderSize?: CSSResult | string;
  borderStyle?: CSSResult | string;
  borderRadius?: CSSResult | string;
  bgColor?: ColorSchemeColors | CSSResult | string;
  contentGap?: CSSResult | string;
  paddingX?: CSSResult | string;
  paddingY?: CSSResult | string;
};

export type FormControl = {
  // REST
  bgColor?: ColorSchemeColors | CSSResult | string;
  borderColor?: ColorSchemeColors | CSSResult | string;
  borderRadius?: CSSResult | string;
  borderSize?: CSSResult | string;
  borderStyle?: CSSResult | string;
  fgColor?: ColorSchemeColors | CSSResult | string;
  fontSize?: CSSResult | string;
  iconGap?: CSSResult | string;
  inputHeight?: CSSResult | string;
  placeholderColor?: ColorSchemeColors | CSSResult | string;
  paddingX?: CSSResult | string;
  paddingY?: CSSResult | string;
  shadow?: ColorSchemeColors | CSSResult | string;

  // DISABLED
  disabledBgColor?: ColorSchemeColors | CSSResult | string;
  disabledBorderColor?: ColorSchemeColors | CSSResult | string;
  disabledFgColor?: ColorSchemeColors | CSSResult | string;
  disabledOpacity?: CSSResult | string;
  disabledPlaceholderColor?: ColorSchemeColors | CSSResult | string;
  disabledShadow?: ColorSchemeColors | CSSResult | string;

  // INVALID
  invalidBgColor?: ColorSchemeColors | CSSResult | string;
  invalidBorderColor?: ColorSchemeColors | CSSResult | string;
  invalidFgColor?: ColorSchemeColors | CSSResult | string;
  invalidPlaceholderColor?: ColorSchemeColors | CSSResult | string;
  invalidMessageFgColor?: ColorSchemeColors | CSSResult | string;
  invalidShadow?: ColorSchemeColors | CSSResult | string;

  // FOCUS
  focusBgColor?: ColorSchemeColors | CSSResult | string;
  focusBorderColor?: ColorSchemeColors | CSSResult | string;
  focusFgColor?: ColorSchemeColors | CSSResult | string;
  focusShadow?: ColorSchemeColors | CSSResult | string;

  // HOVER
  hoverBgColor?: ColorSchemeColors | CSSResult | string;
  hoverBorderColor?: ColorSchemeColors | CSSResult | string;
  hoverFgColor?: ColorSchemeColors | CSSResult | string;
  hoverShadow?: ColorSchemeColors | CSSResult | string;

  helpText?: {
    fgColor?: ColorSchemeColors | CSSResult | string;
    fontSize?: CSSResult | string;
    fontWeight?: CSSResult | string;
    gap?: CSSResult | string;
  };

  label?: {
    fgColor?: ColorSchemeColors | CSSResult | string;
    fontSize?: CSSResult | string;
    fontWeight?: CSSResult | string;
    gap?: CSSResult | string;
    requiredIndicatorGap?: CSSResult | string;
  };
};

export type Heading = {
  fgColor?: ColorSchemeColors | CSSResult | string;
  fontFamily?: CSSResult | string;
  fontWeight?: CSSResult | string;
  lineHeight?: CSSResult | string;
};

export type Link = {
  // REST
  fgColor?: ColorSchemeColors | CSSResult | string;
  decoration?: CSSResult | string;

  // ACTIVE
  activeFgColor?: ColorSchemeColors | CSSResult | string;
  activeDecoration?: CSSResult | string;

  // HOVER
  hoverFgColor?: ColorSchemeColors | string;
  hoverDecoration?: string;

  // FOCUS
  focusFgColor?: ColorSchemeColors | CSSResult | string;
  focusDecoration?: CSSResult | string;

  // VISITED
  visitedFgColor?: ColorSchemeColors | CSSResult | string;
  visitedDecoration?: CSSResult | string;

  // DISABLED
  disabledFgColor?: ColorSchemeColors | CSSResult | string;
  disabledDecoration?: CSSResult | string;
};

export type FocusOutline = {
  color?: ColorSchemeColors | CSSResult | string;
  offset?: CSSResult | string;
  size?: CSSResult | string;
  style?: CSSResult | string;
};

export type ColorSchemeColors = {
  light: CSSResult | string;
  dark: CSSResult | string;
};
