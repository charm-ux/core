import { html } from '@open-wc/testing';
import './index.js';
import { CorePushPaneTests } from './push-pane.test-harness.js';

new CorePushPaneTests().runTests(
  config => html`
    <ch-push-pane style="--push-pane-transition: width 1ms;" ${config}>
      <div class="push-pane">
        <p>default pane content</p>
        <ch-button id="toggleClose">Close</ch-button>
      </div>
    </ch-push-pane>
  `
);
