import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
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
      social: [],
      // Proper minimal i18n configuration to avoid errors
      head: [
        {
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href: '/styles.css',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href: '/charm/reset.css',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href: '/charm/theme.css',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href: '/charm/utility-classes.css',
          },
        },
        {
          tag: 'script',
          attrs: {
            type: 'module',
            src: '/charm/kitchen-sink.js',
            defer: true,
          },
        },
        {
          tag: 'script',
          attrs: {
            type: 'module',
            src: '/code-bubble.js',
            defer: true,
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
