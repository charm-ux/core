import { html } from '@open-wc/testing';
import './index.js';
import { CoreTooltipTests, SiblingTooltipTests } from './tooltip.test-harness.js';

new CoreTooltipTests().runTests(
  config =>
    html`<ch-tooltip content="This is a tooltip" ${config}>
      <button>Hover Me</button>
    </ch-tooltip>`
);

new SiblingTooltipTests().runTests(
  config =>
    html`<ch-tooltip anchor="tooltip-button" content="This is a tooltip" ${config}></ch-tooltip>
      <button id="tooltip-button">Hover Me</button>`
);
