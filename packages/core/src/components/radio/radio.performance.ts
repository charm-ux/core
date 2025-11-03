import { html, testBundleSize, testRenderTime } from 'web-test-runner-performance/browser.js';
import { expect } from '@open-wc/testing';
import { createScope } from '../../utilities/index.js';
import coreRadio from './radio.js';

createScope({
  styles: [],
  components: [coreRadio],
});

describe('divider performance', () => {
  const element = html`<ch-radio>TODO: change this</ch-radio>`;

  it(`should render under 20ms`, async () => {
    expect((await testRenderTime(element)).duration).to.be.lessThan(20);
  });
  it.skip('should have a small bundle', async () => {
    expect((await testBundleSize('./dist/index.js')).kb).to.below(1);
  });
});
