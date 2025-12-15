import { html } from '@open-wc/testing';
import './index.js';
import { CoreCheckboxTests } from './checkbox.test-harness.js';

new CoreCheckboxTests().runTests(config => html`<ch-checkbox label="test" ${config}></ch-checkbox>`);
