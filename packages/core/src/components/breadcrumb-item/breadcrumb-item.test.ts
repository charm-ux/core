import { html } from '@open-wc/testing';
import { CoreBreadcrumbItemTests } from './breadcrumb-item.test-harness.js';
import './index.js';

new CoreBreadcrumbItemTests().runTests(
  config => html` <ch-breadcrumb-item ${config}><a href="#">link</a></ch-breadcrumb-item> `
);
