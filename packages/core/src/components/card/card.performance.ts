import { html, testBundleSize, testRenderTime } from 'web-test-runner-performance/browser.js';
import { expect } from '@open-wc/testing';
import { createScope } from '../../utilities/index.js';
import coreCard from './card.js';

createScope({
  styles: [],
  components: [coreCard],
});

describe('card performance', () => {
  const el = html`<ch-card></ch-card>`;

  it(`should render under 20ms`, async () => {
    expect((await testRenderTime(el)).duration).to.be.lessThan(20);
  });
  it('should have a small bundle', async () => {
    expect((await testBundleSize('./dist/components/card/card.js')).kb).to.below(1);
  });
});
