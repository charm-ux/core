import { html } from '@open-wc/testing';
import { CoreScopedStylesTests } from './scoped-styles.test-harness.js';
import './index.js';
import '../button/index.js';

new CoreScopedStylesTests().runTests(config => html`<ch-scoped-styles ${config}></ch-scoped-styles>`);
