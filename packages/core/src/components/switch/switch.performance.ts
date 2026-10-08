import { html, testBundleSize, testRenderTime } from 'web-test-runner-performance/browser.js';
import { expect } from '@open-wc/testing';
import { createScope } from '../../utilities/index.js';
import coreSwitch, { type CoreSwitch } from './switch.js';

createScope({
  styles: [],
  components: [coreSwitch],
});

describe('switch performance', () => {
  const element = html`<ch-switch>label</ch-switch>`;

  it(`should render under 20ms`, async () => {
    expect((await testRenderTime(element)).duration).to.be.lessThan(20);
  });

  it('should toggle 1000 switches under 150ms', async () => {
    const container = document.createElement('div');
    container.innerHTML = '<ch-switch label="label"></ch-switch>'.repeat(1000);
    document.body.append(container);

    const switches = [...container.querySelectorAll<CoreSwitch>('ch-switch')];
    await Promise.all(switches.map(switchElement => switchElement.updateComplete));

    const start = performance.now();
    switches.forEach(switchElement => {
      switchElement.checked = true;
    });
    await Promise.all(switches.map(switchElement => switchElement.updateComplete));
    void container.offsetHeight;
    const duration = performance.now() - start;

    container.remove();
    expect(duration).to.be.lessThan(150);
  });

  it('should have a small bundle', async () => {
    expect((await testBundleSize('./dist/components/switch/switch.js')).kb).to.below(1);
  });
});
