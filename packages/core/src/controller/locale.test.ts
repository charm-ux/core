import { aTimeout, expect } from '@open-wc/testing';
import { LocaleController } from './locale.js';
import type { ReactiveController, ReactiveControllerHost } from 'lit';

class TestHost extends HTMLElement implements ReactiveControllerHost {
  public updateCount = 0;
  public controllers: ReactiveController[] = [];
  public locale = new LocaleController(this);
  public updateComplete = Promise.resolve(true);

  public addController(controller: ReactiveController): void {
    this.controllers.push(controller);
  }

  public removeController(): void {}

  public requestUpdate(): void {
    this.updateCount += 1;
  }

  public connectedCallback(): void {
    this.controllers.forEach(controller => controller.hostConnected?.());
  }

  public disconnectedCallback(): void {
    this.controllers.forEach(controller => controller.hostDisconnected?.());
  }
}

customElements.define('test-locale-host', TestHost);

describe('LocaleController', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.append(container);
  });

  afterEach(() => container.remove());

  it('normalizes the nearest lang attribute', () => {
    container.lang = 'en-us@posix';
    const host = document.createElement('test-locale-host') as TestHost;
    container.append(host);
    expect(host.locale.locale).to.equal('en-US');
  });

  it('resolves lang across shadow roots', () => {
    container.lang = 'fr-FR';
    const shadow = container.attachShadow({ mode: 'open' });
    const host = document.createElement('test-locale-host') as TestHost;
    shadow.append(host);
    expect(host.locale.locale).to.equal('fr-FR');
  });

  it('tracks lang changes on the host and on composed ancestors', async () => {
    container.lang = 'en-US';
    const shadow = container.attachShadow({ mode: 'open' });
    const host = document.createElement('test-locale-host') as TestHost;
    shadow.append(host);

    container.lang = 'de-DE';
    await aTimeout(0);
    expect(host.locale.locale).to.equal('de-DE');
    expect(host.updateCount).to.equal(1);

    host.lang = 'ja-JP';
    await aTimeout(0);
    expect(host.locale.locale).to.equal('ja-JP');
    expect(host.updateCount).to.equal(2);
  });

  it('retargets when a nearer ancestor gains lang', async () => {
    container.lang = 'en-US';
    const middle = document.createElement('div');
    container.append(middle);
    const host = document.createElement('test-locale-host') as TestHost;
    middle.append(host);

    middle.lang = 'en-GB';
    await aTimeout(0);
    expect(host.locale.locale).to.equal('en-GB');

    container.lang = 'fr-FR';
    await aTimeout(0);
    expect(host.locale.locale).to.equal('en-GB');

    middle.removeAttribute('lang');
    await aTimeout(0);
    expect(host.locale.locale).to.equal('fr-FR');
  });

  it('re-resolves on reconnect and stops observing when disconnected', async () => {
    container.lang = 'en-US';
    const host = document.createElement('test-locale-host') as TestHost;
    container.append(host);
    host.remove();

    container.lang = 'fr-FR';
    await aTimeout(0);
    expect(host.updateCount).to.equal(0);

    container.append(host);
    expect(host.locale.locale).to.equal('fr-FR');
    expect(host.updateCount).to.equal(1);
  });
});
