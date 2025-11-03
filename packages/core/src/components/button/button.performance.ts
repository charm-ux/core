import { html, testRenderTime } from 'web-test-runner-performance/browser.js';
import { expect } from '@open-wc/testing';
import { createScope } from '../../utilities/index.js';
import coreButton from './button.js';

createScope({
  styles: [],
  components: [coreButton],
});

describe('core-button performance', () => {
  const element = html`<ch-button>button</ch-button>`;

  it(`should render under 20ms`, async () => {
    expect((await testRenderTime(element)).duration).to.be.lessThan(20);
  });
  // TODO: test component bundle size rather than full lib size
  // it('should have a small bundle', async () => {
  //   expect((await testBundleSize('./dist/index.js')).kb).to.below(1);
  // });
});
