import { html, testBundleSize, testRenderTime } from 'web-test-runner-performance/browser.js';
import { expect } from '@open-wc/testing';
import { createScope } from '../../utilities/index.js';
import coreTooltip from './tooltip.js';

createScope({
  styles: [],
  components: [coreTooltip],
});

describe('tooltip performance', () => {
  const element = html`<ch-tooltip>TODO: change this</ch-tooltip>`;

  it(`should render under 20ms`, async () => {
    expect((await testRenderTime(element)).duration).to.be.lessThan(20);
  });
  it('should have a small bundle', async () => {
    expect((await testBundleSize('./dist/components/tooltip/tooltip.js')).kb).to.below(1);
  });
});
