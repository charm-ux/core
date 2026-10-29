import { elementUpdated, expect, fixture, html } from '@open-wc/testing';
import { sendKeys } from '@web/test-runner-commands';
import { type TemplateResult } from 'lit';
import sinon from 'sinon';
import { CorePopupTests } from './popup.test-harness.js';
import { type CorePopup } from './index.js';
import './index.js';

new CorePopupTests().runTests(
  config =>
    html`<ch-popup ${config}>
      <div></div>
    </ch-popup>`
);

describe('popup focus trap', () => {
  async function setup(content: TemplateResult) {
    const container = await fixture<HTMLDivElement>(html`
      <div>
        <button id="anchor">Anchor</button>
        <ch-popup focus-trap tabindex="-1">${content}</ch-popup>
        <button>Outside</button>
      </div>
    `);
    const popup = container.querySelector<CorePopup>('ch-popup')!;
    const anchor = container.querySelector<HTMLButtonElement>('#anchor')!;
    popup.anchor = anchor;
    popup.open = true;
    await elementUpdated(popup);
    const requestClose = sinon.spy();
    popup.addEventListener('popup-request-close', requestClose);
    return { popup, anchor, requestClose };
  }

  const inertLayouts = [
    {
      name: 'inert focusable elements',
      content: html`<span inert focusable tabindex="0"></span>`,
    },
    {
      name: 'inert native controls',
      content: html`<button inert>Inert</button>`,
    },
    {
      name: 'inert ancestors',
      content: html`<div inert><span focusable tabindex="0"></span><button>Inert</button></div>`,
    },
    {
      name: 'inert shadow wrappers',
      content: html`<div class="shadow-host"><span focusable tabindex="0"></span></div>`,
      shadow: '<div inert><slot></slot></div>',
    },
    {
      name: 'inert slots',
      content: html`<div class="shadow-host"><span focusable tabindex="0"></span></div>`,
      shadow: '<slot inert></slot>',
    },
    {
      name: 'inert shadow hosts',
      content: html`<div inert class="shadow-host"><span focusable tabindex="0"></span></div>`,
      shadow: '<slot></slot>',
    },
  ];

  for (const layout of inertLayouts) {
    for (const reverse of [false, true]) {
      it(`closes on ${reverse ? 'Shift+Tab' : 'Tab'} at the true endpoint with ${layout.name}`, async () => {
        const { popup, anchor, requestClose } = await setup(html`
          ${layout.content}
          <button id="first">First</button>
          <button id="last">Last</button>
          ${layout.content}
        `);
        if (layout.shadow) {
          popup.querySelectorAll('.shadow-host').forEach(host => {
            host.attachShadow({ mode: 'open' }).innerHTML = layout.shadow!;
          });
        }
        const endpoint = popup.querySelector<HTMLButtonElement>(reverse ? '#first' : '#last')!;
        endpoint.focus();
        expect(document.activeElement).to.equal(endpoint);

        await sendKeys({ press: reverse ? 'Shift+Tab' : 'Tab' });

        expect(requestClose.callCount).to.equal(1);
        expect(requestClose.firstCall.args[0].detail.source).to.equal('tab');
        expect(popup.open).to.be.false;
        expect(document.activeElement).to.equal(anchor);
      });
    }
  }

  for (const reverse of [false, true]) {
    it(`preserves normal ${reverse ? 'reverse' : 'forward'} Tab navigation and endpoint closing`, async () => {
      const { popup, anchor, requestClose } = await setup(html`
        <button id="first">First</button>
        <button id="last">Last</button>
      `);
      const first = popup.querySelector<HTMLButtonElement>('#first')!;
      const last = popup.querySelector<HTMLButtonElement>('#last')!;
      (reverse ? last : first).focus();

      await sendKeys({ press: reverse ? 'Shift+Tab' : 'Tab' });
      expect(document.activeElement).to.equal(reverse ? first : last);
      expect(requestClose.callCount).to.equal(0);
      expect(popup.open).to.be.true;

      await sendKeys({ press: reverse ? 'Shift+Tab' : 'Tab' });
      expect(requestClose.callCount).to.equal(1);
      expect(popup.open).to.be.false;
      expect(document.activeElement).to.equal(anchor);
    });

    it(`skips inert content during ${reverse ? 'reverse' : 'forward'} Tab navigation`, async () => {
      const { popup, requestClose } = await setup(html`
        <button id="first">First</button>
        <div inert><button>Inert</button></div>
        <button id="last">Last</button>
      `);
      const first = popup.querySelector<HTMLButtonElement>('#first')!;
      const last = popup.querySelector<HTMLButtonElement>('#last')!;
      (reverse ? last : first).focus();

      await sendKeys({ press: reverse ? 'Shift+Tab' : 'Tab' });

      expect(document.activeElement).to.equal(reverse ? first : last);
      expect(requestClose.callCount).to.equal(0);
      expect(popup.open).to.be.true;
    });

    for (const { name, content } of [
      { name: 'no candidates', content: html`` },
      { name: 'only inert candidates', content: html`<span inert focusable tabindex="0"></span>` },
    ]) {
      it(`leaves ${reverse ? 'Shift+Tab' : 'Tab'} unhandled with ${name}`, async () => {
        const { popup, requestClose } = await setup(content);
        // The default display: contents prevents focusing the host itself.
        popup.style.display = 'block';
        popup.focus();
        expect(document.activeElement).to.equal(popup);
        const event = new KeyboardEvent('keydown', {
          key: 'Tab',
          shiftKey: reverse,
          bubbles: true,
          cancelable: true,
        });

        popup.dispatchEvent(event);

        expect(requestClose.callCount).to.equal(0);
        expect(event.defaultPrevented).to.be.false;
        expect(popup.open).to.be.true;
      });
    }

    it(`closes from the popup itself on ${reverse ? 'Shift+Tab' : 'Tab'}`, async () => {
      const { popup, anchor, requestClose } = await setup(html`<button>Content</button>`);
      popup.style.display = 'block';
      popup.focus();

      await sendKeys({ press: reverse ? 'Shift+Tab' : 'Tab' });

      expect(requestClose.callCount).to.equal(1);
      expect(popup.open).to.be.false;
      expect(document.activeElement).to.equal(anchor);
    });
  }

  it('recomputes endpoints after inert changes', async () => {
    const { popup, requestClose } = await setup(html`
      <button id="first">First</button>
      <button id="last">Last</button>
    `);
    popup.querySelector<HTMLButtonElement>('#last')!.inert = true;
    popup.querySelector<HTMLButtonElement>('#first')!.focus();

    await sendKeys({ press: 'Tab' });

    expect(requestClose.callCount).to.equal(1);
    expect(popup.open).to.be.false;
  });

  it('includes candidates again when inert is removed', async () => {
    const { popup, requestClose } = await setup(html`
      <button id="first">First</button>
      <button id="last" inert>Last</button>
    `);
    const last = popup.querySelector<HTMLButtonElement>('#last')!;
    last.inert = false;
    popup.querySelector<HTMLButtonElement>('#first')!.focus();

    await sendKeys({ press: 'Tab' });

    expect(document.activeElement).to.equal(last);
    expect(requestClose.callCount).to.equal(0);
    expect(popup.open).to.be.true;

    await sendKeys({ press: 'Tab' });

    expect(requestClose.callCount).to.equal(1);
    expect(popup.open).to.be.false;
  });

  it('keeps canceled Tab close requests open and restores anchor focus', async () => {
    const { popup, anchor, requestClose } = await setup(html`
      <button id="last">Last</button>
      <span inert focusable tabindex="0"></span>
    `);
    popup.addEventListener('popup-request-close', event => event.preventDefault());
    popup.querySelector<HTMLButtonElement>('#last')!.focus();

    await sendKeys({ press: 'Tab' });

    expect(requestClose.callCount).to.equal(1);
    expect(popup.open).to.be.true;
    expect(document.activeElement).to.equal(anchor);
  });

  it('does not close on Tab when focus trapping is disabled', async () => {
    const { popup, requestClose } = await setup(html`<button id="last">Last</button>`);
    popup.focusTrap = false;
    popup.querySelector<HTMLButtonElement>('#last')!.focus();

    await sendKeys({ press: 'Tab' });

    expect(requestClose.callCount).to.equal(0);
    expect(popup.open).to.be.true;
  });

  it('preserves Escape closing without focus trapping', async () => {
    const { popup, anchor, requestClose } = await setup(html`<button>Content</button><span inert focusable></span>`);
    popup.focusTrap = false;
    popup.querySelector('button')!.focus();

    await sendKeys({ press: 'Escape' });

    expect(requestClose.callCount).to.equal(1);
    expect(requestClose.firstCall.args[0].detail.source).to.equal('escape');
    expect(popup.open).to.be.false;
    expect(document.activeElement).to.equal(anchor);
  });
});
