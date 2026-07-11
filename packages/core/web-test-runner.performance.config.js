import { esbuildPlugin } from '@web/dev-server-esbuild';
import { defaultReporter } from '@web/test-runner';
import { bundlePerformancePlugin, performanceReporter, renderPerformancePlugin } from 'web-test-runner-performance';
import { resolvePlaywrightLaunchers } from './test/playwrightLaunchers.js';

const browsers = resolvePlaywrightLaunchers().slice(0, 1);

export default /** @type {import("@web/test-runner").TestRunnerConfig} */ ({
  concurrency: 1,
  concurrentBrowsers: 1,
  files: ['./src/**/*.performance.ts'],
  nodeResolve: true,
  browsers,
  plugins: [
    esbuildPlugin({ ts: true, json: true, target: 'es2020' }),
    renderPerformancePlugin(),
    bundlePerformancePlugin({
      optimize: false,
      // writePath: `./dist/performance`, // uncomment to see bundle output with sourcemaps
      // external: [] // externals are not used so each bundle measured includes all third party dependencies
    }),
  ],
  reporters: [
    defaultReporter({ reportTestResults: true, reportTestProgress: true }),
    performanceReporter({ writePath: `./dist/performance` }),
  ],
});
