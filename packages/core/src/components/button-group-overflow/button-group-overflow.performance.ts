import { html, testRenderTime } from 'web-test-runner-performance/browser.js';
import { expect } from '@open-wc/testing';
import { createScope } from '../../utilities/index.js';
import coreButtonGroupOverflow from './button-group-overflow.js';

createScope({
  styles: [],
  components: [coreButtonGroupOverflow],
});

describe('button-group-overflow performance', () => {
  const element = html`<ch-button-group-overflow></ch-button-group-overflow>`;

  it(`should render under 20ms`, async () => {
    expect((await testRenderTime(element)).duration).to.be.lessThan(20);
  });
  // TODO: test component bundle size rather than full lib size
  // it('should have a small bundle', async () => {
  //   expect((await testBundleSize('./dist/index.js')).kb).to.below(1);
  // });
});
