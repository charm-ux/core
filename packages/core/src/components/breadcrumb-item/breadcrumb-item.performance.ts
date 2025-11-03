import { html, testRenderTime } from 'web-test-runner-performance/browser.js';
import { expect } from '@open-wc/testing';
import { createScope } from '../../utilities/index.js';
import coreBreadcrumbItem from './breadcrumb-item.js';

createScope({
  styles: [],
  components: [coreBreadcrumbItem],
});

describe('breadcrumb-item performance', () => {
  const element = html`<ch-breadcrumb-item>item</ch-breadcrumb-item>`;

  it(`should render under 20ms`, async () => {
    expect((await testRenderTime(element)).duration).to.be.lessThan(20);
  });
});
