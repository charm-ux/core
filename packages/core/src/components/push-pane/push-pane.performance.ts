import { html, testBundleSize, testRenderTime } from 'web-test-runner-performance/browser.js';
import { expect } from '@open-wc/testing';
import { createScope } from '../../utilities/index.js';
import './index.js';
import CorePushPane from './push-pane.js';

createScope({
  styles: [],
  components: [CorePushPane],
});

describe('push-pane performance', () => {
  const element = html`<ch-push-pane>TODO: change this</ch-push-pane>`;

  it(`should render under 20ms`, async () => {
    expect((await testRenderTime(element)).duration).to.be.lessThan(20);
  });
  it('should have a small bundle', async () => {
    expect((await testBundleSize('./dist/components/push-pane/push-pane.js')).kb).to.below(1);
  });
});
