import { cemInheritancePlugin } from '@wc-toolkit/cem-inheritance';
import { cemSorterPlugin } from '@wc-toolkit/cem-sorter';
import { jsDocTagsPlugin } from '@wc-toolkit/jsdoc-tags';
import { getTsProgram, typeParserPlugin } from '@wc-toolkit/type-parser';

export default {
  exclude: [
    '**/*.performance.ts',
    '**/*.stories.ts',
    '**/*.styles.ts',
    '**/*.test.ts',
    '**/*.test-harness.ts',
    '**/index.ts',
    '**/types.ts',
  ],
  globs: ['src/components/**/*.ts', 'src/base/**/*.ts', 'src/components/**/*.js', 'src/base/**/*.js'],
  litelement: true,
  packagejson: true,
  plugins: [
    typeParserPlugin({ parseObjectTypes: 'partial', parseParameters: true }),
    cemInheritancePlugin(),
    jsDocTagsPlugin({
      tags: {
        since: {},
        dependency: {
          mappedName: 'dependencies',
          isArray: true,
        },
        status: {},
      },
    }),
    cemSorterPlugin({}),
  ],
  overrideModuleCreation: ({ ts, globs }) => {
    const program = getTsProgram(ts, globs, 'tsconfig.json');
    return program.getSourceFiles().filter(sf => globs.find(glob => sf.fileName.includes(glob)));
  },
};
