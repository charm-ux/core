import { html } from '@open-wc/testing';
import './index.js';
import { CoreDividerTests } from './divider.test-harness.js';

new CoreDividerTests().runTests(config => html`<ch-divider ${config}></ch-divider>`);
