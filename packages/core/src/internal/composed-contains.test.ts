import { expect } from '@open-wc/testing';
import { composedContains } from './composed-contains.js';

describe('composedContains', () => {
  afterEach(() => document.body.replaceChildren());

  it('checks same-root ancestors inside a shadow root before crossing to the host', () => {
    const host = document.createElement('div');
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML = '<section><span></span></section><p></p>';
    document.body.append(host);
    const section = root.querySelector('section')!;
    const span = root.querySelector('span')!;
    const sibling = root.querySelector('p')!;

    expect(composedContains(section, span)).to.be.true;
    expect(composedContains(section, sibling)).to.be.false;
    expect(composedContains(host, span)).to.be.true;
    expect(composedContains(document.body, span)).to.be.true;
  });

  it('handles the node itself, light DOM, and null', () => {
    const outer = document.createElement('div');
    const inner = document.createElement('span');
    outer.append(inner);
    document.body.append(outer);

    expect(composedContains(inner, inner)).to.be.true;
    expect(composedContains(outer, inner)).to.be.true;
    expect(composedContains(inner, outer)).to.be.false;
    expect(composedContains(outer, null)).to.be.false;
  });
});
