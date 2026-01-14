import { html } from '@open-wc/testing';
import './index.js';
import { CoreOverflowTests } from './overflow.test-harness.js';

new CoreOverflowTests().runTests(
  config =>
    html`<ch-overflow ${config}>
      <button style="width: 100px">one</button>
      <button style="width: 100px">two</button>
      <button style="width: 100px">three</button>
    </ch-overflow>`
);
