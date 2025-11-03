import { html } from '@open-wc/testing';
import { CoreTextAreaTests } from './text-area.test-harness.js';
import './index.js';

new CoreTextAreaTests().runTests(
  config => html` <ch-text-area label="label" ${config}><span slot="help-text">Help text</span></ch-text-area>`
);
