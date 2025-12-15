import { html } from '@open-wc/testing';
import './index.js';
import { CoreMenuGroupTests } from './menu-group.test-harness.js';

new CoreMenuGroupTests().runTests(config => html`<ch-menu-group ${config}></ch-menu-group>`);
