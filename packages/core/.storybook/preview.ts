import { setCustomElementsManifest } from '@storybook/web-components-vite';
import { setStorybookHelpersConfig } from '@wc-toolkit/storybook-helpers';
import { withThemeByClassName } from '@storybook/addon-themes';
import customElements from '../custom-elements.json';
import '../dist/themes/charm/selector-theme.css';
import '../dist/themes/charm/reset.css';
import '../dist/themes/charm/utility-classes.css';
import { withBrandThemes } from './withBrandThemes.decorator.js';

setStorybookHelpersConfig({});
setCustomElementsManifest(customElements);

/** @type { import('@storybook/web-components-vite').Preview } */
const preview = {
  parameters: {
    controls: {
      sort: 'alpha',
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [
    withBrandThemes({
      themes: {
        fluent: 'charm-light',
      },
      defaultTheme: 'charm-light',
    }),
    withThemeByClassName({
      themes: {
        'charm-light': 'charm-light',
        'charm-dark': 'charm-dark',
      },
      defaultTheme: 'charm-light',
    }),
  ],
};

export default preview;
