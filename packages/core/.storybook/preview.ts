import { setCustomElementsManifest } from '@storybook/web-components';
import customElements from '../custom-elements.json';
import { setWcStorybookHelpersConfig } from 'wc-storybook-helpers';
import { withThemeByClassName } from '@storybook/addon-themes';
import { withBrandThemes } from './withBrandThemes.decorator';
import '../dist/themes/charm/selector-theme.css';
import '../dist/themes/charm/reset.css';
import '../dist/themes/charm/utility-classes.css';
import { withActions } from '@storybook/addon-actions/decorator';

setWcStorybookHelpersConfig({ typeRef: 'parsedType' });
setCustomElementsManifest(customElements);

/** @type { import('@storybook/web-components').Preview } */
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
    withActions,
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
