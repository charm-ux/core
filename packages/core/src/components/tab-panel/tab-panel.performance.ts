import { html, testBundleSize, testRenderTime } from 'web-test-runner-performance/browser.js';
import { expect } from '@open-wc/testing';
import './index.js';

describe('tab-panel performance', () => {
  const element = html`<ch-tab-panel>TODO: change this</ch-tab-panel>`;

  it(`should render under 20ms`, async () => {
    expect((await testRenderTime(element)).duration).to.be.lessThan(20);
  });
  it('should have a small bundle', async () => {
    expect((await testBundleSize('./dist/components/tab-panel/tab-panel.js')).kb).to.below(1);
  });
});
