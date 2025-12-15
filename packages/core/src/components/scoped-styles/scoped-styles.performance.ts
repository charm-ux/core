import { html, testBundleSize, testRenderTime } from 'web-test-runner-performance/browser.js';
import { expect } from '@open-wc/testing';
import './index.js';

describe('theme performance', () => {
  const element = html`<ch-scoped-styles>TODO: change this</ch-scoped-styles>`;

  it(`should render under 20ms`, async () => {
    expect((await testRenderTime(element)).duration).to.be.lessThan(20);
  });
  it('should have a small bundle', async () => {
    expect((await testBundleSize('./dist/components/scoped-styles/scoped-styles.js')).kb).to.below(1);
  });
});
