import { html, testBundleSize, testRenderTime } from 'web-test-runner-performance/browser.js';
import { expect } from '@open-wc/testing';
import { createScope } from '../../utilities/index.js';
import coreInput from './input.js';

createScope({
  components: [coreInput],
});

describe('input performance', () => {
  const element = html`<ch-input label="label"></ch-input>`;

  it(`should render under 20ms`, async () => {
    expect((await testRenderTime(element)).duration).to.be.lessThan(20);
  });
  it('should have a small bundle', async () => {
    expect((await testBundleSize('./dist/components/input/input.js')).kb).to.below(1);
  });
});
