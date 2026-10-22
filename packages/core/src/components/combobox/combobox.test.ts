import { html } from '@open-wc/testing';
import '../option/index.js';
import '../option-group/index.js';
import './index.js';
import { CoreComboboxTests } from './combobox.test-harness.js';

new CoreComboboxTests().runTests(
  config => html`
    <ch-combobox label="Choose a fruit" ${config}>
      <ch-option value="apple">Apple</ch-option>
      <ch-option value="banana">Banana</ch-option>
      <ch-option value="cherry">Cherry</ch-option>
    </ch-combobox>
  `
);
