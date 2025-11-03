/**
 * Beachball Configuration
 * @see https://microsoft.github.io/beachball/overview/configuration.html#configuration-files
 * @type {import('beachball').BeachballConfig}
 */
module.exports = {
  ignorePatterns: [
    '**/__*',
    '**/.config/**',
    '**/.gitignore',
    '**/.npmrc',
    '**/.vscode/**',
    '**/*.performance.ts*',
    '**/*.test.ts*',
    '**/CHANGELOG.*',
    '**/docs/**',
    '**/envFiles/**',
    '**/lint-staged.config.cjs',
    '**/plop-templates/**',
    '**/plopfile.js',
    '**/tsconfig.json',
    '**/tsconfig.base.json',
  ],
  access: 'restricted',
  branch: 'origin/main',
  bumpDeps: true,
  gitTags: false,
  groupChanges: true,
  publish: false, //TODO: determine if we want to enable beachball to publish
  push: false,
  registry: 'https://pkgs.dev.azure.com/charm-pilot/charm-pilot/_packaging/charm-feed/npm/registry/',
  changelog: {
    renderMainHeader: () => null,
  },
};
