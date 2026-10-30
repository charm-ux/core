import { html } from '@open-wc/testing';
import './index.js';
import { CoreOptionTests } from './option.test-harness.js';

new CoreOptionTests().runTests(config => html`<ch-option value="apple" label="Apple" ${config}>Apple</ch-option>`);
