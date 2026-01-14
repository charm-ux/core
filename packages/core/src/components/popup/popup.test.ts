import { html } from '@open-wc/testing';
import { CorePopupTests } from './popup.test-harness.js';
import './index.js';

new CorePopupTests().runTests(
  config =>
    html`<ch-popup ${config}>
      <div></div>
    </ch-popup>`
);
