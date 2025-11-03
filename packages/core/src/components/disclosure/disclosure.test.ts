import { html } from '@open-wc/testing';
import { CoreDisclosureTests } from './disclosure.test-harness.js';
import './index.js';

new CoreDisclosureTests().runTests(
  config => html`<ch-disclosure ${config}><button slot="trigger">Heading</button>Disclosure Region</ch-disclosure>`
);
