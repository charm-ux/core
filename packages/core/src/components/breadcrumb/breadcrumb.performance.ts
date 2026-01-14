import { html, testRenderTime } from 'web-test-runner-performance/browser.js';
import { expect } from '@open-wc/testing';
import { createScope } from '../../utilities/index.js';
import coreBreadcrumb from './breadcrumb.js';

createScope({
  styles: [],
  components: [coreBreadcrumb],
});

describe('breadcrumb performance', () => {
  const element = html`<ch-breadcrumb>Breadcrumb</ch-breadcrumb>`;

  it(`should render under 20ms`, async () => {
    expect((await testRenderTime(element)).duration).to.be.lessThan(20);
  });
});
