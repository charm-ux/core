import { html } from '@open-wc/testing';
import { CoreAccordionItemTests } from './accordion-item.test-harness.js';
import './index.js';

new CoreAccordionItemTests().runTests(
  config => html`<ch-accordion-item ${config}><span slot="heading">accordion item</span></ch-accordion-item>`
);
