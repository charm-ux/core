import { html } from '@open-wc/testing';
import './index.js';
import '../radio/index.js';
import { CoreRadioGroupTests } from './radio-group.test-harness.js';

new CoreRadioGroupTests().runTests(
  config =>
    html`<ch-radio-group name="radio-group" label="Select an option" ${config}>
      <ch-radio name="option" value="1" id="radio1">Option 1</ch-radio>
      <ch-radio name="option" value="2" id="radio2">Option 2</ch-radio>
      <ch-radio name="option" value="3" id="radio3">Option 3</ch-radio>
    </ch-radio-group>`
);
