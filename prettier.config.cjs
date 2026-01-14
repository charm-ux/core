module.exports = {
  arrowParens: 'avoid',
  bracketSpacing: true,
  htmlWhitespaceSensitivity: 'css',
  insertPragma: false,
  bracketSameLine: false,
  jsxSingleQuote: false,
  printWidth: 120,
  proseWrap: 'preserve',
  quoteProps: 'as-needed',
  requirePragma: false,
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  useTabs: false,
  endOfLine: 'lf',
  overrides: [
    {
      files: ['*.md', '*.mdx'],
      options: {
        printWidth: 100, // prevents horizontal scrollbars in code previews when full width
        htmlWhitespaceSensitivity: 'ignore',
      },
    },
  ],
};
