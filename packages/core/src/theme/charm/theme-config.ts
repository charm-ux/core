import {
  borderRadius,
  borderWidth,
  color,
  defaultBorder,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  neutralAltColor,
  neutralColor,
  shadow,
  spacing,
} from './token-helpers.js';
import type { ThemeConfiguration } from '@charm-ux/theming';

export const charmThemeConfig: ThemeConfiguration = {
  outDir: 'dist/themes/charm',
  helpersOutDir: 'src/theme/charm',
  uniquePalettes: ['brand', 'neutral'],
  lightThemeSelector: '.charm-light',
  darkThemeSelector: '.charm-dark',
  neutralColor: 'neutral',
  tokens: {
    primitives: {
      borderRadius: {
        none: '0',
        sm: '0.25rem', // 4px
        md: '0.5rem', // 8px
        lg: '0.75rem', // 12px
        pill: '10rem', // 160px
        circle: '50%',
      },
      borderWidth: {
        none: '0',
        thin: '1px',
        thick: '2px',
        thicker: '3px',
        thickest: '4px',
      },
      color: {
        primary: '#0265dc',
        danger: '#dc2626',
        neutral: '#d5d5d5',
      },
      containerQuery: {
        sm: '400px',
        md: '600px',
        lg: '800px',
        xl: '1000px',
      },
      duration: {
        xslow: '2s',
        slow: '1s',
        med: '0.5s',
        fast: '0.3s',
        xfast: '0.1s',
      },
      fontFamily: {
        accent:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, Noto Sans, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
        base: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, Noto Sans, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
        monospace: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      },
      fontSize: {
        xxs: '0.75rem', // 12px
        xs: '0.875rem', // 14px
        sm: '1rem', // 16px
        md: '1.25rem', // 30px
        lg: '1.5rem', // 24px
        xl: '2rem', // 32px
        xxl: '3rem', // 48px,
      },
      fontWeight: {
        regular: '400',
        medium: '500',
        semiBold: '600',
        bold: '700',
      },
      lineHeight: {
        xs: '1',
        sm: '1.25',
        md: '1.5',
        lg: '2',
      },
      mediaQuery: {
        sm: '400px',
        md: '600px',
        lg: '800px',
        xl: '1000px',
      },
      shadow: {
        none: 'none',
        inner: 'inset 1px 2px 4px rgba(0, 0, 0, 0.10)',
        outline: '0 0 0 3px rgba(0, 0, 0, 0.5)',
        xs: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
        sm: '0 3px 5px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)',
        md: '0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.10)',
        lg: '0 15px 25px rgba(0, 0, 0, 0.15), 0 5px 10px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 40px rgba(0, 0, 0, 0.20)',
      },
      spacing: {
        none: '0',
        '3xs': '0.0625rem', // 1px
        xxs: '0.125rem', // 2px
        xs: '0.25rem', // 4px
        sm: '0.5rem', // 8px
        md: '0.75rem', // 12px
        lg: '1rem', // 16px
        xl: '1.25rem', // 20px
        xxl: '1.5rem', // 24px
        '3xl': '2rem', // 32px
      },
      timingFunction: {
        ease: 'ease',
        easeIn: 'ease-in',
        easeInOut: 'ease-in-out',
        easeOut: 'ease-out',
        linear: 'linear',
      },
    },

    semantics: {
      // CHARM SEMANTIC TOKENS

      body: {
        bgColor: {
          light: neutralColor(0),
          dark: neutralColor(800),
        },
        fgColor: {
          light: neutralColor(1000),
          dark: neutralColor(0),
        },
        fontFamily: fontFamily('base'),
        fontSize: fontSize('sm'),
        fontWeight: fontWeight('regular'),
        lineHeight: lineHeight('md'),
      },
      defaultBorder: {
        size: borderWidth('thin'),
        color: neutralColor(500),
        style: 'solid',
      },
      button: {
        // REST
        bgColor: {
          light: neutralColor(200),
          dark: neutralColor(800),
        },
        borderColor: {
          light: neutralColor(800),
          dark: neutralColor(800),
        },
        borderSize: borderWidth('thin'),
        borderStyle: 'solid',
        borderRadius: borderRadius('md'),
        fgColor: {
          light: neutralAltColor(200),
          dark: neutralAltColor(800),
        },
        fontWeight: fontWeight('regular'),
        paddingX: spacing('md'),
        paddingY: spacing('xs'),
        shadow: shadow('xs'),

        // ACTIVE
        activeFgColor: {
          light: neutralColor(800),
          dark: neutralColor(800),
        },
        activeBorderColor: {
          light: neutralColor(800),
          dark: neutralColor(800),
        },
        activeBgColor: {
          light: neutralColor(300),
          dark: neutralColor(700),
        },
        activeShadow: shadow('none'),

        // DISABLED
        disabledBgColor: {
          light: neutralColor(300),
          dark: neutralColor(300),
        },
        disabledBorderColor: {
          light: neutralColor(300),
          dark: neutralColor(300),
        },
        disabledFgColor: {
          light: neutralColor(400),
          dark: neutralColor(400),
        },
        disabledShadow: shadow('none'),

        // FOCUS
        focusBgColor: {
          light: neutralColor(200),
          dark: neutralColor(800),
        },
        focusBorderColor: {
          light: neutralColor(800),
          dark: neutralColor(800),
        },
        focusFgColor: {
          light: neutralAltColor(200),
          dark: neutralAltColor(800),
        },
        focusShadow: shadow('sm'),

        // HOVER
        hoverBgColor: {
          light: neutralColor(400),
          dark: neutralColor(700),
        },
        hoverBorderColor: {
          light: neutralColor(800),
          dark: neutralColor(800),
        },
        hoverFgColor: {
          light: neutralAltColor(200),
          dark: neutralAltColor(700),
        },
        hoverShadow: shadow('sm'),
      },
      form: {
        borderColor: 'inherit',
        borderSize: 'inherit',
        borderStyle: 'inherit',
        borderRadius: 'inherit',
        bgColor: 'inherit',
        contentGap: 'inherit',
        paddingX: 'inherit',
        paddingY: 'inherit',
      },
      formControl: {
        // REST
        bgColor: {
          light: neutralColor(0),
          dark: neutralColor(800),
        },
        borderColor: defaultBorder(),
        borderRadius: borderRadius('md'),
        borderSize: borderWidth('thin'),
        borderStyle: 'solid',
        fgColor: {
          light: neutralColor(1000),
          dark: neutralColor(0),
        },
        fontSize: fontSize('sm'),
        iconGap: spacing('xxs'),
        inputHeight: '32px',
        placeholderColor: neutralColor(500),
        paddingX: spacing('md'),
        paddingY: spacing('none'),

        // DISABLED
        disabledBgColor: {
          light: neutralColor(100),
          dark: neutralColor(700),
        },
        disabledBorderColor: {
          light: neutralColor(400),
          dark: neutralColor(400),
        },
        disabledFgColor: {
          light: neutralColor(400),
          dark: neutralColor(400),
        },
        disabledOpacity: '1',
        disabledPlaceholderColor: {
          light: neutralColor(300),
          dark: neutralColor(300),
        },

        // INVALID
        invalidBgColor: {
          light: neutralColor(0),
          dark: neutralColor(800),
        },
        invalidBorderColor: {
          light: color('danger', 500),
          dark: color('danger', 300),
        },
        invalidFgColor: {
          light: color('danger', 500),
          dark: color('danger', 300),
        },
        invalidPlaceholderColor: neutralColor(500),
        invalidMessageFgColor: {
          light: color('danger', 500),
          dark: color('danger', 300),
        },

        // FOCUS
        focusBgColor: {
          light: neutralColor(0),
          dark: neutralColor(800),
        },
        focusBorderColor: {
          light: color('primary', 500),
          dark: color('primary', 200),
        },
        focusFgColor: {
          light: neutralColor(1000),
          dark: neutralColor(0),
        },

        helpText: {
          fgColor: {
            light: neutralColor(800),
            dark: neutralColor(200),
          },
          fontSize: fontSize('sm'),
          fontWeight: fontWeight('regular'),
          gap: spacing('xxs'),
        },

        label: {
          fgColor: {
            light: neutralColor(1000),
            dark: neutralColor(0),
          },
          fontSize: fontSize('sm'),
          fontWeight: fontWeight('regular'),
          gap: spacing('xxs'),
          requiredIndicatorGap: spacing('xxs'),
        },
      },
      heading: {
        fgColor: 'inherit',
        fontFamily: 'inherit',
        fontWeight: fontWeight('semi-bold'),
        lineHeight: lineHeight('sm'),
      },
      link: {
        // REST
        fgColor: {
          light: color('primary', 500),
          dark: color('primary', 200),
        },
        decoration: 'none',

        // ACTIVE
        activeFgColor: {
          light: color('primary', 700),
          dark: color('primary', 400),
        },
        activeDecoration: 'underline',

        // HOVER
        hoverFgColor: {
          light: color('primary', 600),
          dark: color('primary', 300),
        },
        hoverDecoration: 'underline',

        // FOCUS
        focusFgColor: {
          light: color('primary', 500),
          dark: color('primary', 200),
        },
        focusDecoration: 'underline',

        // VISITED
        visitedFgColor: {
          light: color('primary', 700),
          dark: color('primary', 400),
        },
        visitedDecoration: 'none',

        // DISABLED
        disabledFgColor: {
          light: neutralColor(400),
          dark: neutralColor(400),
        },
        disabledDecoration: 'none',
      },
      focusOutline: {
        color: {
          light: color('primary', 500),
          dark: color('primary', 200),
        },
        offset: spacing('xxs'),
        size: borderWidth('thick'),
        style: 'solid',
      },

      extendedTokens: {},
    },
  },
  extendedResetStyles: `
  `,
  extendedTokenHelpers: `
  `,
  extendedCssUtilities: `
`,
};
