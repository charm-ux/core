/* eslint-env node */

const fs = require('fs');
const path = require('path');
const ignore = require('ignore');

const eslintIgnore = ignore().add(fs.readFileSync('./.eslintignore', { encoding: 'utf-8' }));

module.exports = {
  '*.{ts,js,md,mdx}': files => {
    const filteredFiles = files
      .map(absolutePath => path.relative(process.cwd(), absolutePath))
      .filter(eslintIgnore.createFilter())
      .map(file => `"${file}"`);
    return `eslint --max-warnings 0 --cache --fix ${filteredFiles.join(' ')}`;
  },
  '*': 'prettier --write --ignore-unknown',
};
