import { setCustomElementsManifest } from '@storybook/web-components-vite';
import customElements from '../custom-elements.json';
import { setStorybookHelpersConfig } from '@wc-toolkit/storybook-helpers';
import '../dist/themes/charm/selector-theme.css';
import '../dist/themes/charm/reset.css';
import '../dist/themes/charm/utility-classes.css';

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
  // decorators: [
  //   withActions,
  //   withBrandThemes({
  //     themes: {
  //       fluent: 'charm-light',
  //     },
  //     defaultTheme: 'charm-light',
  //   }),
  //   withThemeByClassName({
  //     themes: {
  //       'charm-light': 'charm-light',
  //       'charm-dark': 'charm-dark',
  //     },
  //     defaultTheme: 'charm-light',
  //   }),
  // ],
};

export default preview;
