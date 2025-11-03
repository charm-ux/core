/** @type { import('@storybook/web-components-vite').StorybookConfig } */
const config = {
  stories: ['../src/**/*.mdx', '../src/**/*html.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials', '@storybook/addon-a11y', 'storybook-addon-rtl'],
  framework: {
    name: '@storybook/web-components-vite',
    options: {},
  },
  docs: {},
  async viteFinal(config) {
    // Merge custom configuration into the default config
    const { mergeConfig } = await import('vite');

    return mergeConfig(config, {
      build: {
        rollupOptions: {
          external: ['@web/test-runner-commands'],
        },
      },
    });
  },
};
export default config;
