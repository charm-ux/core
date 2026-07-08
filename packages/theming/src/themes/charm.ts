import { defineTokens } from '../defineTokens.js';
import { generateThemeSync } from '../generator/generateTheme.js';

export const { definition: charmDefinition, helpers: charmHelpers } = defineTokens(
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
        xxs: '2px',
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

    semantics: ref => ({
      // Surface tokens - background colors for different elevation levels
      surface: {
        primary: { light: ref('color', 'white'), dark: ref('color', 'neutral', 950) },
        secondary: { light: ref('color', 'neutral', 100), dark: ref('color', 'neutral', 800) },
        tertiary: { light: ref('color', 'neutral', 200), dark: ref('color', 'neutral', 700) },
        inverse: { light: ref('color', 'neutral', 900), dark: ref('color', 'neutral', 50) },
      },

      // Text tokens - foreground colors for content
      text: {
        primary: { light: ref('color', 'neutral', 900), dark: ref('color', 'neutral', 50) },
        secondary: { light: ref('color', 'neutral', 600), dark: ref('color', 'neutral', 400) },
        inverse: { light: ref('color', 'neutral', 50), dark: ref('color', 'neutral', 900) },
      },

      // Border tokens - stroke colors for containers and dividers
      border: {
        primary: { light: ref('color', 'neutral', 200), dark: ref('color', 'neutral', 700) },
        secondary: { light: ref('color', 'neutral', 300), dark: ref('color', 'neutral', 600) },
        strong: { light: ref('color', 'neutral', 400), dark: ref('color', 'neutral', 500) },
      },

      // Action tokens - colors for interactive elements
      action: {
        primary: ref('color', 'brand', 500),
        primaryHover: { light: ref('color', 'brand', 600), dark: ref('color', 'brand', 400) },
        primaryActive: { light: ref('color', 'brand', 700), dark: ref('color', 'brand', 300) },
        secondary: { light: ref('color', 'neutral', 200), dark: ref('color', 'neutral', 700) },
        secondaryHover: { light: ref('color', 'neutral', 300), dark: ref('color', 'neutral', 600) },
        secondaryActive: { light: ref('color', 'neutral', 400), dark: ref('color', 'neutral', 500) },
      },

      // Indicator tokens - colors for status and feedback
      indicator: {
        success: ref('color', 'success', 500),
        warning: ref('color', 'warning', 500),
        danger: ref('color', 'danger', 500),
        info: ref('color', 'brand', 500),
      },

      // Disabled state tokens
      disabled: {
        bgColor: { light: ref('color', 'neutral', 100), dark: ref('color', 'neutral', 800) },
        fgColor: { light: ref('color', 'neutral', 400), dark: ref('color', 'neutral', 500) },
        borderColor: { light: ref('color', 'neutral', 200), dark: ref('color', 'neutral', 700) },
      },

      // Body/document tokens
      body: {
        bgColor: { light: ref('color', 'white'), dark: ref('color', 'neutral', 950) },
        fgColor: { light: ref('color', 'neutral', 900), dark: ref('color', 'neutral', 50) },
        secondaryFgColor: { light: ref('color', 'neutral', 600), dark: ref('color', 'neutral', 400) },
        fontFamily: ref('fontFamily', 'base'),
        fontSize: ref('fontSize', 'sm'),
        fontWeight: ref('fontWeight', 'normal'),
        lineHeight: ref('lineHeight', 'md'),
      },

      // Heading tokens
      heading: {
        fgColor: { light: ref('color', 'neutral', 900), dark: ref('color', 'neutral', 50) },
        fontFamily: ref('fontFamily', 'accent'),
        fontWeight: ref('fontWeight', 'semibold'),
        lineHeight: ref('lineHeight', 'sm'),
      },

      // Link tokens with states
      link: {
        fgColor: ref('color', 'brand', 500),
        decoration: 'underline',
        hover: {
          fgColor: { light: ref('color', 'brand', 600), dark: ref('color', 'brand', 400) },
          decoration: 'underline',
        },
        active: {
          fgColor: { light: ref('color', 'brand', 700), dark: ref('color', 'brand', 300) },
          decoration: 'underline',
        },
        visited: {
          fgColor: { light: ref('color', 'accent', 600), dark: ref('color', 'accent', 400) },
          decoration: 'underline',
        },
      },

      // Focus outline tokens
      focusOutline: {
        color: ref('color', 'brand', 500),
        width: ref('borderWidth', 'medium'),
        style: 'solid',
        offset: ref('spacing', 'xxs'),
      },

      // Default border tokens
      defaultBorder: {
        color: { light: ref('color', 'neutral', 200), dark: ref('color', 'neutral', 700) },
        width: ref('borderWidth', 'thin'),
        style: 'solid',
      },

      // Default button tokens with SurfaceStates
      defaultButton: {
        bgColor: { light: ref('color', 'neutral', 200), dark: ref('color', 'neutral', 700) },
        fgColor: { light: ref('color', 'neutral', 900), dark: ref('color', 'neutral', 50) },
        borderColor: ref('color', 'transparent'),
        borderWidth: ref('borderWidth', 'thin'),
        borderStyle: 'solid',
        borderRadius: ref('borderRadius', 'md'),
        fontWeight: ref('fontWeight', 'medium'),
        paddingX: ref('spacing', 'lg'),
        paddingY: ref('spacing', 'sm'),
        shadow: ref('shadow', 'xs'),
        hover: {
          bgColor: { light: ref('color', 'neutral', 300), dark: ref('color', 'neutral', 600) },
          fgColor: { light: ref('color', 'neutral', 900), dark: ref('color', 'neutral', 50) },
          borderColor: ref('color', 'transparent'),
          shadow: ref('shadow', 'sm'),
        },
        active: {
          bgColor: { light: ref('color', 'neutral', 400), dark: ref('color', 'neutral', 500) },
          fgColor: { light: ref('color', 'neutral', 900), dark: ref('color', 'neutral', 50) },
          borderColor: ref('color', 'transparent'),
          shadow: ref('shadow', 'none'),
        },
        focus: {
          bgColor: { light: ref('color', 'neutral', 200), dark: ref('color', 'neutral', 700) },
          fgColor: { light: ref('color', 'neutral', 900), dark: ref('color', 'neutral', 50) },
          borderColor: ref('color', 'brand', 500),
          shadow: ref('shadow', 'sm'),
        },
        disabled: {
          bgColor: { light: ref('color', 'neutral', 100), dark: ref('color', 'neutral', 800) },
          fgColor: { light: ref('color', 'neutral', 400), dark: ref('color', 'neutral', 500) },
          borderColor: ref('color', 'transparent'),
          shadow: ref('shadow', 'none'),
          cursor: 'not-allowed',
        },
      },

      // Form container tokens
      form: {
        bgColor: ref('color', 'transparent'),
        fgColor: { light: ref('color', 'neutral', 900), dark: ref('color', 'neutral', 50) },
        borderColor: ref('color', 'transparent'),
        borderRadius: '0',
        paddingX: '0',
        paddingY: '0',
        contentGap: ref('spacing', 'lg'),
      },

      // Form control tokens with SurfaceStates
      formControl: {
        // Base state
        bgColor: { light: ref('color', 'white'), dark: ref('color', 'neutral', 800) },
        fgColor: { light: ref('color', 'neutral', 900), dark: ref('color', 'neutral', 50) },
        borderColor: { light: ref('color', 'neutral', 300), dark: ref('color', 'neutral', 600) },
        placeholderColor: { light: ref('color', 'neutral', 400), dark: ref('color', 'neutral', 500) },
        shadow: ref('shadow', 'none'),
        // Static properties
        borderWidth: ref('borderWidth', 'thin'),
        borderStyle: 'solid',
        borderRadius: ref('borderRadius', 'md'),
        fontSize: ref('fontSize', 'sm'),
        paddingX: ref('spacing', 'md'),
        paddingY: ref('spacing', 'sm'),
        inputHeight: '40px',
        iconGap: ref('spacing', 'xs'),
        // Interactive states
        hover: {
          bgColor: { light: ref('color', 'white'), dark: ref('color', 'neutral', 800) },
          fgColor: { light: ref('color', 'neutral', 900), dark: ref('color', 'neutral', 50) },
          borderColor: { light: ref('color', 'neutral', 400), dark: ref('color', 'neutral', 500) },
        },
        focus: {
          bgColor: { light: ref('color', 'white'), dark: ref('color', 'neutral', 800) },
          fgColor: { light: ref('color', 'neutral', 900), dark: ref('color', 'neutral', 50) },
          borderColor: ref('color', 'brand', 500),
          shadow: ref('shadow', 'outline'),
        },
        disabled: {
          bgColor: { light: ref('color', 'neutral', 100), dark: ref('color', 'neutral', 700) },
          fgColor: { light: ref('color', 'neutral', 400), dark: ref('color', 'neutral', 500) },
          borderColor: { light: ref('color', 'neutral', 200), dark: ref('color', 'neutral', 700) },
          placeholderColor: { light: ref('color', 'neutral', 300), dark: ref('color', 'neutral', 600) },
          cursor: 'not-allowed',
          opacity: '1',
        },
        invalid: {
          borderColor: ref('color', 'danger', 500),
          placeholderColor: { light: ref('color', 'danger', 300), dark: ref('color', 'danger', 700) },
          shadow: ref('shadow', 'none'),
          message: {
            fgColor: ref('color', 'danger', 500),
            fontSize: ref('fontSize', 'xs'),
            fontWeight: ref('fontWeight', 'normal'),
            gap: ref('spacing', 'xs'),
          },
        },
        // Label
        label: {
          fgColor: { light: ref('color', 'neutral', 900), dark: ref('color', 'neutral', 50) },
          fontSize: ref('fontSize', 'sm'),
          fontWeight: ref('fontWeight', 'medium'),
          gap: ref('spacing', 'xs'),
          requiredIndicatorGap: ref('spacing', 'xxs'),
        },
        // Help text
        helpText: {
          fgColor: { light: ref('color', 'neutral', 600), dark: ref('color', 'neutral', 400) },
          fontSize: ref('fontSize', 'xs'),
          fontWeight: ref('fontWeight', 'normal'),
          gap: ref('spacing', 'xs'),
        },
        // Range input
        range: {
          thumbSize: '16px',
          trackSize: '4px',
          trackMarginTop: '8px',
        },
      },

      focus: {
        outlineColor: ref('color', 'brand', 500),
        outlineOffset: ref('spacing', 'xxs'),
        outlineSize: ref('borderWidth', 'medium'),
        outlineStyle: 'solid',
      },
    }),

    components: ref => ({
      // Accordion
      accordion: {
        topBorderColor: ref('border', 'primary'),
      },
      accordionItem: {
        bgColor: ref('surface', 'primary'),
        fgColor: ref('text', 'primary'),
        borderColor: ref('border', 'primary'),
        borderWidth: ref('borderWidth', 'thin'),
        hover: {
          bgColor: ref('surface', 'secondary'),
          fgColor: ref('text', 'primary'),
          borderColor: ref('border', 'secondary'),
        },
        disabled: {
          bgColor: ref('disabled', 'bgColor'),
          fgColor: ref('disabled', 'fgColor'),
          borderColor: ref('disabled', 'borderColor'),
        },
        animation: {
          duration: ref('duration', 'fast'),
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
        bgColor: ref('surface', 'primary'),
        fgColor: ref('text', 'primary'),
        border: `1px solid ${ref('border', 'primary')}`,
        padding: ref('spacing', 'lg'),
        fontSize: ref('typography', 'fontSize', 'sm'),
        fontWeight: ref('typography', 'fontWeight', 'normal'),
        transition: 'opacity 0.3s ease',
        actionsGap: ref('spacing', 'sm'),
        headingFontSize: ref('typography', 'fontSize', 'md'),
        headingFontWeight: ref('typography', 'fontWeight', 'semibold'),
        iconFgColor: ref('text', 'secondary'),
        iconSize: '24px',
        iconMargin: ref('spacing', 'md'),
        messageMargin: ref('spacing', 'sm'),
        buttonBgColor: ref('surface', 'secondary'),
        buttonHoverBgColor: ref('surface', 'tertiary'),
        buttonActiveBgColor: ref('action', 'secondaryActive'),
        buttonBorder: 'none',
        buttonFontSize: ref('typography', 'fontSize', 'xs'),
        buttonPadding: `${ref('spacing', 'xs')} ${ref('spacing', 'sm')}`,
      },

      // Avatar
      avatar: {
        bgColor: ref('surface', 'tertiary'),
        size: '40px',
        borderRadius: ref('borderRadius', 'full'),
        indicatorBgColor: ref('indicator', 'success'),
        indicatorColor: ref('color', 'white'),
        indicatorSize: '12px',
        indicatorBorderColor: ref('color', 'white'),
        indicatorBorderWidth: '2px',
        indicatorBorderRadius: ref('borderRadius', 'full'),
      },

      // Badge
      badge: {
        bgColor: ref('surface', 'secondary'),
        fgColor: ref('text', 'primary'),
        borderColor: ref('border', 'primary'),
        borderRadius: ref('borderRadius', 'full'),
        borderStyle: 'solid',
        borderWidth: ref('borderWidth', 'thin'),
        padding: `${ref('spacing', 'xxs')} ${ref('spacing', 'sm')}`,
        size: '20px',
      },

      // Breadcrumb
      breadcrumb: {
        item: {
          gap: ref('spacing', 'xs'),
          padding: `${ref('spacing', 'xs')} ${ref('spacing', 'sm')}`,
          controlWidth: '24px',
          borderWidth: ref('borderWidth', 'thin'),
          bgColor: 'transparent',
          fgColor: ref('text', 'secondary'),
          borderColor: 'transparent',
          hover: {
            bgColor: ref('surface', 'secondary'),
            fgColor: ref('text', 'primary'),
            borderColor: 'transparent',
          },
          active: {
            bgColor: ref('surface', 'tertiary'),
            fgColor: ref('text', 'primary'),
            borderColor: 'transparent',
          },
          focus: {
            bgColor: ref('surface', 'secondary'),
            fgColor: ref('text', 'primary'),
            borderColor: ref('focus', 'outlineColor'),
          },
          disabled: {
            bgColor: 'transparent',
            fgColor: ref('disabled', 'fgColor'),
            borderColor: 'transparent',
          },
        },
      },

      // Button
      button: {
        bgColor: ref('surface', 'secondary'),
        fgColor: ref('text', 'primary'),
        borderColor: ref('border', 'secondary'),
        shadow: ref('shadow', 'xs'),
        borderRadius: ref('borderRadius', 'md'),
        borderWidth: ref('borderWidth', 'thin'),
        borderStyle: 'solid',
        fontWeight: ref('typography', 'fontWeight', 'medium'),
        paddingX: ref('spacing', 'lg'),
        paddingY: ref('spacing', 'sm'),
        contentGap: ref('spacing', 'sm'),
        contentAlignment: 'center',
        iconSize: '20px',
        iconPaddingX: ref('spacing', 'sm'),
        iconPaddingY: ref('spacing', 'sm'),
        hover: {
          bgColor: ref('surface', 'tertiary'),
          fgColor: ref('text', 'primary'),
          borderColor: ref('border', 'strong'),
          shadow: ref('shadow', 'sm'),
        },
        active: {
          bgColor: ref('action', 'secondaryActive'),
          fgColor: ref('text', 'primary'),
          borderColor: ref('border', 'strong'),
          shadow: ref('shadow', 'none'),
        },
        focus: {
          bgColor: ref('surface', 'secondary'),
          fgColor: ref('text', 'primary'),
          borderColor: ref('focus', 'outlineColor'),
          shadow: ref('shadow', 'sm'),
        },
        disabled: {
          bgColor: ref('disabled', 'bgColor'),
          fgColor: ref('disabled', 'fgColor'),
          borderColor: ref('disabled', 'borderColor'),
          shadow: ref('shadow', 'none'),
          cursor: 'not-allowed',
        },
        pressed: {
          bgColor: ref('action', 'secondaryActive'),
          fgColor: ref('text', 'primary'),
          borderColor: ref('border', 'strong'),
        },
        group: {
          gap: '1px',
          dividerColor: ref('border', 'strong'),
          dividerWidth: '1px',
          dividerHeight: '100%',
        },
      },

      // Card
      card: {
        bgColor: ref('surface', 'primary'),
        fgColor: ref('text', 'primary'),
        borderColor: ref('border', 'primary'),
        borderRadius: ref('borderRadius', 'lg'),
        borderSize: ref('borderWidth', 'thin'),
        borderStyle: 'solid',
        boxShadow: ref('shadow', 'md'),
        padding: ref('spacing', 'lg'),
        contentGap: ref('spacing', 'md'),
        headingGap: ref('spacing', 'xs'),
        headingPaddingX: ref('spacing', 'lg'),
        headingPaddingY: ref('spacing', 'md'),
        headingSize: ref('typography', 'fontSize', 'lg'),
        headingWeight: ref('typography', 'fontWeight', 'semibold'),
        subheadingSize: ref('typography', 'fontSize', 'sm'),
        subheadingWeight: ref('typography', 'fontWeight', 'normal'),
        bodyPaddingX: ref('spacing', 'lg'),
        bodyPaddingY: ref('spacing', 'md'),
        footerPaddingX: ref('spacing', 'lg'),
        footerPaddingY: ref('spacing', 'md'),
      },

      // Checkbox
      checkbox: {
        borderRadius: ref('borderRadius', 'sm'),
        size: '20px',
        iconSize: '14px',
        bgColor: ref('surface', 'primary'),
        fgColor: ref('text', 'primary'),
        borderColor: ref('border', 'secondary'),
        hover: {
          fgColor: ref('text', 'primary'),
          borderColor: ref('border', 'strong'),
        },
        active: {
          fgColor: ref('text', 'primary'),
          borderColor: ref('border', 'strong'),
        },
        disabled: {
          bgColor: ref('disabled', 'bgColor'),
          fgColor: ref('disabled', 'fgColor'),
          borderColor: ref('disabled', 'borderColor'),
        },
        checked: {
          bgColor: ref('action', 'primary'),
          fgColor: ref('color', 'white'),
          borderColor: ref('action', 'primary'),
          hover: {
            bgColor: ref('action', 'primaryHover'),
            borderColor: ref('action', 'primaryHover'),
          },
          active: {
            bgColor: ref('action', 'primaryActive'),
            borderColor: ref('action', 'primaryActive'),
          },
        },
      },

      // Dialog
      dialog: {
        bgColor: ref('surface', 'primary'),
        fgColor: ref('text', 'primary'),
        backdropColor: 'rgba(0, 0, 0, 0.5)',
        borderColor: ref('border', 'primary'),
        borderRadius: ref('borderRadius', 'lg'),
        borderWidth: ref('borderWidth', 'thin'),
        border: `1px solid ${ref('border', 'primary')}`,
        shadow: ref('shadow', 'xl'),
        paddingX: ref('spacing', 'xl'),
        paddingY: ref('spacing', 'lg'),
        maxWidth: '512px',
        maxHeight: '85vh',
        marginTop: '10vh',
        inset: '0',
        size: 'auto',
        transition: 'opacity 0.2s ease, transform 0.2s ease',
        positionTransition: 'top 0.2s ease, left 0.2s ease',
        footerButtonGap: ref('spacing', 'sm'),
        toolbarButtonGap: ref('spacing', 'sm'),
        headerToolbarGap: ref('spacing', 'md'),
        closeButton: {
          size: '32px',
          padding: ref('spacing', 'xs'),
          borderRadius: ref('borderRadius', 'sm'),
          borderWidth: '0',
          bgColor: 'transparent',
          fgColor: ref('text', 'secondary'),
          borderColor: 'transparent',
          hover: {
            bgColor: ref('surface', 'secondary'),
            fgColor: ref('text', 'primary'),
            borderColor: 'transparent',
            borderWidth: '0',
          },
          active: {
            bgColor: ref('surface', 'tertiary'),
            fgColor: ref('text', 'primary'),
            borderColor: 'transparent',
            borderWidth: '0',
          },
          focus: {
            bgColor: ref('surface', 'secondary'),
            fgColor: ref('text', 'primary'),
            borderColor: ref('focus', 'outlineColor'),
            borderWidth: '2px',
          },
        },
      },

      // Disclosure
      disclosure: {
        bgColor: ref('surface', 'primary'),
        fgColor: ref('text', 'primary'),
        gap: ref('spacing', 'sm'),
        contentBorder: '1px solid transparent',
        contentBorderRadius: ref('borderRadius', 'md'),
        closedMaxHeight: '0',
        openedMaxHeight: 'none',
        showTransition: 'max-height 0.3s ease-in',
        hideTransition: 'max-height 0.2s ease-out',
      },

      // Divider
      divider: {
        border: `1px solid ${ref('border', 'primary')}`,
        fgColor: ref('text', 'secondary'),
        inset: '0',
        textGap: ref('spacing', 'md'),
        textOffset: ref('spacing', 'md'),
        verticalMinHeight: '16px',
      },

      // Input Range
      inputRange: {
        trackColor: ref('surface', 'tertiary'),
        progressColor: ref('action', 'primary'),
        thumbColor: ref('surface', 'primary'),
        hover: {
          bgColor: ref('surface', 'secondary'),
          fgColor: ref('text', 'primary'),
        },
        active: {
          bgColor: ref('surface', 'tertiary'),
          fgColor: ref('text', 'primary'),
        },
        disabled: {
          bgColor: ref('disabled', 'bgColor'),
          fgColor: ref('disabled', 'fgColor'),
        },
      },

      // Menu
      menu: {
        bgColor: ref('surface', 'primary'),
        borderColor: ref('border', 'primary'),
        borderRadius: ref('borderRadius', 'md'),
        borderStyle: 'solid',
        borderWidth: ref('borderWidth', 'thin'),
        shadow: ref('shadow', 'lg'),
        minWidth: '192px',
        maxWidth: '320px',
        width: 'auto',
        popupPadding: ref('spacing', 'xs'),
        transition: 'opacity 0.15s ease, transform 0.15s ease',
        zIndex: ref('zIndex', 'dropdown'),
        groupHeadingSize: ref('typography', 'fontSize', 'xxs'),
        groupHeadingWeight: ref('typography', 'fontWeight', 'semibold'),
        groupHeadingLineHeight: ref('typography', 'lineHeight', 'sm'),
        groupHeadingMargin: `${ref('spacing', 'sm')} 0 ${ref('spacing', 'xxs')}`,
        groupHeadingPaddingX: ref('spacing', 'sm'),
        groupHeadingPaddingY: ref('spacing', 'xxs'),
        item: {
          bgColor: 'transparent',
          fgColor: ref('text', 'primary'),
          borderColor: 'transparent',
          borderRadius: ref('borderRadius', 'sm'),
          paddingX: ref('spacing', 'sm'),
          paddingY: ref('spacing', 'sm'),
          marginX: ref('spacing', 'xxs'),
          inputContainerWidth: '20px',
          inputSize: '16px',
          submenuItemIconSize: '16px',
          submenuItemIconRotation: '-90deg',
          inputHoverBgColor: ref('surface', 'tertiary'),
          hover: {
            bgColor: ref('surface', 'secondary'),
            fgColor: ref('text', 'primary'),
            borderColor: 'transparent',
          },
          active: {
            bgColor: ref('surface', 'tertiary'),
            fgColor: ref('text', 'primary'),
            borderColor: 'transparent',
          },
          disabled: {
            bgColor: 'transparent',
            fgColor: ref('disabled', 'fgColor'),
            borderColor: 'transparent',
          },
          focus: {
            outlineColor: ref('focus', 'outlineColor'),
            outlineOffset: '0',
          },
          radio: {
            bgColor: ref('surface', 'primary'),
            activeBgColor: ref('action', 'primary'),
            hoverBorderColor: ref('border', 'strong'),
          },
        },
      },

      // Popup
      popup: {
        arrowColor: ref('surface', 'primary'),
        arrowSize: '8px',
        arrowSizeDiagonal: '11px',
        arrowPaddingOffset: '8px',
        dropShadow: ref('shadow', 'lg'),
        showTransition: 'opacity 0.15s ease, transform 0.15s ease',
        hideTransition: 'opacity 0.1s ease, transform 0.1s ease',
        zIndex: ref('zIndex', 'popover'),
        autoSizeAvailableWidth: '100%',
        autoSizeAvailableHeight: '100%',
      },

      // Progress Bar
      progressBar: {
        height: '8px',
        borderRadius: ref('borderRadius', 'full'),
        trackColor: ref('surface', 'tertiary'),
        indicatorColor: ref('action', 'primary'),
        iconColor: ref('text', 'secondary'),
        animation: 'none',
        transition: 'width 0.3s ease',
      },

      // Push Pane
      pushPane: {
        bgColor: ref('surface', 'primary'),
        fgColor: ref('text', 'primary'),
        dividerColor: ref('border', 'primary'),
        size: '340px',
        paddingX: ref('spacing', 'lg'),
        paddingY: ref('spacing', 'lg'),
        bodyPaddingX: ref('spacing', 'lg'),
        bodyPaddingY: ref('spacing', 'md'),
        bodyMarginTop: ref('spacing', 'md'),
        bodyMarginBottom: ref('spacing', 'md'),
        bodyMarginInline: ref('spacing', 'lg'),
        headerPaddingX: ref('spacing', 'lg'),
        headerPaddingY: ref('spacing', 'md'),
        footerPaddingX: ref('spacing', 'lg'),
        footerPaddingY: ref('spacing', 'md'),
        transition: 'width 0.3s ease, opacity 0.3s ease',
        toolbarButtonGap: ref('spacing', 'sm'),
        footerButtonGap: ref('spacing', 'sm'),
        closeButton: {
          bgColor: 'transparent',
          fgColor: ref('text', 'secondary'),
          borderColor: 'transparent',
          borderWidth: '0',
          borderRadius: ref('borderRadius', 'sm'),
          padding: ref('spacing', 'xs'),
          hover: {
            bgColor: ref('surface', 'secondary'),
            borderColor: 'transparent',
            borderWidth: '0',
          },
          active: {
            bgColor: ref('surface', 'tertiary'),
            borderColor: 'transparent',
            borderWidth: '0',
          },
          focus: {
            bgColor: ref('surface', 'secondary'),
            borderColor: ref('focus', 'outlineColor'),
            borderWidth: '2px',
          },
        },
      },

      // Radio
      radio: {
        bgColor: ref('surface', 'primary'),
        borderColor: ref('border', 'secondary'),
        controlSize: '20px',
        indicatorSize: '8px',
        groupRadioGap: ref('spacing', 'md'),
        checked: {
          borderColor: ref('action', 'primary'),
        },
        hover: {
          bgColor: ref('surface', 'secondary'),
          borderColorChecked: ref('action', 'primaryHover'),
          borderColorUnchecked: ref('border', 'strong'),
        },
        active: {
          bgColor: ref('surface', 'tertiary'),
          borderColorChecked: ref('action', 'primaryActive'),
          borderColorUnchecked: ref('border', 'strong'),
        },
        disabled: {
          bgColor: ref('disabled', 'bgColor'),
          borderColor: ref('disabled', 'borderColor'),
        },
        label: {
          checkedFgColor: ref('text', 'primary'),
          checkedHoverFgColor: ref('text', 'primary'),
          uncheckedHoverFgColor: ref('text', 'secondary'),
          activeFgColor: ref('text', 'primary'),
          disabledColor: ref('disabled', 'fgColor'),
        },
      },

      // Select
      select: {
        iconSize: '20px',
        iconInset: ref('spacing', 'sm'),
        optionBgColor: ref('surface', 'primary'),
        optionFgColor: ref('text', 'primary'),
      },

      // Skeleton
      skeleton: {
        bgColor: ref('surface', 'tertiary'),
        sheenColor: ref('surface', 'secondary'),
        borderRadius: ref('borderRadius', 'md'),
        minHeight: '16px',
        width: '100%',
        bgSize: '200% 100%',
        animation: 'shimmer 1.5s infinite linear',
      },

      // Spinner
      spinner: {
        indicatorColor: ref('action', 'primary'),
        trackColor: ref('surface', 'tertiary'),
        trackWidth: '3px',
        ringSize: '32px',
        labelColor: ref('text', 'secondary'),
        labelFontSize: ref('typography', 'fontSize', 'sm'),
        labelFontWeight: ref('typography', 'fontWeight', 'normal'),
        labelLineHeight: ref('typography', 'lineHeight', 'md'),
        gap: ref('spacing', 'sm'),
        indicatorAnimation: 'spin 1s linear infinite',
        imageAnimation: 'pulse 2s ease-in-out infinite',
      },

      // Switch
      switch: {
        width: '40px',
        height: '24px',
        thumb: {
          size: '20px',
          bgColor: ref('color', 'white'),
          transform: 'translateX(0)',
          transition: 'transform 0.2s ease',
          hover: {
            bgColor: { light: ref('color', 'neutral', 50), dark: ref('color', 'neutral', 800) },
          },
          active: {
            bgColor: { light: ref('color', 'neutral', 100), dark: ref('color', 'neutral', 700) },
          },
          checked: {
            bgColor: ref('color', 'white'),
            hover: {
              bgColor: { light: ref('color', 'neutral', 50), dark: ref('color', 'neutral', 800) },
            },
            active: {
              bgColor: { light: ref('color', 'neutral', 100), dark: ref('color', 'neutral', 700) },
            },
          },
        },
        control: {
          bgColor: ref('border', 'secondary'),
          borderColor: ref('border', 'secondary'),
          transition: 'background-color 0.2s ease, border-color 0.2s ease',
          hover: {
            bgColor: ref('border', 'strong'),
            borderColor: ref('border', 'strong'),
          },
          active: {
            bgColor: ref('action', 'secondaryActive'),
            borderColor: ref('action', 'secondaryActive'),
          },
          checked: {
            bgColor: ref('action', 'primary'),
            borderColor: ref('action', 'primary'),
            hover: {
              bgColor: ref('action', 'primaryHover'),
              borderColor: ref('action', 'primaryHover'),
            },
            active: {
              bgColor: ref('action', 'primaryActive'),
              borderColor: ref('action', 'primaryActive'),
            },
          },
        },
      },

      // Tabs
      tabs: {
        bgColor: 'transparent',
        borderColor: ref('border', 'primary'),
        borderRadius: ref('borderRadius', 'md'),
        borderStyle: 'solid',
        borderWidth: ref('borderWidth', 'thin'),
        paddingX: '0',
        paddingY: '0',
        gap: '0',
        align: 'flex-start',
        verticalMinWidth: '160px',
      },

      // Tab
      tab: {
        bgColor: 'transparent',
        fgColor: ref('text', 'secondary'),
        borderColor: 'transparent',
        borderRadius: '0',
        borderStyle: 'solid',
        borderWidth: '0 0 2px 0',
        fontSize: ref('typography', 'fontSize', 'sm'),
        fontWeight: ref('typography', 'fontWeight', 'medium'),
        paddingX: ref('spacing', 'lg'),
        paddingY: ref('spacing', 'sm'),
        gap: ref('spacing', 'sm'),
        iconSize: '20px',
        iconGap: ref('spacing', 'xs'),
        transition: 'color 0.15s ease, border-color 0.15s ease',
        hover: {
          bgColor: 'transparent',
          fgColor: ref('text', 'primary'),
          borderColor: ref('border', 'strong'),
        },
        active: {
          bgColor: 'transparent',
          fgColor: ref('text', 'primary'),
          borderColor: ref('action', 'primary'),
          fontWeight: ref('typography', 'fontWeight', 'semibold'),
        },
        focus: {
          bgColor: ref('surface', 'secondary'),
          fgColor: ref('text', 'primary'),
          borderColor: ref('focus', 'outlineColor'),
        },
        disabled: {
          bgColor: 'transparent',
          fgColor: ref('disabled', 'fgColor'),
          borderColor: 'transparent',
        },
      },

      // Tab Panel
      tabPanel: {
        bgColor: ref('surface', 'primary'),
        fgColor: ref('text', 'primary'),
        borderColor: ref('border', 'primary'),
        borderRadius: ref('borderRadius', 'md'),
        borderStyle: 'solid',
        borderWidth: ref('borderWidth', 'thin'),
        boxShadow: 'none',
        paddingX: ref('spacing', 'lg'),
        paddingY: ref('spacing', 'lg'),
        minHeight: '160px',
        transition: 'opacity 0.15s ease',
      },

      // Textarea
      textareaControl: {
        inputLineHeight: ref('typography', 'lineHeight', 'md'),
        inputMinHeight: '80px',
        inputMinWidth: '100%',
      },

      // Tooltip
      tooltip: {
        bgColor: ref('surface', 'inverse'),
        fgColor: ref('text', 'inverse'),
        borderColor: 'transparent',
        borderRadius: ref('borderRadius', 'sm'),
        borderStyle: 'solid',
        borderWidth: '0',
        boxShadow: ref('shadow', 'md'),
        padding: `${ref('spacing', 'xs')} ${ref('spacing', 'sm')}`,
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

export const charmTheme = generateThemeSync(charmDefinition, { prefix: 'charm' });

export const charmTokens = {
  definition: charmDefinition,
  helpers: charmHelpers,
  theme: charmTheme,
  css: charmTheme.css,
  cssReset: charmTheme.cssReset,
  cssUtilities: charmTheme.cssUtilities,
  hasLightDarkTokens: charmTheme.hasLightDarkTokens,
  tokensJson: charmTheme.tokensJson,
  tokensLightJson: charmTheme.tokensLightJson,
  tokensDarkJson: charmTheme.tokensDarkJson,
  tokensMarkdown: charmTheme.tokensMarkdown,
};
