import { html } from '@open-wc/testing';
import {
  CoreButtonGroupNestedToolbarTests,
  CoreButtonGroupTests,
  CoreNoDropdownButtonGroupTests,
} from './button-group.test-harness.js';
import './index.js';

new CoreButtonGroupTests().runTests(
  config =>
    html`<ch-button-group ${config}>
      <ch-button>Button 1</ch-button>
      <ch-button>Button 2</ch-button>
      <ch-menu>
        <ch-button slot="trigger">Button 3</ch-button>
        <ch-menu-item>Item 1</ch-menu-item>
        <ch-menu-item>Item 2</ch-menu-item>
      </ch-menu>
      <ch-button>Button 4</ch-button>
    </ch-button-group>`
);

new CoreNoDropdownButtonGroupTests().runTests(
  config =>
    html`<ch-button-group ${config}>
      <ch-button>Button 1</ch-button>
      <ch-button>Button 2</ch-button>
      <ch-button>Button 3</ch-button>
      <ch-button>Button 4</ch-button>
    </ch-button-group>`
);

new CoreButtonGroupNestedToolbarTests().runTests(
  config =>
    html`<ch-button-group ${config}>
      <ch-button-group>
        <ch-button>Button 1</ch-button>
        <ch-button>Button 2</ch-button>
      </ch-button-group>
      <ch-button-group>
        <ch-button>Button 3</ch-button>
        <ch-button>Button 4</ch-button>
      </ch-button-group>
    </ch-button-group>`
);
