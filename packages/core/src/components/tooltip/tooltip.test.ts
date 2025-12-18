import { html } from '@open-wc/testing';
import './index.js';
import { CoreTooltipTests } from './tooltip.test-harness.js';

new CoreTooltipTests().runTests(
  config =>
    html`<ch-tooltip content="This is a tooltip" ${config}>
      <button slot="anchor">Hover Me</button>
    </ch-tooltip>`
);
