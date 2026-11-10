import { html } from '@open-wc/testing';
import { CoreTagTests } from './tag.test-harness.js';
import './index.js';

new CoreTagTests().runTests(config => html`<ch-tag removable value="apple" ${config}>Apple</ch-tag>`);
