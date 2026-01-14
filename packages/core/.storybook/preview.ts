import { setCustomElementsManifest } from '@storybook/web-components-vite';
import { setStorybookHelpersConfig } from '@wc-toolkit/storybook-helpers';
import { withThemeByClassName } from '@storybook/addon-themes';
import customElements from '../custom-elements.json';
import './code-bubble-setup.js';
import '../dist/kitchen-sink.js';
import '../dist/themes/charm/selector-theme.css';
import '../dist/themes/charm/reset.css';
import '../dist/themes/charm/utility-classes.css';
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
    withThemeByClassName({
      themes: {
        light: 'charm-light',
        dark: 'charm-dark',
      },
      defaultTheme: 'light',
    }),
  ],
};

export default preview;
