import { html } from '@open-wc/testing';
import { CoreBreadcrumbTests } from './breadcrumb.test-harness.js';
import './index.js';

new CoreBreadcrumbTests().runTests(
  config =>
    html`<ch-breadcrumb label="Breadcrumb navigation" ${config}>
      <ch-breadcrumb-item>First</ch-breadcrumb-item><ch-breadcrumb-item>Current</ch-breadcrumb-item>
    </ch-breadcrumb>`
);
