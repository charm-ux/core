import { html } from '@open-wc/testing';
import './index.js';
import { CoreDateRangePickerTests } from './date-range-picker.test-harness.js';

new CoreDateRangePickerTests().runTests(
  config => html`<ch-date-range-picker label="Date range" focus-date="2025-06-15" ${config}></ch-date-range-picker>`
);
