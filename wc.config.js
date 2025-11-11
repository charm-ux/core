/** @type {import('@wc-toolkit/wctools').WCConfig} */
export default {
  manifestSrc: 'custom-elements.json',
  include: ['**/*.html', '**/*.js', '**/*.ts', '**/*.mdx', '**/*.md', '**/*.astro'],
  exclude: ['node_modules/**', 'dist/**', 'build/**'],
  libraries: {
    'wc-dox': './packages/docs/node_modules/wc-dox/custom-elements.json',
  },
};
