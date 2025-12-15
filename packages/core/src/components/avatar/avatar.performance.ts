import { html, testRenderTime } from 'web-test-runner-performance/browser.js';
import { expect } from '@open-wc/testing';
import { createScope } from '../../utilities/index.js';
import coreAvatar from './avatar.js';

createScope({
  styles: [],
  components: [coreAvatar],
});

describe('badge performance', () => {
  const element = html`<ch-avatar>TODO: change this</ch-avatar>`;

  it(`should render under 20ms`, async () => {
    expect((await testRenderTime(element)).duration).to.be.lessThan(20);
  });
});
