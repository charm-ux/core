import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import './index.js';
import { CoreButtonTests } from './button.test-harness.js';
import { CoreButton } from './index.js';

new CoreButtonTests().runTests(config => html`<ch-button ${config}>Click here</ch-button>`);

for (const isLink of [false, true]) {
  describe(`CoreButton accessible name (${isLink ? 'link' : 'button'})`, () => {
    const href = isLink ? '#' : undefined;
    const getControl = (el: CoreButton) => el.shadowRoot!.querySelector(isLink ? 'a' : 'button')!;

    it('forwards an initial label for an icon-only control', async () => {
      const el = await fixture<CoreButton>(html`
        <ch-button href=${href} icon-only aria-label="Close">
          <span aria-hidden="true">×</span>
        </ch-button>
      `);

      expect(getControl(el).getAttribute('aria-label')).to.equal('Close');
      await expect(el).to.be.accessible();
    });

    it('forwards attribute additions, updates, and removal', async () => {
      const el = await fixture<CoreButton>(html`<ch-button href=${href}>Visible name</ch-button>`);

      for (const label of ['First name', 'Updated name']) {
        el.setAttribute('aria-label', label);
        await elementUpdated(el);
        expect(getControl(el).getAttribute('aria-label')).to.equal(label);
      }

      el.removeAttribute('aria-label');
      await elementUpdated(el);
      expect(getControl(el).hasAttribute('aria-label')).to.be.false;
      await expect(el).to.be.accessible();
    });

    it('forwards ariaLabel property updates and clearing', async () => {
      const el = await fixture<CoreButton>(html`<ch-button href=${href}>Visible name</ch-button>`);

      for (const label of ['First name', 'Updated name', '', null]) {
        el.ariaLabel = label;
        await elementUpdated(el);
        expect(el.getAttribute('aria-label')).to.equal(label);
        expect(getControl(el).getAttribute('aria-label')).to.equal(label);
      }

      await expect(el).to.be.accessible();
    });

    it('preserves the visible slotted name without an explicit label', async () => {
      const el = await fixture<CoreButton>(html`<ch-button href=${href}>Visible name</ch-button>`);
      const slot = getControl(el).querySelector('slot:not([name])') as HTMLSlotElement;

      expect(getControl(el).hasAttribute('aria-label')).to.be.false;
      expect(getControl(el).hasAttribute('aria-labelledby')).to.be.false;
      expect(
        slot
          .assignedNodes()
          .map(node => node.textContent)
          .join('')
      ).to.equal('Visible name');
      await expect(el).to.be.accessible();
    });

    it('does not forward light-DOM ID references across the shadow boundary', async () => {
      const wrapper = await fixture<HTMLDivElement>(html`
        <div>
          <span id="external-button-label">External name</span>
          <ch-button href=${href} aria-labelledby="external-button-label">Visible name</ch-button>
        </div>
      `);
      const el = wrapper.querySelector<CoreButton>('ch-button')!;

      expect(el.getRootNode()).to.equal(wrapper.getRootNode());
      expect(el.shadowRoot!.getElementById('external-button-label')).to.be.null;
      expect(getControl(el).hasAttribute('aria-labelledby')).to.be.false;
      await expect(el).to.be.accessible();
    });
  });
}
