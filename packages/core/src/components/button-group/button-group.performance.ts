import { html, testBundleSize, testRenderTime } from 'web-test-runner-performance/browser.js';
import { expect } from '@open-wc/testing';
import './index.js';

describe('button-group performance', () => {
  const element = html`<ch-button-group>
    <ch-button>Button 1</ch-button>
    <ch-button>Button 2</ch-button>
    <ch-menu>
      <ch-button slot="trigger" caret>Button 3</ch-button>
      <ch-menu-item>Item 1</ch-menu-item>
      <ch-menu-item>Item 2</ch-menu-item>
    </ch-menu>
    <ch-button>Button 4</ch-button>
  </ch-button-group>`;

  it(`should render under 20ms`, async () => {
    expect((await testRenderTime(element)).duration).to.be.lessThan(20);
  });
  it('should have a small bundle', async () => {
    expect((await testBundleSize('./dist/components/button-group/button-group.js')).kb).to.below(1);
  });
});
