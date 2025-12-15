/** @type { import('@storybook/web-components-vite').StorybookConfig } */
const config = {
  stories: ['../src/**/*.mdx', '../src/**/*html.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-themes',
    '@storybook/addon-a11y',
    {
      name: '@storybook/addon-docs',
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            providerImportSource: false,
          },
        },
      },
    },
  ],
  framework: {
    name: '@storybook/web-components-vite',
    options: {},
  },
  docs: {},
  staticDirs: ['../public'],
  async viteFinal(config: any) {
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
