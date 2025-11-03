import { html } from '@open-wc/testing';
import './index.js';
import { CoreAlertTests } from './alert.test-harness.js';

new CoreAlertTests().runTests(
  config => html`<ch-alert ${config} style="--alert-transition: opacity 1ms;">Message bar content</ch-alert>`
);
