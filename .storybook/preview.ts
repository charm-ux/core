import { setCustomElementsManifest } from '@storybook/web-components-vite';
import { setStorybookHelpersConfig } from '@wc-toolkit/storybook-helpers';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import customElements from '../packages/core/custom-elements.json';
import '../packages/core/dist/kitchen-sink.js';
import '../packages/core/dist/themes/charm/selector-theme.css';
import '../packages/core/dist/themes/charm/reset.css';
import '../packages/core/dist/themes/charm/utility-classes.css';
import './styles.css';

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
    withThemeByDataAttribute({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
      attributeName: 'data-theme',
    }),
  ],
};

export default preview;
