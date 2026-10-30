import { html } from '@open-wc/testing';
import '../option/index.js';
import './index.js';
import { CoreOptionGroupTests } from './option-group.test-harness.js';

new CoreOptionGroupTests().runTests(
  config => html`
    <ch-option-group label="Fruits" ${config}>
      <ch-option value="apple">Apple</ch-option>
      <ch-option value="banana">Banana</ch-option>
    </ch-option-group>
  `
);
