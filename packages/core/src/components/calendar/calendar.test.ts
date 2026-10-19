import { html } from '@open-wc/testing';
import './index.js';
import { CoreCalendarTests } from './calendar.test-harness.js';

new CoreCalendarTests().runTests(config => html`<ch-calendar focus-date="2025-06-15" ${config}></ch-calendar>`);
