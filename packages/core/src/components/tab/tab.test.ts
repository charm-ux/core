import { html } from '@open-wc/testing';
import { CoreTabTests } from './tab.test-harness.js';
import './index.js';

new CoreTabTests().runTests(config => html`<ch-tab ${config}>one</ch-tab>`);
