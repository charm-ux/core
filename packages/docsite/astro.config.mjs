import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
  base: '/docsite',
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocal: false,
    },
  },
  trailingSlash: 'always',
  integrations: [
    starlight({
      title: 'Charm',
      components: {
        // Override the default PageTitle component
        PageTitle: './src/components/ComponentTitle.astro',
      },
      social: {
        microsoftTeams:
          'https://teams.microsoft.com/l/channel/19%3abb0CQ0At94Qfyhp5sEeaDy745zlrCT-NinUO0-eAShk1%40thread.tacv2/General?groupId=5198b042-c8e1-4344-8a4c-535ace1e06de&tenantId=72f988bf-86f1-41af-91ab-2d7cd011db47',
      },
      // Proper minimal i18n configuration to avoid errors
      head: [
        {
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href: '/docsite/styles.css',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href: '/docsite/charm/reset.css',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href: '/docsite/charm/theme.css',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href: '/docsite/charm/utility-classes.css',
          },
        },
        {
          tag: 'script',
          attrs: {
            type: 'module',
            src: '/docsite/charm/kitchen-sink.js',
          },
        },
      ],
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Installation', link: 'getting-started/installation/' },
            { label: 'Usage', link: 'getting-started/usage/' },
            { label: 'Scoping', link: 'getting-started/scoping/' },
            { label: 'Extending Charm', link: 'getting-started/extending/' },
          ],
        },
        {
          label: 'Overview',
          items: [{ label: 'Testing', link: 'overview/testing/' }],
        },
        {
          label: 'Contributing',
          items: [{ label: 'Version Management', link: 'contributing/version-management' }],
        },
        {
          label: 'Changelogs',
          items: [
            { label: '@charm-ux/core', link: 'changelog/core' },
            { label: '@charm-ux/theming', link: 'changelog/theming' },
          ],
        },
        {
          label: 'Components',
          autogenerate: { directory: 'components' },
        },
        {
          label: 'Theming',
          autogenerate: { directory: 'theming' },
        },
      ],
    }),
  ],
});
