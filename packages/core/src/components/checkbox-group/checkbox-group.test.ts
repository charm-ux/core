import { html } from '@open-wc/testing';
import '../checkbox/index.js';
import './index.js';
import { CoreCheckboxGroupTests } from './checkbox-group.test-harness.js';

new CoreCheckboxGroupTests().runTests(
  config =>
    html`<ch-checkbox-group name="options" label="Choose options" ${config}>
      <ch-checkbox value="birds">Birds</ch-checkbox>
      <ch-checkbox value="cats">Cats</ch-checkbox>
      <ch-checkbox value="dogs">Dogs</ch-checkbox>
    </ch-checkbox-group>`
);
