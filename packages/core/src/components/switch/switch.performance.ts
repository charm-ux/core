import { html, testBundleSize, testRenderTime } from 'web-test-runner-performance/browser.js';
import { expect } from '@open-wc/testing';
import { createScope } from '../../utilities/index.js';
import coreSwitch from './switch.js';

createScope({
  styles: [],
  components: [coreSwitch],
});

describe('menu performance', () => {
  const element = html`<ch-switch>label</ch-switch>`;

  it(`should render under 20ms`, async () => {
    expect((await testRenderTime(element)).duration).to.be.lessThan(20);
  });

  it('should have a small bundle', async () => {
    expect((await testBundleSize('./dist/components/switch/switch.js')).kb).to.below(1);
  });
});
