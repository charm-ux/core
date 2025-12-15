import { html } from '@open-wc/testing';
import './index.js';
import { CoreDialogTests } from './dialog.test-harness.js';

new CoreDialogTests().runTests(
  config =>
    html`<ch-dialog style="--dialog-transition: opacity 1ms;" ${config}>
      <div slot="heading">dialog header</div>
      dialog content
      <div slot="footer">
        <button id="closeBtn">Cancel</button>
        <button>Save</button>
      </div>
    </ch-dialog> `
);
