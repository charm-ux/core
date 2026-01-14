import { html, testBundleSize, testRenderTime } from 'web-test-runner-performance/browser.js';
import { expect } from '@open-wc/testing';
import './index.js';

describe('overflow performance', () => {
  const element = html`<ch-overflow>TODO: change this</ch-overflow>`;

  it(`should render under 20ms`, async () => {
    expect((await testRenderTime(element)).duration).to.be.lessThan(20);
  });
  it('should have a small bundle', async () => {
    expect((await testBundleSize('./dist/components/overflow/overflow.js')).kb).to.below(1);
  });
});
