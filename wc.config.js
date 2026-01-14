/** @type {import('@wc-toolkit/wctools').WCConfig} */
export default {
  manifestSrc: './packages/core/custom-elements.json',
  // include: ['**/*.html', '**/*.js', '**/*.ts', '**/*.mdx', '**/*.md', '**/*.astro'],
  exclude: ['**/node_modules/**', '**/dist/**', '**/build/**'],
  libraries: {
    // 'wc-dox': {
    //   manifestSrc: './packages/docs/node_modules/wc-dox/custom-elements.json',
    // },
    // '@charm-ux/core': {
    //   manifestSrc: './packages/core/custom-elements.json',
    // },
    // 'code-bubble': {
    //   manifestSrc: './packages/docs/node_modules/code-bubble/custom-elements.json',
    // },
  },
  // debug: true,
};
