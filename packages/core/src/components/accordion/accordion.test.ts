import { html } from '@open-wc/testing';
import './index.js';
import { CoreAccordionTests } from './accordion.test-harness.js';

new CoreAccordionTests().runTests(
  config =>
    html` <ch-accordion ${config}>
        <ch-accordion-item id="item1">
          <span slot="heading">button</span>
          Accordion one
        </ch-accordion-item>
        <ch-accordion-item id="item2">
          <span slot="heading">button</span>
          Accordion two
        </ch-accordion-item>
        <ch-accordion-item id="item3">
          <span slot="heading">button</span>
          Accordion three
        </ch-accordion-item>
      </ch-accordion>
      >`
);
