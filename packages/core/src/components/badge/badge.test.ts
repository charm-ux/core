import { html } from '@open-wc/testing';
import { CoreBadgeTests } from './badge.test-harness.js';
import './index.js';

new CoreBadgeTests().runTests(config => html`<ch-badge ${config}></ch-badge>`);
