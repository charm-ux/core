import { html } from '@open-wc/testing';
import { CoreTabPanelTests } from './tab-panel.test-harness.js';
import './index.js';

new CoreTabPanelTests().runTests(config => html`<ch-tab-panel ${config}>one</ch-tab-panel>`);
