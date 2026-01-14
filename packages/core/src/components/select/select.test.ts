import { html } from '@open-wc/testing';
import './index.js';
import { CoreSelectTests } from './select.test-harness.js';

new CoreSelectTests().runTests(
  config => html`
    <ch-select label="test-select" ${config}>
      <option value="">Option One</option>
    </ch-select>
  `
);
