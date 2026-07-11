import { existsSync } from 'node:fs';
import { playwrightLauncher } from '@web/test-runner-playwright';
import { chromium, firefox, webkit } from 'playwright';

const SYSTEM_CHROMIUM_PATHS = [
  '/snap/bin/chromium',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
];

function resolveSystemChromiumPath() {
  return SYSTEM_CHROMIUM_PATHS.find(path => existsSync(path));
}

function createLauncher(product, executablePath) {
  if (executablePath) {
    return playwrightLauncher({
      product,
      launchOptions: { executablePath },
    });
  }
  return playwrightLauncher({ product });
}

/**
 * Resolve a stable browser launcher list for environments where Playwright
 * browser binaries may be unavailable (for example unsupported Linux/ARM
 * distro builds). Falls back to a system Chromium install when present.
 */
export function resolvePlaywrightLaunchers() {
  const launchers = [];

  const chromiumPath = chromium.executablePath();
  if (existsSync(chromiumPath)) {
    launchers.push(createLauncher('chromium'));
  } else {
    const systemChromium = resolveSystemChromiumPath();
    if (systemChromium) {
      launchers.push(createLauncher('chromium', systemChromium));
    }
  }

  const firefoxPath = firefox.executablePath();
  if (existsSync(firefoxPath)) {
    launchers.push(createLauncher('firefox'));
  }

  const webkitPath = webkit.executablePath();
  if (existsSync(webkitPath)) {
    launchers.push(createLauncher('webkit'));
  }

  if (launchers.length === 0) {
    throw new Error(
      [
        'No runnable browser was found for web-test-runner.',
        'Install Playwright browsers with:',
        '  pnpm --filter @charm-ux/core exec playwright install',
        'or install a system Chromium browser.',
      ].join('\n')
    );
  }

  return launchers;
}
