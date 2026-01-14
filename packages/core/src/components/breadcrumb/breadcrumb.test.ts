import { html } from '@open-wc/testing';
import { CoreBreadcrumbTests } from './breadcrumb.test-harness.js';
import './index.js';

new CoreBreadcrumbTests().runTests(config => html`<ch-breadcrumb ${config}></ch-breadcrumb>`);
