import { html } from '@open-wc/testing';
import './index.js';
import { CoreProgressBarTests } from './progress-bar.test-harness.js';

new CoreProgressBarTests().runTests(config => html`<ch-progress-bar label="progress bar" ${config}></ch-progress-bar>`);
