import { html } from '@open-wc/testing';
import './index.js';
import { CoreRadioTests } from './radio.test-harness.js';

new CoreRadioTests().runTests(config => html`<ch-radio ${config}>Radio</ch-radio>`);
