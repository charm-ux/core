import { html } from '@open-wc/testing';
import '../tag/index.js';
import './index.js';
import { CoreTagGroupTests } from './tag-group.test-harness.js';

new CoreTagGroupTests().runTests(
  config =>
    html`<ch-tag-group label="Fruit" ${config}>
      <ch-tag removable value="apple">Apple</ch-tag>
      <ch-tag removable value="banana">Banana</ch-tag>
      <ch-tag removable value="cherry">Cherry</ch-tag>
    </ch-tag-group>`
);
