import { html, testBundleSize, testRenderTime } from 'web-test-runner-performance/browser.js';
import { expect } from '@open-wc/testing';
import './index.js';

describe('accordion-item performance', () => {
  const element = html`<ch-accordion-item>Accordion Item</ch-accordion-item>`;

  it(`should render under 20ms`, async () => {
    expect((await testRenderTime(element)).duration).to.be.lessThan(20);
  });
  it('should have a small bundle', async () => {
    expect((await testBundleSize('./dist/components/accordion-item/accordion-item.js')).kb).to.below(1);
  });
});
