import { html, testBundleSize, testRenderTime } from 'web-test-runner-performance/browser.js';
import { expect } from '@open-wc/testing';
import { createScope } from '../../utilities/index.js';
import './index.js';
import CoreSkeleton from './skeleton.js';

createScope({
  styles: [],
  components: [CoreSkeleton],
});

describe('skeleton performance', () => {
  const element = html`<ch-skeleton></ch-skeleton>`;

  it(`should render under 20ms`, async () => {
    expect((await testRenderTime(element)).duration).to.be.lessThan(20);
  });
  it('should have a small bundle', async () => {
    expect((await testBundleSize('./dist/components/skeleton/skeleton.js')).kb).to.below(1);
  });
});
