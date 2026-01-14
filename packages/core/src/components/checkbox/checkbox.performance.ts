import { html, testBundleSize, testRenderTime } from 'web-test-runner-performance/browser.js';
import { expect } from '@open-wc/testing';
import { createScope } from '../../utilities/index.js';
import coreCheckbox from './checkbox.js';

createScope({
  styles: [],
  components: [coreCheckbox],
});

describe('checkbox performance', () => {
  const element = html`<ch-checkbox>TODO: change this</ch-checkbox>`;

  it(`should render under 20ms`, async () => {
    expect((await testRenderTime(element)).duration).to.be.lessThan(20);
  });
  it.skip('should have a small bundle', async () => {
    expect((await testBundleSize('./dist/index.js')).kb).to.below(1);
  });
});
