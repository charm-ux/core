module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['import', 'markdown', 'require-extensions'],
  extends: [
    'eslint:recommended',
    'prettier',
    'plugin:markdown/recommended',
    'plugin:wc/recommended',
    'plugin:lit/recommended',
    'plugin:require-extensions/recommended',
    'plugin:storybook/recommended',
  ],
  settings: {
    'mdx/code-blocks': true,
  },
  rules: {
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
      },
    ],
    'import/newline-after-import': 'error',
    'sort-imports': [
      'error',
      {
        ignoreCase: true,
        ignoreDeclarationSort: true,
      },
    ],
    'comma-dangle': 'off',
    'no-prototype-builtins': 'off',
    'no-fallthrough': 'off',
    'no-unexpected-multiline': 'off',
    'no-extra-boolean-cast': 'off',
    'lines-between-class-members': 'off',
    'lit/binding-positions': 'off',
    'lit/no-invalid-html': 'off',
  },
  overrides: [
    {
      files: ['*.ts'],
      plugins: ['@typescript-eslint'],
      extends: ['plugin:@typescript-eslint/eslint-recommended', 'plugin:@typescript-eslint/recommended'],
      rules: {
        '@typescript-eslint/member-ordering': 'error',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/camelcase': 'off',
        '@typescript-eslint/no-inferrable-types': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', { args: 'none' }],
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/typedef': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-empty-interface': [
          'error',
          {
            allowSingleExtends: true,
          },
        ],
        '@typescript-eslint/class-name-casing': 'off',
        '@typescript-eslint/naming-convention': [
          'error',
          {
            selector: 'typeLike',
            format: ['UPPER_CASE', 'camelCase', 'PascalCase'],
            leadingUnderscore: 'allow',
          },
        ],
        '@typescript-eslint/lines-between-class-members': [
          'warn',
          'always',
          { exceptAfterOverload: true, exceptAfterSingleLine: true },
        ],
        '@typescript-eslint/explicit-member-accessibility': 'error',
        '@typescript-eslint/ban-types': 'off',
      },
    },
    {
      files: ['**/*.md/*.js', '**/*.md/*.ts'],
      rules: {
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
    {
      files: ['*.mdx', '**/*.mdx/*.js'],
      extends: 'plugin:mdx/recommended',
      rules: {
        'no-unused-vars': 'off',
        'require-extensions/require-extensions': 'off',
      },
    },
  ],
  env: {
    browser: true,
    amd: true,
    node: true,
  },
};
