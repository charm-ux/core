import { expect, fixture, html } from '@open-wc/testing';

describe('CSS reset loading behavior', () => {
  let reset: string;
  let view: Window & typeof globalThis;
  let body: HTMLElement;
  let animation: Animation;

  before(async () => {
    const response = await fetch('/dist/themes/charm/reset.css');
    expect(response.ok).to.equal(true);
    reset = await response.text();
  });

  beforeEach(async () => {
    const frame = await fixture<HTMLIFrameElement>(html`<iframe sandbox="allow-same-origin"></iframe>`);
    const loaded = new Promise<void>(resolve => {
      frame.onload = () => resolve();
    });
    frame.srcdoc = `<!doctype html><html><head><style>${reset}</style>
      <style>body { animation-play-state: paused; }</style></head><body></body></html>`;
    await loaded;

    view = frame.contentWindow as Window & typeof globalThis;
    body = view.document.body;
    [animation] = body.getAnimations();
    expect(animation).to.exist;
    animation.currentTime = 0;
  });

  it('displays native content immediately', () => {
    body.innerHTML = '<p>Native content</p>';

    expect(view.getComputedStyle(body).opacity).to.equal('1');
  });

  it('keeps undefined content in the layout without changing visibility', () => {
    body.innerHTML = '<reset-test-element><button>Fallback content</button></reset-test-element>';
    const button = body.querySelector('button')!;

    expect(view.getComputedStyle(body).opacity).to.equal('0');
    expect(view.getComputedStyle(button).visibility).to.equal('visible');
    expect(button.getBoundingClientRect().height).to.be.greaterThan(0);
  });

  it('displays already-defined custom elements immediately', () => {
    view.customElements.define('reset-test-element', class extends view.HTMLElement {});
    body.innerHTML = '<reset-test-element>Defined content</reset-test-element>';

    expect(view.getComputedStyle(body).opacity).to.equal('1');
  });

  it('reveals the body as soon as all custom elements are defined', () => {
    body.innerHTML = '<reset-test-first></reset-test-first><reset-test-second></reset-test-second>';
    expect(view.getComputedStyle(body).opacity).to.equal('0');

    view.customElements.define('reset-test-first', class extends view.HTMLElement {});
    expect(view.getComputedStyle(body).opacity).to.equal('0');

    view.customElements.define('reset-test-second', class extends view.HTMLElement {});
    expect(view.getComputedStyle(body).opacity).to.equal('1');
    expect(animation.currentTime).to.equal(0);
  });

  it('reveals undefined elements at the 200 ms fallback deadline', () => {
    body.innerHTML = '<reset-test-element>Fallback content</reset-test-element>';
    const timing = animation.effect!.getTiming();
    expect(timing.delay).to.equal(200);
    expect(timing.duration).to.equal(0);
    expect(timing.fill).to.equal('forwards');

    animation.currentTime = 199;
    expect(view.getComputedStyle(body).opacity).to.equal('0');

    animation.currentTime = 200;
    expect(view.getComputedStyle(body).opacity).to.equal('1');
  });

  it('does not hide the page when undefined elements are added after the deadline', () => {
    animation.currentTime = 200;
    expect(view.getComputedStyle(body).opacity).to.equal('1');

    body.innerHTML = '<reset-test-element>Late content</reset-test-element>';
    expect(view.getComputedStyle(body).opacity).to.equal('1');
  });

  it('reveals content automatically without scripts in the document', async () => {
    body.innerHTML = '<reset-test-element>Fallback content</reset-test-element>';
    expect(view.getComputedStyle(body).opacity).to.equal('0');

    animation.play();
    await animation.finished;

    expect(view.getComputedStyle(body).opacity).to.equal('1');
  });
});
