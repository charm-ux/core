import { html } from '@open-wc/testing';
import './index.js';
import '../button-group/index.js';
import { CoreButtonGroupOverflowTests } from './button-group-overflow.test-harness.js';

new CoreButtonGroupOverflowTests().runTests(
  config =>
    html`<ch-button-group-overflow ${config}>
      <ch-button-group>
        <button style="width: 100px">one</button>
        <button style="width: 100px">two</button>
        <button style="width: 100px">three</button>
      </ch-button-group>
      <ch-divider></ch-divider>
      <ch-button-group>
        <button style="width: 100px">one</button>
        <button style="width: 100px">two</button>
        <button style="width: 100px">three</button>
      </ch-button-group>
    </ch-button-group-overflow>`
);
