import { html } from '@open-wc/testing';
import './index.js';
import { CoreIconTests } from './icon.test-harness.js';

new CoreIconTests().runTests(config => html`<ch-icon ${config}></ch-icon>`);
