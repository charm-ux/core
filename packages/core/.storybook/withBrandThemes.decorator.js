import { DecoratorHelpers } from '@storybook/addon-themes';
import { html } from 'lit';

const { initializeThemeState, pluckThemeFromContext, useThemeParameters } = DecoratorHelpers;

export const withBrandThemes = ({ themes, defaultTheme }) => {
  initializeThemeState(Object.keys(themes), defaultTheme);

  return (story, context) => {
    const selectedTheme = pluckThemeFromContext(context);
    const { themeOverride } = useThemeParameters();
    const selected = themeOverride || selectedTheme || defaultTheme;

    return html`<div class="${selected}">${story()}</div>`;
  };
};
