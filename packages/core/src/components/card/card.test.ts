import { html } from '@open-wc/testing';
import { CoreCardTests } from './card.test-harness.js';
import './index.js';

new CoreCardTests().runTests(config => html`<ch-card ${config}></ch-card>`);
