import { html } from '@open-wc/testing';
import './index.js';
import { CoreSwitchTests } from './switch.test-harness.js';

new CoreSwitchTests().runTests(config => html`<ch-switch label="label" ${config}></ch-switch>`);
