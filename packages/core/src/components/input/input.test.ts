import { html } from '@open-wc/testing';
import './index.js';
import { CoreInputTests } from './input.test-harness.js';

new CoreInputTests().runTests(config => html`<ch-input label="Test" ${config}></ch-input>`);
