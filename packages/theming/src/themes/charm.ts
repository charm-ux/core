import { defineTokens } from '../defineTokens.js';
import { generateThemeSync } from '../generator/generateTheme.js';

const charmTokensBase = defineTokens(
  {
    primitives: {
      color: {
        /** Base colors - not palette-expanded */
        white: { light: '#ffffff', dark: '#ffffff' },
        black: { light: '#000000', dark: '#000000' },
        transparent: { light: '#ffffff00', dark: '#ffffff00' },

        /** Explicit palettes from design spec */
        brand: '#0265dc',
        accent: '#7c3aed',
        success: '#16a34a',
        warning: '#f59e0b',
        danger: '#dc2626',
        neutral: '#71717a',
      },
      spacing: {
        none: '0',
        '3xs': '1px',
        '2xs': '2px',
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
        '3xl': '48px',
      },
      borderRadius: {
        none: '0',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        pill: '160px',
        full: '9999px',
      },
      borderWidth: {
        none: '0',
        thin: '1px',
        medium: '2px',
        thick: '4px',
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
      typography: {
        fontFamily: {
          base: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          accent: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          mono: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
        },
        fontSize: {
          xxs: '0.75rem',
          xs: '0.875rem',
          sm: '1rem',
          md: '1.25rem',
          lg: '1.5rem',
          xl: '2rem',
          '2xl': '3rem',
        },
        fontWeight: {
          normal: '400',
          medium: '500',
          semibold: '600',
          bold: '700',
        },
        lineHeight: {
          xs: '1',
          sm: '1.25',
          md: '1.5',
          lg: '2',
        },
        letterSpacing: {
          tight: '-0.025em',
          normal: '0',
          wide: '0.025em',
        },
      },
      duration: {
        xfast: '0.1s',
        fast: '0.3s',
        normal: '0.5s',
        slow: '1s',
        xslow: '2s',
      },
      timingFunction: {
        ease: [0.25, 0.1, 0.25, 1],
        easeIn: [0.42, 0, 1, 1],
        easeOut: [0, 0, 0.58, 1],
        easeInOut: [0.42, 0, 0.58, 1],
      },
      zIndex: {
        base: '0',
        dropdown: '100',
        sticky: '200',
        modal: '300',
        popover: '400',
        tooltip: '500',
      },
    },

    semantics: ({ primitive }) => ({
      // Surface tokens - background colors for different elevation levels
      surface: {
        primary: { light: primitive('color', 'white'), dark: primitive('color', 'neutral', 950) },
        secondary: { light: primitive('color', 'neutral', 100), dark: primitive('color', 'neutral', 800) },
        tertiary: { light: primitive('color', 'neutral', 200), dark: primitive('color', 'neutral', 700) },
        inverse: { light: primitive('color', 'neutral', 900), dark: primitive('color', 'neutral', 50) },
      },

      // Text tokens - foreground colors for content
      text: {
        primary: { light: primitive('color', 'neutral', 900), dark: primitive('color', 'neutral', 50) },
        secondary: { light: primitive('color', 'neutral', 600), dark: primitive('color', 'neutral', 400) },
        inverse: { light: primitive('color', 'neutral', 50), dark: primitive('color', 'neutral', 900) },
      },

      // Border tokens - stroke colors for containers and dividers
      border: {
        primary: { light: primitive('color', 'neutral', 200), dark: primitive('color', 'neutral', 700) },
        secondary: { light: primitive('color', 'neutral', 300), dark: primitive('color', 'neutral', 600) },
        strong: { light: primitive('color', 'neutral', 400), dark: primitive('color', 'neutral', 500) },
      },

      // Action tokens - colors for interactive elements
      action: {
        primary: {
          color: primitive('color', 'brand', 500),
          hover: { color: { light: primitive('color', 'brand', 600), dark: primitive('color', 'brand', 400) } },
          active: { color: { light: primitive('color', 'brand', 700), dark: primitive('color', 'brand', 300) } },
        },
        secondary: {
          color: { light: primitive('color', 'neutral', 200), dark: primitive('color', 'neutral', 700) },
          hover: { color: { light: primitive('color', 'neutral', 300), dark: primitive('color', 'neutral', 600) } },
          active: { color: { light: primitive('color', 'neutral', 400), dark: primitive('color', 'neutral', 500) } },
        },
      },

      // Indicator tokens - colors for status and feedback
      indicator: {
        success: primitive('color', 'success', 500),
        warning: primitive('color', 'warning', 500),
        danger: primitive('color', 'danger', 500),
        info: primitive('color', 'brand', 500),
      },

      // Disabled state tokens
      disabled: {
        bgColor: { light: primitive('color', 'neutral', 100), dark: primitive('color', 'neutral', 800) },
        fgColor: { light: primitive('color', 'neutral', 400), dark: primitive('color', 'neutral', 500) },
        borderColor: { light: primitive('color', 'neutral', 200), dark: primitive('color', 'neutral', 700) },
      },

      // Body/document tokens
      body: {
        bgColor: { light: primitive('color', 'white'), dark: primitive('color', 'neutral', 950) },
        fgColor: { light: primitive('color', 'neutral', 900), dark: primitive('color', 'neutral', 50) },
        secondaryFgColor: { light: primitive('color', 'neutral', 600), dark: primitive('color', 'neutral', 400) },
        fontFamily: primitive('fontFamily', 'base'),
        fontSize: primitive('fontSize', 'sm'),
        fontWeight: primitive('fontWeight', 'normal'),
        lineHeight: primitive('lineHeight', 'md'),
      },

      // Heading tokens
      heading: {
        fgColor: { light: primitive('color', 'neutral', 900), dark: primitive('color', 'neutral', 50) },
        fontFamily: primitive('fontFamily', 'accent'),
        fontWeight: primitive('fontWeight', 'semibold'),
        lineHeight: primitive('lineHeight', 'sm'),
      },

      // Link tokens with states
      link: {
        fgColor: primitive('color', 'brand', 500),
        decoration: 'underline',
        hover: {
          fgColor: { light: primitive('color', 'brand', 600), dark: primitive('color', 'brand', 400) },
          decoration: 'underline',
        },
        active: {
          fgColor: { light: primitive('color', 'brand', 700), dark: primitive('color', 'brand', 300) },
          decoration: 'underline',
        },
        visited: {
          fgColor: { light: primitive('color', 'accent', 600), dark: primitive('color', 'accent', 400) },
          decoration: 'underline',
        },
      },

      // Default border tokens
      defaultBorder: {
        color: { light: primitive('color', 'neutral', 200), dark: primitive('color', 'neutral', 700) },
        width: primitive('borderWidth', 'thin'),
        style: 'solid',
      },

      // Default button tokens with SurfaceStates
      defaultButton: {
        bgColor: { light: primitive('color', 'neutral', 200), dark: primitive('color', 'neutral', 700) },
        fgColor: { light: primitive('color', 'neutral', 900), dark: primitive('color', 'neutral', 50) },
        borderColor: primitive('color', 'transparent'),
        borderWidth: primitive('borderWidth', 'thin'),
        borderStyle: 'solid',
        borderRadius: primitive('borderRadius', 'md'),
        fontWeight: primitive('fontWeight', 'medium'),
        paddingX: primitive('spacing', 'lg'),
        paddingY: primitive('spacing', 'sm'),
        shadow: primitive('shadow', 'xs'),
        hover: {
          bgColor: { light: primitive('color', 'neutral', 300), dark: primitive('color', 'neutral', 600) },
          fgColor: { light: primitive('color', 'neutral', 900), dark: primitive('color', 'neutral', 50) },
          borderColor: primitive('color', 'transparent'),
          shadow: primitive('shadow', 'sm'),
        },
        active: {
          bgColor: { light: primitive('color', 'neutral', 400), dark: primitive('color', 'neutral', 500) },
          fgColor: { light: primitive('color', 'neutral', 900), dark: primitive('color', 'neutral', 50) },
          borderColor: primitive('color', 'transparent'),
          shadow: primitive('shadow', 'none'),
        },
        focus: {
          bgColor: { light: primitive('color', 'neutral', 200), dark: primitive('color', 'neutral', 700) },
          fgColor: { light: primitive('color', 'neutral', 900), dark: primitive('color', 'neutral', 50) },
          borderColor: primitive('color', 'brand', 500),
          shadow: primitive('shadow', 'sm'),
        },
        disabled: {
          bgColor: { light: primitive('color', 'neutral', 100), dark: primitive('color', 'neutral', 800) },
          fgColor: { light: primitive('color', 'neutral', 400), dark: primitive('color', 'neutral', 500) },
          borderColor: primitive('color', 'transparent'),
          shadow: primitive('shadow', 'none'),
          cursor: 'not-allowed',
        },
      },

      // Form container tokens
      form: {
        bgColor: primitive('color', 'transparent'),
        fgColor: { light: primitive('color', 'neutral', 900), dark: primitive('color', 'neutral', 50) },
        borderColor: primitive('color', 'transparent'),
        borderRadius: '0',
        paddingX: '0',
        paddingY: '0',
        contentGap: primitive('spacing', 'lg'),
      },

      // Form control tokens with SurfaceStates
      formControl: {
        // Base state
        bgColor: { light: primitive('color', 'white'), dark: primitive('color', 'neutral', 800) },
        fgColor: { light: primitive('color', 'neutral', 900), dark: primitive('color', 'neutral', 50) },
        borderColor: { light: primitive('color', 'neutral', 300), dark: primitive('color', 'neutral', 600) },
        placeholderColor: { light: primitive('color', 'neutral', 400), dark: primitive('color', 'neutral', 500) },
        shadow: primitive('shadow', 'none'),
        // Static properties
        borderWidth: primitive('borderWidth', 'thin'),
        borderStyle: 'solid',
        borderRadius: primitive('borderRadius', 'md'),
        fontSize: primitive('fontSize', 'sm'),
        paddingX: primitive('spacing', 'md'),
        paddingY: primitive('spacing', 'sm'),
        inputHeight: '40px',
        iconGap: primitive('spacing', 'xs'),
        // Interactive states
        hover: {
          bgColor: { light: primitive('color', 'white'), dark: primitive('color', 'neutral', 800) },
          fgColor: { light: primitive('color', 'neutral', 900), dark: primitive('color', 'neutral', 50) },
          borderColor: { light: primitive('color', 'neutral', 400), dark: primitive('color', 'neutral', 500) },
        },
        focus: {
          bgColor: { light: primitive('color', 'white'), dark: primitive('color', 'neutral', 800) },
          fgColor: { light: primitive('color', 'neutral', 900), dark: primitive('color', 'neutral', 50) },
          borderColor: primitive('color', 'brand', 500),
          shadow: primitive('shadow', 'outline'),
        },
        disabled: {
          bgColor: { light: primitive('color', 'neutral', 100), dark: primitive('color', 'neutral', 700) },
          fgColor: { light: primitive('color', 'neutral', 400), dark: primitive('color', 'neutral', 500) },
          borderColor: { light: primitive('color', 'neutral', 200), dark: primitive('color', 'neutral', 700) },
          placeholderColor: { light: primitive('color', 'neutral', 300), dark: primitive('color', 'neutral', 600) },
          cursor: 'not-allowed',
          opacity: '1',
        },
        invalid: {
          borderColor: primitive('color', 'danger', 500),
          placeholderColor: { light: primitive('color', 'danger', 300), dark: primitive('color', 'danger', 700) },
          shadow: primitive('shadow', 'none'),
          message: {
            color: primitive('color', 'danger', 500),
            fontSize: primitive('fontSize', 'xs'),
            fontWeight: primitive('fontWeight', 'normal'),
            gap: primitive('spacing', 'xs'),
          },
        },
        // Label
        label: {
          color: { light: primitive('color', 'neutral', 900), dark: primitive('color', 'neutral', 50) },
          fontSize: primitive('fontSize', 'sm'),
          fontWeight: primitive('fontWeight', 'medium'),
          gap: primitive('spacing', 'xs'),
          requiredIndicatorGap: primitive('spacing', '2xs'),
        },
        // Help text
        helpText: {
          color: { light: primitive('color', 'neutral', 600), dark: primitive('color', 'neutral', 400) },
          fontSize: primitive('fontSize', 'xs'),
          fontWeight: primitive('fontWeight', 'normal'),
          gap: primitive('spacing', 'xs'),
        },
        // Range input
        range: {
          thumbSize: '16px',
          trackSize: '4px',
          trackMarginTop: '8px',
        },
      },

      focus: {
        outlineColor: primitive('color', 'brand', 500),
        outlineWidth: primitive('borderWidth', 'medium'),
        outlineStyle: 'solid',
        outlineOffset: primitive('spacing', '2xs'),
      },
    }),

    components: ({ primitive, semantic }) => ({
      // Accordion
      accordion: {
        topBorderColor: semantic('border', 'primary'),
      },
      accordionItem: {
        bgColor: semantic('surface', 'primary'),
        fgColor: semantic('text', 'primary'),
        borderColor: semantic('border', 'primary'),
        borderWidth: primitive('borderWidth', 'thin'),
        hover: {
          bgColor: semantic('surface', 'secondary'),
          fgColor: semantic('text', 'primary'),
          borderColor: semantic('border', 'secondary'),
        },
        disabled: {
          bgColor: semantic('disabled', 'bgColor'),
          fgColor: semantic('disabled', 'fgColor'),
          borderColor: semantic('disabled', 'borderColor'),
        },
        animation: {
          duration: primitive('duration', 'fast'),
          timingFunction: 'ease-in-out',
        },
        icon: {
          transition: 'transform 0.3s ease-in-out',
          expandedTransform: 'rotate(180deg)',
          collapsedTransform: 'rotate(0deg)',
        },
      },

      // Alert
      alert: {
        bgColor: semantic('surface', 'primary'),
        fgColor: semantic('text', 'primary'),
        border: `1px solid ${semantic('border', 'primary')}`,
        padding: primitive('spacing', 'lg'),
        fontSize: primitive('fontSize', 'sm'),
        fontWeight: primitive('fontWeight', 'normal'),
        transition: 'opacity 0.3s ease',
        actionsGap: primitive('spacing', 'sm'),
        headingFontSize: primitive('fontSize', 'md'),
        headingFontWeight: primitive('fontWeight', 'semibold'),
        iconColor: semantic('text', 'secondary'),
        iconSize: '24px',
        iconMargin: primitive('spacing', 'md'),
        messageMargin: primitive('spacing', 'sm'),
        buttonBgColor: semantic('surface', 'secondary'),
        buttonHoverBgColor: semantic('surface', 'tertiary'),
        buttonActiveBgColor: semantic('action', 'secondary', 'active', 'color'),
        buttonBorder: 'none',
        buttonFontSize: primitive('fontSize', 'xs'),
        buttonPadding: `${primitive('spacing', 'xs')} ${primitive('spacing', 'sm')}`,
      },

      // Avatar
      avatar: {
        bgColor: semantic('surface', 'tertiary'),
        size: '40px',
        borderRadius: primitive('borderRadius', 'full'),
        indicatorBgColor: semantic('indicator', 'success'),
        indicatorFgColor: primitive('color', 'white'),
        indicatorSize: '12px',
        indicatorBorderColor: primitive('color', 'white'),
        indicatorBorderWidth: '2px',
        indicatorBorderRadius: primitive('borderRadius', 'full'),
      },

      // Badge
      badge: {
        bgColor: semantic('surface', 'secondary'),
        fgColor: semantic('text', 'primary'),
        borderColor: semantic('border', 'primary'),
        borderRadius: primitive('borderRadius', 'full'),
        borderStyle: 'solid',
        borderWidth: primitive('borderWidth', 'thin'),
        padding: `${primitive('spacing', '2xs')} ${primitive('spacing', 'sm')}`,
        size: '20px',
      },

      // Breadcrumb
      breadcrumb: {
        item: {
          gap: primitive('spacing', 'xs'),
          padding: `${primitive('spacing', 'xs')} ${primitive('spacing', 'sm')}`,
          controlWidth: '24px',
          borderWidth: primitive('borderWidth', 'thin'),
          bgColor: 'transparent',
          fgColor: semantic('text', 'secondary'),
          borderColor: 'transparent',
          hover: {
            bgColor: semantic('surface', 'secondary'),
            fgColor: semantic('text', 'primary'),
            borderColor: 'transparent',
          },
          active: {
            bgColor: semantic('surface', 'tertiary'),
            fgColor: semantic('text', 'primary'),
            borderColor: 'transparent',
          },
          focus: {
            bgColor: semantic('surface', 'secondary'),
            fgColor: semantic('text', 'primary'),
            borderColor: semantic('focus', 'outlineColor'),
          },
          disabled: {
            bgColor: 'transparent',
            fgColor: semantic('disabled', 'fgColor'),
            borderColor: 'transparent',
          },
        },
      },

      // Button
      button: {
        bgColor: semantic('surface', 'secondary'),
        fgColor: semantic('text', 'primary'),
        borderColor: semantic('border', 'secondary'),
        shadow: primitive('shadow', 'xs'),
        borderRadius: primitive('borderRadius', 'md'),
        borderWidth: primitive('borderWidth', 'thin'),
        borderStyle: 'solid',
        fontWeight: primitive('fontWeight', 'medium'),
        paddingX: primitive('spacing', 'lg'),
        paddingY: primitive('spacing', 'sm'),
        contentGap: primitive('spacing', 'sm'),
        iconSize: '20px',
        iconPaddingX: primitive('spacing', 'sm'),
        iconPaddingY: primitive('spacing', 'sm'),
        hover: {
          bgColor: semantic('surface', 'tertiary'),
          fgColor: semantic('text', 'primary'),
          borderColor: semantic('border', 'strong'),
          shadow: primitive('shadow', 'sm'),
        },
        active: {
          bgColor: semantic('action', 'secondary', 'active', 'color'),
          fgColor: semantic('text', 'primary'),
          borderColor: semantic('border', 'strong'),
          shadow: primitive('shadow', 'none'),
        },
        focus: {
          bgColor: semantic('surface', 'secondary'),
          fgColor: semantic('text', 'primary'),
          borderColor: semantic('focus', 'outlineColor'),
          shadow: primitive('shadow', 'sm'),
        },
        disabled: {
          bgColor: semantic('disabled', 'bgColor'),
          fgColor: semantic('disabled', 'fgColor'),
          borderColor: semantic('disabled', 'borderColor'),
          shadow: primitive('shadow', 'none'),
          cursor: 'not-allowed',
        },
        pressed: {
          bgColor: semantic('action', 'secondary', 'active', 'color'),
          fgColor: semantic('text', 'primary'),
          borderColor: semantic('border', 'strong'),
        },
        group: {
          gap: '1px',
          dividerColor: semantic('border', 'strong'),
          dividerWidth: '1px',
          dividerHeight: '100%',
        },
      },

      // Card
      card: {
        bgColor: semantic('surface', 'primary'),
        fgColor: semantic('text', 'primary'),
        borderColor: semantic('border', 'primary'),
        borderRadius: primitive('borderRadius', 'lg'),
        borderWidth: primitive('borderWidth', 'thin'),
        borderStyle: 'solid',
        shadow: primitive('shadow', 'md'),
        padding: primitive('spacing', 'lg'),
        contentGap: primitive('spacing', 'md'),
        headingGap: primitive('spacing', 'xs'),
        headingPaddingX: primitive('spacing', 'lg'),
        headingPaddingY: primitive('spacing', 'md'),
        headingSize: primitive('fontSize', 'lg'),
        headingWeight: primitive('fontWeight', 'semibold'),
        subheadingSize: primitive('fontSize', 'sm'),
        subheadingWeight: primitive('fontWeight', 'normal'),
        bodyPaddingX: primitive('spacing', 'lg'),
        bodyPaddingY: primitive('spacing', 'md'),
        footerPaddingX: primitive('spacing', 'lg'),
        footerPaddingY: primitive('spacing', 'md'),
      },

      // Checkbox
      checkbox: {
        borderRadius: primitive('borderRadius', 'sm'),
        size: '20px',
        iconSize: '14px',
        bgColor: semantic('surface', 'primary'),
        fgColor: semantic('text', 'primary'),
        borderColor: semantic('border', 'secondary'),
        hover: {
          fgColor: semantic('text', 'primary'),
          borderColor: semantic('border', 'strong'),
        },
        active: {
          fgColor: semantic('text', 'primary'),
          borderColor: semantic('border', 'strong'),
        },
        disabled: {
          bgColor: semantic('disabled', 'bgColor'),
          fgColor: semantic('disabled', 'fgColor'),
          borderColor: semantic('disabled', 'borderColor'),
        },
        checked: {
          bgColor: semantic('action', 'primary', 'color'),
          fgColor: primitive('color', 'white'),
          borderColor: semantic('action', 'primary', 'color'),
          hover: {
            bgColor: semantic('action', 'primary', 'hover', 'color'),
            borderColor: semantic('action', 'primary', 'hover', 'color'),
          },
          active: {
            bgColor: semantic('action', 'primary', 'active', 'color'),
            borderColor: semantic('action', 'primary', 'active', 'color'),
          },
        },
      },

      // Dialog
      dialog: {
        bgColor: semantic('surface', 'primary'),
        fgColor: semantic('text', 'primary'),
        backdropColor: 'rgba(0, 0, 0, 0.5)',
        borderColor: semantic('border', 'primary'),
        borderStyle: 'solid',
        borderRadius: primitive('borderRadius', 'lg'),
        borderWidth: primitive('borderWidth', 'thin'),
        shadow: primitive('shadow', 'xl'),
        paddingX: primitive('spacing', 'xl'),
        paddingY: primitive('spacing', 'lg'),
        maxWidth: '512px',
        maxHeight: '85vh',
        marginTop: '10vh',
        inset: '0',
        size: 'auto',
        transition: 'opacity 0.2s ease, transform 0.2s ease',
        positionTransition: 'top 0.2s ease, left 0.2s ease',
        footerButtonGap: primitive('spacing', 'sm'),
        toolbarButtonGap: primitive('spacing', 'sm'),
        headerToolbarGap: primitive('spacing', 'md'),
        closeButton: {
          size: '32px',
          padding: primitive('spacing', 'xs'),
          borderRadius: primitive('borderRadius', 'sm'),
          borderWidth: '0',
          bgColor: 'transparent',
          fgColor: semantic('text', 'secondary'),
          borderColor: 'transparent',
          hover: {
            bgColor: semantic('surface', 'secondary'),
            fgColor: semantic('text', 'primary'),
            borderColor: 'transparent',
            borderWidth: '0',
          },
          active: {
            bgColor: semantic('surface', 'tertiary'),
            fgColor: semantic('text', 'primary'),
            borderColor: 'transparent',
            borderWidth: '0',
          },
          focus: {
            bgColor: semantic('surface', 'secondary'),
            fgColor: semantic('text', 'primary'),
            borderColor: semantic('focus', 'outlineColor'),
            borderWidth: '2px',
          },
        },
      },

      // Disclosure
      disclosure: {
        bgColor: semantic('surface', 'primary'),
        fgColor: semantic('text', 'primary'),
        gap: primitive('spacing', 'sm'),
        contentBorder: '1px solid transparent',
        contentBorderRadius: primitive('borderRadius', 'md'),
        closedMaxHeight: '0',
        // max-content, not none: `none` cannot be interpolated even with
        // interpolate-size, so `none` makes showTransition/hideTransition inert.
        openedMaxHeight: 'max-content',
        showTransition: 'max-height 0.3s ease-in',
        hideTransition: 'max-height 0.2s ease-out',
      },

      // Divider
      divider: {
        borderColor: semantic('border', 'primary'),
        borderStyle: 'solid',
        borderWidth: '1px',
        fgColor: semantic('text', 'secondary'),
        inset: '0',
        textGap: primitive('spacing', 'md'),
        textOffset: primitive('spacing', 'md'),
        verticalMinHeight: '16px',
      },

      // Input Range
      inputRange: {
        trackColor: semantic('surface', 'tertiary'),
        progressColor: semantic('action', 'primary', 'color'),
        thumbColor: semantic('surface', 'primary'),
        hover: {
          bgColor: semantic('surface', 'secondary'),
          fgColor: semantic('text', 'primary'),
        },
        active: {
          bgColor: semantic('surface', 'tertiary'),
          fgColor: semantic('text', 'primary'),
        },
        disabled: {
          bgColor: semantic('disabled', 'bgColor'),
          fgColor: semantic('disabled', 'fgColor'),
        },
      },

      // Menu
      menu: {
        bgColor: semantic('surface', 'primary'),
        borderColor: semantic('border', 'primary'),
        borderRadius: primitive('borderRadius', 'md'),
        borderStyle: 'solid',
        borderWidth: primitive('borderWidth', 'thin'),
        shadow: primitive('shadow', 'lg'),
        minWidth: '192px',
        maxWidth: '320px',
        width: 'auto',
        popupPadding: primitive('spacing', 'xs'),
        transition: 'opacity 0.15s ease, transform 0.15s ease',
        zIndex: primitive('zIndex', 'dropdown'),
        groupHeadingSize: primitive('fontSize', 'xxs'),
        groupHeadingWeight: primitive('fontWeight', 'semibold'),
        groupHeadingLineHeight: primitive('lineHeight', 'sm'),
        groupHeadingMargin: `${primitive('spacing', 'sm')} 0 ${primitive('spacing', '2xs')}`,
        groupHeadingPaddingX: primitive('spacing', 'sm'),
        groupHeadingPaddingY: primitive('spacing', '2xs'),
        item: {
          bgColor: 'transparent',
          fgColor: semantic('text', 'primary'),
          borderColor: 'transparent',
          borderRadius: primitive('borderRadius', 'sm'),
          paddingX: primitive('spacing', 'sm'),
          paddingY: primitive('spacing', 'sm'),
          marginX: primitive('spacing', '2xs'),
          inputContainerWidth: '20px',
          inputSize: '16px',
          submenu: {
            iconSize: '16px',
            iconRotation: '-90deg',
          },
          input: {
            hover: {
              bgColor: semantic('surface', 'tertiary'),
            },
          },
          hover: {
            bgColor: semantic('surface', 'secondary'),
            fgColor: semantic('text', 'primary'),
            borderColor: 'transparent',
          },
          active: {
            bgColor: semantic('surface', 'tertiary'),
            fgColor: semantic('text', 'primary'),
            borderColor: 'transparent',
          },
          disabled: {
            bgColor: 'transparent',
            fgColor: semantic('disabled', 'fgColor'),
            borderColor: 'transparent',
          },
          focus: {
            outlineColor: semantic('focus', 'outlineColor'),
            outlineOffset: '0',
          },
          radio: {
            bgColor: semantic('surface', 'primary'),
            active: {
              bgColor: semantic('action', 'primary', 'color'),
              borderColor: semantic('border', 'strong'),
            },
            hover: {
              borderColor: semantic('border', 'strong'),
            },
          },
        },
      },

      // Overflow
      overflow: {
        collapsingContainerDisplay: 'inline-block',
        itemGap: primitive('spacing', 'sm'),
      },

      // Popup
      popup: {
        arrowColor: semantic('surface', 'primary'),
        arrowSize: '8px',
        dropShadow: primitive('shadow', 'lg'),
        showTransition: 'opacity 0.15s ease, transform 0.15s ease',
        hideTransition: 'opacity 0.1s ease, transform 0.1s ease',
        zIndex: primitive('zIndex', 'popover'),
      },

      // Progress Bar
      progressBar: {
        height: '8px',
        borderRadius: primitive('borderRadius', 'full'),
        trackColor: semantic('surface', 'tertiary'),
        indicatorBgColor: semantic('action', 'primary', 'color'),
        iconColor: semantic('text', 'secondary'),
        // Drives the documented indeterminate state via the @keyframes of the
        // same name in progress-bar.styles.ts. Was 'none', which left the
        // indeterminate bar static.
        animation: 'indeterminate 1.5s ease-in-out infinite',
        transition: 'width 0.3s ease',
      },

      // Push Pane
      pushPane: {
        bgColor: semantic('surface', 'primary'),
        fgColor: semantic('text', 'primary'),
        dividerColor: semantic('border', 'primary'),
        size: '340px',
        paddingX: primitive('spacing', 'lg'),
        paddingY: primitive('spacing', 'lg'),
        bodyPaddingX: primitive('spacing', 'lg'),
        bodyPaddingY: primitive('spacing', 'md'),
        bodyMarginTop: primitive('spacing', 'md'),
        bodyMarginBottom: primitive('spacing', 'md'),
        bodyMarginInline: primitive('spacing', 'lg'),
        headerPaddingX: primitive('spacing', 'lg'),
        headerPaddingY: primitive('spacing', 'md'),
        footerPaddingX: primitive('spacing', 'lg'),
        footerPaddingY: primitive('spacing', 'md'),
        transition: 'width 0.3s ease, opacity 0.3s ease',
        toolbarButtonGap: primitive('spacing', 'sm'),
        footerButtonGap: primitive('spacing', 'sm'),
        closeButton: {
          bgColor: 'transparent',
          fgColor: semantic('text', 'secondary'),
          borderColor: 'transparent',
          borderWidth: '0',
          borderRadius: primitive('borderRadius', 'sm'),
          padding: primitive('spacing', 'xs'),
          hover: {
            bgColor: semantic('surface', 'secondary'),
            borderColor: 'transparent',
            borderWidth: '0',
          },
          active: {
            bgColor: semantic('surface', 'tertiary'),
            borderColor: 'transparent',
            borderWidth: '0',
          },
          focus: {
            bgColor: semantic('surface', 'secondary'),
            borderColor: semantic('focus', 'outlineColor'),
            borderWidth: '2px',
          },
        },
      },

      // Radio
      radio: {
        bgColor: semantic('surface', 'primary'),
        borderColor: semantic('border', 'secondary'),
        controlSize: '20px',
        indicatorSize: '8px',
        groupRadioGap: primitive('spacing', 'md'),
        checked: {
          bgColor: semantic('action', 'primary', 'color'),
          borderColor: semantic('action', 'primary', 'color'),
          hover: {
            borderColor: semantic('action', 'primary', 'hover', 'color'),
          },
          active: {
            borderColor: semantic('action', 'primary', 'active', 'color'),
          },
        },
        unchecked: {
          hover: {
            borderColor: semantic('border', 'strong'),
          },
          active: {
            borderColor: semantic('border', 'strong'),
          },
        },
        hover: {
          bgColor: semantic('surface', 'secondary'),
        },
        active: {
          bgColor: semantic('surface', 'tertiary'),
        },
        disabled: {
          bgColor: semantic('disabled', 'bgColor'),
          borderColor: semantic('disabled', 'borderColor'),
        },
        label: {
          checked: {
            color: semantic('text', 'primary'),
            hover: {
              color: semantic('text', 'primary'),
            },
          },
          unchecked: {
            hover: {
              color: semantic('text', 'secondary'),
            },
          },
          active: {
            color: semantic('text', 'primary'),
          },
          disabled: {
            color: semantic('disabled', 'fgColor'),
          },
        },
      },

      // Select
      select: {
        iconSize: '20px',
        optionBgColor: semantic('surface', 'primary'),
        optionFgColor: semantic('text', 'primary'),
      },

      // Skeleton
      skeleton: {
        bgColor: semantic('surface', 'tertiary'),
        sheenColor: semantic('surface', 'secondary'),
        borderRadius: primitive('borderRadius', 'md'),
        minHeight: '16px',
        width: '100%',
        bgSize: '200% 100%',
      },

      // Spinner
      spinner: {
        indicatorFgColor: semantic('action', 'primary', 'color'),
        trackColor: semantic('surface', 'tertiary'),
        trackWidth: '3px',
        ringSize: '32px',
        labelColor: semantic('text', 'secondary'),
        labelFontSize: primitive('fontSize', 'sm'),
        labelFontWeight: primitive('fontWeight', 'normal'),
        labelLineHeight: primitive('lineHeight', 'md'),
        gap: primitive('spacing', 'sm'),
        // These must match @keyframes defined in spinner.styles.ts. Keyframes are
        // scoped to the shadow tree that declares them, so a name from another
        // component's stylesheet does not resolve here. 'spin' matched nothing at
        // all, and 'pulse' is skeleton's opacity loop - the rotation this wants is
        // spin-image, which was already defined and unreferenced.
        indicatorAnimation: 'spin-infinite 1s linear infinite',
        imageAnimation: 'spin-image 2s linear infinite',
      },

      // Switch
      switch: {
        width: '40px',
        height: '24px',
        thumb: {
          size: '20px',
          bgColor: primitive('color', 'white'),
          transform: 'translateX(0)',
          transition: 'transform 0.2s ease',
          hover: {
            bgColor: { light: primitive('color', 'neutral', 50), dark: primitive('color', 'neutral', 800) },
          },
          active: {
            bgColor: { light: primitive('color', 'neutral', 100), dark: primitive('color', 'neutral', 700) },
          },
          checked: {
            bgColor: primitive('color', 'white'),
            hover: {
              bgColor: { light: primitive('color', 'neutral', 50), dark: primitive('color', 'neutral', 800) },
            },
            active: {
              bgColor: { light: primitive('color', 'neutral', 100), dark: primitive('color', 'neutral', 700) },
            },
          },
        },
        control: {
          bgColor: semantic('border', 'secondary'),
          borderColor: semantic('border', 'secondary'),
          transition: 'background-color 0.2s ease, border-color 0.2s ease',
          hover: {
            bgColor: semantic('border', 'strong'),
            borderColor: semantic('border', 'strong'),
          },
          active: {
            bgColor: semantic('action', 'secondary', 'active', 'color'),
            borderColor: semantic('action', 'secondary', 'active', 'color'),
          },
          checked: {
            bgColor: semantic('action', 'primary', 'color'),
            borderColor: semantic('action', 'primary', 'color'),
            hover: {
              bgColor: semantic('action', 'primary', 'hover', 'color'),
              borderColor: semantic('action', 'primary', 'hover', 'color'),
            },
            active: {
              bgColor: semantic('action', 'primary', 'active', 'color'),
              borderColor: semantic('action', 'primary', 'active', 'color'),
            },
          },
        },
      },

      // Tabs
      tabs: {
        bgColor: 'transparent',
        borderColor: semantic('border', 'primary'),
        borderRadius: primitive('borderRadius', 'md'),
        borderStyle: 'solid',
        borderWidth: primitive('borderWidth', 'thin'),
        paddingX: '0',
        paddingY: '0',
        gap: '0',
        tablistGap: primitive('spacing', 'md'),
        align: 'flex-start',
        verticalMinWidth: '160px',
      },

      // Tab
      tab: {
        bgColor: 'transparent',
        fgColor: semantic('text', 'secondary'),
        borderColor: 'transparent',
        borderRadius: '0',
        borderStyle: 'solid',
        borderWidth: '0 0 2px 0',
        fontSize: primitive('fontSize', 'sm'),
        fontWeight: primitive('fontWeight', 'medium'),
        paddingX: primitive('spacing', 'lg'),
        paddingY: primitive('spacing', 'sm'),
        gap: primitive('spacing', 'sm'),
        iconSize: '20px',
        iconGap: primitive('spacing', 'xs'),
        transition: 'color 0.15s ease, border-color 0.15s ease',
        hover: {
          bgColor: 'transparent',
          fgColor: semantic('text', 'primary'),
          borderColor: semantic('border', 'strong'),
        },
        active: {
          bgColor: 'transparent',
          fgColor: semantic('text', 'primary'),
          borderColor: semantic('action', 'primary', 'color'),
          fontWeight: primitive('fontWeight', 'semibold'),
        },
        focus: {
          bgColor: semantic('surface', 'secondary'),
          fgColor: semantic('text', 'primary'),
          borderColor: semantic('focus', 'outlineColor'),
        },
        disabled: {
          bgColor: 'transparent',
          fgColor: semantic('disabled', 'fgColor'),
          borderColor: 'transparent',
        },
      },

      // Tab Panel
      tabPanel: {
        bgColor: semantic('surface', 'primary'),
        fgColor: semantic('text', 'primary'),
        borderColor: semantic('border', 'primary'),
        borderRadius: primitive('borderRadius', 'md'),
        borderStyle: 'solid',
        borderWidth: primitive('borderWidth', 'thin'),
        shadow: 'none',
        paddingX: primitive('spacing', 'lg'),
        paddingY: primitive('spacing', 'lg'),
        minHeight: '160px',
        transition: 'opacity 0.15s ease',
      },

      // Textarea
      textArea: {
        inputLineHeight: primitive('lineHeight', 'md'),
        inputMinHeight: '80px',
        inputMinWidth: '100%',
      },

      // Tooltip
      tooltip: {
        bgColor: semantic('surface', 'inverse'),
        fgColor: semantic('text', 'inverse'),
        borderColor: 'transparent',
        borderRadius: primitive('borderRadius', 'sm'),
        borderStyle: 'solid',
        borderWidth: '0',
        shadow: primitive('shadow', 'md'),
        padding: `${primitive('spacing', 'xs')} ${primitive('spacing', 'sm')}`,
        maxWidth: '320px',
        arrowSize: '8px',
        arrowBorderColor: 'transparent',
        showTransition: 'opacity 0.15s ease',
        hideTransition: 'opacity 0.1s ease',
      },
    }),
  },
  { prefix: 'charm' }
);

/** The resolved token definition for the charm theme */
export const charmDefinition = charmTokensBase.definition;
/** Token helpers for the charm theme */
export const charmHelpers = charmTokensBase.helpers;

/** Pre-generated CSS theme for the charm tokens (lazily computed) */
let _charmTheme: ReturnType<typeof generateThemeSync> | undefined;

function getCharmTheme(): ReturnType<typeof generateThemeSync> {
  if (!_charmTheme) {
    _charmTheme = generateThemeSync(charmDefinition, { prefix: 'charm' });
  }
  return _charmTheme;
}

/**
 * Lazy-evaluated proxy for the generated charm theme.
 * Generation only runs on first property access.
 */
export const charmTheme: ReturnType<typeof generateThemeSync> = new Proxy({} as ReturnType<typeof generateThemeSync>, {
  get(_target, prop: keyof ReturnType<typeof generateThemeSync>) {
    return getCharmTheme()[prop];
  },
});

/**
 * Complete charm theme tokens with extension methods.
 *
 * Use `.extendPrimitives()`, `.extendSemantics()`, `.extendComponents()`, and
 * `.extendRawCss()` to create derived themes:
 *
 * @example
 * ```ts
 * import { charmTokens } from '@charm-ux/theming/themes';
 *
 * // Extend with custom brand colors
 * const customTokens = charmTokens
 *   .extendPrimitives({
 *     color: { brand: '#ff6600' },
 *   })
 *   .extendSemantics(({ primitive }) => ({
 *     // Deep-merged into the inherited semantics - no need to spread `base`
 *     surface: {
 *       brand: { light: primitive('color', 'brand', 100), dark: primitive('color', 'brand', 900) },
 *     },
 *   }))
 *   .extendRawCss(({ semantic }, base) => ({
 *     // Preserve inherited raw CSS, then append a custom rule.
 *     ...base,
 *     theme: `${base?.theme ?? ''}
 *       .brand-surface { background: ${semantic('surface', 'brand')}; }`,
 *   }));
 * ```
 */
export const charmTokens = Object.defineProperties(charmTokensBase, {
  theme: { get: getCharmTheme, enumerable: true },
  css: { get: () => getCharmTheme().css, enumerable: true },
  cssReset: { get: () => getCharmTheme().cssReset, enumerable: true },
  cssUtilities: { get: () => getCharmTheme().cssUtilities, enumerable: true },
  hasLightDarkTokens: { get: () => getCharmTheme().hasLightDarkTokens, enumerable: true },
  tokensJson: { get: () => getCharmTheme().tokensJson, enumerable: true },
  tokensLightJson: { get: () => getCharmTheme().tokensLightJson, enumerable: true },
  tokensDarkJson: { get: () => getCharmTheme().tokensDarkJson, enumerable: true },
  tokensMarkdown: { get: () => getCharmTheme().tokensMarkdown, enumerable: true },
});
