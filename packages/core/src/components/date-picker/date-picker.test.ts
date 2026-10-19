import { html } from '@open-wc/testing';
import './index.js';
import { CoreDatePickerTests } from './date-picker.test-harness.js';

new CoreDatePickerTests().runTests(
  config => html`<ch-date-picker label="Date" focus-date="2025-06-15" ${config}></ch-date-picker>`
);
