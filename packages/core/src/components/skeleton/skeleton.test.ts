import { html } from '@open-wc/testing';
import './index.js';
import { CoreSkeletonTests } from './skeleton.test-harness.js';

new CoreSkeletonTests().runTests(config => html`<ch-skeleton ${config}></ch-skeleton>`);
