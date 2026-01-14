export const basicTokens = {
  primitives: {
    duration: {
      fast: '100ms',
      medium: '200ms',
      slow: '300ms',
    },
    borderRadius: {
      none: '0',
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      full: '9999px',
    },
    borderWidth: {
      none: '0',
      sm: '1px',
      md: '2px',
      lg: '4px',
      xl: '8px',
    },
    color: {
      gray: {
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
      red: {
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
      orange: {
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
    },
    containerQuery: {
      sm: '400px',
      md: '600px',
      lg: '800px',
      xl: '1000px',
    },
    fontFamily: {
      base: 'Ariel, sans-serif',
      accent: 'Times New Roman, serif',
      monospace: 'Courier New, monospace',
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '20px',
      xl: '24px',
      '2xl': '32px',
      '3xl': '48px',
      '4xl': '64px',
      '5xl': '96px',
    },
    mediaQuery: {
      sm: '400px',
      md: '600px',
      lg: '800px',
      xl: '1000px',
    },
    shadow: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 8px 0 rgba(0, 0, 0, 0.1)',
      lg: '0 8px 16px 0 rgba(0, 0, 0, 0.1)',
      xl: '0 12px 24px 0 rgba(0, 0, 0, 0.1)',
    },
  },

  semantics: {
    body: {
      bgColor: 'white',
      fgColor: 'black',
      fontFamily: 'Ariel, sans-serif',
      fontSize: '16px',
      fontWeight: 'normal',
      lineHeight: '1.5',
    },
    border: {
      size: '1px',
      color: 'black',
      style: 'solid',
    },
    button: {
      // REST
      bgColor: 'white',
      borderColor: 'gray',
      borderSize: '1px',
      borderStyle: 'solid',
      borderRadius: '4px',
      fgColor: 'black',
      fontWeight: 'normal',
      paddingX: '8px',
      paddingY: '8px',
      shadow: 'none',

      // ACTIVE
      activeFgColor: 'inherit',
      activeBorderColor: 'inherit',
      activeBgColor: 'inherit',
      shadowActive: 'inherit',

      // DISABLED
      disabledBgColor: 'inherit',
      disabledBorderColor: 'inherit',
      disabledFgColor: 'inherit',
      shadowDisabled: 'inherit',

      // FOCUS
      focusBgColor: 'inherit',
      focusBorderColor: 'inherit',
      focusFgColor: 'inherit',
      shadowFocus: 'inherit',

      // HOVER
      hoverBgColor: 'inherit',
      hoverBorderColor: 'inherit',
      hoverFgColor: 'inherit',
      shadowHover: 'inherit',
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
      bgColor: 'inherit',
      borderColor: 'inherit',
      borderRadius: 'inherit',
      borderSize: 'inherit',
      borderStyle: 'inherit',
      fgColor: 'inherit',
      fontSize: 'inherit',
      iconGap: 'inherit',
      inputHeight: 'inherit',
      placeholderColor: 'inherit',
      paddingX: 'inherit',
      paddingY: 'inherit',

      // DISABLED
      disabledBgColor: 'inherit',
      disabledBorderColor: 'inherit',
      disabledFgColor: 'inherit',
      disabledOpacity: 'inherit',
      disabledPlaceholderColor: 'inherit',

      // INVALID
      invalidBgColor: 'inherit',
      invalidBorderColor: 'inherit',
      invalidFgColor: 'inherit',
      invalidPlaceholderColor: 'inherit',
      invalidMessageFgColor: 'inherit',

      // FOCUS
      focusBgColor: 'inherit',
      focusBorderColor: 'inherit',
      focusFgColor: 'inherit',

      helpText: {
        fgColor: 'inherit',
        fontSize: 'inherit',
        fontWeight: 'inherit',
        gap: 'inherit',
      },

      label: {
        fgColor: 'inherit',
        fontSize: 'inherit',
        fontWeight: 'inherit',
        gap: 'inherit',
        requiredIndicatorGap: 'inherit',
      },
    },
    heading: {
      fgColor: 'inherit',
      fontFamily: 'inherit',
      fontWeight: 'inherit',
      lineHeight: 'inherit',
    },
    link: {
      // REST
      fgColor: 'inherit',
      decoration: 'inherit',

      // ACTIVE
      activeFgColor: 'inherit',
      activeDecoration: 'inherit',

      // HOVER
      hoverFgColor: 'inherit',
      hoverDecoration: 'inherit',

      // FOCUS
      focusFgColor: 'inherit',
      focusDecoration: 'inherit',

      // VISITED
      visitedFgColor: 'inherit',
      visitedDecoration: 'inherit',
    },
    focusOutline: {
      color: 'inherit',
      offset: 'inherit',
      size: 'inherit',
      style: 'inherit',
    },
  },
};

export const themedTokens = {
  primitives: {
    color: {
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
      secondary: {
        100: {
          light: '#0000ff',
          dark: '#00008b',
        },
        200: {
          light: '#0000cd',
          dark: '#000080',
        },
        300: {
          light: '#00008b',
          dark: '#000064',
        },
        400: {
          light: '#000064',
          dark: '#000046',
        },
        500: {
          light: '#000046',
          dark: '#000032',
        },
      },
    },
  },
  semantics: {
    body: {
      bgColor: {
        light: 'white',
        dark: 'black',
      },
      fgColor: {
        light: 'black',
        dark: 'white',
      },
    },
    button: {
      bgColor: {
        light: 'white',
        dark: 'black',
      },
      borderColor: {
        light: 'gray',
        dark: 'gray',
      },
      fgColor: {
        light: 'black',
        dark: 'white',
      },
      shadow: {
        light: 'none',
        dark: 'none',
      },
    },
  },
};
