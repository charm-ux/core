import { html } from '@open-wc/testing';
import './index.js';
import { CoreButtonTests } from './button.test-harness.js';

new CoreButtonTests().runTests(config => html`<ch-button ${config}>Click here</ch-button>`);
