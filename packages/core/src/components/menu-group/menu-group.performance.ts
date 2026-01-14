import { html, testBundleSize, testRenderTime } from 'web-test-runner-performance/browser.js';
import { expect } from '@open-wc/testing';
import { createScope } from '../../utilities/index.js';
import coreMenuGroup from './menu-group.js';

createScope({
  styles: [],
  components: [coreMenuGroup],
});

describe('menu-group performance', () => {
  const element = html`<ch-menu-group></ch-menu-group>`;

  it(`should render under 20ms`, async () => {
    expect((await testRenderTime(element)).duration).to.be.lessThan(20);
  });
  it('should have a small bundle', async () => {
    expect((await testBundleSize('./dist/components/menu-group/menu-group.js')).kb).to.below(1);
  });
});
