import { html } from '@open-wc/testing';
import { CoreMenuItemTests } from './menu-item.test-harness.js';
import './index.js';

new CoreMenuItemTests().runTests(config => html` <ch-menu-item ${config}>Menu Item</ch-menu-item> `);
