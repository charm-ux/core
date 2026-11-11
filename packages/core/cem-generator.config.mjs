import { litPlugin } from '@wc-toolkit/cem-generator-lit';
import { cemGeneratorCssPrefixPlugin } from '@charm-ux/theming/cem-plugin';

export default {
  tsConfigPath: './tsconfig.json',
  include: ['src/components/**/*.ts', 'src/base/**/*.ts'],
  exclude: [
    '**/*.performance.ts',
    '**/*.stories.ts',
    '**/*.styles.ts',
    '**/*.test.ts',
    '**/*.test-harness.ts',
    '**/index.ts',
    '**/types.ts',
  ],
  plugins: [litPlugin(), cemGeneratorCssPrefixPlugin()],
  customJsDocTags: {
    since: {},
    dependency: {
      mappedName: 'dependencies',
      isArray: true,
    },
    status: {},
  },
};
