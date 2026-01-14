import { fileURLToPath } from 'url';
import { esbuildPlugin } from '@web/dev-server-esbuild';
import { defaultReporter } from '@web/test-runner';
import { junitReporter } from '@web/test-runner-junit-reporter';
import { playwrightLauncher } from '@web/test-runner-playwright';
import { globbySync } from 'globby';

const testFilePatterns = ['src/**/*.test.ts'];

export default {
  rootDir: '.',
  plugins: [
    esbuildPlugin({ ts: true, json: true, tsconfig: fileURLToPath(new URL('./tsconfig.json', import.meta.url)) }),
  ],
  concurrentBrowsers: 3,
  browsers: [
    playwrightLauncher({ product: 'chromium' }),
    playwrightLauncher({ product: 'firefox' }),
    playwrightLauncher({ product: 'webkit' }),
  ],
  reporters: [
    defaultReporter({ reportTestResults: true, reportTestProgress: true }),
    junitReporter({
      outputPath: './results/test-results.xml',
      reportLogs: true,
    }),
  ],
  coverage: true,
  coverageConfig: {
    include: testFilePatterns,
    exclude: [],
    report: true,
    reportDir: './results',
  },
  // Create a named group for every test file to enable running single tests.
  // If a test file is `search-box.test.ts` then you can run `pnpm run test -- --group search-box` to run only that file's tests
  groups: globbySync(testFilePatterns).map(path => {
    const groupName = path.match(/^.*\/(?<fileName>.*)\.test/).groups.fileName;
    return {
      name: groupName,
      files: path,
    };
  }),
  nodeResolve: true,
  testsFinishTimeout: 400000,
  testFramework: {
    config: {
      timeout: 10000,
    },
  },
  testRunnerHtml: testFramework => `
	<html>
		<head> 
      <link href="dist/themes/charm/reset.css" rel="stylesheet"/>
      <link href="dist/themes/charm/theme.css" rel="stylesheet"/>
    </head>
		<body>
		<script>
      // Suppress Floating UI warnings
      window.process = { env: { NODE_ENV: "development" } };

      // Disable Lit dev mode warning
      window.litDisableDevModeWarning = true;

			// This is a benign error that seems to be caused by components that use anchored region. We'll suppress it
			// here and track down the root cause of it one day.
			window.addEventListener('error', (e) => {
			if (
				e.message === 'ResizeObserver loop completed with undelivered notifications.' ||
				e.message === 'ResizeObserver loop limit exceeded'
			) {
				e.stopImmediatePropagation();
			}
			});
		</script>
		<script type="module" src="${testFramework}"></script>
		</body>
	</html>
	`,
};
