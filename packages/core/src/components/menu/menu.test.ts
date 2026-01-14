import { html } from '@open-wc/testing';
import { CoreMenuTests } from './menu.test-harness.js';
import './index.js';
import '../menu-item/index.js';
import '../button/index.js';

new CoreMenuTests().runTests(
  config => html`
    <ch-menu ${config}>
      <ch-button slot="trigger" id="triggerId">click me</ch-button>
      <ch-menu-item>Item 1</ch-menu-item>
      <ch-menu-item>Item 2</ch-menu-item>
      <ch-menu-item>Item 3</ch-menu-item>
    </ch-menu>
  `
);
