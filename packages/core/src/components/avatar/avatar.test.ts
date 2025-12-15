import { html } from '@open-wc/testing';
import { CoreAvatarTests } from './avatar.test-harness.js';
import './index.js';

new CoreAvatarTests().runTests(config => html`<ch-avatar ${config}></ch-avatar>`);
