# Charm Theming

This package is designed to help generate and manage themes for the Charm UI library. It is a part of the Charm UI ecosystem.

> This package is _optional_ and not required for using the Charm UI library.

## Installation

```bash
npm i -D @charm-ux/theming
```

## Usage

After you install the package, you will need to create a file where you can run the `generateTheme()` method.

```ts
// scripts/make-theme.js
import { generateTheme } from '../index.js';

generateTheme({
  /* Add your options here */
});
```

Now you can execute the theme generator with your npm build scripts or include it as a module in another build file.

```json
{
  "name": "your-project",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc && npm run make-theme",
    "make-theme": "node scripts/make-theme.js"
  }
}
```

The default configuration will generate the following assets:

- CSS Reset - this is CSS file used to standardize the native elements across all browsers as well as according to the styles defined in the Semantic Tokens
- Theme - this is a CSS file containing all of your CSS variable/token definitions
- Token Helpers - this is a JavaScript file with helper functions that are strongly typed according to the tokens you have defined. These are designed to be used in lit's `css` tagged template literals, but these can also be used to define other tokens

Depending on your configuration, you may also generate the following assets:

- Dark Theme - this is a CSS file containing the media query and token definitions for "dark mode"
- Selector Theme - this is a CSS file containing class-based themes for toggling light/dark mode. These class names can be defined using the `lightThemeSelector` and `darkThemeSelector` properties

## Configuration

The theme generator has the following configuration:

```ts
type ThemeConfiguration = {
  /** Primitive and semantic tokens used to generate theme */
  tokens: CharmTokens;
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
  extendedResetStyles?: string;
  /** Adds custom styles to your base theme */
  extendedTokens?: string;
  /** Adds custom styles to your light theme */
  extendedLightTokens?: string;
  /** Adds custom styles to your dark theme */
  extendedDarkTokens?: string;
  /** Adds custom styles to your selector theme */
  extendedSemanticTokens?: string;
  /** Adds custom functions to the token helpers */
  extendedTokenHelpers?: string;
  /** Adds custom CSS utilities to the generated utilities */
  extendedCssUtilities?: string;
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
```

## Tokens

The theme generator takes to groups of token configurations - `primitives` and `semantics`.

- **_Primitive Tokens:_** These tokens represent the fundamental building blocks of your design system. They reference raw values, such as colors (`#942d3a`), percentages (`50%`), or pixel sizes (`22px`). They define the core properties and values used consistently throughout a design.
- **_Semantic Tokens:_** These tokens represent design intent and provide context-aware implementation of the primitive tokens. These tokens are used in the CSS reset to standardize native element styles as well as in the components.

```ts
type CharmTokens = {
  /** Primitives are reusable foundational tokens for your global CSS or components */
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

  /** Semantics define baseline themes and Charm core components, CSS reset, and can also use them in your global CSS or within your components */
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
```

### Defining Primitives

The following properties all take a key/value pair of values to provide aliases and values:

- `borderRadius`
- `borderWidth`
- `color`
- `containerQuery`
- `duration`
- `fontFamily`
- `fontSize`
- `fontWeight`
- `lineHeight`
- `mediaQuery`
- `shadow`
- `spacing`
- `timingFunction`
- `zIndex`
- `extendedTokens`

```ts
const myOptions = {
  tokens: {
    primitives: {
      borderRadius: {
        none: '0',
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        pill: '10rem',
        circle: '50%',
      },
      duration: {
        xslow: '2s',
        slow: '1s',
        med: '0.5s',
        fast: '0.3s',
        xfast: '0.1s',
      },
      /* Add the rest of your tokens here */
    },
  },
};
```

> Use Token Helper functions for media and container queries, as these queries do not support CSS variables.

#### Colors

Colors have a slightly different interface to accommodate more complex naming conventions.

```ts
export type Colors = {
  [key: string]:
    | {
        [key: string]: ColorSchemeColors | string;
      }
    | string;
};
```

Using this structure, you can define your color palette using a color/variation naming convention.

```ts
const options = {
  tokens: {
    primitives: {
      colors: {
        primary: {
          100: '#ffe5e5',
          200: '#ffb3b3',
          300: '#ff7f7f',
          400: '#ff4c4c',
          500: '#ff1919',
          600: '#e50000',
          700: '#b30000',
          800: '#7f0000',
          900: '#4c0000',
        },
        secondary: {
          100: '#fff0e5',
          200: '#ffcc99',
          300: '#ff9966',
          400: '#ff6633',
          500: '#ff3300',
          600: '#e52e00',
          700: '#b32400',
          800: '#7f1a00',
          900: '#4c1000',
        },
        neutral: {
          100: '#f7f7f7',
          200: '#e1e1e1',
          300: '#cfcfcf',
          400: '#b1b1b1',
          500: '#939393',
          600: '#757575',
          700: '#616161',
          800: '#4f4f4f',
          900: '#3f3f3f',
        },
      },
    },
  },
};
```

Or an alternative naming convention.

```ts
const options = {
  tokens: {
    primitives: {
      colors: {
        primary: {
          darker: '#ffe5e5',
          dark: '#ffb3b3',
          base: '#ff7f7f',
          light: '#ff4c4c',
          lighter: '#ff1919',
        },
        secondary: {
          darker: '#fff0e5',
          dark: '#ffcc99',
          base: '#ff9966',
          light: '#ff6633',
          lighter: '#ff3300',
        },
        neutral: {
          darker: '#f7f7f7',
          dark: '#e1e1e1',
          base: '#cfcfcf',
          light: '#b1b1b1',
          lighter: '#939393',
        },
      },
    },
  },
};
```

> These values are converted to `rgba` format (unless otherwise configured) to accommodate the "alpha" channel. The color tokens also include color "alpha" tokens, allowing you to control the opacity of a color based on a given context. The value should be between `0` and `1`.
>
> Color token: `--colors-primary-500: rgba(255, 255, 224, var(--colors-primary-500-alpha));`
>
> Alpha token: `--colors-primary-500-alpha: 1;`

These properties also support the `ColorSchemeColors` as a value, allowing you to specify `light` and `dark` variations for your color palette, which will generate your dark-mode themes.

```ts
type ColorSchemeColors = {
  light: string;
  dark: string;
};
```

```ts
const options = {
  tokens: {
    primitives: {
      colors: {
        primary: {
          100: {
            light: '#ff8c00',
            dark: '#ff4500',
          },
          200: {
            light: '#ffa500',
            dark: '#ff6347',
          },
          300: {
            light: '#ffd700',
            dark: '#ffa500',
          },
          400: {
            light: '#ffff00',
            dark: '#ffd700',
          },
          500: {
            light: '#ffffe0',
            dark: '#fffacd',
          },
        },
      },
    },
  },
};
```

> When creating color names, use a generic naming convention - "primary", "secondary", "success", "danger", "neutral" etc. This will reduce confusion when creating theme variations or extending a project.

##### Generating a Color Palette

If you do not want to define your own color palette, you can define your base colors and the palette will automatically create the variations for you.

```ts
const options = {
  neutralColor: 'neutral',

  tokens: {
    primitives: {
      colors: {
        primary: '#0f6cbd',
        danger: '#C50F1F',
        neutral: '#808080',
      },
    },
  },
};
```

> When generating a color palette, be sure to set the `neutralColor` value to the name of your neutral color palette. That will include the "black" and "white" colors on the palette and will generate the appropriate token helpers.

#### Shadows

Shadows can accept a key/value pair of values, but it also supports the `ColorSchemeColors` interface in case you need to vary your shadows in dark-mode.

```ts
type Shadows = {
  [key: string]: ColorSchemeColors | string;
};
```

```ts
const myOptions = {
  tokens: {
    primitives: {
      shadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 8px 0 rgba(0, 0, 0, 0.1)',
        lg: '0 8px 16px 0 rgba(0, 0, 0, 0.1)',
        xl: '0 12px 24px 0 rgba(0, 0, 0, 0.1)',
      },
    },
  },
};
```

Using color scheme variations:

```ts
const myOptions = {
  tokens: {
    primitives: {
      shadow: {
        sm: {
          light: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          dark: '0 1px 2px 0 rgba(0, 0, 0, 0.1)',
        },
        md: {
          light: '0 4px 8px 0 rgba(0, 0, 0, 0.1)',
          dark: '0 4px 4px 0 rgba(0, 0, 0, 0.2)',
        },
        lg: {
          light: '0 8px 16px 0 rgba(0, 0, 0, 0.1)',
          dark: '0 8px 14px 0 rgba(0, 0, 0, 0.2)',
        },
        xl: {
          light: '0 12px 24px 0 rgba(0, 0, 0, 0.1)',
          dark: '0 12px 18px 0 rgba(0, 0, 0, 0.2)',
        },
      },
    },
  },
};
```

### Token Helpers

The theme generator outputs Token Helper functions based on the tokens you provide. These functions are strongly typed according to your tokens.

> If you do not want these helpers, you can use the `skipHelpers` option to prevent their generation.

```ts
// avatar.styles.ts

export default css`
  :host {
    border-radius: ${borderRadius('circle')};
    font-size: ${fontSize('md')};
    background-color: ${color('primary', 500)};
    color: ${color('neutral', 900)};
  }
`;
```

#### Unique Palettes

There may be instances where a color palette's interface differs from your other color palettes. Neutral colors are a good example, because they include additional values like white and black. In this case, you can specify the name of your unique palettes using the `uniquePalettes` configuration. As a result, appropriately typed functions will be generated for those palettes.

```ts
// make-theme.js

const options = {
  uniquePalettes = ['neutral'],
};
```

```ts
// avatar.styles.ts

export default css`
  :host {
    border-radius: ${borderRadius('circle')};
    font-size: ${fontSize('md')};
    background-color: ${color('primary', 500)};
    color: ${neutralColor(1000)};
  }
`;
```

#### Color Alpha Helpers

Primitive tokens are not often changed after they are initially set, but one exception is a color's "alpha channel", which controls opacity. There is a special helper called `setColorAlpha` (and `setNeutralColorAlpha` if you have specified a unique color palette) that can be used to update the value based on a specific context.

```ts
// input.styles.ts

export default css`
  .input:invalid {
    border-color: ${color('danger', 700)};
    background-color: ${color('danger', 300)};
    ${setColorAlpha('danger', 300, 0.5)};
  }
`;
```

```ts
// dialog.styles.ts

export default css`
  .overlay {
    background-color: ${neutralColor(700)};
    ${setNeutralColorAlpha(700, 0.08)};
  }
`;
```

#### Media and Container Queries

Media and containers do not support using CSS variables as values, so to improve consistency there are two types functions. `containerQuery` and `mediaQuery` return values that you have defined in the tokens.

```ts
// nav-bar.styles.ts

export default css`
  @media screen and (max-width: ${mediaQuery('xl')}) {
    .nav-bar {
      flex-direction: row;
    }
  }

  @media screen and (max-width: ${mediaQuery('sm')}) {
    .nav-bar {
      flex-direction: column;
    }
  }
`;
```

You can use the `containerQueryBlock` and `mediaQueryBlock` for a simplified interface.

```ts
// nav-bar.styles.ts

export default css`
  ${mediaQueryBlock(
    'xl',
    css`
      .nav-bar {
        flex-direction: row;
      }
    `
  )};

  ${mediaQueryBlock(
    'sm',
    css`
      .nav-bar {
        flex-direction: column;
      }
    `
  )};
`;
```

If you are using the `containerQueryBlock`, be sure to set the `container` property on the element being observed.

```ts
// nav-bar.styles.ts

export default css`
  .nav-bar {
    container: inline-size;
  }

  ${containerQueryBlock(
    'xl',
    css`
      .nav-bar {
        flex-direction: row;
      }
    `
  )};

  ${containerQueryBlock(
    'sm',
    css`
      .nav-bar {
        flex-direction: column;
      }
    `
  )};
`;
```

If you are using [CSS nesting](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_nesting/Using_CSS_nesting), you can simplify the implementation by nesting them in the container being styled.

```ts
// nav-bar.styles.ts

export default css`
  .nav-bar {
    container: inline-size;

    ${containerQueryBlock(
      'xl',
      css`
        flex-direction: row;
      `
    )};
    ${containerQueryBlock(
      'sm',
      css`
        flex-direction: column;
      `
    )};
  }
`;
```

#### Using Helpers to Define Tokens

The theme generator supports using the Token Helpers in your token definitions, but there are some steps you should take to prevent potential build and CI issues.

1. Define your primitive tokens
2. Run the theme generator to generate your Token Helpers
3. Import the Token Helpers to define the rest of your tokens
4. Include the Token Helpers in your source control to prevent further timing issues with Token Helper generation and builds

#### Adding Custom Helpers

If you would like to include your own custom helper functions, you can define them using the `extendedTokenHelpers` property. These will be included in file with the rest of the generated token helpers.

### Adding Custom Tokens

If there are additional primitive tokens you would like to add, you can add them using the `extendedTokens` property for general tokens and the `extendedLightTokens`/`extendedDarkTokens` for the color scheme based. Each of these properties can use a string or the `css` tagged template literal from lit.

### Defining Semantic Tokens

Semantic tokens are much more specific in their naming convention and implementation. These are used in the CSS reset as well as in the components to create style consistency throughout the user interface.

> Several of the semantic tokens support `ColorSchemeColors` so you can provide color-scheme specific variations.

#### Body

These define the styles applied globally to the application.

```ts
type Body = {
  bgColor?: ColorSchemeColors | string;
  fgColor?: ColorSchemeColors | string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
};
```

#### Border

This defines the global border styles as well as defines the default border styles.

```ts
type Border = {
  size?: string;
  color?: ColorSchemeColors | string;
  style?: string;
};
```

#### Buttons

This is used to set the styles for the native `<button>` element as well as the default styles for the button component.

```ts
type Button = {
  // REST
  bgColor?: ColorSchemeColors | string;
  borderColor?: ColorSchemeColors | string;
  borderSize?: string;
  borderStyle?: string;
  borderRadius?: string;
  fgColor?: ColorSchemeColors | string;
  fontWeight?: string;
  paddingX?: string;
  paddingY?: string;
  shadow?: ColorSchemeColors | string;

  // ACTIVE
  activeFgColor?: ColorSchemeColors | string;
  activeBorderColor?: ColorSchemeColors | string;
  activeBgColor?: ColorSchemeColors | string;
  shadowActive?: ColorSchemeColors | string;

  // DISABLED
  disabledBgColor?: ColorSchemeColors | string;
  disabledBorderColor?: ColorSchemeColors | string;
  disabledFgColor?: ColorSchemeColors | string;
  shadowDisabled?: ColorSchemeColors | string;

  // FOCUS
  focusBgColor?: ColorSchemeColors | string;
  focusBorderColor?: ColorSchemeColors | string;
  focusFgColor?: ColorSchemeColors | string;
  shadowFocus?: ColorSchemeColors | string;

  // HOVER
  hoverBgColor?: ColorSchemeColors | string;
  hoverBorderColor?: ColorSchemeColors | string;
  hoverFgColor?: ColorSchemeColors | string;
  shadowHover?: ColorSchemeColors | string;
};
```

#### Link

Like the button styles, this is used to set the styles for the native anchor (`<a>`) element as well as the default styles for links in the button component.

```ts
type Link = {
  // REST
  fgColor?: ColorSchemeColors | string;
  decoration?: string;

  // ACTIVE
  activeFgColor?: ColorSchemeColors | string;
  activeDecoration?: string;

  // HOVER
  hoverFgColor?: ColorSchemeColors | string;
  hoverDecoration?: string;

  // FOCUS
  focusFgColor?: ColorSchemeColors | string;
  focusDecoration?: string;

  // VISITED
  visitedFgColor?: ColorSchemeColors | string;
  visitedDecoration?: string;
};
```

#### Forms

This sets the styles for the native `<form>` element.

```ts
type Form = {
  borderColor?: ColorSchemeColors | string;
  borderSize?: string;
  borderStyle?: string;
  borderRadius?: string;
  bgColor?: ColorSchemeColors | string;
  contentGap?: string;
  paddingX?: string;
  paddingY?: string;
};
```

#### Form Controls

This sets the default styles for the native form control elements as well as the styles within the form control components.

```ts
type FormControl = {
  // REST
  bgColor?: ColorSchemeColors | string;
  borderColor?: ColorSchemeColors | string;
  borderRadius?: string;
  borderSize?: string;
  borderStyle?: string;
  fgColor?: ColorSchemeColors | string;
  fontSize?: string;
  iconGap?: string;
  inputHeight?: string;
  placeholderColor?: ColorSchemeColors | string;
  paddingX?: string;
  paddingY?: string;

  // DISABLED
  disabledBgColor?: ColorSchemeColors | string;
  disabledBorderColor?: ColorSchemeColors | string;
  disabledFgColor?: ColorSchemeColors | string;
  disabledOpacity?: string;
  disabledPlaceholderColor?: ColorSchemeColors | string;

  // INVALID
  invalidBgColor?: ColorSchemeColors | string;
  invalidBorderColor?: ColorSchemeColors | string;
  invalidFgColor?: ColorSchemeColors | string;
  invalidPlaceholderColor?: ColorSchemeColors | string;
  invalidMessageFgColor?: ColorSchemeColors | string;

  // FOCUS
  focusBgColor?: ColorSchemeColors | string;
  focusBorderColor?: ColorSchemeColors | string;
  focusFgColor?: ColorSchemeColors | string;

  helpText?: {
    fgColor?: ColorSchemeColors | string;
    fontSize?: string;
    fontWeight?: string;
    gap?: string;
  };

  label?: {
    fgColor?: ColorSchemeColors | string;
    fontSize?: string;
    fontWeight?: string;
    gap?: string;
    requiredIndicatorGap?: string;
  };
};
```

#### Headings

This sets the base styles for the native heading elements.

```ts
type Heading = {
  fgColor?: ColorSchemeColors | string;
  fontFamily?: string;
  fontWeight?: string;
  lineHeight?: string;
};
```

#### Focus Outline

This globally sets the focus outline styles. The focus outline is configured to be used with the `:focus-visible` selector so they are visible when using keyboard navigation.

```ts
type FocusOutline = {
  color?: ColorSchemeColors | string;
  offset?: string;
  size?: string;
  style?: string;
};
```

## CSS Utility Classes

Each theme will generate a file with CSS utility classes in them. These are designed to provide easy access to your token values to support design consistency.

> These utility classes are considered "last mile" styling tools meaning you should not use them to style your components. Each of the styles use the `!important` property to prevent issues with specificity and inheritance. Using them in your components will make extending and customizing them very difficult. These should be reserved for teams using the component library.

### CSS Utility Examples

The following utilities will be generated based on your configuration.

#### Border Radius

`br-{size}` (ex - `br-none`, `br-xl`, `br-circle`, etc.)

`br-s-{size}` "border-radius start" sets the `border-start-start-radius` and `border-end-start-radius` properties

`br-e-{name}` "border-radius end" sets the `border-start-end-radius` and `border-end-end-radius` properties

`br-t-{name}` "border-radius top" sets the `border-start-start-radius` and `border-start-end-radius` properties

`br-b-{name}` "border-radius bottom" sets the `border-end-start-radius` and `border-end-end-radius` properties

#### Border Widths

`b-{name}` (ex - `b-none`, `b-3`, etc.)

`bs-{name}` "border start" sets the `border-inline-start`

`be-{name}` "border end" sets the `border-inline-end`

`bt-{name}` "border top" sets the `border-block-start`

`bb-{name}` "border bottom" sets the `border-block-end`

`bx-{name}` "horizontal border" sets the `border-inline`

`by-{name}` "vertical border" sets the `border-block`

#### Colors

##### Background

The utilities prefixed with `bg-` will set the `background-color` property with the color associated to the class name and the `color` property will be set the to appropriate contrasting color to support accessible UIs.

`bg-{color}-{variation}` (ex - `bg-primary-500`, `bg-danger-light`, etc.)

##### Foreground

The utilities prefixed with `fg-` will set the `color` property to the color with the associated class name.

`fg-{color}-{variation}` (ex - `fg-neutral-900`, `fg-success-darker`, etc.)

##### Border

`b-{name}-{variation}` (ex - `b-primary-500`, `b-caution-base`, etc.)

`bs-{name}-{variation}` "border start" sets the `border-inline-start-color`

`be-{name}-{variation}` "border end" sets the `border-inline-end-color`

`bt-{name}-{variation}` "border top" sets the `border-block-start-color`

`bb-{name}-{variation}` "border bottom" sets the `border-block-end-color`

`bx-{name}-{variation}` "horizontal border" sets the `border-inline-color`

`by-{name}-{variation}` "vertical border" sets the `border-block-color`

#### Duration

`duration-{name}` sets the `transition-duration` property

#### Font Families

`font-{name}` (ex - `font-base`, `font-monospace`, etc.)

#### Font Weights

`font-{name}` (ex - `font-bold`, `font-normal`, etc.)

#### Line Heights

`lh-{name}` (ex - `lh-sm`, `lh-500`, etc.)

#### Shadows

`shadow-{name}` (ex - `shadow-0`, `shadow-xl`, etc.)

#### Spacing

##### Margins

`m-{name}` (ex - `m-none`, `m-xl`, etc.)

`mt-{name}` "margin top" sets the `margin-block-start` property

`mb-{name}` "margin bottom" sets the `margin-block-end` property

`ms-{name}` "margin start" sets the `margin-inline-start` property

`me-{name}` "margin end" sets the `margin-inline-end` property

`mx-{name}` "horizontal margin" sets the `margin-inline` property

`my-{name}` "vertical margin" sets the `margin-block` property

##### Padding

`p-{name}` (ex - `p-none`, `p-xl`, etc.)

`pt-{name}` "padding top" sets the `padding-block-start` property

`pb-{name}` "padding bottom" sets the `padding-block-end` property

`ps-{name}` "padding start" sets the `padding-inline-start` property

`pe-{name}` "padding end" sets the `padding-inline-end` property

`px-{name}` "horizontal padding" sets the `padding-inline` property

`py-{name}` "vertical padding" sets the `padding-block` property

##### Gap

`gap-{name}` (ex - `gap-sm`, `gap-200`, etc.)

#### Transition Function

`tf-{name}` sets the `transition-timing-function`

### Adding Custom CSS Utilities

If you would like to add your own custom CSS utility classes, you can add them to the `extendedCssUtilities` config property. The property accepts a `string` or `CSSResult` from the Lit's `css` tagged template literal.
