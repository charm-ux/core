import { html } from '@open-wc/testing';
import './index.js';
import { CoreSpinnerTests } from './spinner.test-harness.js';

new CoreSpinnerTests().runTests(config => html`<ch-spinner ${config}></ch-spinner>`);
