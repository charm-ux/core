import { fileURLToPath } from 'url';
import { esbuildPlugin } from '@web/dev-server-esbuild';
import { defaultReporter } from '@web/test-runner';
import { performanceReporter } from 'web-test-runner-performance';
import { resolvePlaywrightLaunchers } from './test/playwrightLaunchers.js';

const browsers = resolvePlaywrightLaunchers().slice(0, 1);

export default {
  concurrency: 1,
  concurrentBrowsers: 1,
  testsFinishTimeout: 400000,
  files: ['./src/internal/testing/component-production.performance.ts'],
  nodeResolve: {
    exportConditions: ['browser'],
  },
  browsers,
  plugins: [
    esbuildPlugin({
      ts: true,
      json: true,
      target: 'es2020',
      tsconfig: fileURLToPath(new URL('./tsconfig.json', import.meta.url)),
    }),
  ],
  reporters: [
    defaultReporter({ reportTestResults: true, reportTestProgress: true }),
    performanceReporter({ writePath: './dist/performance-production' }),
  ],
  testRunnerHtml: testFramework => `
    <html>
      <body>
        <script type="module" src="${testFramework}"></script>
      </body>
    </html>
  `,
  testFramework: {
    config: {
      timeout: 60000,
    },
  },
};
