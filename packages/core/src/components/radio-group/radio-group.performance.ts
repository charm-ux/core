import { html, testBundleSize, testRenderTime } from 'web-test-runner-performance/browser.js';
import { expect } from '@open-wc/testing';
import './index.js';
import { createScope } from '../../utilities/index.js';
import coreRadioGroup from './radio-group.js';

createScope({
  styles: [],
  components: [coreRadioGroup],
});

describe('radio-group performance', () => {
  const element = html`<ch-radio-group>TODO: change this</ch-radio-group>`;

  it(`should render under 20ms`, async () => {
    expect((await testRenderTime(element)).duration).to.be.lessThan(20);
  });
  it('should have a small bundle', async () => {
    expect((await testBundleSize('./dist/components/radio-group/radio-group.js')).kb).to.below(1);
  });
});
