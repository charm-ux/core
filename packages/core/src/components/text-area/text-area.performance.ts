import { html, testBundleSize, testRenderTime } from 'web-test-runner-performance/browser.js';
import { expect } from '@open-wc/testing';
import './index.js';

describe('text-area performance', () => {
  const element = html`<ch-text-area>TODO: change this</ch-text-area>`;

  it(`should render under 20ms`, async () => {
    expect((await testRenderTime(element)).duration).to.be.lessThan(20);
  });
  it('should have a small bundle', async () => {
    expect((await testBundleSize('./dist/components/text-area/text-area.js')).kb).to.below(1);
  });
});
