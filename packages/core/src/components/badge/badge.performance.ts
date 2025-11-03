import { html, testBundleSize, testRenderTime } from 'web-test-runner-performance/browser.js';
import { expect } from '@open-wc/testing';
import { createScope } from '../../utilities/index.js';
import coreBadge from './badge.js';

createScope({
  styles: [],
  components: [coreBadge],
});

describe('badge performance', () => {
  const element = html`<ch-badge>TODO: change this</ch-badge>`;

  it(`should render under 20ms`, async () => {
    expect((await testRenderTime(element)).duration).to.be.lessThan(20);
  });
  it('should have a small bundle', async () => {
    expect((await testBundleSize('./dist/index.js')).kb).to.below(1);
  });
});
